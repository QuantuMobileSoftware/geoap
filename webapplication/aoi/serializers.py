"""
Aoi serializer module.
"""
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import AoI, Component, Request


class AoISerializer(serializers.ModelSerializer):
    class Meta:
        model = AoI
        fields = ('id', 'user', 'name', 'polygon', 'createdat', 'type')
        read_only_fields = ['createdat', ]


class ComponentSerializer(serializers.ModelSerializer):
    path = serializers.CharField(source="notebook_path")

    class Meta:
        model = Component
        fields = ('id', 'name', 'basic_price', 'image', 'path', 'kernel_name', 'run_validation', 'success',
                  'additional_parameter', 'period_required', 'date_type')


class RequestSerializer(serializers.ModelSerializer):
    pre_submit = serializers.BooleanField(write_only=True, default=False, required=False)
    notebook_name = serializers.ReadOnlyField(source='component_name', label="Component name")
    notebook = serializers.PrimaryKeyRelatedField(source='component', many=False, queryset=Component.objects,
                                                  label="Component id")

    def create(self, validated_data):
        validated_data.update({'polygon': validated_data["aoi"].polygon})
        if validated_data.pop('pre_submit'):
            return Request(**validated_data)
        return Request.objects.create(**validated_data)

    def validate(self, attrs):
        """ 
        Additional validation of the whole model:
        - If chosen notebook that require period then date_from and date_to in request 
        are  required as well      
        """
        if attrs['component'].period_required and (not 'date_from' in attrs or not 'date_to' in attrs):
            exception_details = {}
            if not 'date_from' in attrs:
                exception_details.update(
                    {'date_from': f"The field is required for '{attrs['component'].name}' component"})
            if not 'date_to' in attrs:
                exception_details.update(
                    {'date_to': f"The field is required for '{attrs['component'].name}' component"})
            raise serializers.ValidationError(exception_details)
        return super().validate(attrs)

    class Meta:
        model = Request
        fields = ('id', 'user', 'aoi', 'notebook', 'notebook_name',
                  'date_from', 'date_to', 'started_at', 'finished_at', 'error', 'calculated', 'success', 'polygon',
                  'additional_parameter', 'pre_submit')
        read_only_fields = ('polygon',)
