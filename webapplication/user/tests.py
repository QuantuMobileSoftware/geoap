from rest_framework.test import APITestCase
from django.contrib.auth.models import Group, Permission
from .models import User


class UserBase(APITestCase):

    @staticmethod
    def add_users_special_permissions():
        permission = Permission.objects.get(codename='delete_result_admin')
        staff_user = User.objects.get(id=1001)
        staff_user.user_permissions.add(permission)
    
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
