from django.urls import path

from user.views import (
    TransactionListAPIView,
    GoogleBucketFolderAPIView,
    GenerateResumableUploadURLAPIView,
    GenerateDownloadURLAPIView,
    UploadMissionsListCreateAPIView,
    UploadMissionsUpdateAPIView,
    UploadMissionsDeleteAPIView,
    UploadMissionsRemoveFilesAPIView,
    UploadMissionsRerunTrajectoryAPIView,
    UnitListAPIView,
    UnitTelemetryAPIView,
    UnitLatestImageURLAPIView,
)
from user.stone_device_views import PredictionsAPIView, CoverageAPIView, EdgeChunkDataAPIView

urlpatterns = [
    path('transactions/', TransactionListAPIView.as_view(), name='get_transactions_list'),
    path('google_bucket_folder/', GoogleBucketFolderAPIView.as_view(), name='google_bucket_folder'),
    path('generate_upload_url/', GenerateResumableUploadURLAPIView.as_view(), name='generate_upload_url'),
    path('generate_download_url/', GenerateDownloadURLAPIView.as_view(), name='generate_download_url'),
    path('upload_missions/', UploadMissionsListCreateAPIView.as_view(), name='upload_missions_list'),
    path('upload_missions/<int:pk>/', UploadMissionsUpdateAPIView.as_view(), name='upload_mission_detail'),
    path('upload_missions/<int:pk>/delete/', UploadMissionsDeleteAPIView.as_view(), name='upload_mission_delete'),
    path('upload_missions/<int:pk>/remove_files/', UploadMissionsRemoveFilesAPIView.as_view(), name='upload_mission_remove_files'),
    path('upload_missions/<int:pk>/rerun_trajectory/', UploadMissionsRerunTrajectoryAPIView.as_view(), name='upload_mission_rerun_trajectory'),
    path('predictions', PredictionsAPIView.as_view(), name='device_predictions'),
    path('coverage', CoverageAPIView.as_view(), name='device_coverage'),
    path('edge-chunk-data/', EdgeChunkDataAPIView.as_view(), name='edge_chunk_data'),
    path('units', UnitListAPIView.as_view(), name='unit_list'),
    path('units/telemetry', UnitTelemetryAPIView.as_view(), name='unit_telemetry'),
    path('units/<str:unit_id>/latest_image_url/', UnitLatestImageURLAPIView.as_view(), name='unit_latest_image_url'),
]
