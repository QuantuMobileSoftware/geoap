# Generated by Django 3.1 on 2021-07-27 07:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0015_add_aoi_types'),
    ]

    operations = [
        migrations.AddField(
            model_name='aoi',
            name='type',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='aoi.aoitype', verbose_name='AOI type'),
        ),
    ]
