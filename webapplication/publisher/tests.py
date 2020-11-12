import os
import uuid
import geojson
import shutil
import json
from pathlib import Path
from geojson import Feature, Polygon, FeatureCollection, Point, LineString
from datetime import datetime
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.conf import settings
from django.urls import reverse
from user.models import User
from .management.commands.publish import Command
from .models import Result, AoI

kharkiv_zoo = Polygon([
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
    ]
])
kharkiv_park = Polygon([
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
    ]
])
homilsha = Polygon([
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
    ]
])
slobozhanskiy_park = Polygon([
    [
        [
            35.26233673095703,
            50.099220760305094
        ],
        [
            35.21324157714844,
            50.0831414307389
        ],
        [
            35.18165588378906,
            50.05603665721485
        ],
        [
            35.19023895263672,
            50.04523455350427
        ],
        [
            35.20774841308594,
            50.03619419013074
        ],
        [
            35.216331481933594,
            50.026049316879906
        ],
        [
            35.238990783691406,
            50.03156310080887
        ],
        [
            35.26851654052734,
            50.04104532847993
        ],
        [
            35.277099609375,
            50.05206882001855
        ],
        [
            35.282249450683594,
            50.058902113365555
        ],
        [
            35.28190612792969,
            50.07102330352104
        ],
        [
            35.27057647705078,
            50.09701843132571
        ],
        [
            35.26233673095703,
            50.099220760305094
        ]
    ]
])
hytor = Polygon([
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
    ]
])
osnova_lake = Polygon([
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
    ]
])

point1 = Point((36.22372627258301, 49.9383227101154))
point2 = Point((36.225571632385254, 49.93757694207898))
point3 = Point((36.22698783874512, 49.935809149513695))
point4 = Point((36.230034828186035, 49.93053300797301))

line1 = LineString([(36.19377136230469, 50.01104862197962),
                    (36.304664611816406, 49.98279931342137)])

line2 = LineString([(36.171112060546875, 49.981916255086986),
                    (36.25488281249999, 50.01082798858057)])

line3 = LineString([(36.19377136230469, 48.03104862197962),
                    (36.304664611816406, 48.98279931342137)])

line4 = LineString([(36.171112060546875, 49.991916255086986),
                    (36.25488281249999, 49.01082798858057)])


class BaseTestCase(APITestCase):
    """
    Base test case.
    """

    def setUp(self):
        self.staff_user = self.create_user(username='test_staff_user', is_staff=True)
        self.not_staff_user = self.create_user(username='test_user')
        self.test_path = Path(settings.BASE_DIR).parent / settings.TEST_RESULTS_FOLDER
        self.test_path.mkdir(parents=True, exist_ok=True)
        self.create_test_geojson()
        self.run_publisher()

    @classmethod
    def tearDownClass(cls):
        if settings.TEST_RESULTS_FOLDER and (Path(settings.BASE_DIR).parent / settings.TEST_RESULTS_FOLDER).exists():
            shutil.rmtree(Path(settings.BASE_DIR).parent / settings.TEST_RESULTS_FOLDER)
        super().tearDownClass()

    def create_user(self, username, is_staff=False, is_superuser=False):
        """
        create_user
        """
        user = User.objects.create(username=username, is_staff=is_staff, is_superuser=is_superuser)
        return user

    def generate_features(self):
        polygons = [kharkiv_zoo, kharkiv_park, homilsha, hytor, osnova_lake]
        points = [point1, point2, point3, point4]
        lines = [line1, line2, line3, line4]

        geometries = [*polygons, *points, *lines]

        acquired = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        properties = dict(acquired=acquired)

        features = list()
        for geometry in geometries:
            id_ = str(uuid.uuid4())
            feature = Feature(id=id_, geometry=geometry, properties=properties)
            features.append(feature)
        return features

    def create_test_geojson(self):
        features = self.generate_features()

        for cnt in range(len(features)):
            with open(f"{self.test_path}/{cnt}.geojson", 'w') as file:
                geojson.dump(features[cnt], file)

    def run_publisher(self):
        c = Command()
        c.handle()

    def test_get_results_for_stuff(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse('get_results')
        response = self.client.get(url)

        content = json.loads(response.content)
        print(content['count'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(content['count'], 13)

    def test_get_results_for_not_staff(self):
        self.client.force_authenticate(user=self.not_staff_user)
        url = reverse('get_results')
        response = self.client.get(url)
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(content['count'], 0)

    def test_get_results_for_non_auth_user(self):
        self.client.force_authenticate(user=None)
        url = reverse('get_results')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
