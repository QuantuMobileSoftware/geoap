from django.urls import path

from user.views import TransactionListAPIView, GoogleBucketFolderAPIView

urlpatterns = [
    path('transactions/', TransactionListAPIView.as_view(), name='get_transactions_list'),
    path('google_bucket_folder/', GoogleBucketFolderAPIView.as_view(), name='get_transactions_list'),
]
