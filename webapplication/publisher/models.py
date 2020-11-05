from django.contrib.gis.db import models
from django.db.models import JSONField
from datetime import date


class Result(models.Model):
    filepath = models.CharField(max_length=200, unique=True, db_index=True, verbose_name='Original filepath')
    modifiedat = models.DateTimeField(verbose_name='Original file modification date')

    STRING = 'STRING'
    GEOJSON = 'GEOJSON'
    XYZ = 'XYZ'

    LAYER_TYPE_CHOICES = [
        (STRING, 'STRING'),
        (GEOJSON, 'GEOJSON'),
        (XYZ, 'XYZ'),
    ]
    layer_type = models.CharField(
        max_length=7,
        choices=LAYER_TYPE_CHOICES,
        verbose_name='Layer type',
    )

    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    rel_url = models.URLField(max_length=400, verbose_name='Layer URL')

    # Filled in by a Data science engineer
    options = JSONField(blank=True, null=True, verbose_name='Layer options')
    description = models.TextField(blank=True, null=True, verbose_name='Layer description')
    released = models.BooleanField(default=False, verbose_name='Released')

    start_date = models.DateField(verbose_name='Start date', default=date.today)
    end_date = models.DateField(verbose_name='End date', default=date.today)
    name = models.CharField(max_length=200, blank=True, null=True, verbose_name='Layer name')

    def __str__(self):
        return self.filepath

    class Meta:
        verbose_name = 'Result'
        verbose_name_plural = 'Results'
        ordering = ['-modifiedat']
