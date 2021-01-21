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
        fields = ('id', 'name', 'image', 'path', 'kernel_name', 'is_validated')
        
        
class RequestSerializer(serializers.ModelSerializer):
    jupyter_notebook_name = serializers.ReadOnlyField()

    class Meta:
        model = Request
        fields = ('id', 'user', 'aoi', 'notebook', 'date_from', 'date_to', 'started_at', 'finished_at',
                  'error')
        fields = ('id', 'user_id', 'aoi_id', 'jupyter_notebook_id', 'jupyter_notebook_name',
                  'date_from', 'date_to', 'started_at', 'finished_at', 'error', )
