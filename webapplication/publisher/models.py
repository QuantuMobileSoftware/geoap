from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from datetime import date


class Results(models.Model):
    filename = models.CharField(max_length=200, unique=True, db_index=True, verbose_name='Original filename')
    modified = models.DateTimeField(verbose_name='File modification date')
    abs_url = models.URLField(max_length=400, verbose_name='File absolute URL')

    STRING = 'STRING'
    GEOJSON = 'GEOJSON'
    TMS = 'TMS'
    XYZ = 'XYZ'

    TYPE_CHOICES = [
        (STRING, 'STRING'),
        (GEOJSON, 'GEOJSON'),
        (TMS, 'TMS'),
        (XYZ, 'XYZ'),
    ]
    type = models.CharField(
        max_length=7,
        choices=TYPE_CHOICES,
        verbose_name='Layer type'
    )

    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    rel_url = models.URLField(max_length=400, verbose_name='Relative domain URL')

    # Filled in by a Data science engineer
    properties = JSONField(null=True, verbose_name='Layer properties')
    description = models.TextField(null=True, verbose_name='Layer description')
    released = models.BooleanField(default=False, verbose_name='Released')

    start_date = models.DateField(verbose_name='Start date', default=date.today)
    end_date = models.DateField(verbose_name='End date', default=date.today)
    name = models.CharField(max_length=200, null=True, verbose_name='Layer name')

