from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.geos import GEOSGeometry
from aoi.models import AoI


class User(AbstractUser):
    area_limit_ha = models.IntegerField(null=True, default=None)

    @property
    def areas_total_ha(self):
        total = 0
        polygon_union = AoI.objects.filter(user=self).values('id', 'polygon')
        for record in polygon_union:
            # EPSG:4326 has degree units
            # EPSG:3857 has metre units
            # we need to convert EPSG:4326 to EPSG:3857
            record['polygon'].transform(3857)
            total = total + record['polygon'].area / 10000
        return total
    
    def can_add_new_area(self, polygon_str):
        if not self.area_limit_ha:
            return True
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(3857)
        if (polygon.area / 10000 + self.areas_total_ha) > self.area_limit_ha:
            return False
        return True
    
    def can_update_area(self, aoi_id, polygon_str):
        if not self.area_limit_ha:
            return True
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(3857)
        new_area_ha = polygon.area / 10000
        
        aoi = AoI.objects.get(id=aoi_id)
        aoi_polygon = aoi.polygon
        aoi_polygon.transform(3857)
        old_area_ha = aoi_polygon.area / 10000
        
        if self.areas_total_ha - old_area_ha + new_area_ha > self.area_limit_ha:
            return False
        return True
