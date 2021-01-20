from django.contrib.gis.db import models
from django.db.models import JSONField
from django.contrib.postgres.fields import ArrayField
from user.models import User
from aoi.models import Request


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

    bounding_polygon = models.PolygonField(spatial_index=True, verbose_name='Bounding polygon')
    rel_url = models.URLField(max_length=400, verbose_name='Layer URL')
    request = models.ForeignKey(Request, on_delete=models.SET_NULL, null=True, verbose_name="Client's request id")

    # Filled in by a Data science engineer
    options = JSONField(blank=True, null=True, verbose_name='Layer options')
    description = models.TextField(blank=True, default='', verbose_name='Layer description')
    released = models.BooleanField(default=False, verbose_name='Released')
    to_be_deleted = models.BooleanField(default=False, verbose_name='To be deleted')
    start_date = models.DateField(blank=True, null=True, verbose_name='Start date')
    end_date = models.DateField(blank=True, null=True, verbose_name='End date')
    name = models.CharField(max_length=200, blank=True, default='', verbose_name='Layer name')

    def __str__(self):
        return self.filepath

    class Meta:
        verbose_name = 'Result'
        verbose_name_plural = 'Results'
        ordering = ['-modifiedat']


class ACL(models.Model):
    user_id = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='User name')
    restrict_projects_to = ArrayField(models.CharField(max_length=20), blank=True, verbose_name='Restrict projects to')

    def __str__(self):
        return self.user_id.username

    def save(self, *args, **kwargs):
        for i in range(len(self.restrict_projects_to)):
            self.restrict_projects_to[i] = str(self.restrict_projects_to[i]).upper()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Access Control List'
        verbose_name_plural = 'Access Control Lists'
        ordering = ['user_id']
