# Generated by Django 3.1 on 2022-04-05 04:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0018_remove_AOI_type_table'),
    ]

    operations = [
        migrations.AddField(
            model_name='jupyternotebook',
            name='parameters',
            field=models.JSONField(blank=True, null=True, verbose_name='Optional parameters'),
        ),
    ]
