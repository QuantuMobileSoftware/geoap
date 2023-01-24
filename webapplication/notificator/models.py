from django.db import models
from publisher.models import Result

# Create your models here.

class Notification(models.Model):

    result = models.OneToOneField(Result, on_delete=models.deletion.CASCADE, primary_key=True)


class Email(models.Model):

    template = models.CharField(max_length=225, verbose_name="Email's template")
    subject = models.CharField(max_length=225, verbose_name="Email's subject")
    recipient_email = models.EmailField()
    context = models.JSONField()
    