from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from transaction.models import Transaction
from transaction.serializers import TransactionSerializer


class TransactionsListAPIView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    pagination_class = None
