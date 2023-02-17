from django.urls import path

from user.views import TransactionsListAPIView

urlpatterns = [
    path('transactions/', TransactionsListAPIView.as_view(), name='get_transactions_list'),
]
