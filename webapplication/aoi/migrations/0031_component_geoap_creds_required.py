# Generated by Django 3.1 on 2023-04-04 19:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0030_changed_unique_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='component',
            name='geoap_creds_required',
            field=models.BooleanField(default=False, verbose_name='Geoap creds is required'),
        ),
    ]
