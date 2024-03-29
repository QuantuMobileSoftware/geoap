# Generated by Django 3.1 on 2021-01-12 09:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('aoi', '0002_jupyternotebook'),
    ]

    operations = [
        migrations.AddField(
            model_name='aoi',
            name='user_id',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='aoi', to=settings.AUTH_USER_MODEL, verbose_name='User'),
        ),
        migrations.AlterField(
            model_name='aoi',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='aoi',
                                    to=settings.AUTH_USER_MODEL, verbose_name='User'),
        ),
    ]
