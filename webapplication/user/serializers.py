from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name', 'area_limit_ha', 'planet_api_key', 'notify', 'notification_email')
        read_only_fields = ('area_limit_ha', 'email')
    
    def validate(self, attrs):
        if attrs.get('notify') and not (self.instance.notification_email or attrs.get('notification_email')):
                raise serializers.ValidationError("Please, specify email for notifications first!")
        return super().validate(attrs)