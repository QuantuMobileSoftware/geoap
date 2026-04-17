from django.db import models

from user.models import User


class Camera(models.Model):
    cam_serial_num = models.CharField(max_length=128, unique=True, verbose_name='Camera serial number')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cameras', verbose_name='User')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created at')

    class Meta:
        verbose_name = 'Camera'
        verbose_name_plural = 'Cameras'

    def __str__(self):
        return f'{self.cam_serial_num} → {self.user.username}'
