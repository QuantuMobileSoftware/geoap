from django.urls import path

from user.views import TransactionListAPIView

urlpatterns = [
    path('transactions/', TransactionListAPIView.as_view(), name='get_transactions_list'),
]
