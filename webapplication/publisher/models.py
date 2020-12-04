from django.contrib.gis.db import models
from django.db.models import JSONField
from django.contrib.postgres.fields import ArrayField
from user.models import User
from django.utils import timezone


class Result(models.Model):
    filepath = models.CharField(max_length=200, unique=True, db_index=True, verbose_name='Original filepath')
    modifiedat = models.DateTimeField(verbose_name='Original file modification date')

    GEOJSON = 'GEOJSON'
    MVT = 'MVT'
    XYZ = 'XYZ'

    LAYER_TYPE_CHOICES = [
        (GEOJSON, 'GEOJSON'),
        (MVT, 'MVT'),
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
    to_be_deleted = models.BooleanField(default=False, verbose_name='To be deleted')

    start_date = models.DateField(blank=True, null=True, verbose_name='Start date')
    end_date = models.DateField(blank=True, null=True, verbose_name='End date')
    name = models.CharField(max_length=200, blank=True, null=True, verbose_name='Layer name')

    def __str__(self):
        return self.filepath

    class Meta:
        verbose_name = 'Result'
        verbose_name_plural = 'Results'
        ordering = ['-modifiedat']


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


class ACL(models.Model):
    user_id = models.OneToOneField(User, on_delete=models.CASCADE)
    restrict_projects_to = ArrayField(models.CharField(max_length=20), blank=True)

    class Meta:
        verbose_name = 'Access Control List'
        verbose_name_plural = 'Access Control Lists'
        ordering = ['user_id']
