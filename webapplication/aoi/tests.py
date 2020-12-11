import json
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from user.models import User
from .models import AoI
from .serializers import AoISerializer
from user.tests import UserBase


class AOITestCase(APITestCase, UserBase):
    fixtures = ["user/fixtures/user_fixtures.json", "aoi/fixtures/results_bbox_fixtures.json"]

    def setUp(self):
        self.add_users_to_groups()
        self.staff_user = User.objects.get(id=1001)
        self.not_staff_user = User.objects.get(id=1002)
        self.data_create = {
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

    def test_create_aoi_as_not_staff_user(self):
        url = reverse('aoi:aoi_list_or_create')
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_aoi_as_staff_user(self):
        url = reverse('aoi:aoi_list_or_create')
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(url, self.data_create)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_aoi_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_aoi()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_aoi_as_not_staff_user(self):
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.get_aoi()
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_aoi_as_staff_user(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_aoi()
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def get_aoi(self):
        aoi = AoI.objects.create(**self.data_create)
        url = reverse('aoi:aoi', kwargs={'pk': aoi.id})
        response = self.client.get(url)
        return response

    def test_patch_aoi_as_not_auth_user(self):
        aoi = AoI.objects.create(**self.data_create)
        url = reverse('aoi:aoi', kwargs={'pk': aoi.id})
        self.client.force_authenticate(user=None)
        response = self.client.patch(url, self.data_patch)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_aoi_as_not_staff_user(self):
        aoi = AoI.objects.create(**self.data_create)
        url = reverse('aoi:aoi', kwargs={'pk': aoi.id})
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.client.patch(url, self.data_patch)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_aoi_as_staff_user(self):
        aoi = AoI.objects.create(**self.data_create)
        aoi.polygon = self.data_patch['polygon']
        serializer = AoISerializer(aoi)
        url = reverse('aoi:aoi', kwargs={'pk': aoi.id})
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.patch(url, self.data_patch)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = json.loads(response.content)
        self.assertEqual(content['name'], self.data_patch['name'])
        self.assertEqual(content['polygon'], serializer.data['polygon'])
        self.assertEqual(content['createdat'], serializer.data['createdat'])

    def test_get_aoi_list_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_aoi_list()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_aoi_list_as_not_staff_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.get_aoi_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def test_get_aoi_list_as_staff_user(self):
        expected_results_len = 2
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_aoi_list()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def get_aoi_list(self):
        AoI.objects.create(**self.data_create)
        AoI.objects.create(**self.data_patch)
        url = reverse('aoi:aoi_list_or_create')
        response = self.client.get(url)
        return response

    def test_delete_aoi_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.delete_aoi()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_aoi_as_not_staff_user(self):
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.delete_aoi()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_aoi_as_staff_user(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.delete_aoi()
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def delete_aoi(self):
        aoi = AoI.objects.create(**self.data_create)
        url = reverse('aoi:aoi', kwargs={'pk': aoi.id})
        response = self.client.delete(url)
        return response

    def test_get_aoi_results_as_not_auth_user(self):
        self.client.force_authenticate(user=None)
        response = self.get_aoi_results()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_aoi_results_as_not_staff_user(self):
        expected_results_len = 1
        self.client.force_authenticate(user=self.not_staff_user)
        response = self.get_aoi_results()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def test_get_aoi_results_as_staff_user(self):
        expected_results_len = 4
        self.client.force_authenticate(user=self.staff_user)
        response = self.get_aoi_results()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), expected_results_len)

    def get_aoi_results(self):
        aoi = AoI.objects.create(**self.data_create)
        url = reverse('aoi:aoi_results', kwargs={'pk': aoi.id})
        response = self.client.get(url)
        return response
