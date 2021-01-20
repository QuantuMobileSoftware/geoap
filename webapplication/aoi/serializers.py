"""
Aoi serializer module.
"""
from rest_framework import serializers
from .models import AoI, JupyterNotebook, Request


class AoISerializer(serializers.ModelSerializer):
    class Meta:
        model = AoI
        fields = ('id', 'user', 'name', 'polygon', 'createdat')
        read_only_fields = ['createdat', ]


class JupyterNotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = JupyterNotebook
        fields = ('id', 'name', 'image', 'path_to_a_notebook', 'kernel_name', 'is_validated')
        
        
class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ('id', 'user', 'aoi', 'notebook', 'date_from', 'date_to', 'started_at', 'finished_at',
                  'error')
