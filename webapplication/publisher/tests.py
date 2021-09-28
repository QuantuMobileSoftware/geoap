import uuid
import geojson
import shutil
import logging
import json
from pathlib import Path
import numpy as np
import rasterio
import geopandas
from rasterio import Affine
from rasterio.crs import CRS
from geojson import Feature, FeatureCollection, Polygon
from django.contrib.gis.geos import Polygon as DjPolygon
from datetime import datetime
from rest_framework.test import APITestCase
from rest_framework import status
from django.conf import settings
from django.urls import reverse
from user.tests import UserBase
from .management.commands.publish import Command
from .models import Result

logger = logging.getLogger('root')

kharkiv_zoo = Polygon((
    [
        [
            36.22615098953247,
            50.00466363354688
        ],
        [
            36.221033334732056,
            50.003381017371815
        ],
        [
            36.22276067733765,
            50.00138117118807
        ],
        [
            36.22344732284546,
            50.001546678857466
        ],
        [
            36.225271224975586,
            50.00131220949099
        ],
        [
            36.22516393661499,
            50.000753616098805
        ],
        [
            36.225807666778564,
            50.000663964703044
        ],
        [
            36.22971296310425,
            50.001394963515615
        ],
        [
            36.22970223426819,
            50.00204319844682
        ],
        [
            36.228017807006836,
            50.002153535436946
        ],
        [
            36.22788906097412,
            50.002794864178
        ],
        [
            36.228264570236206,
            50.00294657510193
        ],
        [
            36.228017807006836,
            50.003608580803395
        ],
        [
            36.2272560596466,
            50.00377408080426
        ],
        [
            36.22615098953247,
            50.00466363354688
        ]
    ],
))
kharkiv_zoo_bbox = DjPolygon((
    (36.229713, 50.000664),
    (36.229713, 50.004664),
    (36.221033, 50.004664),
    (36.221033, 50.000664),
    (36.229713, 50.000664)
    ), srid=4326)

kharkiv_park = Polygon((
    [
        [
            36.247501373291016,
            50.02621473960805
        ],
        [
            36.24290943145752,
            50.02422962926923
        ],
        [
            36.23870372772217,
            50.0176120022918
        ],
        [
            36.245527267456055,
            50.01485438867449
        ],
        [
            36.25415325164795,
            50.022713170267444
        ],
        [
            36.247501373291016,
            50.02621473960805
        ]
    ],
))
kharkiv_park_bbox = DjPolygon((
        (36.254153, 50.014854),
        (36.254153, 50.026215),
        (36.238704, 50.026215),
        (36.238704, 50.014854),
        (36.254153, 50.014854)
), srid=4326)

homilsha = Polygon((
    [
        [
            36.224327087402344,
            49.50492429349325
        ],
        [
            36.416587829589844,
            49.50492429349325
        ],
        [
            36.416587829589844,
            49.63984419839115
        ],
        [
            36.224327087402344,
            49.63984419839115
        ],
        [
            36.224327087402344,
            49.50492429349325
        ]
    ],
))
homilsha_bbox = DjPolygon((
    (36.416588, 49.504924),
    (36.416588, 49.639844),
    (36.224327, 49.639844),
    (36.224327, 49.504924),
    (36.416588, 49.504924)
), srid=4326)

hytor = Polygon((
    [
        [
            36.14845275878906,
            49.888247779192504
        ],
        [
            36.137638092041016,
            49.88476381394377
        ],
        [
            36.13974094390869,
            49.88058825449894
        ],
        [
            36.14501953125,
            49.88067121614994
        ],
        [
            36.153860092163086,
            49.87151692081505
        ],
        [
            36.15926742553711,
            49.87159989805245
        ],
        [
            36.16257190704346,
            49.879343812627525
        ],
        [
            36.15652084350586,
            49.885731607291845
        ],
        [
            36.15278720855713,
            49.88777773506376
        ],
        [
            36.14845275878906,
            49.888247779192504
        ]
    ],
))
hytor_bbox = DjPolygon((
    (36.162572, 49.871517),
    (36.162572, 49.888248),
    (36.137638, 49.888248),
    (36.137638, 49.871517),
    (36.162572, 49.871517)
), srid=4326)

osnova_lake = Polygon((
    [
        [
            36.22372627258301,
            49.9383227101154
        ],
        [
            36.21896266937256,
            49.937273107347465
        ],
        [
            36.21823310852051,
            49.935588170882816
        ],
        [
            36.2158727645874,
            49.93398604550227
        ],
        [
            36.21518611907959,
            49.93196950163907
        ],
        [
            36.216773986816406,
            49.930173877866366
        ],
        [
            36.22243881225586,
            49.926582429615706
        ],
        [
            36.22458457946777,
            49.92591936375263
        ],
        [
            36.2294340133667,
            49.9276875191187
        ],
        [
            36.230034828186035,
            49.93053300797301
        ],
        [
            36.22698783874512,
            49.935809149513695
        ],
        [
            36.225571632385254,
            49.93757694207898
        ],
        [
            36.22372627258301,
            49.9383227101154
        ]
    ],
))
osnova_lake_bbox = DjPolygon((
    (36.230035, 49.925919),
    (36.230035, 49.938323),
    (36.215186, 49.938323),
    (36.215186, 49.925919),
    (36.230035, 49.925919)
), srid=4326)

geometries = [
            ('kharkiv_zoo', kharkiv_zoo),
            ('kharkiv_park', kharkiv_park),
            ('homilsha', homilsha),
            ('hytor', hytor),
            ('osnova_lake', osnova_lake)
        ]

geometries_bbox = {
    'kharkiv_zoo': kharkiv_zoo_bbox,
    'kharkiv_park': kharkiv_park_bbox,
    'homilsha': homilsha_bbox,
    'hytor': hytor_bbox,
    'osnova_lake': osnova_lake_bbox
}


class PublisherBase(APITestCase):
    """
    Base class for creating publisher test cases.
    """
    def setUp(self):
        self.test_results_folder = Path(settings.RESULTS_FOLDER)
        self.test_results_folder.mkdir(parents=True, exist_ok=True)
        logger.info(f'test_results_folder: {self.test_results_folder}')

        self.test_tile_folder = Path(settings.TILES_FOLDER)
        self.test_tile_folder.mkdir(parents=True, exist_ok=True)
        logger.info(f'test_tile_folder: {self.test_tile_folder}')

    @classmethod
    def tearDownClass(cls):
        if Path(settings.RESULTS_FOLDER).exists():
            shutil.rmtree(Path(settings.RESULTS_FOLDER))

        if Path(settings.TILES_FOLDER).exists():
            shutil.rmtree(Path(settings.TILES_FOLDER))
        super().tearDownClass()

    @staticmethod
    def delete_all_files_in_folder(path):
        for child in path.glob('*'):
            if child.is_file():
                child.unlink()

    def create_tiff(self):
        start_date = "2020-01-01"
        end_date = "2021-01-01"
        request_id = 1
        name = 'test_name'
        self.geotiff_labels = "[{'color': (0, 0, 0), 'name': 'Background', 'area': 1.4939}, \
        {'color': (0, 16, 255), 'name': 'Corn', 'area': 17.5908}, \
        {'color': (0, 164, 255), 'name': 'Soybeans', 'area': 24.0805}, \
        {'color': (63, 255, 183), 'name': 'Fallow/Idle Cropland', 'area': 1.1609}, \
        {'color': (183, 255, 63), 'name': 'Developed areas', 'area': 2.4049}, \
        {'color': (255, 185, 0), 'name': 'Forest', 'area': 1.8071}, \
        {'color': (255, 48, 0), 'name': 'Grassland/Pasture', 'area': 2.4144}]"
        self.colormap = '{"name": "Vegetation index", "colors": ["0,0,0", "3,1,1", "5,1,1", "8,1,1", "10,1,1"], \
        "labels": ["low", "high"]}'
        self.tiff_name = Path('black_image.tif')
        self.test_tif_path = self.test_results_folder / self.tiff_name
        self.test_tile_result_path = Path('/tiles') / self.tiff_name.stem
        self.test_tile_png_path = self.test_tile_result_path / '{z}/{x}/{y}.png'
        logger.info(f'test_tile_result_path: {self.test_tile_result_path}')
        logger.info(f'test_tile_png_path: {self.test_tile_png_path}')
        kwargs = {
            'driver': 'GTiff',
            'dtype': 'uint8',
            'nodata': None,
            'width': 1880,
            'height': 1795,
            'count': 1,
            'crs': CRS.from_epsg(32636),
            'transform': Affine(10.0, 0.0, 768520.5912700305, 0.0, -10.0, 5549846.104763807)
        }
        raster = np.zeros((kwargs['width'], kwargs['height']), dtype=kwargs['dtype'])
        with rasterio.open(self.test_tif_path, 'w', **kwargs) as dst:
            dst.update_tags(start_date=start_date,
                            end_date=end_date,
                            request_id=request_id,
                            labels=self.geotiff_labels,
                            name=name,
                            colormap=self.colormap)
            dst.write(raster, 1)

    @staticmethod
    def generate_features():
        acquired = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        properties = dict(acquired=acquired)

        features = list()
        for geometry_name, geometry in geometries:
            id_ = str(uuid.uuid4())
            feature = Feature(id=id_, geometry=geometry, properties=properties)
            features.append((geometry_name, feature))
        return features

    def create_geojson(self):
        self.test_geojson_result_path = Path('/results')
        features = self.generate_features()
        for cnt in range(len(features)):
            with open(f"{self.test_results_folder}/{features[cnt][0]}.geojson", 'w') as file:
                geojson.dump(features[cnt][1], file)

    def create_big_geojson(self):
        self.big_geojson_name = Path('big.geojson')
        self.geojson_path = self.test_results_folder / self.big_geojson_name
        self.mvt_path = self.test_tile_folder / self.big_geojson_name.stem
        self.mvt_rel_url = Path('/tiles') / self.big_geojson_name.stem / '{z}/{x}/{y}.pbf'
        logger.info(f'mvt_path: {self.mvt_path}')
        logger.info(f'mvt_rel_url: {self.mvt_rel_url}')

        feature_list = [feature_obj[1] for feature_obj in self.generate_features()]
        for cnt in range(10):
            feature_list += feature_list
        feature_collection = FeatureCollection(feature_list)
        with open(self.geojson_path, 'w') as file:
            geojson.dump(feature_collection, file)
            
    def create_big_geojson_with_style(self):
        self.big_geojson_name = Path('big_style.geojson')
        self.geojson_path = self.test_results_folder / self.big_geojson_name
        self.mvt_styles_path = self.test_tile_folder / self.big_geojson_name.stem / 'style.json'
        self.mvt_styles_url = Path('/tiles') / self.big_geojson_name.stem / 'style.json'
        feature_list = [feature_obj[1] for feature_obj in self.generate_features()]
        for cnt in range(10):
            feature_list += feature_list
        feature_collection = FeatureCollection(feature_list)
        df = geopandas.GeoDataFrame.from_features(feature_collection, crs="epsg:4326")
        df_len = len(df.index)
        style_column = [{'color': '#111111'}] * 10
        style_column.extend([{'color': '#000000'}] * (df_len - 10))
        df.insert(1, 'style', style_column)
        df.to_file(self.geojson_path, driver='GeoJSON')


class BigGeojsonPublisherTestCase(PublisherBase):
    def test_publish_big_geojson(self):
        self.create_big_geojson()
        command = Command()
        command.handle()
        results = Result.objects.all().order_by('filepath')
        for result in results:
            self.assertEqual(str(self.mvt_rel_url), result.rel_url)
            self.assertEqual(result.layer_type, 'MVT')
            self.assertEqual(result.bounding_polygon.geom_type, 'Polygon')
            self.assertEqual(result.bounding_polygon.srid, 4326)
            self.assertEqual(self.mvt_path.exists(), True)
            self.assertEqual(result.styles_url, None)


class BigGeojsonWithStylePublisherTestCase(PublisherBase):
    def test_publish_big_geojson_with_style(self):
        self.create_big_geojson_with_style()
        command = Command()
        command.handle()
        results = Result.objects.all().order_by('filepath')
        for result in results:
            self.assertEqual(str(self.mvt_styles_url), result.styles_url)
            with open(self.mvt_styles_path) as f:
                data = json.loads(f.readline())
                self.assertEqual(len(data['layers']), 2)
        
        
class CleanBigGeojsonPublisherTestCase(PublisherBase):
    def test_clean_geojson_files_result(self):
        self.create_big_geojson()
        command = Command()
        command.handle()
        logger.info(f'Result.objects.count before deleting: {Result.objects.count()}')
        self.delete_all_files_in_folder(self.test_results_folder)
        logger.info(f'Result.filepath: {Result.objects.all()[0].filepath}')
        command.handle()
        num_results = Result.objects.count()
        self.assertEqual(num_results, 0)
        self.assertEqual(self.mvt_path.exists(), False)


class DeleteBigGeojsonPublisherTestCase(PublisherBase):
    def test_delete_geojson_files_result(self):
        self.create_big_geojson()
        command = Command()
        command.handle()

        results = Result.objects.filter(to_be_deleted=False)
        for result in results:
            result.to_be_deleted = True
            result.save()

        command._delete()
        self.assertEqual(self.geojson_path.exists(), False)
        self.assertEqual(self.mvt_path.exists(), False)
        self.assertEqual(Result.objects.filter(to_be_deleted=True).count(), 0)


class GeojsonPublisherTestCase(PublisherBase):

    def test_publish_geojson(self):
        self.create_geojson()
        command = Command()
        command.handle()
        results = Result.objects.all().order_by('filepath')
        for result in results:
            result_file = Path(result.filepath)
            result_filename = result_file.stem
            result_path = self.test_geojson_result_path / result_file
            self.assertEqual(str(result_path), result.rel_url)
            self.assertEqual(result.layer_type, 'GEOJSON')
            self.assertEqual(result.bounding_polygon.geom_type, 'Polygon')
            self.assertEqual(result.bounding_polygon.srid, 4326)
            self.assertEqual(str(result.bounding_polygon), geometries_bbox[result_filename].ewkt)


class GeotifPublisherTestCase(PublisherBase):

    def test_publish_tiff(self):
        self.create_tiff()
        command = Command()
        command.handle()
        results = Result.objects.all()
        for result in results:
            self.assertEqual(str(self.test_tile_png_path), result.rel_url)
            self.assertEqual(result.layer_type, 'XYZ')
            self.assertEqual(result.labels, self.geotiff_labels)
            self.assertEqual(result.colormap, self.colormap)


class DeleteGeotifPublisherTestCase(PublisherBase):
    def test_delete_geotif_files_result(self):
        self.create_tiff()
        command = Command()
        command.handle()
        result = Result.objects.get(layer_type='XYZ')
        logger.info(f'result.rel_url: {result.rel_url}')
        result.to_be_deleted = True
        result.save()
        command._delete()
        self.assertEqual(self.test_tile_result_path.exists(), False)


class DeleteGeojsonPublisherTestCase(PublisherBase):
    def test_delete_geojson_files_result(self):
        self.create_geojson()
        command = Command()
        command.handle()

        results = Result.objects.filter(to_be_deleted=False)
        for result in results:
            result.to_be_deleted = True
            result.save()

        command._delete()
        for result in results:
            test_geojson_result_file = self.test_geojson_result_path / result.filepath
            logger.info(f'test_geojson_result_file: {test_geojson_result_file}')
            logger.info(f'result.rel_url: {result.rel_url}')
            self.assertEqual(test_geojson_result_file.exists(), False)


class CleanGeotifPublisherTestCase(PublisherBase):
    def test_clean_geotif_files_result(self):
        self.create_tiff()
        command = Command()
        command.handle()
        logger.info(f'Result.objects.count before deleting: {Result.objects.count()}')
        self.delete_all_files_in_folder(self.test_results_folder)
        command.handle()
        num_results = Result.objects.count()
        self.assertEqual(num_results, 0)
        self.assertEqual(self.test_tile_result_path.exists(), False)


class CleanGeojsonPublisherTestCase(PublisherBase):
    def test_clean_geojson_files_result(self):
        self.create_geojson()
        command = Command()
        command.handle()
        logger.info(f'Result.objects.count before deleting: {Result.objects.count()}')
        self.delete_all_files_in_folder(self.test_results_folder)
        command.handle()
        num_results = Result.objects.count()
        self.assertEqual(num_results, 0)


class ResultTestCase(UserBase):
    fixtures = [
        'user/fixtures/user_fixtures.json',
        'aoi/fixtures/aoi_fixtures.json',
        'aoi/fixtures/notebook_fixtures.json',
        'aoi/fixtures/request_fixtures.json',
        'publisher/fixtures/acl_fixtures.json',
        'publisher/fixtures/results_restricted_acl_fixtures.json'
    ]

    def setUp(self):
        super().setUp()
        self.result = Result.objects.get(id=1001)

        self.patch_data = {
            "description": "description_test",
            "start_date": "2021-12-12",
            "end_date": "2021-12-13",
            "name": "test_name",
            'to_be_deleted': True,
            'filepath': 'new.geojson'
            }

    def test_get_results_list_as_not_auth_user(self):
        url = reverse('get_results')
        self.client.force_authenticate(user=None)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_results_list_as_staff_user(self):
        expected_results_len = 10
        self.client.force_authenticate(user=self.staff_user)
        self.get_results_list(expected_results_len)

    def test_get_results_list_as_ex_2_user(self):
        expected_results_len = 4
        self.client.force_authenticate(user=self.ex_2_user)
        self.get_results_list(expected_results_len)

    def test_get_results_list_as_ex_3_user(self):
        expected_results_len = 4
        self.client.force_authenticate(user=self.ex_3_user)
        self.get_results_list(expected_results_len)

    def test_get_results_list_as_all_results_user(self):
        expected_results_len = 10
        self.client.force_authenticate(user=self.all_results_user)
        self.get_results_list(expected_results_len)

    def test_get_results_list_as_all_results_no_acl_user(self):
        expected_results_len = 10
        self.client.force_authenticate(user=self.all_results_no_acl_user)
        self.get_results_list(expected_results_len)

    def get_results_list(self, expected_results_len):
        url = reverse('get_results')
        response = self.client.get(url)
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def test_get_result_as_not_auth_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=None)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_result_as_ex_2_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_get_result_as_ex_3_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.ex_3_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_get_result_as_all_results_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.all_results_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_get_result_as_all_results_no_acl_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.all_results_no_acl_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_result_as_staff_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_result_as_not_auth_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=None)
        response = self.client.patch(url, self.patch_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_result_as_ex_2_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.patch(url, self.patch_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_patch_result_as_ex_3_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.ex_3_user)
        response = self.client.patch(url, self.patch_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_patch_result_as_all_results_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.all_results_user)
        response = self.client.patch(url, self.patch_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_patch_result_as_all_results_no_acl_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.all_results_no_acl_user)
        response = self.client.patch(url, self.patch_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_result_as_staff_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.patch(url, self.patch_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = json.loads(response.content)
        self.assertEqual(content['name'], 'test_name')
        self.assertEqual(content['start_date'], self.patch_data['start_date'])
        self.assertEqual(content['end_date'], self.patch_data['end_date'])
        self.assertEqual(content['description'], self.patch_data['description'])
        self.assertEqual(content['to_be_deleted'], self.result.to_be_deleted)
        self.assertEqual(content['filepath'], self.result.filepath)

    def test_delete_result_as_not_auth_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=None)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_result_as_ex_2_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_delete_result_as_ex_3_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.ex_3_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_delete_result_as_all_results_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.all_results_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_delete_result_as_all_results_no_acl_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.all_results_no_acl_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_result_as_staff_user(self):
        url = reverse('result', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_delete_result_by_request_no_acl_owner(self):
        url = reverse('result', kwargs={'pk': 1008})
        self.client.force_authenticate(user=self.all_results_no_acl_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        result = Result.objects.get(id=1008)
        self.assertEqual(result.to_be_deleted, True)

    def test_delete_result_by_request_acl_restricted_owner(self):
        url = reverse('result', kwargs={'pk': 1007})
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        result = Result.objects.get(id=1007)
        self.assertEqual(result.to_be_deleted, True)
        
