from rest_framework import serializers

from transaction.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'completed')
        read_only_fields = ('user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'completed')
