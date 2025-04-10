"""
Aoi serializer module.
"""
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from datetime import datetime, timedelta
from django.utils import timezone



from .models import AoI, Component, Request


class AoISerializer(serializers.ModelSerializer):
    class Meta:
        model = AoI
        fields = ('id', 'user', 'name', 'polygon', 'createdat', 'type', 'sentinel_hub_available_dates', 'sentinel_hub_available_dates_update_time', 'square_in_km')
        read_only_fields = ['createdat', 'square_in_km']


class ComponentSerializer(serializers.ModelSerializer):
    path = serializers.CharField(source="notebook_path")

    class Meta:
        model = Component
        fields = ('id', 'name', 'basic_price', 'image', 'path', 'kernel_name', 'run_validation', 'success',
                  'additional_parameter', 'additional_parameter2', 'period_required', 'date_type', 'description', 'domains',
                  'description_picture', 'detail_description_link', 'google_bucket_input_data')

    def to_representation(self, instance):
        data = super(ComponentSerializer, self).to_representation(instance)

        flags = []
        if instance.sentinel1_aws_creds_required:
            flags.append("Sentinel-1")
        if instance.sentinel_google_api_key_required:
            flags.append("Sentinel-2")

        data['sentinels'] = flags

        return data


class RequestSerializer(serializers.ModelSerializer):
    pre_submit = serializers.BooleanField(write_only=True, default=False, required=False)
    notebook_name = serializers.ReadOnlyField(source='component_name', label="Component name")
    notebook = serializers.PrimaryKeyRelatedField(source='component', many=False, queryset=Component.objects,
                                                  label="Component id")

    def create(self, validated_data):
        if validated_data.get("aoi"):
            validated_data.update({'polygon': validated_data["aoi"].polygon})
            calculation_time = validated_data.get("component").average_calculation_time_per_km2 * validated_data[
                "aoi"].square_in_km
            estimated_finish_time = timezone.now() + timedelta(seconds=calculation_time)
            validated_data.update({'estimated_finish_time': estimated_finish_time})
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.estimated_finish_time:
            current_time = datetime.now(timezone.utc)
            data['remaining_time'] = (instance.estimated_finish_time - current_time).total_seconds()
        else:
            data['remaining_time'] = None
        return data

    class Meta:
        model = Request
        fields = ('id', 'user', 'aoi', 'notebook', 'notebook_name',
                  'date_from', 'date_to', 'started_at', 'finished_at', 'error', 'calculated', 'success', 'polygon',
                  'additional_parameter', 'additional_parameter2', 'pre_submit', 'request_origin', 'user_readable_errors')
