import json
import logging
import os
from datetime import datetime, timezone, timedelta

from django.conf import settings
from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from devices.models import Camera
from user.models import StonesDetectionChunk
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


class PredictionsAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        metadata_file = request.FILES.get('metadata')
        image_file = request.FILES.get('image')

        if not metadata_file or not image_file:
            return Response(
                {'detail': "Both 'metadata' and 'image' fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file.size > MAX_IMAGE_SIZE:
            return Response(
                {'detail': f'Image exceeds maximum allowed size of {MAX_IMAGE_SIZE // (1024 * 1024)} MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = json.loads(metadata_file.read())
        except (json.JSONDecodeError, UnicodeDecodeError):
            return Response(
                {'detail': 'metadata must be valid JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PredictionsMetadataSerializer(data=metadata)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = _resolve_user_by_serial(serializer.validated_data['serial'])
        if user is None:
            return Response({'detail': 'Unknown camera serial number.'}, status=status.HTTP_403_FORBIDDEN)

        if not user.stone_google_folder:
            return Response(
                {'detail': 'Storage bucket is not configured for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uuid = serializer.validated_data['uuid']
        chunk_obj = _get_or_create_chunk(user, StonesDetectionChunk.TYPE_PREDICTIONS)
        base_path = f'{chunk_obj.gcs_path}{uuid}'

        try:
            client = _gcs_client()
            bucket = client.bucket(user.stone_google_folder)
            bucket.blob(f'{base_path}/{uuid}.jpg').upload_from_string(
                image_file.read(), content_type='image/jpeg'
            )
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

        return Response({'uuid': uuid}, status=status.HTTP_201_CREATED)


class CoverageAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        metadata_file = request.FILES.get('metadata')
        image_file = request.FILES.get('image')

        if not metadata_file:
            return Response(
                {'detail': "'metadata' field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file and image_file.size > MAX_IMAGE_SIZE:
            return Response(
                {'detail': f'Image exceeds maximum allowed size of {MAX_IMAGE_SIZE // (1024 * 1024)} MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            metadata = json.loads(metadata_file.read())
        except (json.JSONDecodeError, UnicodeDecodeError):
            return Response(
                {'detail': 'metadata must be valid JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CoverageMetadataSerializer(data=metadata)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = _resolve_user_by_serial(serializer.validated_data['serial'])
        if user is None:
            return Response({'detail': 'Unknown camera serial number.'}, status=status.HTTP_403_FORBIDDEN)

        if not user.stone_google_folder:
            return Response(
                {'detail': 'Storage bucket is not configured for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uuid = serializer.validated_data['uuid']
        chunk_obj = _get_or_create_chunk(user, StonesDetectionChunk.TYPE_COVERAGE)
        base_path = f'{chunk_obj.gcs_path}{uuid}'

        try:
            client = _gcs_client()
            bucket = client.bucket(user.stone_google_folder)
            if image_file:
                bucket.blob(f'{base_path}/{uuid}.jpg').upload_from_string(
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

        return Response({'uuid': uuid}, status=status.HTTP_201_CREATED)
