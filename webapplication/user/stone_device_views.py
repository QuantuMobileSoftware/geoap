import json
import logging
import os
from datetime import datetime, timezone, timedelta

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from google.cloud import storage

from user.authentication import CameraTokenAuthentication
from user.models import StonesDetectionChunk

logger = logging.getLogger(__name__)

SUPPORTED_VERSIONS = {'1'}

PREDICTIONS_REQUIRED_FIELDS = {'uuid', 'version', 'gprmc', 'model_name', 'predictions', 'time_since_boot_sec'}
COVERAGE_REQUIRED_FIELDS = {'uuid', 'version', 'gprmc'}


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
            'status': StonesDetectionChunk.STATUS_PENDING,
        },
    )
    return obj


def _gcs_client():
    creds_path = os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
    return storage.Client.from_service_account_json(creds_path)


class PredictionsAPIView(APIView):
    authentication_classes = [CameraTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        metadata_file = request.FILES.get('metadata')
        image_file = request.FILES.get('image')

        if not metadata_file or not image_file:
            return Response(
                {'detail': "Both 'metadata' and 'image' fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = json.loads(metadata_file.read())
        except (json.JSONDecodeError, UnicodeDecodeError):
            return Response(
                {'detail': 'metadata must be valid JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        version = str(metadata.get('version', ''))
        if version not in SUPPORTED_VERSIONS:
            return Response(
                {'detail': f"Unsupported version '{version}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        missing = PREDICTIONS_REQUIRED_FIELDS - metadata.keys()
        if missing:
            return Response(
                {'detail': f"Missing metadata fields: {', '.join(sorted(missing))}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.stone_google_folder:
            return Response(
                {'detail': 'Storage bucket is not configured for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uuid = metadata['uuid']
        chunk_obj = _get_or_create_chunk(request.user, StonesDetectionChunk.TYPE_PREDICTIONS)
        base_path = f'{chunk_obj.gcs_path}{uuid}'

        try:
            client = _gcs_client()
            bucket = client.bucket(request.user.stone_google_folder)
            bucket.blob(f'{base_path}/{uuid}.jpg').upload_from_string(
                image_file.read(), content_type='image/jpeg'
            )
            bucket.blob(f'{base_path}/{uuid}.json').upload_from_string(
                json.dumps(metadata).encode('utf-8'), content_type='application/json'
            )
        except Exception:
            logger.exception(
                'GCS upload failed for predictions: user=%s, uuid=%s',
                request.user.id, uuid,
            )
            return Response(
                {'detail': 'Failed to store prediction. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'uuid': uuid}, status=status.HTTP_201_CREATED)


class CoverageAPIView(APIView):
    authentication_classes = [CameraTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data

        version = str(data.get('version', ''))
        if version not in SUPPORTED_VERSIONS:
            return Response(
                {'detail': f"Unsupported version '{version}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        missing = COVERAGE_REQUIRED_FIELDS - data.keys()
        if missing:
            return Response(
                {'detail': f"Missing fields: {', '.join(sorted(missing))}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.stone_google_folder:
            return Response(
                {'detail': 'Storage bucket is not configured for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uuid = data['uuid']
        chunk_obj = _get_or_create_chunk(request.user, StonesDetectionChunk.TYPE_COVERAGE)

        try:
            client = _gcs_client()
            bucket = client.bucket(request.user.stone_google_folder)
            bucket.blob(f'{chunk_obj.gcs_path}{uuid}/{uuid}.json').upload_from_string(
                json.dumps(dict(data)).encode('utf-8'), content_type='application/json'
            )
        except Exception:
            logger.exception(
                'GCS upload failed for coverage: user=%s, uuid=%s',
                request.user.id, uuid,
            )
            return Response(
                {'detail': 'Failed to store coverage. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'uuid': uuid}, status=status.HTTP_201_CREATED)
