import logging
import os
from datetime import datetime
from allauth.account.views import ConfirmEmailView
from dj_rest_auth.registration.views import RegisterView as BasicRegisterView
from django.conf import settings
from django.contrib.auth.models import Group
from django.http import Http404
from rest_framework import status
from django.utils.translation import gettext_lazy as _
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView
from dj_rest_auth.views import UserDetailsView

from user.models import Transaction, User
from aoi.models import Component
from django.db.models import Q
from user.serializers import TransactionSerializer, UserSerializer
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
        if google_bucket_folder_path:
            storage_client = storage.Client.from_service_account_json(
                os.path.join(settings.PERSISTENT_STORAGE_PATH,
                             settings.OPERATIONS_SERVICE_CREDS))
            bucket = storage_client.bucket(google_bucket_folder_path)
            if bucket.exists():
                blobs = storage_client.list_blobs(google_bucket_folder_path)
                paths = [blob.name for blob in blobs]
                results = []
                for path in paths:
                    if path.endswith("/"):
                        if path not in results:
                            results.append(path)
                    else:
                        filepath = f'{"/".join(path.split("/")[:-1])}/'
                        if filepath not in results:
                            results.append(filepath)

                if results:
                    return Response(results)
                else:
                    return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)


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

    # None means the file goes directly into the session folder (no subfolder)
    UPLOAD_TYPE_FOLDERS = {
        "data_video": "DCIM",
        "log": "GPS_LOG",
        "calibration_video": None,
    }

    def get(self, request, *args, **kwargs):
        user_folder = request.user.stone_google_folder
        if not user_folder:
            return Response(status=status.HTTP_404_NOT_FOUND)

        file_name = request.query_params.get("file_name")
        file_type = request.query_params.get("file_type")
        upload_type = request.query_params.get("upload_type")
        session_folder = request.query_params.get("session_folder")

        if not file_name or not file_type or not upload_type:
            return Response(
                {"detail": "file_name, file_type, and upload_type query parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if upload_type not in self.UPLOAD_TYPE_FOLDERS:
            return Response(
                {"detail": f"upload_type must be one of: {', '.join(self.UPLOAD_TYPE_FOLDERS)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not session_folder:
            session_folder = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

        type_folder = self.UPLOAD_TYPE_FOLDERS[upload_type]
        if type_folder:
            blob_path = os.path.join(user_folder, session_folder, type_folder, file_name)
        else:
            blob_path = os.path.join(user_folder, session_folder, file_name)

        storage_client = storage.Client.from_service_account_json(
            os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
        )
        bucket = storage_client.bucket(settings.STONES_STORAGE_BUCKET)
        blob = bucket.blob(blob_path)
        resumable_url = blob.create_resumable_upload_session(
            content_type=file_type,
            origin=getattr(settings, "GOOGLE_CLOUD_UPLOAD_ORIGIN", None),
        )
        logger.info(
            f"Resumable URL generated for user={request.user.id}, upload_type={upload_type}, file={blob_path}"
        )
        return Response(
            {"upload_url": resumable_url, "session_folder": session_folder},
            status=status.HTTP_200_OK,
        )


