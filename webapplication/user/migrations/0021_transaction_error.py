# Generated by Django 3.1 on 2023-07-05 09:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0020_user_receive_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='error',
            field=models.CharField(blank=True, max_length=400, null=True, verbose_name='Error'),
        ),
    ]
