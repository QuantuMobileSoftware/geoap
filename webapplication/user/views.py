import logging
import os
from datetime import datetime, timedelta
from allauth.account.views import ConfirmEmailView
from dj_rest_auth.registration.views import RegisterView as BasicRegisterView
from django.conf import settings
from django.contrib.auth.models import Group
from django.http import Http404
from rest_framework import status
from django.utils.translation import gettext_lazy as _
from rest_framework.generics import ListAPIView, ListCreateAPIView, UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView
from dj_rest_auth.views import UserDetailsView

from user.models import Transaction, User, UploadMissions
from aoi.models import Component, Request
from django.db.models import Q
from user.serializers import TransactionSerializer, UserSerializer, UploadMissionsSerializer
from user.upload_utils import get_upload_config
from waffle import switch_is_active
from google.cloud import storage

logger = logging.getLogger(__name__)


class RegisterView(BasicRegisterView):
    def perform_create(self, serializer):
        user = super().perform_create(serializer)
        client_group = Group.objects.get(name="Client")
        user.groups.add(client_group)
        user.start_trial()
        return user


class CustomUserDetailsView(UserDetailsView):
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        component_with_remote_executions = Component.objects.filter(Q(success=True) & Q(geoap_creds_required=True))
        response.data['server_for_calculation_is_needed'] = component_with_remote_executions.exists()
        if component_with_remote_executions.exists():
            server_is_overloaded_notification = switch_is_active('our_server_is_overloaded_notification')
            remote_server_available = switch_is_active('remote_server_available')
            if server_is_overloaded_notification:
                response.data['remote_server_available'] = False
            else:
                response.data['remote_server_available'] = remote_server_available
        return response


class VerifyEmailView(APIView, ConfirmEmailView):
    permission_classes = (AllowAny,)
    allowed_methods = ('GET', 'OPTIONS', 'HEAD')

    def verify_email(self):
        confirmation = self.get_object()
        confirmation.confirm(self.request)

    def get(self, *args, **kwargs):
        try:
            self.verify_email()
        except Http404:
            raise NotFound(_("Email verification failed"))
        return Response(data=_("Email has been successfully confirmed!"), status=HTTP_200_OK)


class TransactionListAPIView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.has_perm("user.view_all_transactions"):
            return queryset
        return queryset.filter(user=self.request.user)


class GoogleBucketFolderAPIView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        google_bucket_folder_path = self.request.user.stone_google_folder
        if not google_bucket_folder_path:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            storage_client = storage.Client.from_service_account_json(
                os.path.join(settings.PERSISTENT_STORAGE_PATH,
                             settings.OPERATIONS_SERVICE_CREDS))
            bucket = storage_client.bucket(google_bucket_folder_path)
            if not bucket.exists():
                return Response(
                    {"detail": "Storage bucket not found. Please check the bucket name in your account settings."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user_prefix = f"{self.request.user.username}/"
            blobs = storage_client.list_blobs(google_bucket_folder_path, prefix=user_prefix)
            paths = [blob.name for blob in blobs]
        except Exception as e:
            logger.exception(
                "GCS error listing bucket folders for user=%s, bucket=%s: %s",
                request.user.id, google_bucket_folder_path, e,
            )
            return Response(
                {"detail": "Storage bucket is not available. Please check the bucket name in your account settings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = []
        for path in paths:
            parts = path.rstrip('/').split('/')
            # Collect folder paths up to the session level (username/year/session/)
            for depth in range(2, min(4, len(parts))):
                folder_path = '/'.join(parts[:depth]) + '/'
                if folder_path not in results:
                    results.append(folder_path)

        if results:
            return Response(results)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)


class GenerateResumableUploadURLAPIView(APIView):
    """
    Generate a GCS resumable upload session URL for uploading a file into the stones_storage bucket.
    Accepts: GET method.

    Required query params:
        'file_name'   — name of the file to upload
        'file_type'   — MIME type of the file (e.g. video/mp4)
        'upload_type' — one of: 'data_video', 'calibration_video', 'log'
    Optional query params:
        'session_folder' — datetime-named folder from a previous call in the same session;
                           if omitted a new folder is generated (YYYY-MM-DD_HH-MM-SS).

    GCS layout:
        stones_storage/<user_folder>/<session_folder>/DCIM/<file>          (data_video)
        stones_storage/<user_folder>/<session_folder>/GPS_LOG/<file>       (log)
        stones_storage/<user_folder>/<session_folder>/<file>               (calibration_video)

    Returns: {'upload_url': ..., 'session_folder': ...}
    """
    permission_classes = (IsAuthenticated,)
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        if not request.user.stone_google_folder:
            return Response(
                {"detail": "Upload bucket is not configured for this account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_folder = request.user.username

        file_name = request.query_params.get("file_name")
        file_type = request.query_params.get("file_type")
        upload_type = request.query_params.get("upload_type")
        session_folder = request.query_params.get("session_folder")

        if not file_name or not file_type or not upload_type:
            return Response(
                {"detail": "file_name, file_type, and upload_type query parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mission = UploadMissions.objects.filter(
            user=request.user, gcs_path=session_folder
        ).select_related('component').first() if session_folder else None
        component = (mission and mission.component) or request.user.default_upload_component

        try:
            upload_cfg = get_upload_config(component)
        except ValueError as e:
            logger.warning(
                "Invalid upload configuration for user=%s, component=%s: %s",
                getattr(request.user, "id", None),
                getattr(component, "id", None) if component is not None else None,
                e,
            )
            return Response(
                {"detail": _("Upload configuration is invalid for this account.")},
                status=status.HTTP_400_BAD_REQUEST,
            )
        upload_folders = upload_cfg['upload']
        unit_folder = upload_cfg['unit_folder']

        if upload_type not in upload_folders:
            return Response(
                {"detail": f"upload_type must be one of: {', '.join(upload_folders)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not session_folder:
            now = datetime.now()
            session_folder = f"{now.strftime('%Y')}/{now.strftime('%Y-%m-%d_%H-%M-%S')}"

        type_folder = upload_folders[upload_type]
        if type_folder:
            blob_path = os.path.join(user_folder, session_folder, unit_folder, type_folder, file_name)
        else:
            blob_path = os.path.join(user_folder, session_folder, unit_folder, file_name)

        try:
            storage_client = storage.Client.from_service_account_json(
                os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
            )
            bucket = storage_client.bucket(request.user.stone_google_folder)
            blob = bucket.blob(blob_path)
            resumable_url = blob.create_resumable_upload_session(
                content_type=file_type,
                origin=getattr(settings, "GOOGLE_CLOUD_UPLOAD_ORIGIN", None),
            )
        except Exception as e:
            logger.exception(
                "GCS error generating upload URL for user=%s, bucket=%s: %s",
                request.user.id, request.user.stone_google_folder, e,
            )
            return Response(
                {"detail": "Storage bucket is not available. Please check the bucket name in your account settings."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        logger.info(
            f"Resumable URL generated for user={request.user.id}, upload_type={upload_type}, file={blob_path}"
        )
        return Response(
            {"upload_url": resumable_url, "session_folder": session_folder},
            status=status.HTTP_200_OK,
        )


class GenerateDownloadURLAPIView(APIView):
    """
    Generate a short-lived GCS signed download URL for a previously uploaded file.
    Accepts: GET method.

    Required query params:
        'file_name'      — name of the file
        'upload_type'    — one of: 'data_video', 'calibration_video', 'log'
        'session_folder' — the gcs_path value stored on the mission (e.g. '2024/2024-01-01_12-00-00')

    Returns: {'download_url': ...}
    """
    permission_classes = (IsAuthenticated,)
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        if not request.user.stone_google_folder:
            return Response(
                {"detail": "Upload bucket is not configured for this account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_name = request.query_params.get("file_name")
        upload_type = request.query_params.get("upload_type")
        session_folder = request.query_params.get("session_folder")

        if not file_name or not upload_type or not session_folder:
            return Response(
                {"detail": "file_name, upload_type, and session_folder are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mission = UploadMissions.objects.filter(
            user=request.user, gcs_path=session_folder
        ).select_related('component').first()
        component = (mission and mission.component) or request.user.default_upload_component

        try:
            upload_cfg = get_upload_config(component)
        except ValueError as e:
            logger.exception("Failed to get upload config for component %s", component)
            return Response(
                {"detail": _("Invalid upload configuration.")},
                status=status.HTTP_400_BAD_REQUEST,
            )
        upload_folders = upload_cfg['upload']
        unit_folder = upload_cfg['unit_folder']

        if upload_type not in upload_folders:
            return Response(
                {"detail": f"upload_type must be one of: {', '.join(upload_folders)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_folder = request.user.username
        type_folder = upload_folders[upload_type]
        if type_folder:
            blob_path = os.path.join(user_folder, session_folder, unit_folder, type_folder, file_name)
        else:
            blob_path = os.path.join(user_folder, session_folder, unit_folder, file_name)

        try:
            storage_client = storage.Client.from_service_account_json(
                os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
            )
            bucket = storage_client.bucket(request.user.stone_google_folder)
            blob = bucket.blob(blob_path)
            download_url = blob.generate_signed_url(
                expiration=timedelta(hours=1),
                method="GET",
                version="v4",
            )
        except Exception as e:
            logger.exception(
                "GCS error generating download URL for user=%s, bucket=%s: %s",
                request.user.id, request.user.stone_google_folder, e,
            )
            return Response(
                {"detail": "Storage bucket is not available. Please check the bucket name in your account settings."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        logger.info(
            f"Download URL generated for user={request.user.id}, upload_type={upload_type}, file={blob_path}"
        )
        return Response({"download_url": download_url}, status=status.HTTP_200_OK)


class UploadMissionsListCreateAPIView(ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UploadMissionsSerializer
    pagination_class = None

    def get_queryset(self):
        return UploadMissions.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        now = datetime.now()
        session_folder = now.strftime("%Y-%m-%d_%H-%M-%S")
        year = now.strftime("%Y")
        gcs_path = f"{year}/{session_folder}"
        component = serializer.validated_data.get('component') or self.request.user.default_upload_component
        serializer.save(
            user=self.request.user,
            status=UploadMissions.STATUS_IN_PROGRESS,
            gcs_path=gcs_path,
            component=component,
        )


class UploadMissionsUpdateAPIView(UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UploadMissionsSerializer
    http_method_names = ['patch']

    def get_queryset(self):
        return UploadMissions.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        if (
            instance.status == UploadMissions.STATUS_COMPLETED
            and instance.component
            and self.request.user.stone_google_folder
            and not instance.trajectory_request_id
        ):
            full_gcs_path = (
                f"{self.request.user.stone_google_folder}"
                f"/{self.request.user.username}"
                f"/{instance.gcs_path}/"
            )
            trajectory_request = Request.objects.create(
                user=self.request.user,
                component=instance.component,
                aoi=None,
                polygon=None,
                additional_parameter=full_gcs_path,
            )
            instance.trajectory_request = trajectory_request
            instance.save(update_fields=['trajectory_request'])


class UploadMissionsDeleteAPIView(APIView):
    """Delete a failed mission and remove its GCS folder contents."""
    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk, *args, **kwargs):
        try:
            mission = UploadMissions.objects.get(pk=pk, user=request.user)
        except UploadMissions.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if mission.status != UploadMissions.STATUS_FAILED:
            return Response(
                {"detail": "Only failed missions can be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.stone_google_folder and mission.gcs_path:
            try:
                storage_client = storage.Client.from_service_account_json(
                    os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
                )
                bucket = storage_client.bucket(request.user.stone_google_folder)
                prefix = f"{request.user.username}/{mission.gcs_path}/"
                blobs = list(storage_client.list_blobs(request.user.stone_google_folder, prefix=prefix))
                if blobs:
                    bucket.delete_blobs(blobs, on_error=lambda blob: None)
            except Exception as e:
                logger.exception(
                    "GCS error deleting folder for mission=%s, user=%s: %s",
                    mission.id, request.user.id, e,
                )

        mission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UploadMissionsRemoveFilesAPIView(APIView):
    """Remove specific files from a completed mission and re-run trajectory."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        try:
            mission = UploadMissions.objects.select_related(
                'component', 'trajectory_request'
            ).get(pk=pk, user=request.user)
        except UploadMissions.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if mission.status != UploadMissions.STATUS_COMPLETED:
            return Response(
                {"detail": "Files can only be removed from completed missions."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        files_to_remove = request.data.get('files_to_remove', [])
        if not files_to_remove or not isinstance(files_to_remove, list):
            return Response(
                {"detail": "files_to_remove must be a non-empty list of file names."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        component = mission.component or request.user.default_upload_component
        try:
            upload_cfg = get_upload_config(component)
        except ValueError as e:
            logger.warning(
                "Invalid upload config for mission=%s, user=%s: %s",
                mission.id, request.user.id, e,
            )
            return Response(
                {"detail": "Upload configuration is invalid for this account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        upload_folders = upload_cfg['upload']
        unit_folder = upload_cfg['unit_folder']
        user_folder = request.user.username
        uploaded_files = mission.uploaded_files or []
        file_map = {f['name']: f for f in uploaded_files}

        if request.user.stone_google_folder:
            try:
                storage_client = storage.Client.from_service_account_json(
                    os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
                )
                bucket = storage_client.bucket(request.user.stone_google_folder)
                blobs_to_delete = []
                for file_name in files_to_remove:
                    file_record = file_map.get(file_name)
                    if not file_record:
                        continue
                    upload_type = file_record.get('type')
                    type_folder = upload_folders.get(upload_type)
                    if type_folder:
                        blob_path = os.path.join(
                            user_folder, mission.gcs_path, unit_folder, type_folder, file_name
                        )
                    else:
                        blob_path = os.path.join(
                            user_folder, mission.gcs_path, unit_folder, file_name
                        )
                    blobs_to_delete.append(bucket.blob(blob_path))
                if blobs_to_delete:
                    bucket.delete_blobs(blobs_to_delete, on_error=lambda blob: None)
            except Exception as e:
                logger.exception(
                    "GCS error removing files for mission=%s, user=%s: %s",
                    mission.id, request.user.id, e,
                )
                return Response(
                    {"detail": "Failed to delete files from storage."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        remove_set = set(files_to_remove)
        mission.uploaded_files = [f for f in uploaded_files if f['name'] not in remove_set]

        mission.trajectory_request = None
        mission.save(update_fields=['uploaded_files', 'trajectory_request'])

        if component and request.user.stone_google_folder:
            full_gcs_path = (
                f"{request.user.stone_google_folder}"
                f"/{request.user.username}"
                f"/{mission.gcs_path}/"
            )
            trajectory_request = Request.objects.create(
                user=request.user,
                component=component,
                aoi=None,
                polygon=None,
                additional_parameter=full_gcs_path,
            )
            mission.trajectory_request = trajectory_request
            mission.save(update_fields=['trajectory_request'])

        serializer = UploadMissionsSerializer(mission)
        return Response(serializer.data, status=status.HTTP_200_OK)


