from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.geos import GEOSGeometry
from django.utils.translation import gettext_lazy as _
from django.core.validators import MaxValueValidator

from aoi.models import AoI


class User(AbstractUser):
    area_limit_ha = models.IntegerField(null=True, default=None, blank=True)
    planet_api_key = models.CharField(max_length=64, verbose_name='Planet API Key', null=True, default=None, blank=True)
    balance = models.DecimalField(_('Balance'), max_digits=9, decimal_places=2, default=0, null=True, blank=True)
    on_hold = models.DecimalField(_("On hold"), max_digits=9, decimal_places=2, default=0, null=True, blank=True)
    discount = models.PositiveIntegerField(_("Discount"), null=True, blank=True, default=0,
                                           validators=(MaxValueValidator(100),))
    trial_started_at = models.DateTimeField(blank=True, null=True, verbose_name='Trial started at')
    trial_finished_at = models.DateTimeField(blank=True, null=True, verbose_name='Trial finished at')
    is_trial_end_notified = models.BooleanField(default=False, verbose_name='Is trial end notified')
    receive_notification = models.BooleanField(default=True, verbose_name='Receive Notification')
    receive_news = models.BooleanField(default=False, verbose_name='Receive News')



    @property
    def areas_total_ha(self):
        total = 0
        polygon_union = AoI.objects.filter(user=self).values('id', 'polygon')
        for record in polygon_union:
            # EPSG:4326 has degree units
            # EPSG:8857 has metre units
            # we need to convert EPSG:4326 to EPSG:8857
            record['polygon'].transform(8857)
            total = total + record['polygon'].area / 10000
        return total
    
    def can_add_new_area(self, polygon_str):
        if not self.area_limit_ha:
            return True
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(8857)
        if (polygon.area / 10000 + self.areas_total_ha) > self.area_limit_ha:
            return False
        return True
    
    def can_update_area(self, aoi_id, polygon_str):
        if not self.area_limit_ha:
            return True
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(8857)
        new_area_ha = polygon.area / 10000
        
        aoi = AoI.objects.get(id=aoi_id)
        aoi_polygon = aoi.polygon
        aoi_polygon.transform(8857)
        old_area_ha = aoi_polygon.area / 10000
        
        if self.areas_total_ha - old_area_ha + new_area_ha > self.area_limit_ha:
            return False
        return True
