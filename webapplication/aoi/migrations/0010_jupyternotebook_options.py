# Generated by Django 3.1 on 2021-02-15 15:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0009_add_success_flag'),
    ]

    operations = [
        migrations.AddField(
            model_name='jupyternotebook',
            name='options',
            field=models.JSONField(blank=True, null=True, verbose_name='Additional container options'),
        ),
    ]