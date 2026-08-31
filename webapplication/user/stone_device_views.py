import json
import logging
import os
import secrets
from collections import namedtuple
from datetime import datetime, timezone, timedelta

from django.conf import settings
from django.contrib.gis.geos import Point
from django.utils.dateparse import parse_date
from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError
import pynmea2
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from devices.models import Camera
from user.models import EdgeCoverage, EdgePrediction, StonesDetectionChunk
from user.serializers import CoverageMetadataSerializer, PredictionsMetadataSerializer

logger = logging.getLogger(__name__)

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

_gcs_client_instance = None


def _current_chunk_info():
    """
    Return (date, chunk_index, processing_start_date) for the current UTC time.
    Chunk boundaries are hard-preset: 00,04,08,12,16,20 UTC.
    """
    now = datetime.now(timezone.utc)
    chunk = now.hour // 4
    chunk_start = now.replace(hour=chunk * 4, minute=0, second=0, microsecond=0)
    processing_start = chunk_start + timedelta(hours=4)
    return now.date(), chunk, processing_start


def _get_or_create_chunk(user, chunk_type):
    """Get or create a StonesDetectionChunk for the current UTC window and type."""
    date, chunk, processing_start = _current_chunk_info()
    username = user.username
    gcs_path = f'{username}/{date}/{chunk}/{chunk_type}/'

    obj, created = StonesDetectionChunk.objects.get_or_create(
        user=user,
        date=date,
        chunk=chunk,
        type=chunk_type,
        defaults={
            'gcs_path': gcs_path,
            'processing_start_date': processing_start,
            'status': StonesDetectionChunk.STATUS_UPLOADING,
        },
    )
    return obj


def _gcs_client():
    global _gcs_client_instance
    if _gcs_client_instance is None:
        creds_path = os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
        _gcs_client_instance = storage.Client.from_service_account_json(creds_path)
    return _gcs_client_instance


def _resolve_user_by_serial(serial):
    """Return the User linked to this camera serial number, or None if not found."""
    try:
        return Camera.objects.select_related('user').get(cam_serial_num=serial).user
    except Camera.DoesNotExist:
        return None


GprmcFix = namedtuple('GprmcFix', ['location', 'captured_at', 'speed'])


def parse_gprmc(gprmc_string):
  """Parse an NMEA $GPRMC string. Return location, captured_at, and speed.

  All three values are None if the string is empty or cannot be parsed.
  All three values are also None if the fix is not valid: status is not
  'A', or the coordinates are missing even when status is 'A'.

  A date/time parse error sets only captured_at to None. The location
  value stays valid in that case.
  """
  if not gprmc_string:
    return GprmcFix(None, None, None)
  try:
    msg = pynmea2.parse(gprmc_string)
  except Exception as error:
    logger.warning('Failed to parse NMEA string: %s, error: %s', gprmc_string, error)
    return GprmcFix(None, None, None)

  if getattr(msg, 'status', None) != 'A':
    return GprmcFix(None, None, None)

  if not msg.lat or not msg.lon:
    # pynmea2 returns 0.0 for latitude/longitude when the raw fields are
    # empty, even if status is 'A'. This is the Null Island case. The fix
    # is not valid here. Set captured_at and speed to None too, not only
    # location.
    logger.warning('GPRMC string has status A but missing coordinates: %s', gprmc_string)
    return GprmcFix(None, None, None)

  location = Point(msg.longitude, msg.latitude, srid=4326)

  captured_at = None
  try:
    if msg.datestamp and msg.timestamp:
      captured_at = datetime.combine(msg.datestamp, msg.timestamp, tzinfo=timezone.utc)
  except Exception as error:
    logger.warning('Failed to parse GPRMC date/time: %s, error: %s', gprmc_string, error)

  return GprmcFix(location, captured_at, msg.spd_over_grnd)


class PredictionsAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        metadata_file = request.FILES.get('metadata')
        image_file = request.FILES.get('image')

        if not metadata_file or not image_file:
            logger.warning(
                'predictions: missing required fields: metadata=%s image=%s ip=%s',
                bool(metadata_file), bool(image_file), request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': "Both 'metadata' and 'image' fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file.size > MAX_IMAGE_SIZE:
            logger.warning(
                'predictions: image too large: size=%d ip=%s',
                image_file.size, request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': f'Image exceeds maximum allowed size of {MAX_IMAGE_SIZE // (1024 * 1024)} MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = json.loads(metadata_file.read())
        except (json.JSONDecodeError, UnicodeDecodeError):
            logger.warning(
                'predictions: invalid metadata JSON ip=%s',
                request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': 'metadata must be valid JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PredictionsMetadataSerializer(data=metadata)
        if not serializer.is_valid():
            logger.warning(
                'predictions: metadata validation failed: serial=%s errors=%s ip=%s',
                metadata.get('serial'), serializer.errors, request.META.get('REMOTE_ADDR'),
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        serial = data['serial']
        user = _resolve_user_by_serial(serial)
        if user is None:
            logger.warning(
                'predictions: unknown serial=%s ip=%s',
                serial, request.META.get('REMOTE_ADDR'),
            )
            return Response({'detail': 'Unknown camera serial number.'}, status=status.HTTP_403_FORBIDDEN)

        if not user.stones_storage_edge:
            logger.warning(
                'predictions: storage bucket not configured for serial=%s user=%s ip=%s',
                serial, user.id, request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': 'Storage bucket is not configured for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uuid = data['uuid']
        chunk_obj = _get_or_create_chunk(user, StonesDetectionChunk.TYPE_PREDICTIONS)
        base_path = f'{chunk_obj.gcs_path}{uuid}'
        image_rel_path = f'{chunk_obj.gcs_path}{uuid}/{uuid}.jpg'

        try:
            client = _gcs_client()
            bucket = client.bucket(user.stones_storage_edge)
            image_blob = bucket.blob(image_rel_path)
            image_blob.upload_from_string(image_file.read(), content_type='image/jpeg')
            bucket.blob(f'{base_path}/{uuid}.json').upload_from_string(
                json.dumps(metadata).encode('utf-8'), content_type='application/json'
            )
        except GoogleCloudError:
            logger.exception(
                'GCS upload failed for predictions: user=%s, uuid=%s',
                user.id, uuid,
            )
            return Response(
                {'detail': 'Failed to store prediction. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            gprmc_str = data.get('gprmc')
            fix = parse_gprmc(gprmc_str)
            EdgePrediction.objects.create(
                uuid=uuid,
                chunk=chunk_obj,
                serial=serial,
                version=data.get('version', '1'),
                gprmc=gprmc_str,
                model_name=data.get('model_name'),
                time_since_boot_sec=data.get('time_since_boot_sec'),
                predictions=data.get('predictions', []),
                image_path=image_rel_path,
                location=fix.location,
                captured_at=fix.captured_at,
                speed=fix.speed,
            )
        except Exception:
            logger.exception('Database write failed for prediction data: user=%s, uuid=%s',
                             user.id, uuid)
            return Response(
                {'detail': 'Failed to save prediction to database.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'uuid': uuid}, status=status.HTTP_201_CREATED)


class CoverageAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        metadata_file = request.FILES.get('metadata')
        image_file = request.FILES.get('image')

        if not metadata_file:
            logger.warning(
                'coverage: missing metadata field ip=%s',
                request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': "'metadata' field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file and image_file.size > MAX_IMAGE_SIZE:
            logger.warning(
                'coverage: image too large: size=%d ip=%s',
                image_file.size, request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': f'Image exceeds maximum allowed size of {MAX_IMAGE_SIZE // (1024 * 1024)} MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = json.loads(metadata_file.read())
        except (json.JSONDecodeError, UnicodeDecodeError):
            logger.warning(
                'coverage: invalid metadata JSON ip=%s',
                request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': 'metadata must be valid JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CoverageMetadataSerializer(data=metadata)
        if not serializer.is_valid():
            logger.warning(
                'coverage: metadata validation failed: serial=%s errors=%s ip=%s',
                metadata.get('serial'), serializer.errors, request.META.get('REMOTE_ADDR'),
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        serial = data['serial']
        user = _resolve_user_by_serial(serial)
        if user is None:
            logger.warning(
                'coverage: unknown serial=%s ip=%s',
                serial, request.META.get('REMOTE_ADDR'),
            )
            return Response({'detail': 'Unknown camera serial number.'}, status=status.HTTP_403_FORBIDDEN)

        if not user.stones_storage_edge:
            logger.warning(
                'coverage: storage bucket not configured for serial=%s user=%s ip=%s',
                serial, user.id, request.META.get('REMOTE_ADDR'),
            )
            return Response(
                {'detail': 'Storage bucket is not configured for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uuid = data['uuid']
        chunk_obj = _get_or_create_chunk(user, StonesDetectionChunk.TYPE_COVERAGE)
        base_path = f'{chunk_obj.gcs_path}{uuid}'

        image_rel_path = f'{base_path}/{uuid}.jpg' if image_file else None

        try:
            client = _gcs_client()
            bucket = client.bucket(user.stones_storage_edge)
            if image_file:
                bucket.blob(image_rel_path).upload_from_string(
                    image_file.read(), content_type='image/jpeg'
                )
            bucket.blob(f'{base_path}/{uuid}.json').upload_from_string(
                json.dumps(metadata).encode('utf-8'), content_type='application/json'
            )
        except GoogleCloudError:
            logger.exception(
                'GCS upload failed for coverage: user=%s, uuid=%s',
                user.id, uuid,
            )
            return Response(
                {'detail': 'Failed to store coverage. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            gprmc_str = data.get('gprmc')
            fix = parse_gprmc(gprmc_str)
            EdgeCoverage.objects.create(
                uuid=uuid,
                chunk=chunk_obj,
                serial=serial,
                version=data.get('version', '1'),
                gprmc=gprmc_str,
                image_path=image_rel_path,
                location=fix.location,
                captured_at=fix.captured_at,
                speed=fix.speed,
            )
        except Exception:
            logger.exception('Database write failed for coverage data: user=%s, uuid=%s',
                             user.id, uuid)
            return Response(
                {'detail': 'Failed to save coverage to database.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'uuid': uuid}, status=status.HTTP_201_CREATED)


class EdgeChunkDataAPIView(APIView):
    """Internal endpoint used by the Edge Detection Assembler
    container to read EdgeCoverage/EdgePrediction rows instead of listing and
    downloading the metadata JSON blobs it used to read from GCS.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        token = request.headers.get('X-Internal-Token', '')
        if not settings.EDGE_ASSEMBLER_API_TOKEN or not secrets.compare_digest(
            token, settings.EDGE_ASSEMBLER_API_TOKEN
        ):
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        username = request.query_params.get('username')
        date = request.query_params.get('date')
        chunk = request.query_params.get('chunk')
        if not (username and date and chunk):
            return Response(
                {'detail': "'username', 'date' and 'chunk' query params are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            chunk_index = int(chunk)
        except ValueError:
            return Response({'detail': "'chunk' must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        parsed_date = parse_date(date)
        if parsed_date is None:
            return Response(
                {'detail': "'date' must be in YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            predictions = list(
                EdgePrediction.objects.filter(
                    chunk__user__username=username,
                    chunk__date=parsed_date,
                    chunk__chunk=chunk_index,
                ).values('serial', 'gprmc', 'predictions', 'image_path')
            )
            coverage = list(
                EdgeCoverage.objects.filter(
                    chunk__user__username=username,
                    chunk__date=parsed_date,
                    chunk__chunk=chunk_index,
                ).values('serial', 'gprmc', 'image_path')
            )

        except Exception:
            logger.exception(
                f'Database query failed for EdgeChunkDataAPIView:'
                f' username={username}, date={date}, chunk={chunk}'
            )
            return Response(
                {'detail': 'Failed to fetch chunk data from database.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'predictions': predictions, 'coverage': coverage})
