from django.urls import path

from user.views import TransactionListAPIView, GoogleBucketFolderAPIView, GenerateResumableUploadURLAPIView

urlpatterns = [
    path('transactions/', TransactionListAPIView.as_view(), name='get_transactions_list'),
    path('google_bucket_folder/', GoogleBucketFolderAPIView.as_view(), name='google_bucket_folder'),
    path('generate_upload_url/', GenerateResumableUploadURLAPIView.as_view(), name='generate_upload_url'),
]
