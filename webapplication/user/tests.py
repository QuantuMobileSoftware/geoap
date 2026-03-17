import re
from unittest import mock

from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_404_NOT_FOUND
from rest_framework.test import APITestCase
from django.contrib.auth.models import Group, Permission
from django.urls import reverse
from django.core import mail

from user.models import User, UploadMissions
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

    def setUp(self):
        super().setUp()
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.save(update_fields=['stone_google_folder'])

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

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_generates_upload_url_for_data_video(self, mock_gcs_cls):
        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        response = self.client.get(url, {'file_name': 'video.mp4', 'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertIn('upload_url', response.data)
        self.assertIn('session_folder', response.data)
        self.assertEqual(response.data['upload_url'], 'https://storage.googleapis.com/resumable/session')

        # Verify blob path includes DCIM folder for data_video
        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        self.assertIn('DCIM', blob_path)
        self.assertIn('video.mp4', blob_path)
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
        # calibration_video has no subfolder
        self.assertNotIn('DCIM', blob_path)
        self.assertNotIn('GPS_LOG', blob_path)
        self.assertIn('calib.mp4', blob_path)

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
            'file_name': 'video.mp4',
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
        response = self.client.get(url, {'file_name': 'video.mp4', 'file_type': 'video/mp4', 'upload_type': 'data_video'})
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
        response = self.client.get(url, {'file_name': 'video.mp4', 'file_type': 'video/mp4', 'upload_type': 'data_video'})
        self.assertEqual(response.status_code, HTTP_200_OK)

        blob_path = mock_client.bucket.return_value.blob.call_args[0][0]
        # Default config has unit_folder = "unit"
        self.assertIn('/unit/', blob_path)

    @mock.patch('user.views.storage.Client.from_service_account_json')
    def test_session_folder_not_in_db_falls_back_to_default_component(self, mock_gcs_cls):
        from aoi.models import Component
        component = Component.objects.create(name='Test Component', image='test-image')
        self.ex_2_user.default_upload_component = component
        self.ex_2_user.save(update_fields=['default_upload_component'])

        mock_client, mock_blob, _ = self._mock_gcs()
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('generate_upload_url')
        # session_folder that doesn't exist in DB
        response = self.client.get(url, {
            'file_name': 'video.mp4',
            'file_type': 'video/mp4',
            'upload_type': 'data_video',
            'session_folder': '2099/2099-01-01_00-00-00',
        })
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data['session_folder'], '2099/2099-01-01_00-00-00')


class GenerateDownloadURLTestCase(UserBase):
    fixtures = ('user/fixtures/user_fixtures.json',)

    def setUp(self):
        super().setUp()
        self.ex_2_user.stone_google_folder = 'test-bucket'
        self.ex_2_user.save(update_fields=['stone_google_folder'])

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


class UploadConfigTestCase(APITestCase):

    def test_default_config_loaded(self):
        config = get_upload_config()
        self.assertIn('upload', config)
        self.assertIn('unit_folder', config)
        self.assertEqual(config['upload']['data_video'], 'DCIM')
        self.assertEqual(config['upload']['log'], 'GPS_LOG')
        self.assertIsNone(config['upload']['calibration_video'])

    def test_exclude_derived_from_upload_values(self):
        config = get_upload_config()
        self.assertIn('DCIM', config['exclude'])
        self.assertIn('GPS_LOG', config['exclude'])
        # null calibration_video must not appear in exclude
        self.assertNotIn(None, config['exclude'])

    def test_component_config_overrides_defaults(self):
        mock_component = mock.MagicMock()
        mock_component.upload_config = {
            'upload': {
                'data_video': 'CUSTOM_FOLDER',
                'log': 'MY_LOG',
                'calibration_video': 'CALIB',
            }
        }
        config = get_upload_config(mock_component)
        self.assertEqual(config['upload']['data_video'], 'CUSTOM_FOLDER')
        self.assertEqual(config['upload']['log'], 'MY_LOG')
        self.assertEqual(config['upload']['calibration_video'], 'CALIB')

    def test_none_component_returns_default(self):
        config_no_component = get_upload_config(None)
        config_default = get_upload_config()
        self.assertEqual(config_no_component, config_default)

    def test_component_with_no_upload_config_returns_default(self):
        mock_component = mock.MagicMock()
        mock_component.upload_config = None
        config = get_upload_config(mock_component)
        self.assertEqual(config['upload']['data_video'], 'DCIM')

    def test_partial_component_config_preserves_other_defaults(self):
        mock_component = mock.MagicMock()
        mock_component.upload_config = {'unit_folder': 'custom_unit'}
        config = get_upload_config(mock_component)
        self.assertEqual(config['unit_folder'], 'custom_unit')
        # Other default keys must still be present
        self.assertEqual(config['upload']['data_video'], 'DCIM')
        self.assertIn('DCIM', config['exclude'])


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
    def test_bucket_not_found_returns_404(self, mock_gcs_cls):
        mock_client = mock.MagicMock()
        mock_bucket = mock.MagicMock()
        mock_bucket.exists.return_value = False
        mock_client.bucket.return_value = mock_bucket
        mock_gcs_cls.return_value = mock_client

        self.client.force_login(self.ex_2_user)
        url = reverse('google_bucket_folder')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

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
