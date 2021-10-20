from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.geos import GEOSGeometry
from aoi.models import AoI


class User(AbstractUser):
    area_limit = models.IntegerField(default=settings.AREA_LIMIT_DEFAULT)

    @property
    def get_areas_total(self):
        total = 0
        polygon_union = AoI.objects.filter(user=self).values('id', 'polygon')
        for record in polygon_union:
            record['polygon'].transform(3857)
            total = total + record['polygon'].area / 10000
        return total
    
    def can_add_new_area(self, polygon_str):
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(3857)
        if (polygon.area / 10000 + self.get_areas_total) > self.area_limit:
            return False
        return True
    
    def can_update_area(self, aoi_id, polygon_str):
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(3857)
        new_area = polygon.area / 10000

        total_area = 0
        polygon_union = AoI.objects.filter(user=self).values('id', 'polygon').exclude(id=int(aoi_id))
        for record in polygon_union:
            record['polygon'].transform(3857)
            total_area = total_area + record['polygon'].area / 10000
        
        if total_area + new_area > self.area_limit:
            return False
        return True
