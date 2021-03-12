# Generated by Django 3.1 on 2021-03-12 17:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0012_request_calculated'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='jupyternotebook',
            name='is_validated',
        ),
        migrations.AddField(
            model_name='jupyternotebook',
            name='run_validation',
            field=models.BooleanField(default=False, verbose_name='Run validation'),
        ),
        migrations.AddField(
            model_name='jupyternotebook',
            name='success',
            field=models.BooleanField(default=False, verbose_name='Validation succeeded'),
        ),
    ]
