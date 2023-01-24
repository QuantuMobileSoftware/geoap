from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name', 'area_limit_ha', 'planet_api_key', 'notify_always', 'email_verified')
        read_only_fields = ('area_limit_ha', 'email_verified')
    
    def validate(self, attrs):
        if attrs.get('notify_always') and not self.instance.email_verified:
                raise serializers.ValidationError("Please, verify email first!")
        return super().validate(attrs)