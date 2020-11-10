from django.contrib.gis.db import models
from django.utils import timezone


class AoI(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Aoi name')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    create_date = models.DateTimeField(default=timezone.now)
    description = models.TextField(blank=True, null=True, verbose_name='Aoi description')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Area of interest'
        verbose_name_plural = 'Areas of interest'
        ordering = ['name']
