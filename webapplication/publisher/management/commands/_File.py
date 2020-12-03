import logging
import os
import json
import shutil
import geopandas
import rasterio
import rasterio.features
import rasterio.warp

from abc import ABCMeta, abstractmethod
from dateutil import parser as timestamp_parser
import subprocess
from subprocess import PIPE, TimeoutExpired, CalledProcessError
from datetime import datetime
from shapely.geometry import box
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.utils import timezone
from ...models import Result

logger = logging.getLogger(__name__)


class FileFactory(object):
    def __init__(self, basedir):
        self.basedir = basedir

    def get_file_obj(self, path):
        path_lower = path.lower()
        if path_lower.endswith('.geojson'):
            return Geojson(path, self.basedir)
        elif path_lower.endswith(('.tif', '.tiff')):
            return Geotif(path, self.basedir)
        else:
            return


class File(metaclass=ABCMeta):
    def __init__(self, path, basedir):
        self.path = path
        self.basedir = basedir
        self.srid = 'EPSG:4326'

        self.name = None
        self.start_date = None
        self.end_date = None
        self.state = 0

    def filename(self):
        return os.path.basename(self.path)

    def filepath(self):
        filepath = os.path.relpath(self.path, self.basedir)
        return filepath

    def modifiedat(self):
        timestamp = os.path.getmtime(self.path)
        timestamp = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        return timestamp

    def _file_size_bytes(self):
        stat = os.stat(self.path)
        return stat.st_size

    @abstractmethod
    def layer_type(self):
        pass

    @abstractmethod
    def polygon(self):
        pass

    @abstractmethod
    def rel_url(self):
        pass

    def generate_tiles(self, tiles_folder, **kwargs):
        pass

    def delete_tiles(self, tiles_folder):
        delete_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
        if os.path.exists(delete_path):
            try:
                logger.info(f'Deleting {delete_path} tiles')
                shutil.rmtree(delete_path)
            except OSError as e:
                logger.error(f"Error delete {delete_path} tile: {e.strerror}")

    def as_dict(self):
        dict_ = dict(filepath=self.filepath(),
                     modifiedat=self.modifiedat(),
                     layer_type=self.layer_type(),
                     rel_url=self.rel_url(),
                     polygon=self.polygon(), )

        if self.name:
            dict_['name'] = self.name
        if self.start_date:
            dict_['start_date'] = timestamp_parser.parse(self.start_date)
        if self.end_date:
            dict_['end_date'] = timestamp_parser.parse(self.end_date)

        return dict_

    def run_process(self, command, timeout):
        try:
            result = subprocess.run(command, timeout=timeout, stdout=PIPE, stderr=PIPE, encoding='utf-8')
            self.state = result.returncode
            logger.info(f'self.state: {self.state}')
            if result.returncode != 0:
                raise CalledProcessError(result.returncode, result.args)

        except TimeoutExpired:
            logger.error('Time out, process run too long', exc_info=True)
            self.state = -1
        except CalledProcessError:
            logger.error('"Process error."', exc_info=True)


class Geojson(File):
    def __init__(self, path, basedir):
        super().__init__(path, basedir)

        self.features = None

        try:
            self._read_file()
        except Exception as ex:
            logger.error(f"Cannot read file {self.path}: {str(ex)}")

    def _read_file(self):
        with open(self.path) as file:
            geojson = json.load(file)

            self.name = geojson.get('name')
            self.start_date = geojson.get('start_date')
            self.end_date = geojson.get('end_date')

            # Get features as iterable list
            if geojson.get('features'):
                self.features = geojson['features']
            else:
                self.features = [geojson]

    @property
    def _need_create_mvt(self):
        return self._file_size_bytes() > settings.MIN_GEOJSON_SIZE_FOR_MVT_CREATE

    def layer_type(self):
        if self._need_create_mvt:
            return Result.MVT
        return Result.GEOJSON

    def rel_url(self):
        if self._need_create_mvt:
            return f"/tiles/{os.path.splitext(super().filepath())[0]}" + "/{z}/{x}/{y}.pbf"
        return f"/results/{super().filepath()}"

    def polygon(self):
        if not self.features:
            return

        df = geopandas.GeoDataFrame.from_features(self.features)
        bound_box = str(box(*df.total_bounds))
        bound_box = GEOSGeometry(bound_box)
        return bound_box

    def generate_tiles(self, tiles_folder, timeout=settings.MAX_TIMEOUT_FOR_TILE_CREATING):
        if self._need_create_mvt:
            save_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
            logger.info(f"Generating tiles for {self.path}")
            if os.path.exists(save_path):
                try:
                    logger.info(f'Path {save_path} exists')
                    logger.info(f'Deleting {save_path}')
                    shutil.rmtree(save_path)
                except OSError:
                    logger.error(f"Error when deleting {save_path}.", exc_info=True)
            command = ["ogr2ogr",
                       "-f", "MVT",
                       "-dsco", "MINZOOM=10",
                       "-dsco", "MAXZOOM=16",
                       "-dsco", 'COMPRESS=NO',
                       '-mapFieldType', 'DateTime=String',
                       '-lco', 'NAME=default',
                       save_path,
                       self.path,
                       ]
            self.run_process(command, timeout)


class Geotif(File):
    def __init__(self, path, basedir):
        super().__init__(path, basedir)

        self.bound_box = None

        try:
            self._read_file()
        except Exception as ex:
            logger.error(f"Cannot read file {self.path}: {str(ex)}")

    def _read_file(self):
        with rasterio.open(self.path) as dataset:
            mask = dataset.dataset_mask()
            # Extract feature shapes and values from the array.
            for geom, _ in rasterio.features.shapes(mask, transform=dataset.transform):
                geom = rasterio.warp.transform_geom(dataset.crs, self.srid, geom, precision=6)
                self.bound_box = json.dumps(geom)
            tags = dataset.tags()

            self.name = tags.get('name')
            self.start_date = tags.get('start_date')
            self.end_date = tags.get('end_date')

    def layer_type(self):
        return Result.XYZ

    def rel_url(self):
        return f"/tiles/{os.path.splitext(super().filepath())[0]}" + "/{z}/{x}/{y}.png"

    def polygon(self):
        if not self.bound_box:
            return
        bound_box = GEOSGeometry(self.bound_box)
        return bound_box

    def generate_tiles(self, tiles_folder, timeout=settings.MAX_TIMEOUT_FOR_TILE_CREATING):
        save_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
        logger.info(f"Generating tiles for {self.path}")

        command = ["gdal2tiles.py", "--xyz", "--webviewer=none", "--zoom=10-16", self.path, save_path, ]
        self.run_process(command, timeout)
