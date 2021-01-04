from django.contrib.gis.db import models
from django.utils import timezone


class AoI(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Aoi name')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    createdat = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Area of interest'
        verbose_name_plural = 'Areas of interest'
        ordering = ['name']
        
        
class JupyterNotebook(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Jupyter Notebook name')
    base_url = models.URLField(max_length=400, verbose_name='Base url')
    password = models.CharField(max_length=128)
    path_to_a_notebook = models.CharField(max_length=200, unique=True, verbose_name='Path to a notebook')
    kernel_name = models.CharField(max_length=200, null=True, blank=True)
