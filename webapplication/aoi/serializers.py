"""
Aoi serializer module.
"""
from rest_framework import serializers
from .models import AoI, JupyterNotebook


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
        fields = ('id', 'name', 'base_url', 'password', 'path_to_a_notebook', 'kernel_name')
