from django.test import TestCase
from user.models import User


class BaseTestCase(TestCase):
    """
    Base test case.
    """

    def setUp(self):
        self.staff = self.create_user(username='test_staff_user', is_staff=True)
        self.not_staff_user = self.create_user(username='test_user')

    def create_user(self, username, is_staff=False, is_superuser=False):
        """
        create_user
        """
        user = User.objects.create(username=username, is_staff=is_staff, is_superuser=is_superuser)
        return user
