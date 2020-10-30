import os
import json
import rasterio
import rasterio.features
import rasterio.warp

from abc import ABCMeta, abstractmethod
from datetime import datetime
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.sites.models import Site
from django.utils import timezone
from ...models import Results


class File(metaclass=ABCMeta):
    def __init__(self, path):
        self.path = path

    def filename(self):
        filename = os.path.basename(self.path)
        return filename

    def modified(self):
        timestamp = os.path.getmtime(self.path)
        timestamp = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        return timestamp

    def abs_url(self):
        current_site = Site.objects.get_current()
        url = f"https://{current_site.domain}/results/{self.filename()}"
        return url

    @abstractmethod
    def type(self):
        pass

    @abstractmethod
    def polygon(self):
        pass

    @abstractmethod
    def rel_url(self):
        pass

    def as_dict(self):
        return dict(filename=self.filename(),
                    modified=self.modified(),
                    abs_url=self.abs_url(), )


class Geojson(File):
    def __init__(self, path):
        super().__init__(path)

    def type(self):
        return Results.GEOJSON

    def rel_url(self):
        return f"/results/{super().filename()}"

    def polygon(self):
        with open(self.path) as file:
            asset = json.load(file)
        polygon = str(asset['geometry'])
        polygon = GEOSGeometry(polygon)
        return polygon

    def as_dict(self):
        dict_ = dict(type=self.type(),
                     rel_url=self.rel_url(),
                     polygon=self.polygon(), )

        dict_.update(super().as_dict())
        return dict_


class Geotif(File):
    def __init__(self, path):
        super().__init__(path)

    def type(self):
        return Results.XYZ

    def rel_url(self):
        return f"/tiles/{super().filename().split('.')[0]}/z/x/y/.png"

    def polygon(self):
        with rasterio.open(self.path) as dataset:
            mask = dataset.dataset_mask()
            # Extract feature shapes and values from the array.
            for geom, _ in rasterio.features.shapes(mask, transform=dataset.transform):
                geom = rasterio.warp.transform_geom(dataset.crs, 'EPSG:4326', geom, precision=6)
                polygon = json.dumps(geom)

        polygon = GEOSGeometry(polygon)
        return polygon

    def as_dict(self):
        dict_ = dict(type=self.type(),
                     rel_url=self.rel_url(),
                     polygon=self.polygon(), )

        dict_.update(super().as_dict())
        return dict_
