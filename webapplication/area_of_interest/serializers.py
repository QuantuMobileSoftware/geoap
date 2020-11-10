"""
AoI serializer module.
"""
from rest_framework import serializers
from .models import AoI


class AoISerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data.pop('create_date', None)
        return AoI.objects.create(**validated_data)

    class Meta:
        model = AoI
        fields = ('id', 'name', 'polygon', 'create_date', 'description')
        read_only_fields = ['create_date', ]
