import logging
import os
import json
import shutil
import geopandas
import pyproj
import rasterio
import rasterio.features
import rasterio.warp
from osgeo import gdal, gdalconst, osr
from tempfile import NamedTemporaryFile

from abc import ABCMeta, abstractmethod
from dateutil import parser as timestamp_parser
from subprocess import Popen, PIPE, TimeoutExpired
from datetime import datetime
from shapely.ops import transform
from shapely.geometry import box
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.utils import timezone
from publisher.models import Result

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

        self.bound_box = None
        self.crs = "epsg:4326"

        self.name = None
        self.start_date = None
        self.end_date = None
        self.request_id = None

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
    def rel_url(self):
        pass

    def generate_tiles(self, tiles_folder, **kwargs):
        pass

    def bounding_polygon(self):
        if not self.bound_box:
            return
        bound_box = GEOSGeometry(self.bound_box)
        return bound_box

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
                     bounding_polygon=self.bounding_polygon(), )

        if self.name:
            dict_['name'] = self.name
        if self.start_date:
            dict_['start_date'] = timestamp_parser.parse(self.start_date)
        if self.end_date:
            dict_['end_date'] = timestamp_parser.parse(self.end_date)
        if self.request_id:
            dict_['request_id'] = self.request_id

        return dict_

    def run_process(self, command, timeout):
        process = Popen(command, stdout=PIPE, stderr=PIPE, encoding="utf-8")
        try:
            out, err = process.communicate(timeout=timeout)
            if process.returncode != 0:
                logger.error(f"Failed {command} output: {out}, err: {err}")
                raise Exception(f"Failed to run process")
            logger.info(f"Success {command} output: {out}, err: {err}")
        except TimeoutExpired as te:
            logger.error(f"Failed {command} error: {str(te)}. Killing process...")
            process.kill()
            out, err = process.communicate()
            logger.info(f"Failed {command} output: {out}, err: {err}")
            raise


class Geojson(File):
    def __init__(self, path, basedir):
        super().__init__(path, basedir)

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
            self.request_id = geojson.get('request_id')

        df = geopandas.read_file(self.path)
        if str(df.crs) != self.crs:
            logger.info(f"{self.path}: {df.crs}. Transform to {self.crs}")
            df.to_crs(self.crs, inplace=True)

        self.bound_box = str(box(*df.total_bounds))

    @property
    def _need_create_mvt(self):
        return self._file_size_bytes() > settings.MIN_GEOJSON_SIZE_TO_CREATE_MVT_BYTES

    def layer_type(self):
        if self._need_create_mvt:
            return Result.MVT
        return Result.GEOJSON

    def rel_url(self):
        if self._need_create_mvt:
            return f"/tiles/{os.path.splitext(super().filepath())[0]}" + "/{z}/{x}/{y}.pbf"
        return f"/results/{super().filepath()}"

    def generate_tiles(self, tiles_folder, timeout=settings.MAX_TIMEOUT_FOR_TILE_CREATION_SECONDS):
        if self._need_create_mvt:
            save_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
            logger.info(f"Generating tiles for {self.path}")
            os.makedirs(save_path, exist_ok=True)
            shutil.rmtree(save_path)
            command = ["tippecanoe",
                       "-l", "default",
                       "--no-feature-limit",
                       "--no-tile-size-limit",
                       "--exclude-all",
                       "--minimum-zoom=10",
                       "--maximum-zoom=16",
                       "--no-tile-compression",
                       "--include=style",
                       "--include=data",
                       "--include=layout",
                       "--include=label",
                       "--output-to-directory",
                       save_path,
                       self.path,
                       ]
            self.run_process(command, timeout)


class Geotif(File):
    def __init__(self, path, basedir):
        super().__init__(path, basedir)

        try:
            self._read_file()
        except Exception as ex:
            logger.error(f"Cannot read file {self.path}: {str(ex)}")

    def _read_file(self):
        with rasterio.open(self.path) as dataset:

            bound_box = box(*dataset.bounds)

            if str(dataset.crs).lower() != self.crs:
                project = pyproj.Transformer.from_crs(pyproj.CRS(dataset.crs),
                                                      pyproj.CRS(self.crs), always_xy=True).transform
                bound_box = transform(project, bound_box)

            self.bound_box = str(bound_box)

            tags = dataset.tags()
            self.name = tags.get('name')
            self.start_date = tags.get('start_date')
            self.end_date = tags.get('end_date')
            self.request_id = tags.get('request_id')

    def layer_type(self):
        return Result.XYZ

    def rel_url(self):
        return f"/tiles/{os.path.splitext(super().filepath())[0]}" + "/{z}/{x}/{y}.png"

    def generate_tiles(self, tiles_folder, timeout=settings.MAX_TIMEOUT_FOR_TILE_CREATION_SECONDS):
        save_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
        dataset = gdal.Open(self.path)
        command = ["gdal2tiles.py",
                   "--xyz",
                   "--webviewer=none",
                   "--processes=6",
                   "--zoom=10-16",
                   self.path,
                   save_path,
                   ]

        proj = osr.SpatialReference(wkt=dataset.GetProjection())
        epsg = proj.GetAttrValue("AUTHORITY", 1)
        if epsg != "3857":
            with NamedTemporaryFile(suffix=".tif") as tmp_file:
                logger.info(f"Changing projection to Web Mercator for {self.path}")
                gdal.Warp(tmp_file.name,
                          dataset,
                          resampleAlg=gdalconst.GRIORA_Cubic,
                          outputType=gdal.GDT_Byte,
                          dstSRS="EPSG:3857",
                          dstNodata=0
                          )
                command[5] = tmp_file.name
                logger.info(f"Generating tiles for {self.path}")
                self.run_process(command, timeout)
        else:
            logger.info(f"Generating tiles for {self.path}")
            self.run_process(command, timeout)

    def delete_tiles(self, tiles_folder):
        delete_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
        try:
            shutil.rmtree(delete_path)
        except OSError as e:
            logger.error(f"Error delete {delete_path} tile: {e.strerror}")
