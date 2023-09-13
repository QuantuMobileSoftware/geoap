from dj_rest_auth.serializers import PasswordResetSerializer as DefaultPasswordResetSerializer
from rest_framework import serializers

from user.forms import PasswordResetForm
from user.models import User, Transaction


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name', 'area_limit_ha', 'planet_api_key', 'balance',
                  'on_hold', 'discount', 'trial_started_at', 'trial_finished_at', 'is_trial_end_notified', 'receive_notification',)
        read_only_fields = ('email', 'area_limit_ha', 'balance', 'on_hold', 'discount', 'trial_started_at', 'trial_finished_at')


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'error', 'completed', 'rolled_back')
        read_only_fields = ('user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'error', 'completed',
                            'rolled_back')


class PasswordResetSerializer(DefaultPasswordResetSerializer):
    @property
    def password_reset_form_class(self):
        return PasswordResetForm
