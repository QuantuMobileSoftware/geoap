import json
import logging
from rest_framework import status
from django.urls import reverse
from user.models import User
from .models import AoI, JupyterNotebook
from .serializers import AoISerializer
from user.tests import UserBase
from django.conf import settings

logger = logging.getLogger('root')


class AOITestCase(UserBase):
    fixtures = ['user/fixtures/user_fixtures.json', 'aoi/fixtures/aoi_fixtures.json',
                'aoi/fixtures/results_bbox_fixtures.json']

    def setUp(self):
        super().setUp()
        self.data_create = {
            "user": 1001,
            "name": "Aoi_test",
            "polygon": "SRID=4326;POLYGON (( \
            35.895191466414154 50.009453778741694 ,  \
            36.336338200246395 50.008199333053057 ,  \
            36.344659254377753 49.460584684398697 , \
            35.912753706054865 49.4508072987418 ,  \
            35.895191466414154 50.009453778741694 \
            ))",
        }

        self.data_patch = {
            "user": 1002,
            "name": "Aoi_test_new",
            "polygon": "SRID=4326;POLYGON ((\
            35.895191466414154 50.009453778741694, \
            36.336338200246395 50.008199333053057, \
            36.344659254377753 49.460584684398697, \
            35.912753706054865 49.4508072987418, \
            35.895191466414154 50.009453778741694\
            ))",
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
        "user/fixtures/user_fixtures.json",
        "aoi/fixtures/aoi_fixtures.json",
        "publisher/fixtures/acl_fixtures.json",
        "publisher/fixtures/results_restricted_acl_fixtures.json",
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
            "image": "some docker command",
            "path": "work/notebooks/example/geojson_created.ipynb",
            "kernel_name": "3.8",
            "run_validation": True,
            "success": False
        }
        
        self.data_patch = {
            "name": "JupyterNotebook_test_patch",
            "image": "some new docker command",
            "kernel_name": "3.3",
            "run_validation": True,
            "success": True,
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
        notebook = JupyterNotebook.objects.get(id=1001)
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
        self.assertEqual(content['image'], self.data_patch['image'])
        self.assertEqual(content['path'], 'work/notebooks/example/geojson.ipynb')
        self.assertEqual(content['kernel_name'], self.data_patch['kernel_name'])
        self.assertEqual(content['run_validation'], self.data_patch['run_validation'])
        self.assertEqual(content['success'], self.data_patch['success'])
    
    def test_get_notebook_list_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_notebook_list()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_notebook_list_as_not_staff_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.get_notebook_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)
    
    def test_get_notebook_list_as_staff_user(self):
        expected_results_len = 2
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
        }

        self.data_patch = {
            'notebook': 1002,
        }

    def test_create_request_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_create_request_as_not_owner(self):
        self.client.force_authenticate(user=self.ex_2_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_create_request_as_owner(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        content = json.loads(response.content)
        self.assertEqual(content['user'], self.staff_user.id)
    
    def create_request(self):
        url = reverse('aoi:request_list_or_create')
        return self.client.post(url, self.data_create)

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
        expected_results_len = 1
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
        expected_results_len = 1
        self.client.force_authenticate(user=self.staff_user)
        self.get_aoi_requests(1001, expected_results_len)
    
    def get_aoi_requests(self, aoi_id, expected_requests_len):
        url = reverse('aoi:aoi_requests', kwargs={'pk': aoi_id})
        response = self.client.get(url)
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_requests_len)


class PlotBoundariesTestCase(UserBase):
    fixtures = ['user/fixtures/user_fixtures.json',
                'aoi/fixtures/aoi_fixtures.json',
                'aoi/fixtures/notebook_fixtures.json',
                'aoi/fixtures/request_fixtures.json',
                'aoi/fixtures/plot_boundaries_fixtures.json']

    data_create = {
        "user": 1002,
        "aoi": 1002,
        "date_from": '2021-01-01',
        "date_to": '2021-01-01',
        "polygon": "SRID=4326;POLYGON ((\
            35.895191466414154 50.009453778741694, \
            36.336338200246395 50.008199333053057, \
            36.344659254377753 49.460584684398697, \
            35.912753706054865 49.4508072987418, \
            35.895191466414154 50.009453778741694\
            ))",
        "notebook": settings.PLOT_BOUNDARIES_NOTEBOOK_ID
    }

    def setUp(self):
        super().setUp()

    def get_plot_boundaries(self, aoi_id, user=None, year=2021) -> object:
        url = reverse('aoi:plot_boundaries_list_or_create', kwargs={'pk': aoi_id, 'year': year})
        self.client.force_authenticate(user=user)
        response = self.client.get(url)
        return response

    def test_get_plot_boundaries_not_auth(self):
        response = self.get_plot_boundaries(1001, user=None, year=2021)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_plot_boundaries_as_not_owner_staff(self):
        response = self.get_plot_boundaries(1002, user=self.staff_user, year=2021)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_plot_boundaries_as_owner_check_results(self):
        expected_results_len = 2
        response = self.get_plot_boundaries(1002, user=self.ex_2_user, year=2021)
        content = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def test_get_plot_boundaries_owner_check_results_other_year(self):
        expected_results_len = 1
        response = self.get_plot_boundaries(1002, user=self.ex_2_user, year=2020)
        content = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)
        self.assertTrue(content[0]['date_to'] == '2020-01-01')

    def post_request(self, aoi_id, year, user=None):
        self.client.force_authenticate(user=user)
        url = reverse('aoi:plot_boundaries_list_or_create', kwargs={'pk': aoi_id, 'year': year})
        return self.client.post(url, self.data_create)

    def test_create_plot_boundaries_as_not_auth_user(self):
        response = self.post_request(aoi_id=1, user=None, year=2021)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_plot_boundaries_as_not_owner_staff(self):
        response = self.post_request(1002, user=self.staff_user, year=2021)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_plot_boundaries_request_as_owner(self):
        response = self.post_request(aoi_id=1002, user=self.ex_2_user, year=2021)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        equals = [
            request[1] == response[1]
            for request, response in zip(
                sorted(response.json().items()), sorted(self.data_create.items())
            )
            if response[0] == request[0]
        ]
        self.assertTrue(all(equals))


