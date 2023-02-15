from django.urls import reverse
from rest_framework.status import HTTP_200_OK
from rest_framework.test import APITestCase
from django.contrib.auth.models import Group
from .models import User


class UserBase(APITestCase):
    
    @staticmethod
    def add_users_to_groups():
        group = Group.objects.get(name='Data_science_engineer')
        user = User.objects.get(id=1001)
        user.groups.add(group)

        group = Group.objects.get(name='Client')
        user = User.objects.get(id=1002)
        user.groups.add(group)
        user = User.objects.get(id=1003)
        user.groups.add(group)
        user = User.objects.get(id=1004)
        user.groups.add(group)
        user = User.objects.get(id=1005)
        user.groups.add(group)
        
    def setUp(self):
        self.add_users_to_groups()
        self.staff_user = User.objects.get(id=1001)
        self.ex_2_user = User.objects.get(id=1002)
        self.ex_3_user = User.objects.get(id=1003)
        self.all_results_user = User.objects.get(id=1004)
        self.all_results_no_acl_user = User.objects.get(id=1005)


class UserDetailsTestCase(UserBase):
    fixtures = ('user/fixtures/user_fixtures.json',)

    def test_user_details_retrieve(self):
        self.client.force_login(self.staff_user)
        response_data = {
            "pk": 1001,
            "username": "test_staff",
            "email": "",
            "first_name": "",
            "last_name": "",
            "area_limit_ha": None,
            "planet_api_key": None,
            "balance": 0,
            "on_hold": 0,
            "discount": 0
        }
        url = reverse("rest_user_details")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

    def test_user_details_partial_update(self):
        self.client.force_login(self.staff_user)
        input_data = {
            "username": "staff_user",
            "email": "updated@mail.com",
            "first_name": "User",
            "last_name": "Staff",
            "planet_api_key": "secret-api-key",
            "area_limit_ha": None,
            "balance": 100000,
            "on_hold": 5,
            "discount": 100
        }
        response_data = {
            "pk": 1001,
            "username": "staff_user",
            "email": "",
            "first_name": "User",
            "last_name": "Staff",
            "area_limit_ha": None,
            "planet_api_key": "secret-api-key",
            "balance": 0,
            "on_hold": 0,
            "discount": 0
        }
        url = reverse("rest_user_details")
        response = self.client.patch(url, input_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

    def test_user_details_update(self):
        self.client.force_login(self.staff_user)
        input_data = {
            "username": "staff_user",
            "email": "updated@mail.com",
            "first_name": "User",
            "last_name": "Staff",
            "planet_api_key": "secret-api-key",
            "area_limit_ha": None,
            "balance": 100000,
            "on_hold": 5,
            "discount": 100
        }
        response_data = {
            "pk": 1001,
            "username": "staff_user",
            "email": "",
            "first_name": "User",
            "last_name": "Staff",
            "area_limit_ha": None,
            "planet_api_key": "secret-api-key",
            "balance": 0,
            "on_hold": 0,
            "discount": 0
        }
        url = reverse("rest_user_details")
        response = self.client.put(url, input_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)
