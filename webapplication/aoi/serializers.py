"""
Aoi serializer module.
"""
from rest_framework import serializers
from .models import AoI, JupyterNotebook, Request


class AoISerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        validated_data.pop('createdat', None)
        return AoI.objects.create(**validated_data)

    class Meta:
        model = AoI
        fields = ('id', 'name', 'polygon', 'createdat')
        read_only_fields = ['createdat', ]


class JupyterNotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = JupyterNotebook
        fields = ('id', 'name', 'image', 'path_to_a_notebook', 'kernel_name', 'is_validated')
        
        
class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ('id', 'user_id', 'aoi_id', 'jupyter_notebook_id', 'date_from', 'date_to', 'started_at', 'finished_at',
                  'error')
