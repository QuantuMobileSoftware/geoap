# Generated by Django 3.1 on 2023-09-19 12:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0034_auto_20230630_0904'),
    ]

    operations = [
        migrations.AddField(
            model_name='aoi',
            name='sentinel_hub_available_dates',
            field=models.JSONField(blank=True, null=True, verbose_name='Available dates from Sentinel Hub'),
        ),
        migrations.AddField(
            model_name='aoi',
            name='sentinel_hub_available_dates_update_time',
            field=models.DateTimeField(default=None, null=True, verbose_name='Sentinel Hub available dates update time'),
        ),
    ]
