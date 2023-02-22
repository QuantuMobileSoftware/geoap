from rest_framework import serializers

from user.models import User, Transaction


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name', 'area_limit_ha', 'planet_api_key', 'balance',
                  'on_hold', 'discount')
        read_only_fields = ('email', 'area_limit_ha', 'balance', 'on_hold', 'discount')


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'completed')
        read_only_fields = ('user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'completed')
