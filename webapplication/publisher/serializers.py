"""
Results serializer module.
"""
from rest_framework import serializers
from .models import Result, AoI


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ('id', 'filepath', 'modifiedat', 'layer_type', 'polygon', 'rel_url', 'options', 'description',
                  'released', 'start_date', 'end_date', 'name', 'to_be_deleted')
        read_only_fields = ['filepath', 'fmodifiedat', 'layer_type', 'polygon', 'rel_url', 'to_be_deleted']


class AoISerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data.pop('createdat', None)
        return AoI.objects.create(**validated_data)

    class Meta:
        model = AoI
        fields = ('id', 'name', 'polygon', 'createdat')
        read_only_fields = ['createdat', ]
