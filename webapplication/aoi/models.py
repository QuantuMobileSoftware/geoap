from django.contrib.gis.db import models
from django.db.models import JSONField
from django.utils import timezone
from user.models import User


class AoI(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='User id', related_name='aoi')
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='AOI name')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    createdat = models.DateTimeField(default=timezone.now)

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
    is_validated = models.BooleanField(default=False, verbose_name='Is validated')
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Jupyter Notebook'
        verbose_name_plural = 'Jupyter Notebooks'
        ordering = ['name']
        
        
class Request(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='User id')
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

    @property
    def notebook_name(self):
        return self.notebook.name
