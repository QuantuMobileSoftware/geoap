"""
Results serializer module.
"""
from rest_framework import serializers
from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ('id', 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'options', 'description',
                  'released', 'start_date', 'end_date', 'name', 'to_be_deleted', 'request', 'styles_url', 'labels',
                  'colormap', 'validated', 'validation_start_date', 'validation_end_date')
        
        read_only_fields = ['filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'to_be_deleted',
                            'request', 'styles_url', 'labels', 'colormap']


class PointSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    
    class Meta:
        fields = ['lat', 'lng']
