import json
import re
from unittest import mock

from django.contrib.auth.models import Group, Permission
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from google.cloud.exceptions import GoogleCloudError
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_404_NOT_FOUND, HTTP_409_CONFLICT, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.test import APITestCase

import user.stone_device_views as stone_views
from devices.models import Camera
from user.models import StonesDetectionChunk, User, UploadMissions
from user.upload_utils import get_upload_config


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
    fixtures = ("user/fixtures/user_fixtures.json",)

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

    def test_user_login_with_wrong_password_fails(self):
        login_data = {
            "username": "test_staff",
            "password": "wrongpassword123"
        }
        response = self.login_with_credentials(login_data)
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get("key", False))


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
                "rolled_back": False,
                "area_sq_km": None
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
                "rolled_back": False,
                "area_sq_km": None
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
                "rolled_back": False,
                "area_sq_km": None
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
                "rolled_back": False,
                "area_sq_km": None
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

    def test_post_transactions_not_allowed(self):
        self.client.force_login(self.ex_2_user)
        url = reverse("get_transactions_list")
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, 405)


class UploadMissionsTestCase(UserBase):
    fixtures = (
        'user/fixtures/user_fixtures.json',
        'aoi/fixtures/notebook_fixtures.json',
    )

    def setUp(self):
        super().setUp()
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.save(update_fields=['stone_google_folder'])

    # --- UploadMissionsListCreateAPIView ---

    def test_create_mission_authenticated(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_missions_list')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('gcs_path', response.data)
        self.assertEqual(response.data['status'], UploadMissions.STATUS_IN_PROGRESS)
        # gcs_path format: YYYY/YYYY-MM-DD_HH-MM-SS
        gcs_path = response.data['gcs_path']
        parts = gcs_path.split('/')
        self.assertEqual(len(parts), 2)
        self.assertEqual(len(parts[0]), 4)  # year

    def test_create_mission_unauthenticated(self):
        url = reverse('upload_missions_list')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_list_missions_returns_only_own(self):
        # Create missions for two users
        self.client.force_login(self.ex_2_user)
        self.client.post(reverse('upload_missions_list'), {})
        self.client.post(reverse('upload_missions_list'), {})

        self.client.force_login(self.ex_3_user)
        self.client.post(reverse('upload_missions_list'), {})

        # ex_2_user sees only their 2 missions
        self.client.force_login(self.ex_2_user)
        response = self.client.get(reverse('upload_missions_list'))
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        for mission in response.data:
            self.assertEqual(mission['status'], UploadMissions.STATUS_IN_PROGRESS)

    def test_list_missions_unauthenticated(self):
        url = reverse('upload_missions_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_create_mission_with_component(self):
        from aoi.models import Component
        component = Component.objects.get(pk=1001)
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_missions_list')
        response = self.client.post(url, {'component': component.pk})
        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data['component'], component.pk)
        self.assertEqual(response.data['component_name'], component.name)

    def test_create_mission_uses_default_upload_component(self):
        from aoi.models import Component
        component = Component.objects.get(pk=1001)
        self.ex_2_user.default_upload_component = component
        self.ex_2_user.save(update_fields=['default_upload_component'])

        self.client.force_login(self.ex_2_user)
        url = reverse('upload_missions_list')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data['component'], component.pk)

    # --- UploadMissionsUpdateAPIView ---

    def test_patch_mission_status_to_completed(self):
        self.client.force_login(self.ex_2_user)
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_COMPLETED}, format='json')
        self.assertEqual(response.status_code, HTTP_200_OK)
        mission.refresh_from_db()
        self.assertEqual(mission.status, UploadMissions.STATUS_COMPLETED)

    def test_patch_mission_status_to_failed(self):
        self.client.force_login(self.ex_2_user)
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_FAILED}, format='json')
        self.assertEqual(response.status_code, HTTP_200_OK)
        mission.refresh_from_db()
        self.assertEqual(mission.status, UploadMissions.STATUS_FAILED)

    def test_patch_mission_updates_uploaded_files(self):
        self.client.force_login(self.ex_2_user)
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        files = [{'name': 'video.mp4', 'type': 'data_video', 'size': 1024}]
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_COMPLETED, 'uploaded_files': files}, format='json')
        self.assertEqual(response.status_code, HTTP_200_OK)
        mission.refresh_from_db()
        self.assertEqual(mission.uploaded_files, files)

    def test_patch_mission_creates_trajectory_request_when_completed_with_component(self):
        from aoi.models import Component, Request
        component = Component.objects.get(pk=1001)
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.save(update_fields=['stone_google_folder'])
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
            component=component,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_COMPLETED}, format='json')
        self.assertEqual(response.status_code, HTTP_200_OK)
        mission.refresh_from_db()
        self.assertIsNotNone(mission.trajectory_request_id)
        req = Request.objects.get(pk=mission.trajectory_request_id)
        self.assertEqual(req.component, component)
        self.assertEqual(req.user, self.ex_2_user)
        self.assertIsNone(req.aoi)
        self.assertIsNone(req.polygon)
        expected_path = f"test-bucket/{self.ex_2_user.username}/2024/2024-01-01_10-00-00/"
        self.assertEqual(req.additional_parameter, expected_path)

    def test_patch_mission_no_trajectory_request_when_no_component(self):
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
            component=None,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_COMPLETED}, format='json')
        self.assertEqual(response.status_code, HTTP_200_OK)
        mission.refresh_from_db()
        self.assertIsNone(mission.trajectory_request_id)

    def test_patch_mission_no_trajectory_request_when_already_exists(self):
        from aoi.models import Component, Request
        component = Component.objects.get(pk=1001)
        existing_request = Request.objects.create(
            user=self.ex_2_user,
            component=component,
        )
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
            component=component,
            trajectory_request=existing_request,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_COMPLETED}, format='json')
        self.assertEqual(response.status_code, HTTP_200_OK)
        mission.refresh_from_db()
        # Should still be the original request, not a new one
        self.assertEqual(mission.trajectory_request_id, existing_request.pk)

    def test_patch_other_users_mission_returns_404(self):
        mission = UploadMissions.objects.create(
            user=self.ex_3_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_COMPLETED}, format='json')
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

    def test_mission_put_not_allowed(self):
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.put(url, {'status': UploadMissions.STATUS_COMPLETED}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_mission_serializer_trajectory_status_none_when_no_request(self):
        self.client.force_login(self.ex_2_user)
        self.client.post(reverse('upload_missions_list'), {})
        response = self.client.get(reverse('upload_missions_list'))
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertIsNone(response.data[0]['trajectory_status'])

    def test_mission_serializer_trajectory_status_when_request_exists(self):
        from aoi.models import Component, Request
        component = Component.objects.get(pk=1001)
        req = Request.objects.create(user=self.ex_2_user, component=component)
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_COMPLETED,
            component=component,
            trajectory_request=req,
        )
        self.client.force_login(self.ex_2_user)
        response = self.client.get(reverse('upload_missions_list'))
        self.assertEqual(response.status_code, HTTP_200_OK)
        traj = response.data[0]['trajectory_status']
        self.assertIsNotNone(traj)
        self.assertEqual(traj['id'], req.pk)
        self.assertFalse(traj['calculated'])
        self.assertFalse(traj['success'])
        self.assertIsNone(traj['error'])

    def test_patch_completed_mission_to_failed_without_trajectory_error_returns_400(self):
        self.client.force_login(self.ex_2_user)
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_COMPLETED,
        )
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_FAILED}, format='json')
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        mission.refresh_from_db()
        self.assertEqual(mission.status, UploadMissions.STATUS_COMPLETED)

    def test_patch_completed_mission_to_failed_is_always_blocked(self):
        from aoi.models import Component, Request
        component = Component.objects.get(pk=1001)
        req = Request.objects.create(user=self.ex_2_user, component=component, error='Processing failed')
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_COMPLETED,
            component=component,
            trajectory_request=req,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_FAILED}, format='json')
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        mission.refresh_from_db()
        self.assertEqual(mission.status, UploadMissions.STATUS_COMPLETED)

    def test_trajectory_status_fields_exposed(self):
        from django.utils import timezone
        from aoi.models import Component, Request
        component = Component.objects.get(pk=1001)
        finished = timezone.now()
        req = Request.objects.create(
            user=self.ex_2_user, component=component,
            error='Something went wrong', finished_at=finished,
        )
        UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_COMPLETED,
            component=component,
            trajectory_request=req,
        )
        self.client.force_login(self.ex_2_user)
        response = self.client.get(reverse('upload_missions_list'))
        self.assertEqual(response.status_code, HTTP_200_OK)
        traj = response.data[0]['trajectory_status']
        self.assertEqual(traj['error'], 'Something went wrong')
        self.assertIsNotNone(traj['finished_at'])

    def test_rerun_trajectory_creates_new_request(self):
        from aoi.models import Component, Request
        component = Component.objects.get(pk=1001)
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.save(update_fields=['stone_google_folder'])
        failed_req = Request.objects.create(
            user=self.ex_2_user, component=component, error='Processing failed'
        )
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_COMPLETED,
            component=component,
            trajectory_request=failed_req,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_rerun_trajectory', kwargs={'pk': mission.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        mission.refresh_from_db()
        self.assertNotEqual(mission.trajectory_request_id, failed_req.pk)
        new_req = Request.objects.get(pk=mission.trajectory_request_id)
        self.assertEqual(new_req.component, component)
        self.assertIsNone(new_req.error)

    def test_rerun_trajectory_blocked_when_not_failed(self):
        from aoi.models import Component, Request
        component = Component.objects.get(pk=1001)
        req = Request.objects.create(user=self.ex_2_user, component=component, success=True)
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_COMPLETED,
            component=component,
            trajectory_request=req,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_rerun_trajectory', kwargs={'pk': mission.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_rerun_trajectory_blocked_when_mission_not_completed(self):
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_rerun_trajectory', kwargs={'pk': mission.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_patch_mission_unauthenticated_returns_403(self):
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': UploadMissions.STATUS_COMPLETED}, format='json')
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_patch_mission_invalid_status_returns_400(self):
        self.client.force_login(self.ex_2_user)
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )
        url = reverse('upload_mission_detail', kwargs={'pk': mission.pk})
        response = self.client.patch(url, {'status': 'not_a_valid_status'}, format='json')
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_mission_serializer_component_name_null_when_no_component(self):
        UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
            component=None,
        )
        self.client.force_login(self.ex_2_user)
        response = self.client.get(reverse('upload_missions_list'))
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertIsNone(response.data[0]['component_name'])

    def test_list_missions_empty_when_none_exist(self):
        self.client.force_login(self.ex_2_user)
        response = self.client.get(reverse('upload_missions_list'))
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, [])


class GenerateUploadURLTestCase(UserBase):
    fixtures = ('user/fixtures/user_fixtures.json',)

    VALID_DATA_VIDEO_NAME = '00SAIRS_UNIT0120251028071253_0010.MP4'

    _DEFAULT_UPLOAD_CONFIG = {
        'unit_folder': 'unit',
        'upload': {
            'data_video': 'DCIM',
            'log': 'GPS_LOG',
            'calibration_video': None,
        }
    }

    def setUp(self):
        super().setUp()
        from aoi.models import Component
        component = Component.objects.create(
            name='Default Upload Component',
            image='test-image',
            upload_config=self._DEFAULT_UPLOAD_CONFIG,
        )
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.default_upload_component = component
        self.ex_2_user.save(update_fields=['stone_google_folder', 'default_upload_component'])

    def _mock_gcs(self):
        mock_client = mock.MagicMock()
        mock_blob = mock.MagicMock()
        mock_blob.create_resumable_upload_session.return_value = 'https://storage.googleapis.com/resumable/session'
        mock_bucket = mock.MagicMock()
        mock_bucket.blob.return_value = mock_blob
        mock_client.bucket.return_value = mock_bucket
        return mock_client, mock_blob, mock_bucket

    def test_missing_required_params_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_missing_file_name_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_invalid_upload_type_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': 'test.mp4', 'file_type': 'video/mp4', 'upload_type': 'invalid_type'})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_unauthenticated_returns_403(self):
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': 'test.mp4', 'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_invalid_data_video_filename_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        for bad_name in ('video.mp4', 'random.MP4', 'UNIT0120251028071253_0010.MP4', '00SAIRS_UNIT0120251028071253.MP4'):
            response = self.client.get(url, {'file_name': bad_name, 'file_type': 'video/mp4', 'upload_type': 'data_video'})
            self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST, msg=f"Expected 400 for filename: {bad_name}")
            self.assertIn('detail', response.data)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_generates_upload_url_for_data_video(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': self.VALID_DATA_VIDEO_NAME, 'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertIn('upload_url', response.data)
        self.assertIn('session_folder', response.data)
        self.assertEqual(response.data['upload_url'], 'https://storage.googleapis.com/resumable/session')

        # Verify blob path includes DCIM folder for data_video
        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        self.assertIn('DCIM', blob_path)
        self.assertIn(self.VALID_DATA_VIDEO_NAME, blob_path)
        self.assertIn(self.ex_2_user.username, blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_generates_upload_url_for_log(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': 'gps.log', 'file_type': 'text/plain', 'upload_type': 'log'})
        self.assertEqual(response.status_code, HTTP_200_OK)

        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        self.assertIn('GPS_LOG', blob_path)
        self.assertIn('gps.log', blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_generates_upload_url_for_calibration_video(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': 'calib.mp4', 'file_type': 'video/mp4', 'upload_type': 'calibration_video'})
        self.assertEqual(response.status_code, HTTP_200_OK)

        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        # calibration_video has no subfolder and name is forced to 'calibration.<ext>'
        self.assertNotIn('DCIM', blob_path)
        self.assertNotIn('GPS_LOG', blob_path)
        self.assertIn('calibration.mp4', blob_path)
        self.assertNotIn('calib.mp4', blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_session_folder_reused_when_provided(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        # Create a mission so the session_folder is found in DB
        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
        )

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {
            'file_name': self.VALID_DATA_VIDEO_NAME,
            'file_type': 'video/mp4',
            'upload_type': 'data_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data['session_folder'], '2024/2024-01-01_10-00-00')

    def test_missing_file_type_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': 'test.mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_new_session_folder_format(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': self.VALID_DATA_VIDEO_NAME, 'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_200_OK)

        session_folder = response.data['session_folder']
        parts = session_folder.split('/')
        self.assertEqual(len(parts), 2)
        self.assertEqual(len(parts[0]), 4)  # YYYY
        self.assertRegex(parts[1], r'^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$')

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_blob_path_contains_unit_folder(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': self.VALID_DATA_VIDEO_NAME, 'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_200_OK)

        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        # Default config has unit_folder = "unit"
        self.assertIn('/unit/', blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_session_folder_not_in_db_falls_back_to_default_component(self, mock_gcs_cls):
        from aoi.models import Component
        component = Component.objects.create(name='Test Component', image='test-image', upload_config=self._DEFAULT_UPLOAD_CONFIG)
        self.ex_2_user.default_upload_component = component
        self.ex_2_user.save(update_fields=['default_upload_component'])

        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        # session_folder that doesn't exist in DB
        response = self.client.get(url, {
            'file_name': self.VALID_DATA_VIDEO_NAME,
            'file_type': 'video/mp4',
            'upload_type': 'data_video',
            'session_folder': '2099/2099-01-01_00-00-00',
        })
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data['session_folder'], '2099/2099-01-01_00-00-00')

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_gcs_exception_returns_400(self, mock_gcs_cls):
        mock_gcs_cls.side_effect = Exception("GCS error")
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': self.VALID_DATA_VIDEO_NAME, 'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_duplicate_file_in_session_returns_409(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
            uploaded_files=[{'name': self.VALID_DATA_VIDEO_NAME, 'type': 'data_video', 'size': 1024}],
        )

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {
            'file_name': self.VALID_DATA_VIDEO_NAME,
            'file_type': 'video/mp4',
            'upload_type': 'data_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_409_CONFLICT)
        self.assertIn('already been uploaded', response.data['detail'])

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_calibration_video_name_forced_to_calibration(self, mock_gcs_cls):
        """Any calibration_video upload is stored as calibration.<ext> regardless of the original name."""
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {
            'file_name': 'MY_CALIB_2024.MP4',
            'file_type': 'video/mp4',
            'upload_type': 'calibration_video',
        })
        self.assertEqual(response.status_code, HTTP_200_OK)
        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        self.assertIn('calibration.MP4', blob_path)
        self.assertNotIn('MY_CALIB_2024', blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_duplicate_calibration_video_in_session_returns_409(self, mock_gcs_cls):
        """Second calibration upload to the same session is rejected (both renamed to calibration.<ext>)."""
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        mission = UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_IN_PROGRESS,
            uploaded_files=[{'name': 'calibration.mp4', 'type': 'calibration_video', 'size': 512}],
        )

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {
            'file_name': 'other_calib.mp4',
            'file_type': 'video/mp4',
            'upload_type': 'calibration_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_409_CONFLICT)


class GenerateDownloadURLTestCase(UserBase):
    fixtures = ('user/fixtures/user_fixtures.json',)

    _DEFAULT_UPLOAD_CONFIG = {
        'unit_folder': 'unit',
        'upload': {
            'data_video': 'DCIM',
            'log': 'GPS_LOG',
            'calibration_video': None,
        }
    }

    def setUp(self):
        super().setUp()
        from aoi.models import Component
        component = Component.objects.create(
            name='Default Upload Component',
            image='test-image',
            upload_config=self._DEFAULT_UPLOAD_CONFIG,
        )
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.default_upload_component = component
        self.ex_2_user.save(update_fields=['stone_google_folder', 'default_upload_component'])

    def test_missing_params_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_missing_session_folder_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {'file_name': 'video.mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_invalid_upload_type_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'file_name': 'video.mp4',
            'upload_type': 'bad_type',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_unauthenticated_returns_403(self):
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'file_name': 'video.mp4',
            'upload_type': 'data_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_generates_download_url(self, mock_gcs_cls):
        mock_client = mock.MagicMock()
        mock_blob = mock.MagicMock()
        mock_blob.generate_signed_url.return_value = 'https://storage.googleapis.com/signed/download'
        mock_client.bucket.return_value.blob.return_value = mock_blob
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'file_name': 'video.mp4',
            'upload_type': 'data_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertIn('download_url', response.data)
        self.assertEqual(response.data['download_url'], 'https://storage.googleapis.com/signed/download')

        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        self.assertIn('DCIM', blob_path)
        self.assertIn('video.mp4', blob_path)
        self.assertIn(self.ex_2_user.username, blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_download_url_blob_path_for_calibration(self, mock_gcs_cls):
        mock_client = mock.MagicMock()
        mock_blob = mock.MagicMock()
        mock_blob.generate_signed_url.return_value = 'https://storage.googleapis.com/signed/download'
        mock_client.bucket.return_value.blob.return_value = mock_blob
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'file_name': 'calib.mp4',
            'upload_type': 'calibration_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_200_OK)

        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        self.assertNotIn('DCIM', blob_path)
        self.assertNotIn('GPS_LOG', blob_path)
        self.assertIn('calib.mp4', blob_path)

    def test_missing_file_name_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'upload_type': 'data_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_missing_upload_type_returns_400(self):
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'file_name': 'video.mp4',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_download_url_blob_path_for_log(self, mock_gcs_cls):
        mock_client = mock.MagicMock()
        mock_blob = mock.MagicMock()
        mock_blob.generate_signed_url.return_value = 'https://storage.googleapis.com/signed/download'
        mock_client.bucket.return_value.blob.return_value = mock_blob
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'file_name': 'gps.log',
            'upload_type': 'log',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_200_OK)

        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        self.assertIn('GPS_LOG', blob_path)
        self.assertIn('gps.log', blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_gcs_exception_returns_400(self, mock_gcs_cls):
        mock_gcs_cls.side_effect = Exception("GCS error")
        self.client.force_login(self.ex_2_user)
        url = reverse('generate_download_url')
        response = self.client.get(url, {
            'file_name': 'video.mp4',
            'upload_type': 'data_video',
            'session_folder': '2024/2024-01-01_10-00-00',
        })
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)


class UploadConfigTestCase(APITestCase):

    def test_no_component_raises_error(self):
        with self.assertRaises(ValueError):
            get_upload_config()

    def test_none_component_raises_error(self):
        with self.assertRaises(ValueError):
            get_upload_config(None)

    def test_component_with_no_upload_config_raises_error(self):
        mock_component = mock.MagicMock()
        mock_component.upload_config = None
        with self.assertRaises(ValueError):
            get_upload_config(mock_component)

    def test_component_config_used(self):
        mock_component = mock.MagicMock()
        mock_component.upload_config = {
            'unit_folder': 'unit_1',
            'upload': {
                'data_video': 'DCIM',
                'log': 'GPS_LOG',
                'calibration_video': None,
            }
        }
        config = get_upload_config(mock_component)
        self.assertEqual(config['upload']['data_video'], 'DCIM')
        self.assertEqual(config['upload']['log'], 'GPS_LOG')
        self.assertIsNone(config['upload']['calibration_video'])

    def test_exclude_derived_from_upload_values(self):
        mock_component = mock.MagicMock()
        mock_component.upload_config = {
            'unit_folder': 'unit_1',
            'upload': {
                'data_video': 'DCIM',
                'log': 'GPS_LOG',
                'calibration_video': None,
            }
        }
        config = get_upload_config(mock_component)
        self.assertIn('DCIM', config['exclude'])
        self.assertIn('GPS_LOG', config['exclude'])
        self.assertNotIn(None, config['exclude'])


class GoogleBucketFolderAPIViewTestCase(UserBase):
    fixtures = ('user/fixtures/user_fixtures.json',)

    def setUp(self):
        super().setUp()
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.save(update_fields=['stone_google_folder'])

    def _make_mock_blob(self, name):
        b = mock.MagicMock()
        b.name = name
        return b

    def _mock_gcs(self, blob_names):
        mock_client = mock.MagicMock()
        mock_bucket = mock.MagicMock()
        mock_bucket.exists.return_value = True
        mock_client.bucket.return_value = mock_bucket
        mock_client.list_blobs.return_value = [self._make_mock_blob(n) for n in blob_names]
        return mock_client

    def test_unauthenticated_returns_403(self):
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_no_stone_google_folder_returns_404(self):
        self.client.force_login(self.ex_3_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_bucket_not_found_returns_400(self, mock_gcs_cls):
        mock_client = mock.MagicMock()
        mock_bucket = mock.MagicMock()
        mock_bucket.exists.return_value = False
        mock_client.bucket.return_value = mock_bucket
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_empty_bucket_returns_204(self, mock_gcs_cls):
        mock_gcs_cls.return_value = self._mock_gcs([])
        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_returns_session_level_folders(self, mock_gcs_cls):
        username = self.ex_2_user.username
        blobs = [f'{username}/2024/2024-01-01_10-00-00/unit/DCIM/video.mp4']
        mock_gcs_cls.return_value = self._mock_gcs(blobs)

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertIn(f'{username}/2024/', response.data)
        self.assertIn(f'{username}/2024/2024-01-01_10-00-00/', response.data)
        # unit folder itself should not appear
        self.assertNotIn(f'{username}/2024/2024-01-01_10-00-00/unit/', response.data)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_excluded_folders_not_returned(self, mock_gcs_cls):
        username = self.ex_2_user.username
        blobs = [
            f'{username}/2024/session/unit/DCIM/video.mp4',
            f'{username}/2024/session/unit/GPS_LOG/gps.log',
        ]
        mock_gcs_cls.return_value = self._mock_gcs(blobs)

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        folders = response.data
        self.assertNotIn(f'{username}/2024/session/unit/', folders)
        self.assertNotIn(f'{username}/2024/session/unit/DCIM/', folders)
        self.assertNotIn(f'{username}/2024/session/unit/GPS_LOG/', folders)
        self.assertIn(f'{username}/2024/session/', folders)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_deduplicates_folders_across_blobs(self, mock_gcs_cls):
        username = self.ex_2_user.username
        blobs = [
            f'{username}/2024/session/unit/DCIM/video1.mp4',
            f'{username}/2024/session/unit/DCIM/video2.mp4',
        ]
        mock_gcs_cls.return_value = self._mock_gcs(blobs)

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        folders = response.data
        self.assertEqual(folders.count(f'{username}/2024/'), 1)
        self.assertEqual(folders.count(f'{username}/2024/session/'), 1)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_multiple_sessions_returned(self, mock_gcs_cls):
        username = self.ex_2_user.username
        blobs = [
            f'{username}/2024/2024-01-01_10-00-00/unit/DCIM/video.mp4',
            f'{username}/2024/2024-02-01_10-00-00/unit/DCIM/video.mp4',
        ]
        mock_gcs_cls.return_value = self._mock_gcs(blobs)

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        folders = response.data
        self.assertIn(f'{username}/2024/2024-01-01_10-00-00/', folders)
        self.assertIn(f'{username}/2024/2024-02-01_10-00-00/', folders)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_unit_variant_folder_names_not_returned(self, mock_gcs_cls):
        """unit_1, unit_test and other variants must not appear — only session-level folders"""
        username = self.ex_2_user.username
        blobs = [
            f'{username}/2024/2024-01-01_10-00-00/unit_1/DCIM/video.mp4',
            f'{username}/2024/2024-01-01_10-00-00/unit_test/GPS_LOG/gps.log',
        ]
        mock_gcs_cls.return_value = self._mock_gcs(blobs)

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        folders = response.data
        self.assertIn(f'{username}/2024/2024-01-01_10-00-00/', folders)
        self.assertNotIn(f'{username}/2024/2024-01-01_10-00-00/unit_1/', folders)
        self.assertNotIn(f'{username}/2024/2024-01-01_10-00-00/unit_test/', folders)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_shallow_blobs_return_204(self, mock_gcs_cls):
        """Blobs only 2 parts deep (username/file.mp4) produce no folder entries"""
        username = self.ex_2_user.username
        blobs = [f'{username}/file.mp4']
        mock_gcs_cls.return_value = self._mock_gcs(blobs)

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_gcs_exception_returns_400(self, mock_gcs_cls):
        mock_gcs_cls.side_effect = Exception("GCS error")
        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)


VALID_PREDICTIONS_METADATA = {
    'uuid': 'test-uuid-1234',
    'version': '1',
    'gprmc': '$GPRMC,075513.00,A,5025.390269,N,03030.408529,E,0.0,98.2,100426,6.0,E,A,V*79',
    'model_name': 'stone_v1',
    'predictions': [{'x': 1, 'y': 2, 'confidence': 0.9}],
    'time_since_boot_sec': 123.45,
    'serial': 'CAM-001',
}

VALID_COVERAGE_METADATA = {
    'uuid': 'test-uuid-5678',
    'version': '1',
    'gprmc': '$GPRMC,075513.00,A,5025.390269,N,03030.408529,E,0.0,98.2,100426,6.0,E,A,V*79',
    'serial': 'CAM-001',
}

SMALL_JPEG = b'\xff\xd8\xff\xe0' + b'\x00' * 16


class StoneDeviceViewsBase(APITestCase):
    def setUp(self):
        stone_views._gcs_client_instance = None

        self.user = User.objects.create_user(
            username='camerauser',
            password='testpass',
            stone_google_folder='test-bucket',
        )
        self.camera = Camera.objects.create(
            cam_serial_num='CAM-001',
            user=self.user,
        )

    def _mock_gcs(self):
        mock_client = mock.MagicMock()
        mock_bucket = mock.MagicMock()
        mock_client.bucket.return_value = mock_bucket
        return mock_client, mock_bucket

    def _metadata_file(self, data):
        return SimpleUploadedFile('meta.json', json.dumps(data).encode(), content_type='application/json')

    def _image_file(self, content=SMALL_JPEG):
        return SimpleUploadedFile('img.jpg', content, content_type='image/jpeg')


class PredictionsAPIViewTest(StoneDeviceViewsBase):

    def _post(self, data=None):
        return self.client.post(
            reverse('device_predictions'),
            data or {},
            format='multipart',
        )

    # --- auth ---

    def test_unknown_serial_returns_403(self):
        bad_meta = {**VALID_PREDICTIONS_METADATA, 'serial': 'UNKNOWN-CAM'}
        response = self._post({'metadata': self._metadata_file(bad_meta), 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    # --- missing files ---

    def test_missing_both_files_returns_400(self):
        response = self._post()
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('required', response.data['detail'])

    def test_missing_image_returns_400(self):
        response = self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA)})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_missing_metadata_returns_400(self):
        response = self._post({'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    # --- metadata validation ---

    def test_invalid_json_metadata_returns_400(self):
        bad_file = SimpleUploadedFile('meta.json', b'not json', content_type='application/json')
        response = self._post({'metadata': bad_file, 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('metadata must be valid JSON', response.data['detail'])

    def test_missing_required_metadata_fields_returns_400(self):
        incomplete = {'uuid': 'abc', 'version': '1'}
        response = self._post({'metadata': self._metadata_file(incomplete), 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    def test_invalid_field_type_returns_400(self):
        bad_data = {**VALID_PREDICTIONS_METADATA, 'time_since_boot_sec': 'not-a-number'}
        response = self._post({'metadata': self._metadata_file(bad_data), 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    # --- image size ---

    def test_image_too_large_returns_400(self):
        big_image = self._image_file(b'\xff' * (10 * 1024 * 1024 + 1))
        response = self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA), 'image': big_image})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('Image exceeds', response.data['detail'])

    @mock.patch('user.stone_device_views._gcs_client')
    def test_image_at_size_limit_is_accepted(self, mock_gcs_fn):
        mock_client, _ = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client
        exact_image = self._image_file(b'\xff' * (10 * 1024 * 1024))
        response = self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA), 'image': exact_image})
        self.assertEqual(response.status_code, HTTP_201_CREATED)

    # --- bucket not configured ---

    def test_no_bucket_configured_returns_400(self):
        self.user.stone_google_folder = None
        self.user.save()
        response = self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA), 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('Storage bucket', response.data['detail'])

    # --- GCS upload ---

    @mock.patch('user.stone_device_views._gcs_client')
    def test_success_returns_201_with_uuid(self, mock_gcs_fn):
        mock_client, _ = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        response = self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA), 'image': self._image_file()})

        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data['uuid'], VALID_PREDICTIONS_METADATA['uuid'])

    @mock.patch('user.stone_device_views._gcs_client')
    def test_success_uploads_jpg_and_json_to_gcs(self, mock_gcs_fn):
        mock_client, mock_bucket = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA), 'image': self._image_file()})

        blob_paths = [call[0][0] for call in mock_bucket.blob.call_args_list]
        uuid = VALID_PREDICTIONS_METADATA['uuid']
        self.assertTrue(any(path.endswith(f'{uuid}.jpg') for path in blob_paths))
        self.assertTrue(any(path.endswith(f'{uuid}.json') for path in blob_paths))

    @mock.patch('user.stone_device_views._gcs_client')
    def test_success_creates_predictions_chunk(self, mock_gcs_fn):
        mock_client, _ = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA), 'image': self._image_file()})

        self.assertTrue(
            StonesDetectionChunk.objects.filter(user=self.user, type=StonesDetectionChunk.TYPE_PREDICTIONS).exists()
        )

    @mock.patch('user.stone_device_views._gcs_client')
    def test_gcs_error_returns_500(self, mock_gcs_fn):
        mock_client = mock.MagicMock()
        mock_client.bucket.side_effect = GoogleCloudError('GCS down')
        mock_gcs_fn.return_value = mock_client

        response = self._post({'metadata': self._metadata_file(VALID_PREDICTIONS_METADATA), 'image': self._image_file()})

        self.assertEqual(response.status_code, HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('Failed to store prediction', response.data['detail'])


class CoverageAPIViewTest(StoneDeviceViewsBase):

    def _post(self, data=None):
        return self.client.post(
            reverse('device_coverage'),
            data or {},
            format='multipart',
        )

    # --- auth ---

    def test_unknown_serial_returns_403(self):
        bad_meta = {**VALID_COVERAGE_METADATA, 'serial': 'UNKNOWN-CAM'}
        response = self._post({'metadata': self._metadata_file(bad_meta)})
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    # --- missing files ---

    def test_missing_both_files_returns_400(self):
        response = self._post()
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('required', response.data['detail'])

    def test_missing_image_is_allowed(self):
        # metadata-only upload is valid; image is optional
        pass

    def test_missing_metadata_returns_400(self):
        response = self._post({'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    # --- metadata validation ---

    def test_invalid_json_metadata_returns_400(self):
        bad_file = SimpleUploadedFile('meta.json', b'not json', content_type='application/json')
        response = self._post({'metadata': bad_file, 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('metadata must be valid JSON', response.data['detail'])

    def test_missing_required_metadata_fields_returns_400(self):
        incomplete = {'uuid': 'abc'}
        response = self._post({'metadata': self._metadata_file(incomplete), 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    # --- image size ---

    def test_image_too_large_returns_400(self):
        big_image = self._image_file(b'\xff' * (10 * 1024 * 1024 + 1))
        response = self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA), 'image': big_image})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)
        self.assertIn('Image exceeds', response.data['detail'])

    # --- bucket not configured ---

    def test_no_bucket_configured_returns_400(self):
        self.user.stone_google_folder = None
        self.user.save()
        response = self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA), 'image': self._image_file()})
        self.assertEqual(response.status_code, HTTP_400_BAD_REQUEST)

    # --- GCS upload ---

    @mock.patch('user.stone_device_views._gcs_client')
    def test_success_returns_201_with_uuid(self, mock_gcs_fn):
        mock_client, _ = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        response = self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA), 'image': self._image_file()})

        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data['uuid'], VALID_COVERAGE_METADATA['uuid'])

    @mock.patch('user.stone_device_views._gcs_client')
    def test_success_uploads_jpg_and_json_to_gcs(self, mock_gcs_fn):
        mock_client, mock_bucket = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA), 'image': self._image_file()})

        blob_paths = [call[0][0] for call in mock_bucket.blob.call_args_list]
        uuid = VALID_COVERAGE_METADATA['uuid']
        self.assertTrue(any(path.endswith(f'{uuid}.jpg') for path in blob_paths))
        self.assertTrue(any(path.endswith(f'{uuid}.json') for path in blob_paths))

    @mock.patch('user.stone_device_views._gcs_client')
    def test_success_creates_coverage_chunk(self, mock_gcs_fn):
        mock_client, _ = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA), 'image': self._image_file()})

        self.assertTrue(
            StonesDetectionChunk.objects.filter(user=self.user, type=StonesDetectionChunk.TYPE_COVERAGE).exists()
        )

    @mock.patch('user.stone_device_views._gcs_client')
    def test_gcs_error_returns_500(self, mock_gcs_fn):
        mock_client = mock.MagicMock()
        mock_client.bucket.side_effect = GoogleCloudError('GCS down')
        mock_gcs_fn.return_value = mock_client

        response = self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA), 'image': self._image_file()})

        self.assertEqual(response.status_code, HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('Failed to store coverage', response.data['detail'])

    # --- metadata-only (no image) ---

    @mock.patch('user.stone_device_views._gcs_client')
    def test_metadata_only_returns_201(self, mock_gcs_fn):
        mock_client, _ = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        response = self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA)})

        self.assertEqual(response.status_code, HTTP_201_CREATED)
        self.assertEqual(response.data['uuid'], VALID_COVERAGE_METADATA['uuid'])

    @mock.patch('user.stone_device_views._gcs_client')
    def test_metadata_only_uploads_json_but_not_jpg(self, mock_gcs_fn):
        mock_client, mock_bucket = self._mock_gcs()
        mock_gcs_fn.return_value = mock_client

        self._post({'metadata': self._metadata_file(VALID_COVERAGE_METADATA)})

        blob_paths = [call[0][0] for call in mock_bucket.blob.call_args_list]
        uuid = VALID_COVERAGE_METADATA['uuid']
        self.assertTrue(any(path.endswith(f'{uuid}.json') for path in blob_paths))
        self.assertFalse(any(path.endswith(f'{uuid}.jpg') for path in blob_paths))


class GcsClientSingletonTest(StoneDeviceViewsBase):

    @mock.patch('user.stone_device_views.storage')
    def test_client_instantiated_once(self, mock_storage):
        mock_storage.Client.from_service_account_json.return_value = mock.MagicMock()

        stone_views._gcs_client()
        stone_views._gcs_client()
        stone_views._gcs_client()


class UploadMissionsRemoveFilesTestCase(UserBase):
    fixtures = (
        'user/fixtures/user_fixtures.json',
        'aoi/fixtures/notebook_fixtures.json',
    )

    _DEFAULT_UPLOAD_CONFIG = {
        'unit_folder': 'unit',
        'upload': {
            'data_video': 'DCIM',
            'log': 'GPS_LOG',
            'calibration_video': None,
        }
    }

    def setUp(self):
        super().setUp()
        from aoi.models import Component
        component = Component.objects.create(
            name='Remove Files Component',
            image='test-image',
            upload_config=self._DEFAULT_UPLOAD_CONFIG,
        )
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.default_upload_component = component
        self.ex_2_user.save(update_fields=['stone_google_folder', 'default_upload_component'])
        self.component = component

    def _make_completed_mission(self, uploaded_files):
        return UploadMissions.objects.create(
            user=self.ex_2_user,
            gcs_path='2024/2024-01-01_10-00-00',
            status=UploadMissions.STATUS_COMPLETED,
            component=self.component,
            uploaded_files=uploaded_files,
        )

    def _mock_gcs(self):
        mock_client = mock.MagicMock()
        mock_bucket = mock.MagicMock()
        mock_client.bucket.return_value = mock_bucket
        return mock_client, mock_bucket

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_suggest_delete_when_all_videos_removed(self, mock_gcs_cls):
        mock_client, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        mission = self._make_completed_mission([
            {'name': 'video.mp4', 'type': 'data_video', 'size': 1024},
        ])
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_remove_files', kwargs={'pk': mission.pk})
        response = self.client.post(url, {'files_to_remove': ['video.mp4']}, format='json')

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertTrue(response.data.get('suggest_delete'))

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_no_suggest_delete_when_videos_remain(self, mock_gcs_cls):
        mock_client, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        mission = self._make_completed_mission([
            {'name': 'video1.mp4', 'type': 'data_video', 'size': 1024},
            {'name': 'video2.mp4', 'type': 'data_video', 'size': 2048},
        ])
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_remove_files', kwargs={'pk': mission.pk})
        response = self.client.post(url, {'files_to_remove': ['video1.mp4']}, format='json')

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertNotIn('suggest_delete', response.data)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_suggest_delete_when_only_log_remains_after_video_removed(self, mock_gcs_cls):
        """Removing the only video while a log file remains still triggers suggest_delete."""
        mock_client, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        mission = self._make_completed_mission([
            {'name': 'video.mp4', 'type': 'data_video', 'size': 1024},
            {'name': 'gps.log', 'type': 'log', 'size': 512},
        ])
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_remove_files', kwargs={'pk': mission.pk})
        response = self.client.post(url, {'files_to_remove': ['video.mp4']}, format='json')

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertTrue(response.data.get('suggest_delete'))

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_suggest_delete_skips_trajectory_request_creation(self, mock_gcs_cls):
        """When all videos are removed no new trajectory request should be created."""
        mock_client, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        mission = self._make_completed_mission([
            {'name': 'video.mp4', 'type': 'data_video', 'size': 1024},
        ])
        self.client.force_login(self.ex_2_user)
        url = reverse('upload_mission_remove_files', kwargs={'pk': mission.pk})
        self.client.post(url, {'files_to_remove': ['video.mp4']}, format='json')

        mission.refresh_from_db()
        self.assertIsNone(mission.trajectory_request_id)
