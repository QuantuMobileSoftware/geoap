from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    @property
    def user_is_active_and_is_staff(self):
        if self.is_active and self.is_staff:
            return True
        return False
