# Generated by Django 3.1 on 2022-04-08 11:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0018_remove_AOI_type_table'),
    ]

    operations = [
        migrations.AddField(
            model_name='jupyternotebook',
            name='additional_parameter',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Additional parameter'),
        ),
        migrations.AddField(
            model_name='request',
            name='additional_parameter',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Additional parameter'),
        ),
    ]
