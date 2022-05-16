from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name', 'area_limit_ha', 'planet_api_key', )
        read_only_fields = ('email', 'area_limit_ha', )