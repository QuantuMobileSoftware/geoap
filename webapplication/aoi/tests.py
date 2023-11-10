import json
import logging
from decimal import Decimal

from rest_framework import status
from django.urls import reverse
from django.conf import settings
from user.models import User
from .models import AoI, Component, Request
from .serializers import AoISerializer
from user.tests import UserBase
from django.apps import apps

logger = logging.getLogger('root')


class AOILimitedTestCase(UserBase):
    fixtures = ['user/fixtures/user_fixtures.json', 'aoi/fixtures/aoi_10_ha_fixtures.json']
    
    def setUp(self):
        super().setUp()
        self.ex_2_user.area_limit_ha = 10
        self.ex_2_user.save()
        self.data_create = {
            "user": 1002,
            "name": "Aoi_10_ha_ex_2_user_data_create",
            "polygon": "SRID=4326;POLYGON ((\
            35.948714 50.000974, 35.955194 50.002378, 35.955806 50.000581, 35.949529 49.999961, 35.948714 50.000974\
            ))",
            "type": 1,
        }

        self.data_patch_decrease = {
            "user": 1002,
            "name": "Aoi_10_ha_ex_2_user_patch_decrease",
            "polygon": "SRID=4326;POLYGON ((35.948714 50.000974, 35.949519 49.999954, 35.952716 50.000319, \
            35.952727 50.000292, 35.951933 50.001678, 35.948714 50.000974))",
            "createdat": "2020-11-20T00:00:00.000000Z",
        }

        self.data_patch_increase = {
            "user": 1002,
            "name": "Aoi_10_ha_ex_2_user_patch_increase",
            "polygon": "SRID=4326;POLYGON ((35.948714 50.000974, 35.949519 49.999954, 35.952716 50.000319, \
            35.959818 50.000933, 35.959014 50.003216, 35.948714 50.000974))",
            "createdat": "2020-11-20T00:00:00.000000Z",
        }
        
    def test_add_over_limited_area(self):
        url = reverse('aoi:aoi_list_or_create')
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        content = json.loads(response.content)
        self.assertEqual(content['errorCode'], settings.AREA_IS_OVER_LIMITED_CODE)
        
    def test_patch_decrease_aoi(self):
        aoi_id = 1002
        url = reverse('aoi:aoi', kwargs={'pk': aoi_id})
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.patch(url, self.data_patch_decrease)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_patch_increase_aoi(self):
        aoi_id = 1002
        url = reverse('aoi:aoi', kwargs={'pk': aoi_id})
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.patch(url, self.data_patch_increase)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        
class AOITestCase(UserBase):
    fixtures = ['user/fixtures/user_fixtures.json', 'aoi/fixtures/aoi_fixtures.json',
                'aoi/fixtures/results_bbox_fixtures.json']

    def setUp(self):
        super().setUp()
        self.data_create = {
            "user": 1001,
            "name": "Aoi_test",
            "polygon": "SRID=4326;POLYGON ((35.951777 50.006346, 35.952673 50.006339, 35.952662 50.005953, \
            35.951734 50.00596, 35.951777 50.006346))",
            "type": 1,
        }

        self.data_patch = {
            "user": 1002,
            "name": "Aoi_test_new",
            "polygon": "SRID=4326;POLYGON ((35.953724 50.006239, 35.954942 50.006388, 35.955151 50.005795, \
            35.953971 50.005601, 35.953724 50.006239))",
            "createdat": "2020-11-20T00:00:00.000000Z",
        }

    def test_create_aoi_as_not_auth_user(self):
        url = reverse('aoi:aoi_list_or_create')
        self.client.force_authenticate(user=None)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_aoi_by_not_owner(self):
        url = reverse('aoi:aoi_list_or_create')
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_aoi_by_owner(self):
        url = reverse('aoi:aoi_list_or_create')
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_aoi_unique_name(self):
        url = reverse('aoi:aoi_list_or_create')
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        target_response = {"non_field_errors": ["The fields user, name must make a unique set."]}
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, target_response)

        # Another user can create aoi with this name
        self.client.force_authenticate(user=self.ex_2_user)
        creation_data = {**self.data_create, "user": self.ex_2_user.id}
        response = self.client.post(url, creation_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_aoi_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_aoi(1001)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_aoi_by_owner(self):
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.get_aoi(1002)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_get_aoi_by_not_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_aoi(1002)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def get_aoi(self, aoi_id):
        url = reverse('aoi:aoi', kwargs={'pk': aoi_id})
        return self.client.get(url)

    def test_patch_aoi_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.patch_aoi(1002)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_aoi_by_not_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.patch_aoi(1002)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_aoi_by_owner(self):
        aoi_id = 1002
        self.client.force_authenticate(user=self.ex_2_user)
        aoi = AoI.objects.get(pk=aoi_id)
        aoi.polygon = self.data_patch['polygon']
        serializer = AoISerializer(aoi)
    
        response = self.patch_aoi(aoi_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = json.loads(response.content)
        self.assertEqual(content['name'], self.data_patch['name'])
        self.assertEqual(content['polygon'], serializer.data['polygon'])
        self.assertEqual(content['createdat'], serializer.data['createdat'])
        self.assertEqual(content['type'], serializer.data['type'])
        
    def test_patch_aoi_with_wrong_user_id_by_owner(self):
        aoi_id = 1002
        self.data_patch['user'] = 10001
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.patch_aoi(aoi_id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def patch_aoi(self, aoi_id):
        url = reverse('aoi:aoi', kwargs={'pk': aoi_id})
        return self.client.patch(url, self.data_patch)

    def test_get_aoi_list_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_aoi_list()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_aoi_list_as_not_staff_user(self):
        expected_results_len = 1
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.get_aoi_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def test_get_aoi_list_as_staff_user(self):
        expected_results_len = 1
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_aoi_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def get_aoi_list(self):
        url = reverse('aoi:aoi_list_or_create')
        return self.client.get(url)

    def test_delete_aoi_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.delete_aoi(1001)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_aoi_by_owner(self):
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.delete_aoi(1002)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_aoi_by_not_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.delete_aoi(1002)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def delete_aoi(self, aoi_id):
        url = reverse('aoi:aoi', kwargs={'pk': aoi_id})
        return self.client.delete(url)

    def test_get_aoi_results_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_aoi_results(1001)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_aoi_results_by_not_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_aoi_results(1002)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_aoi_results_by_owner(self):
        expected_results_len = 5
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_aoi_results(1001)
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def get_aoi_results(self, aoi_id):
        url = reverse('aoi:aoi_results', kwargs={'pk': aoi_id})
        return self.client.get(url)
    
    
class AOIResultRestrictedAclTestCase(UserBase):
    fixtures = [
        'user/fixtures/user_fixtures.json',
        'aoi/fixtures/aoi_fixtures.json',
        'aoi/fixtures/notebook_fixtures.json',
        'aoi/fixtures/request_fixtures.json',
        'publisher/fixtures/acl_fixtures.json',
        'publisher/fixtures/results_restricted_acl_fixtures.json'
    ]
    
    def test_get_aoi_results_as_ex_2_user(self):
        expected_results_len = 3
        self.client.force_authenticate(user=self.ex_2_user)
        self.get_aoi_results(1002, expected_results_len)

    def test_get_aoi_results_as_ex_3_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.ex_3_user)
        self.get_aoi_results(1003, expected_results_len)

    def test_get_aoi_results_as_all_results_user(self):
        expected_results_len = 5
        self.client.force_authenticate(user=self.all_results_user)
        self.get_aoi_results(1004, expected_results_len)
    
    def test_get_aoi_results_as_all_results_no_acl_user(self):
        expected_results_len = 5
        self.client.force_authenticate(user=self.all_results_no_acl_user)
        self.get_aoi_results(1005, expected_results_len)
        
    def get_aoi_results(self, aoi_id, expected_results_len):
        url = reverse('aoi:aoi_results', kwargs={'pk': aoi_id})
        response = self.client.get(url)
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)


class JupyterNotebookTestCase(UserBase):
    fixtures = ["user/fixtures/user_fixtures.json", "aoi/fixtures/notebook_fixtures.json"]
    
    def setUp(self):
        self.add_users_to_groups()
        self.staff_user = User.objects.get(id=1001)
        self.not_staff_user = User.objects.get(id=1002)
        self.data_create = {
            "name": "JupyterNotebook_test_created",
            "basic_price": 1.2,
            "image": "some docker command",
            "path": "work/notebooks/example/geojson_created.ipynb",
            "kernel_name": "3.8",
            "run_validation": True,
            "success": False,
            "date_type": 2
        }
        
        self.data_patch = {
            "name": "JupyterNotebook_test_patch",
            "basic_price": 1.4,
            "image": "some new docker command",
            "kernel_name": "3.3",
            "run_validation": True,
            "success": True,
            "date_type": 2
        }
    
    def test_create_notebook_as_not_auth_user(self):
        url = reverse('aoi:notebook_list_or_create')
        self.client.force_authenticate(user=None)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_notebook_as_not_staff_user(self):
        url = reverse('aoi:notebook_list_or_create')
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_notebook_as_staff_user(self):
        url = reverse('aoi:notebook_list_or_create')
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_get_notebook_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_notebook()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_notebook_as_not_staff_user(self):
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.get_notebook()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_notebook_as_staff_user(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_notebook()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def get_notebook(self):
        notebook = Component.objects.get(id=1001)
        url = reverse('aoi:notebook', kwargs={'pk': notebook.id})
        response = self.client.get(url)
        return response
    
    def test_patch_notebook_as_not_auth_user(self):
        url = reverse('aoi:notebook', kwargs={'pk': 1001})
        self.client.force_authenticate(user=None)
        response = self.client.patch(url, self.data_patch)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_patch_notebook_as_not_staff_user(self):
        url = reverse('aoi:notebook', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.client.patch(url, self.data_patch)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_patch_notebook_as_staff_user(self):
        url = reverse('aoi:notebook', kwargs={'pk': 1001})
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.patch(url, self.data_patch)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = json.loads(response.content)
        self.assertEqual(content['name'], self.data_patch['name'])
        self.assertEqual(content['basic_price'], self.data_patch['basic_price'])
        self.assertEqual(content['image'], self.data_patch['image'])
        self.assertEqual(content['path'], 'work/notebooks/example/geojson.ipynb')
        self.assertEqual(content['kernel_name'], self.data_patch['kernel_name'])
        self.assertEqual(content['run_validation'], self.data_patch['run_validation'])
        self.assertEqual(content['success'], self.data_patch['success'])
        self.assertEqual(content['date_type'], self.data_patch['date_type'])
    
    def test_get_notebook_list_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_notebook_list()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_notebook_list_as_not_staff_user(self):
        expected_results_len = 3
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.get_notebook_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)
    
    def test_get_notebook_list_as_staff_user(self):
        expected_results_len = 3
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_notebook_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)
    
    def get_notebook_list(self):
        url = reverse('aoi:notebook_list_or_create')
        return self.client.get(url)
    
    def test_delete_notebook_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.delete_notebook()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_notebook_as_not_staff_user(self):
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.delete_notebook()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_notebook_as_staff_user(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.delete_notebook()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def delete_notebook(self):
        url = reverse('aoi:notebook', kwargs={'pk': 1001})
        response = self.client.delete(url)
        return response
    
    
class RequestTestCase(UserBase):
    fixtures = ['user/fixtures/user_fixtures.json',
                'aoi/fixtures/aoi_fixtures.json',
                'aoi/fixtures/notebook_fixtures.json',
                'aoi/fixtures/request_fixtures.json']

    def setUp(self):
        super().setUp()

        self.data_create = {
            'user': 1001,
            'aoi': 1001,
            'notebook': 1001,
            'polygon': ''
        }

        self.data_patch = {
            'notebook': 1002,
        }
        
        # Data to test request model validation
        self.data_no_period = {
            'user': 1001,
            'aoi': 1001,
            'notebook': 1003,
        }

        # Data to test request creation without AoI
        self.data_polygon_create = {
            'user': 1001,
            'notebook': 1001,
            'polygon': 'SRID=4326;POLYGON ((36.01678367017178 50.14982647696019, 36.55073998712133 50.13673931232907, '
                       '36.55073998712133 49.42479755639633, 36.02725340187668 49.41171039176521, 36.01678367017178 '
                       '50.14982647696019))'
        }

    def test_create_request_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.create_request(self.data_create)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_create_request_as_not_owner(self):
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.create_request(self.data_create)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_create_request_as_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.create_request(self.data_create)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        content = json.loads(response.content)
        self.assertEqual(content['user'], self.staff_user.id)

    def test_create_request_without_required_period(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.create_request(self.data_no_period)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_request_without_aoi(self):
        target_response = {
            'user': 1001,
            'aoi': None,
            'notebook': 1001,
            'notebook_name': 'JupyterNotebook_test',
            'date_from': None,
            'date_to': None,
            'started_at': None,
            'finished_at': None,
            'error': None,
            'calculated': False,
            'success': False,
            'polygon': 'SRID=4326;POLYGON ((36.01678367017178 50.14982647696019, 36.55073998712133 50.13673931232907, '
                       '36.55073998712133 49.42479755639633, 36.02725340187668 49.41171039176521, 36.01678367017178 '
                       '50.14982647696019))',
            'additional_parameter': None,
            'request_origin': 'http://testserver/',
            'user_readable_errors': None
        }
        self.client.force_authenticate(user=self.staff_user)
        response = self.create_request(self.data_polygon_create)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response.data.pop('id')
        self.assertEqual(response.data, target_response)

    def test_create_request_with_invalid_polygon(self):
        self.client.force_authenticate(user=self.staff_user)
        data_create = {
            **self.data_polygon_create,
            'polygon': 'SRID=4326;POLYGON ((36.01678367017178 50.14982647696019, 36.55073998712133 50.13673931232907'
        }
        target_error_message = {
            "non_field_errors": ["Sorry, we couldn't process your request because the provided location is invalid"]
        }
        response = self.create_request(data_create)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, target_error_message)

    def create_request(self, data):
        url = reverse('aoi:request_list_or_create')
        return self.client.post(url, data)

    def test_get_request_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_request(1001)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_get_request_by_owner(self):
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.get_request(1002)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_get_request_by_not_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_request(1002)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def get_request(self, request_id):
        url = reverse('aoi:request', kwargs={'pk': request_id})
        return self.client.get(url)

    def test_patch_request_by_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.patch_request(1001)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def patch_request(self, request_id):
        url = reverse('aoi:request', kwargs={'pk': request_id})
        return self.client.patch(url, self.data_patch)
    
    def test_delete_request_by_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.patch_request(1001)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def delete_request(self, request_id):
        url = reverse('aoi:request', kwargs={'pk': request_id})
        return self.client.delete(url)
    
    def test_get_request_list_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_request_list()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_get_request_list_as_ex_2_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.get_request_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)
        
    def test_get_request_list_as_staff_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_request_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)
    
    def get_request_list(self):
        url = reverse('aoi:request_list_or_create')
        return self.client.get(url)

    
class AOIRequestsTestCase(UserBase):
    fixtures = ['user/fixtures/user_fixtures.json',
                'aoi/fixtures/aoi_fixtures.json',
                'aoi/fixtures/notebook_fixtures.json',
                'aoi/fixtures/request_fixtures.json']
    
    def test_get_aoi_requests_as_ex_2_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.ex_2_user)
        self.get_aoi_requests(1002, expected_results_len)
        
    def test_get_aoi_requests_as_staff_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.staff_user)
        self.get_aoi_requests(1001, expected_results_len)
    
    def get_aoi_requests(self, aoi_id, expected_requests_len):
        url = reverse('aoi:aoi_requests', kwargs={'pk': aoi_id})
        response = self.client.get(url)
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_requests_len)
