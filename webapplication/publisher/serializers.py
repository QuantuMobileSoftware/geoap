"""
Results serializer module.
"""
from rest_framework import serializers
from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ('id', 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'options', 'description',
                  'released', 'start_date', 'end_date', 'name', 'to_be_deleted')
        read_only_fields = ['filepath', 'fmodifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'to_be_deleted']
