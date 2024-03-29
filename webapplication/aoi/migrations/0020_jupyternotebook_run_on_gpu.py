# Generated by Django 3.1 on 2022-04-05 17:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0019_jupyternotebook_additional_parameter'),
    ]

    operations = [
        migrations.AddField(
            model_name='jupyternotebook',
            name='run_on_gpu',
            field=models.BooleanField(default=True, verbose_name='Whether GPU is needed for a notebook to run'),
        ),
    ]
