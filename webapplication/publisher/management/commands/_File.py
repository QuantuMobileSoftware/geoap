import logging
import os
import json
import shutil
import rasterio
import rasterio.features
import rasterio.warp

from abc import ABCMeta, abstractmethod
from subprocess import Popen, PIPE, TimeoutExpired
from datetime import datetime
from django.contrib.gis.geos import GEOSGeometry
from django.utils import timezone
from ...models import Result

logger = logging.getLogger(__name__)


class File(metaclass=ABCMeta):
    def __init__(self, path, basedir):
        self.path = path
        self.basedir = basedir
        self.srid = 'EPSG:4326'

    def filename(self):
        return os.path.basename(self.path)

    def filepath(self):
        filepath = os.path.relpath(self.path, self.basedir)
        return filepath

    def modifiedat(self):
        timestamp = os.path.getmtime(self.path)
        timestamp = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        return timestamp

    @abstractmethod
    def layer_type(self):
        pass

    @abstractmethod
    def polygon(self):
        pass

    @abstractmethod
    def rel_url(self):
        pass

    @abstractmethod
    def generate_tile(self, *args, **kwargs):
        pass

    @staticmethod
    def delete_tile(filepath, base_dir):
        delete_path = os.path.join(base_dir, os.path.splitext(filepath)[0])
        try:
            shutil.rmtree(delete_path)
        except OSError as e:
            logger.error(f"Error delete {delete_path} tile: {e.strerror}")

    def as_dict(self):
        return dict(filepath=self.filepath(),
                    modifiedat=self.modifiedat(), )


class Geojson(File):
    def __init__(self, path, basedir):
        super().__init__(path, basedir)

    def layer_type(self):
        return Result.GEOJSON

    def rel_url(self):
        return f"/results/{super().filepath()}"

    def polygon(self):
        with open(self.path) as file:
            asset = json.load(file)
        polygon = str(asset['geometry'])
        polygon = GEOSGeometry(polygon)
        return polygon

    def generate_tile(self, tiles_folder):
        pass

    def as_dict(self):
        dict_ = dict(layer_type=self.layer_type(),
                     rel_url=self.rel_url(),
                     polygon=self.polygon(), )

        dict_.update(super().as_dict())
        return dict_


class Geotif(File):
    def __init__(self, path, basedir):
        super().__init__(path, basedir)

    def layer_type(self):
        return Result.XYZ

    def rel_url(self):
        return f"/tiles/{os.path.splitext(super().filepath())[0]}" + "/{z}/{x}/{y}.png"

    def polygon(self):
        with rasterio.open(self.path) as dataset:
            mask = dataset.dataset_mask()
            # Extract feature shapes and values from the array.
            for geom, _ in rasterio.features.shapes(mask, transform=dataset.transform):
                geom = rasterio.warp.transform_geom(dataset.crs, self.srid, geom, precision=6)
                polygon = json.dumps(geom)

        polygon = GEOSGeometry(polygon)
        return polygon

    def generate_tile(self, tiles_folder, timeout=60 * 5):
        save_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
        logger.info(f"Generating tile for {self.path}")

        command = ["gdal2tiles.py", "--xyz", "--webviewer=none", "--zoom=10-16", self.path, save_path, ]
        process = Popen(command, stdout=PIPE)
        try:
            out, err = process.communicate(timeout=timeout)
            logger.info(f"Process output: {out}, err: {err}")
        except TimeoutExpired as te:
            logger.error(f"Process error: {str(te)}. Killing process...")
            process.kill()
            out, err = process.communicate()
            logger.info(f"Process state: {out}, err: {err}")

    def as_dict(self):
        dict_ = dict(layer_type=self.layer_type(),
                     rel_url=self.rel_url(),
                     polygon=self.polygon(), )

        dict_.update(super().as_dict())
        return dict_
