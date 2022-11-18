import os
from typing import Dict
from django.contrib.gis.db import models
from django.utils import timezone
from django.conf import settings


class AoI(models.Model):
    USER_DEFINED_TYPE = 1
    FIELD_TYPE = 2
    AREA_TYPE_CHOICES = (
        (USER_DEFINED_TYPE, 'AREA'),
        (FIELD_TYPE, 'FIELD')
    )
    
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, verbose_name='User id', related_name='aoi')
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='AOI name')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    createdat = models.DateTimeField(default=timezone.now)
    type = models.IntegerField(choices=AREA_TYPE_CHOICES, default=USER_DEFINED_TYPE)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Area of interest'
        verbose_name_plural = 'Areas of interest'
        ordering = ['name']
        
        
class Component(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Notebook name')
    image = models.CharField(max_length=400, verbose_name='Image')
    command = models.CharField(max_length=400, blank=True, null=True, verbose_name="Command")
    path = models.CharField(max_length=200, unique=True, blank=True, null=True, verbose_name='Path to a notebook')
    kernel_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Kernel name')
    run_validation = models.BooleanField(default=False, verbose_name='Run validation')
    success = models.BooleanField(default=False, verbose_name='Validation succeeded')
    additional_parameter = models.CharField(max_length=50, null=True, blank=True, verbose_name='Additional parameter')
    run_on_gpu = models.BooleanField(default=True, verbose_name='Whether GPU is needed for a notebook to run')
    period_required = models.BooleanField(default=True, verbose_name='Start and end dates are required')
    planet_api_key_required = models.BooleanField(default=False, verbose_name='Plane API key is required')
    google_api_key_required = models.BooleanField(default=False, verbose_name='Google API key is required')

    def __str__(self):
        return self.name

    @property
    def is_notebook(self):
        return not (bool(self.command) and (not bool(self.path) and not bool(self.kernel_name)))

    class Meta:
        verbose_name = 'Component'
        verbose_name_plural = 'Components'
        ordering = ['name']
        
        
class Request(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.PROTECT, verbose_name='User id')
    aoi = models.ForeignKey(AoI, null=True, on_delete=models.SET_NULL, verbose_name='AOI id')
    component = models.ForeignKey(
        Component, on_delete=models.PROTECT,
        verbose_name='Request id',
    )
    date_from = models.DateField(blank=True, null=True, verbose_name='Date from')
    date_to = models.DateField(blank=True, null=True, verbose_name='Date to')
    started_at = models.DateTimeField(blank=True, null=True, verbose_name='Started at')
    finished_at = models.DateTimeField(blank=True, null=True, verbose_name='Finished at')
    calculated = models.BooleanField(default=False, verbose_name='Notebook calculated')
    success = models.BooleanField(default=False, verbose_name='Execution succeeded')
    error = models.CharField(max_length=400, blank=True, null=True, verbose_name='Error')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    additional_parameter = models.CharField(max_length=50, null=True, blank=True, verbose_name='Additional parameter')

    @property
    def component_name(self):
        return self.component.name
    
    def get_environment(self) -> Dict[str, str]:
        """Return dict of environment variables names (as keys) and values

        Returns:
            Dict[str, str]: _description_
        """
        env_variables = {
            'REQUEST_ID':str(self.pk),
            'AOI':self.aoi.polygon.wkt,
            'START_DATE':self.date_from.strftime("%Y-%m-%d"),
            'END_DATE':self.date_to.strftime("%Y-%m-%d"),
            'SENTINEL2_CACHE':self.user.planet_api_key,
            'CELL_TIMEOUT':str(settings.CELL_EXECUTION_TIMEOUT),
            'NOTEBOOK_TIMEOUT':str(settings.NOTEBOOK_EXECUTION_TIMEOUT),
            'KERNEL_NAME':self.component.kernel_name,
            'NOTEBOOK_PATH':self.component.path,
        }
        if self.component.is_notebook:
            env_update = {
                'OUTPUT_FOLDER':os.path.join('/home/jovyan/work/results', str(self.pk)),
                'SENTINEL2_GOOGLE_API_KEY':os.path.join('/home/jovyan/work/',settings.SENTINEL2_GOOGLE_API_KEY)
            }
        else:
            env_update = {
                'OUTPUT_FOLDER':'/output',
                'SENTINEL2_GOOGLE_API_KEY':os.path.join('/input',os.path.split(settings.SENTINEL2_GOOGLE_API_KEY)[1])
            }
        if self.component.additional_parameter:
            env_update.update(
                {
                    'ADDITIONAL_PARAMETER_NAME': self.component.additional_parameter,
                    self.component.additional_parameter:self.additional_parameter
                }
            )
        env_variables.update(env_update)
        return env_variables
