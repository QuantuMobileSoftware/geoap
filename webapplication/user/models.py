from django.contrib.auth.models import AbstractUser, Group


class User(AbstractUser):
    def save(self, *args, **kwargs):
        if self.is_staff:
            ds_group = Group.objects.get(name="Data_science_engineer")
            self.groups.add(ds_group)
        super().save(*args, **kwargs)
