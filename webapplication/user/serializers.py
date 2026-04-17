from dj_rest_auth.serializers import PasswordResetSerializer as DefaultPasswordResetSerializer
from rest_framework import serializers

from user.forms import PasswordResetForm
from user.models import User, Transaction, UploadMissions


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name',
                  'area_limit_ha', 'planet_api_key', 'balance', 'on_hold',
                  'discount', 'trial_started_at', 'trial_finished_at',
                  'is_trial_end_notified', 'receive_notification',
                  'stone_google_folder', 'units_of_measurement', 'country')
        read_only_fields = ('email', 'area_limit_ha', 'balance', 'on_hold',
                            'discount', 'trial_started_at', 'trial_finished_at')


class TransactionSerializer(serializers.ModelSerializer):
    area_sq_km = serializers.SerializerMethodField()

    def get_area_sq_km(self, obj):
        req = obj.request
        if req is None:
            return None
        if obj.amount > 0:
            # Refund transaction: show the area difference for which money was returned
            charged = req.charged_area_sq_km
            processed = req.processed_area_sq_km
            if charged is not None and processed is not None:
                return round(charged - processed, 4)
            return None
        # Charge transaction: show the full charged area
        return req.charged_area_sq_km

    class Meta:
        model = Transaction
        fields = ('id', 'user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'error', 'completed', 'rolled_back', 'area_sq_km')
        read_only_fields = ('user', 'amount', 'created_at', 'updated_at', 'request', 'comment', 'error', 'completed',
                            'rolled_back')


class UploadMissionsSerializer(serializers.ModelSerializer):
    trajectory_status = serializers.SerializerMethodField()
    component_name = serializers.SerializerMethodField()

    def get_component_name(self, obj):
        return obj.component.name if obj.component else None

    class Meta:
        model = UploadMissions
        fields = ('id', 'gcs_path', 'status', 'created_at', 'component', 'component_name', 'trajectory_request', 'trajectory_status', 'uploaded_files')
        read_only_fields = ('id', 'created_at', 'trajectory_request')

    def get_trajectory_status(self, obj):
        if not obj.trajectory_request_id:
            return None
        req = obj.trajectory_request
        return {
            'id': req.id,
            'calculated': req.calculated,
            'success': req.success,
            'error': req.error or None,
            'finished_at': req.finished_at,
        }


class PasswordResetSerializer(DefaultPasswordResetSerializer):
    @property
    def password_reset_form_class(self):
        return PasswordResetForm


class CoverageMetadataSerializer(serializers.Serializer):
    uuid = serializers.CharField(max_length=64)
    version = serializers.CharField(max_length=64)
    gprmc = serializers.CharField(max_length=256)
    serial = serializers.CharField(max_length=128)


class PredictionsMetadataSerializer(CoverageMetadataSerializer):
    model_name = serializers.CharField(max_length=128)
    predictions = serializers.ListField()
    time_since_boot_sec = serializers.FloatField(min_value=0)
