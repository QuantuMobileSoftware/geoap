import logging
import os
import json
import shutil
import random
from typing import Optional
import geopandas
import gpxpy
import pyproj
import rasterio
import rasterio.features
import rasterio.warp
from pathlib import Path
import geojson
import uuid

from osgeo import gdal, gdalconst, osr
from tempfile import NamedTemporaryFile
from abc import ABCMeta, abstractmethod
from dateutil import parser as timestamp_parser
from subprocess import Popen, PIPE, TimeoutExpired
from datetime import datetime

from shapely import Polygon, Point, geometry
from shapely.ops import transform
from shapely.geometry import box
from shapely.geometry.polygon import orient
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.utils import timezone
from aoi.models import Request
from publisher.models import Result


logger = logging.getLogger(__name__)


class FileFactory(object):
    def __init__(self, basedir):
        self.basedir = basedir

    def get_file_obj(self, path, request: Optional[Request] = None):
        path_lower = path.lower()
        if path_lower.endswith('.geojson'):
            return Geojson(path, self.basedir, request)
        elif path_lower.endswith(('.tif', '.tiff')):
            return Geotif(path, self.basedir, request)
        elif path_lower.endswith('.gpx'):
            return GPXFile(path, self.basedir, request)
        else:
            return


class File(metaclass=ABCMeta):
    def __init__(self, path, basedir, request: Optional[Request]=None):
        self.path = path
        self.basedir = basedir
        
        self.bound_box = None
        self.crs = "epsg:4326"

        self.name = None
        self.start_date = request.date_from if request else None
        self.end_date = request.date_to if request else None
        self.request = request
        self.style_url = None
        self.labels = ""
        self.colormap = ""

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
    
    @abstractmethod
    def get_styles_url(self):
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
                try:
                    os.rmdir(Path(delete_path).parent)
                except OSError:
                    pass
            except OSError as e:
                logger.error(f"Error delete {delete_path} tile: {e.strerror}")

    def as_dict(self):
        dict_ = dict(filepath=self.filepath(),
                     modifiedat=self.modifiedat(),
                     layer_type=self.layer_type(),
                     rel_url=self.rel_url(),
                     bounding_polygon=self.bounding_polygon(),
                     name='',
                     start_date=None,
                     end_date=None,
                     request=self.request,
                     released=True if self.request else False,
                     labels=self.labels,
                     colormap=self.colormap)

        if self.name:
            dict_['name'] = self.name
        if self.start_date:
            dict_['start_date'] = self.start_date
        if self.end_date:
            dict_['end_date'] = self.end_date
        if self.style_url:
            dict_['styles_url'] = self.style_url
        return dict_

    @staticmethod
    def run_process(command, timeout):
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

    def read_file(self):
        try:
            with open(self.path) as file:
                geojson = json.load(file)

                self.name = geojson.get('name')
                try:
                    self.start_date = timestamp_parser.parse(geojson.get('start_date'))
                except TypeError or ValueError:
                    pass

                try:
                    self.end_date = timestamp_parser.parse(geojson.get('end_date'))
                except TypeError or ValueError:
                    pass

            self.df = geopandas.read_file(self.path)
            if str(self.df.crs) != self.crs:
                logger.info(f"{self.path}: {self.df.crs}. Transform to {self.crs}")
                self.df.to_crs(self.crs, inplace=True)

            if all(self.df.is_empty):
                self.bound_box = self.request.polygon if self.request else Polygon()
            else:
                self.bound_box = str(box(*self.df.total_bounds))
        except Exception as ex:
            logger.error(f"Cannot read file {self.path}: {str(ex)}")

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
    
    def get_styles_url(self):
        return f"/tiles/{os.path.splitext(super().filepath())[0]}" + '/style.json'
    
    def create_mvt_style(self, df, output_path):
        """
        read GeoDataFrame object and create style.json if need it.
        return: style url if style.json was created else return None
        @param df: GeoDataFrame
        @param output_path: str or Path
        @return: str
        """
        
        def get_color(row):
            if row and isinstance(row, dict) and 'color' in dict(row).keys():
                return row['color']

        if 'style' not in df.columns:
            return
        colors_list = df['style'].apply(get_color).dropna().unique().tolist()
        if len(colors_list) > 0:
            style_dict = dict(version=1, name='default_style', layers=[])
    
            for i, color in enumerate(colors_list):
                layer = {
                    "id": f"id{i}",
                    "type": "fill",
                    "source-layer": "default",
                    "filter": [
                        "==",
                        "style",
                        '{"color":"%(color)s"}' % {"color": color}
                    ],
                    "paint": {
                        "fill-color": color,
                        "fill-opacity": 0.75
                    }
                }
                style_dict['layers'].append(layer)

            with open(output_path, "w") as outfile:
                json.dump(style_dict, outfile)
                logger.info(f"Styles for tiles saved in: {output_path}")
            return self.get_styles_url()
        return
        
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
                       f"--minimum-zoom={settings.ZOOM_LEVEL_MIN}",
                       f"--maximum-zoom={settings.ZOOM_LEVEL_MAX}",
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
            self.style_url = self.create_mvt_style(self.df, f'{save_path}/style.json')


class Geotif(File):

    def read_file(self):
        try:
            with rasterio.open(self.path) as dataset:
                bound_box = box(*dataset.bounds)

                if str(dataset.crs).lower() != self.crs:
                    project = pyproj.Transformer.from_crs(pyproj.CRS(dataset.crs),
                                                        pyproj.CRS(self.crs), always_xy=True).transform
                    bound_box = transform(project, bound_box)

                self.bound_box = str(bound_box)

                tags = dataset.tags()
                self.name = tags.get('name')
                try:
                    self.start_date = timestamp_parser.parse(tags.get('start_date'))
                except TypeError or ValueError:
                    pass

                try:
                    self.end_date = timestamp_parser.parse(tags.get('end_date'))
                except TypeError or ValueError:
                    pass

                self.labels = tags.get('labels')
                self.colormap = tags.get('colormap')
        except Exception as ex:
            logger.error(f"Cannot read file {self.path}: {str(ex)}")

    def layer_type(self):
        return Result.XYZ

    def rel_url(self):
        return f"/tiles/{os.path.splitext(super().filepath())[0]}" + "/{z}/{x}/{y}.png"
    
    def get_styles_url(self):
        return

    def generate_tiles(self, tiles_folder, timeout=settings.MAX_TIMEOUT_FOR_TILE_CREATION_SECONDS):
        save_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
        dataset = gdal.Open(self.path)
        command = ["gdal2tiles.py",
                   "--xyz",
                   "--webviewer=none",
                   "--processes=6",
                   "--resampling=near",
                   f"--zoom={settings.ZOOM_LEVEL_MIN}-{settings.ZOOM_LEVEL_MAX}",
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
                          resampleAlg=gdalconst.GRIORA_NearestNeighbour,
                          outputType=gdal.GDT_Byte,
                          dstSRS="EPSG:3857",
                          dstNodata=0
                          )
                command[6] = tmp_file.name
                logger.info(f"Generating tiles for {self.path}")
                self.run_process(command, timeout)
        else:
            logger.info(f"Generating tiles for {self.path}")
            self.run_process(command, timeout)

    def delete_tiles(self, tiles_folder):
        delete_path = os.path.join(tiles_folder, os.path.splitext(self.filepath())[0])
        try:
            shutil.rmtree(delete_path)
            try:
                os.rmdir(Path(delete_path).parent)
            except OSError:
                pass
        except OSError as e:
            logger.error(f"Error delete {delete_path} tile: {e.strerror}")


class GPXFile(File):

    def __init__(self, path, basedir, request: Optional[Request] = None):
        super().__init__(path, basedir, request)
        self.df = None

    def create_geojson_from_gpx_file(self, file_path):
        with open(file_path, 'r') as gpx_file:
            gpx = gpxpy.parse(gpx_file)
            features = []
            for waypoint in gpx.waypoints:
                point = Point(waypoint.longitude, waypoint.latitude)
                polygon = point.buffer(0.00002)
                polygon = orient(polygon, sign=1.0)

                feature = {
                    "type": "Feature",
                    "geometry": {"type": "Polygon", "coordinates": [
                        list(polygon.exterior.coords)]},
                    "properties": {
                        "style": {"color": "#e80e27", "stroke": "#e80e27",
                                  "stroke-width": 2}},
                }
                features.append(feature)

                if not features:
                    raise ValueError("No waypoints found in the GPX file.")

            feature_collection = {"type": "FeatureCollection",
                                  "features": features}
            temp_uuid = uuid.uuid4().hex
            res_path = f'{os.path.dirname(self.path)}/{temp_uuid}.geojson'
            with open(res_path, 'w') as f:
                geojson.dump(feature_collection, f)
        return res_path

    def generate_random_point(self, base_point, offset_range=0.00001):
        random_offset_x = random.uniform(-offset_range, offset_range)
        random_offset_y = random.uniform(-offset_range, offset_range)
        return Point(base_point.x + random_offset_x, base_point.y + random_offset_y)

    def parse_gpx_file(self, file_path):
        with open(file_path, 'r') as gpx_file:
            gpx = gpxpy.parse(gpx_file)
            waypoints_stones = []
            for waypoint in gpx.waypoints:
                waypoints_stones.append(
                    Point(waypoint.longitude, waypoint.latitude))

            x = []
            y = []
            for route in gpx.routes:
                for point in route.points:
                    x.append(point.longitude)
                    y.append(point.latitude)
            if x and y:
                route_polygon = Polygon(zip(x, y))
            else:
                min_points_for_route_polygon = 3  # A linearring requires at least 4 coordinates.
                if len(waypoints_stones) < min_points_for_route_polygon:
                    for _ in range(min_points_for_route_polygon-len(waypoints_stones)):
                        new_point = self.generate_random_point(waypoints_stones[0])
                        waypoints_stones.append(new_point)
                route_polygon = geometry.Polygon(
                        [[p.x, p.y] for p in waypoints_stones]).convex_hull
            route_polygon = orient(route_polygon, sign=1.0)
            return route_polygon

    def rel_url(self):
        return f"/tiles/{os.path.splitext(super().filepath())[0]}" + "/{z}/{x}/{y}.pbf"

    def layer_type(self):
        return Result.MVT

    def get_styles_url(self):
        return

    def read_file(self):
        return

    def bounding_polygon(self):
        return GEOSGeometry(f"{self.parse_gpx_file(self.path)}", srid=4326)

    def create_mvt_style(self, df, output_path):
        def get_color(row):
            if row and isinstance(row, dict) and 'color' in dict(row).keys():
                return row['color']

        if 'style' not in df.columns:
            return
        colors_list = df['style'].apply(get_color).dropna().unique().tolist()
        if len(colors_list) > 0:
            style_dict = dict(version=1, name='default_style', layers=[])

            for i, color in enumerate(colors_list):
                layer = {
                    "id": f"id{i}",
                    "type": "fill",
                    "source-layer": "default",
                    "filter": [
                        "==",
                        "style",
                        '{"color":"%(color)s"}' % {"color": color}
                    ],
                    "paint": {
                        "fill-color": color,
                        "fill-opacity": 0.75
                    }
                }
                style_dict['layers'].append(layer)

            with open(output_path, "w") as outfile:
                json.dump(style_dict, outfile)
                logger.info(f"Styles for tiles saved in: {output_path}")
            return self.get_styles_url()
        return

    def generate_tiles(self, tiles_folder, timeout=settings.MAX_TIMEOUT_FOR_TILE_CREATION_SECONDS):
        new_path = self.create_geojson_from_gpx_file(self.path)
        print(new_path)
        save_path = os.path.join(tiles_folder,
                                 os.path.splitext(self.filepath())[0])
        logger.info(f"Generating tiles for {new_path}")
        os.makedirs(save_path, exist_ok=True)
        shutil.rmtree(save_path)
        command = ["tippecanoe",
                   "-l", "default",
                   "--no-feature-limit",
                   "--no-tile-size-limit",
                   "--exclude-all",
                   f"--minimum-zoom={settings.ZOOM_LEVEL_MIN}",
                   f"--maximum-zoom={settings.ZOOM_LEVEL_MAX}",
                   "--no-tile-compression",
                   "--include=style",
                   "--include=data",
                   "--include=layout",
                   "--include=label",
                   "--output-to-directory",
                   save_path,
                   new_path,
                   ]
        self.run_process(command, timeout)
        self.df = geopandas.read_file(new_path)
        os.remove(new_path)


    def as_dict(self):
        dict_ = dict(filepath=self.filepath(),
                     modifiedat=self.modifiedat(),
                     layer_type=self.layer_type(),
                     rel_url=self.rel_url(),
                     bounding_polygon=self.bounding_polygon(),
                     name=Path(self.path).stem,
                     start_date=None,
                     end_date=None,
                     request=self.request,
                     released=True if self.request else False,
                     labels=self.labels,
                     colormap=self.colormap)

        if self.start_date:
            dict_['start_date'] = self.start_date
        if self.end_date:
            dict_['end_date'] = self.end_date
        if self.style_url:
            dict_['styles_url'] = self.style_url
        return dict_
