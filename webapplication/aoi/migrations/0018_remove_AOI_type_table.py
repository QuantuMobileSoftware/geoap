# Generated by Django 3.1 on 2021-09-02 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0016_aoi_type'),
        ('user', '0010_remove_aoi_type_perms')
    ]

    operations = [
        migrations.AlterField(
            model_name='aoi',
            name='type',
            field=models.IntegerField(choices=[(1, 'AREA'), (2, 'FIELD')], default=1),
        ),
        migrations.DeleteModel(
            name='AoiType',
        )
    ]
