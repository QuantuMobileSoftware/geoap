"""
Aoi serializer module.
"""
from rest_framework import serializers
from .models import AoI, JupyterNotebook, Request


class AoISerializer(serializers.ModelSerializer):
    class Meta:
        model = AoI
        fields = ('id', 'user', 'name', 'polygon', 'createdat', )
        read_only_fields = ['createdat', ]


class JupyterNotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = JupyterNotebook
        fields = ('id', 'name', 'image', 'path', 'kernel_name', 'options', 'is_validated', )
        
        
class RequestSerializer(serializers.ModelSerializer):
    notebook_name = serializers.ReadOnlyField()

    def create(self, validated_data):
        validated_data.update({'polygon': validated_data["aoi"].polygon})
        return Request.objects.create(**validated_data)

    class Meta:
        model = Request
        fields = ('id', 'user', 'aoi', 'notebook', 'notebook_name',
                  'date_from', 'date_to', 'started_at', 'finished_at', 'error', 'success', 'polygon',)
        read_only_fields = ['polygon', ]
