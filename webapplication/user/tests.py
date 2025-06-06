import re

from rest_framework.status import HTTP_200_OK, HTTP_403_FORBIDDEN, HTTP_201_CREATED
from rest_framework.test import APITestCase
from django.contrib.auth.models import Group, Permission
from django.urls import reverse
from django.core import mail

from user.models import User


class UserBase(APITestCase):

    @staticmethod
    def add_users_special_permissions():
        delete_any_result_permission = Permission.objects.get(codename='delete_any_result')
        view_all_transactions_permission = Permission.objects.get(codename='view_all_transactions')

        staff_user = User.objects.get(id=1001)
        staff_user.user_permissions.add(delete_any_result_permission)
        staff_user.user_permissions.add(view_all_transactions_permission)
    
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
        self.add_users_special_permissions()
        self.staff_user = User.objects.get(id=1001)
        self.ex_2_user = User.objects.get(id=1002)
        self.ex_3_user = User.objects.get(id=1003)
        self.all_results_user = User.objects.get(id=1004)
        self.all_results_no_acl_user = User.objects.get(id=1005)

class AuthTestCase(UserBase):
    fixtures = ("user/fixtures/user_fixtures.json", )

    def login_with_credentials(self, login_data):
        url = reverse("rest_login")
        return self.client.post(url, login_data)

    def test_user_login_with_username(self):
        login_data = {
            "username": "test_staff",
            "password": "AiL9uumi"
        }
        response = self.login_with_credentials(login_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertTrue(response.data.get("key", False))

    def test_user_login_with_username_and_email(self):
        login_data = {
            "username": "test_staff",
            "e-mail": "test_staff@geoap.com",
            "password": "AiL9uumi"
        }
        response = self.login_with_credentials(login_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertTrue(response.data.get("key", False))

    def test_user_logout_on_GET(self):
        self.client.force_login(self.ex_2_user)
        url = reverse("rest_logout")
        response_data = {'detail': 'Successfully logged out.'}
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

    def test_user_logout_on_POST(self):
        self.client.force_login(self.ex_2_user)
        url = reverse("rest_logout")
        response_data = {'detail': 'Successfully logged out.'}
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

    def test_password_change(self):
        self.client.force_login(self.ex_2_user)
        new_password = "Ois@3ns1"
        input_data = {
          "new_password1": new_password,
          "new_password2": new_password
        }
        response_data = {'detail': 'New password has been saved.'}
        url = reverse("rest_password_change")
        response = self.client.post(url, input_data)

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

        login_data = {
            "username": self.ex_2_user.username,
            "password": new_password
        }
        response = self.login_with_credentials(login_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertTrue(response.data.get("key", False))

    def test_reset_password(self):
        self.client.force_login(self.ex_3_user)
        input_data = {'email': self.ex_3_user.email}
        response_data = {'detail': 'Password reset e-mail has been sent.'}
        url = reverse("rest_password_reset")
        response = self.client.post(url, input_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)
        self.assertEqual(len(mail.outbox), 1)

    def test_get_current_user_details(self):
        self.client.force_login(self.staff_user)
        response_data = {
            'pk': 1001,
            'username': 'test_staff',
            'email': 'test_staff@geoap.com',
            'first_name': '',
            'last_name': '',
            'area_limit_ha': None,
            'planet_api_key': None,
            "balance": 100000,
            "on_hold": 0,
            "discount": 0,
            'trial_started_at': None,
            'trial_finished_at': None,
            'is_trial_end_notified': False,
            'receive_notification': True,
            'server_for_calculation_is_needed': False,
            'stone_google_folder': None,
            'country': 'US',
            'units_of_measurement': 'km'
        }
        url = reverse("rest_user_details")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

    def test_get_anonymous_user_details(self):
        response_data = {'detail': 'Authentication credentials were not provided.'}
        url = reverse("rest_user_details")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)
        self.assertEqual(response.data, response_data)

    def test_current_user_partial_update(self):
        self.client.force_login(self.staff_user)
        input_data = {
            'username': 'admin',
            'email': 'admin_staff@geoap.com',
            'first_name': 'admin',
            'last_name': 'admin',
            'area_limit_ha': 100,
            'planet_api_key': "secret-api-key",
            'balance': 12345,
            'on_hold': 5,
            'discount': 100
        }
        response_data = {
            'pk': 1001,
            'username': 'admin',
            'email': 'test_staff@geoap.com',
            'first_name': 'admin',
            'last_name': 'admin',
            'area_limit_ha': None,
            'planet_api_key': "secret-api-key",
            'balance': 100000,
            'on_hold': 0,
            'discount': 0,
            'trial_started_at': None,
            'trial_finished_at': None,
            'is_trial_end_notified': False,
            'receive_notification': True,
            'stone_google_folder': None,
            'country': 'US',
            'units_of_measurement': 'km'
        }
        url = reverse("rest_user_details")
        response = self.client.patch(url, input_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

    def test_current_user_update(self):
        self.client.force_login(self.staff_user)
        input_data = {
            'username': 'admin',
            'email': 'admin_staff@geoap.com',
            'first_name': 'admin',
            'last_name': 'admin',
            'area_limit_ha': 100,
            'planet_api_key': "secret-api-key",
            'balance': 12345,
            'on_hold': 5,
            'discount': 100
        }
        response_data = {
            'pk': 1001,
            'username': 'admin',
            'email': 'test_staff@geoap.com',
            'first_name': 'admin',
            'last_name': 'admin',
            'area_limit_ha': None,
            'planet_api_key': "secret-api-key",
            'balance': 100000,
            'on_hold': 0,
            'discount': 0,
            'trial_started_at': None,
            'trial_finished_at': None,
            'is_trial_end_notified': False,
            'receive_notification': True,
            'stone_google_folder': None,
            'country': 'US',
            'units_of_measurement': 'km'
        }
        url = reverse("rest_user_details")
        response = self.client.put(url, input_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

    def test_user_signup_with_confirmation(self):
        username = "new_user"
        password = "TrmWe23kn"
        input_data = {
            "username": username,
            "email": "new_user@geoap.com",
            "password1": password,
            "password2": password
        }
        response_data = {'detail': 'Verification e-mail sent.'}
        url = reverse("rest_register")
        response = self.client.post(url, input_data)
        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data, response_data)
        self.assertEqual(len(mail.outbox), 1)

        current_user = User.objects.get(username=input_data.get("username"), email=input_data.get("email"))
        self.assertEqual(len(current_user.groups.all()), 1)
        self.assertEqual(current_user.groups.first().name, "Client")
        
        url_matches = re.findall(r"http.*account-confirm-email.*\B", mail.outbox[0].body)
        self.assertTrue(url_matches)
        confirmation_url = url_matches[0]  # Confirmation URL built for FE purposes and doesn't contain "/api/" part
        url_parts = confirmation_url.split("signup")
        url_parts.insert(1, "api/signup")
        confirmation_url = "".join(url_parts)
        response_data = "Email has been successfully confirmed!"

        response = self.client.get(confirmation_url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, response_data)

        response = self.login_with_credentials({
            "username": username,
            "password": password
        })
        self.assertEqual(response.status_code, HTTP_200_OK)

    def test_email_resend(self):
        username = "new_user_1"
        password = "TrmWe23kn"
        email = "new_user_1@geoap.com"
        input_data = {
            "username": username,
            "email": email,
            "password1": password,
            "password2": password
        }
        response_data = {'detail': 'Verification e-mail sent.'}
        url = reverse("rest_register")
        response = self.client.post(url, input_data)
        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data, response_data)
        self.assertEqual(len(mail.outbox), 1)

        input_data = {"email": email}
        url = reverse("rest_resend_email")
        response = self.client.post(url, input_data)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 2)


class TransactionTestCase(UserBase):
    fixtures = (
        'user/fixtures/user_fixtures.json',
        'aoi/fixtures/aoi_fixtures.json',
        'aoi/fixtures/notebook_fixtures.json',
        'aoi/fixtures/request_fixtures.json',
        'user/fixtures/transaction_fixtures.json'
    )

    def test_get_transactions_list_authorized(self):
        response_data = [
            {
                "id": 1002,
                "user": 1002,
                "amount": 30,
                "created_at": "2023-02-15T11:15:11.230000Z",
                "updated_at": "2023-02-15T11:15:11.230000Z",
                "request": None,
                "comment": "",
                "error": None,
                "completed": False,
                "rolled_back": False
            }
        ]
        url = reverse("get_transactions_list")
        self.client.force_login(self.ex_2_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data), len(response_data))
        self.assertEqual(response.json(), response_data)

    def test_get_transactions_list_authorized_as_admin(self):
        response_data = [
            {
                "id": 1003,
                "user": 1003,
                "amount": -8.14,
                "created_at": "2023-02-15T11:16:21.210000Z",
                "updated_at": "2023-02-15T11:16:21.210000Z",
                "request": 1001,
                "comment": "",
                "error": None,
                "completed": True,
                "rolled_back": False
            },
            {
                "id": 1002,
                "user": 1002,
                "amount": 30,
                "created_at": "2023-02-15T11:15:11.230000Z",
                "updated_at": "2023-02-15T11:15:11.230000Z",
                "request": None,
                "comment": "",
                "error": None,
                "completed": False,
                "rolled_back": False
            },
            {
                "id": 1001,
                "user": 1001,
                "amount": -20.42,
                "created_at": "2023-02-15T11:14:31.140000Z",
                "updated_at": "2023-02-15T11:14:31.140000Z",
                "request": 1001,
                "comment": "",
                "error": None,
                "completed": True,
                "rolled_back": False
            }
        ]
        url = reverse("get_transactions_list")
        self.client.force_login(self.staff_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data), len(response_data))
        self.assertEqual(response.json(), response_data)

    def test_get_transactions_list_not_authorized(self):
        url = reverse("get_transactions_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)
