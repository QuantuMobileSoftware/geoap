from rest_framework import serializers
from django.contrib.gis.db import models
from django.db.models import JSONField
from django.utils import timezone


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
        
        
class JupyterNotebook(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Notebook name')
    image = models.CharField(max_length=400, verbose_name='Image')
    path = models.CharField(max_length=200, unique=True, verbose_name='Path to a notebook')
    kernel_name = models.CharField(max_length=200, null=False, blank=False, verbose_name='Kernel name')
    options = JSONField(blank=True, null=True, verbose_name='Additional container options')
    run_validation = models.BooleanField(default=False, verbose_name='Run validation')
    success = models.BooleanField(default=False, verbose_name='Validation succeeded')
    additional_parameter = models.CharField(max_length=50, null=True, blank=True, verbose_name='Additional parameter')
    run_on_gpu = models.BooleanField(default=True, verbose_name='Whether GPU is needed for a notebook to run')
    period_required = models.BooleanField(default=True, verbose_name='Start and end dates are required')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Jupyter Notebook'
        verbose_name_plural = 'Jupyter Notebooks'
        ordering = ['name']
       

class Input(models.Model):

    class InputDataType(models.TextChoices):
        INT = 'INT','Integer'
        STR = 'STR','String'
        FLOAT = 'FLOAT','Float'
        BOOL = 'BOOL','Boolean'
        LIST = 'LIST','List'
        DATE = 'DATE','Date'

    class AssigningMethod(models.TextChoices):
        GLOBAL_SETTINGS = "settings",'Global settings'
        USER_ATTRIBUTES = "user",'User attributes'
        REQUEST_ATTRIBUTES = "request",'Request attributes'
        ANOTHER_COMPONENT = "component",'Another component'

    name = models.CharField(max_length=50, verbose_name='Name')
    type = models.CharField(
        max_length=10, 
        verbose_name='Type',
        choices=InputDataType.choices,
        default=InputDataType.STR
    )
    assigned_from = models.CharField(max_length=20,
        choices=AssigningMethod.choices,
        default=AssigningMethod.USER_ATTRIBUTES,
        verbose_name="Attribute's origin"
    )
    is_file = models.BooleanField(default=False, verbose_name='Is it a file?')

    def __str__(self) -> str:
        return f'{self.name} | {self.type} | From: "{self.assigned_from}"'


class Output(models.Model):
    name = models.CharField(max_length=50, verbose_name='Name')
    special_output = models.BooleanField(default=False)
    

class Component(models.Model):
    name = models.CharField(max_length=50, verbose_name='Name')
    image = models.CharField(max_length=255, verbose_name='Image tag')
    command = models.CharField(
        max_length=1000,
        null=True, 
        blank=True,
        verbose_name='Command'
    )
    inputs = models.ManyToManyField(Input)
    outputs = models.ManyToManyField(Output)
    require_GPU = models.BooleanField(default=False, verbose_name='Whether GPU is needed for a component to run')
    run_validation = models.BooleanField(default=False, verbose_name='Run validation')
    success = models.BooleanField(default=False, verbose_name='Validation succeeded')

    def __str__(self) -> str:
        return self.name


class Request(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.PROTECT, verbose_name='User id')
    aoi = models.ForeignKey(AoI, null=True, on_delete=models.SET_NULL, verbose_name='AOI id')
    notebook = models.ForeignKey(
        JupyterNotebook, on_delete=models.PROTECT,
        verbose_name='Notebook id',
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
    def notebook_name(self):
        return self.notebook.name
