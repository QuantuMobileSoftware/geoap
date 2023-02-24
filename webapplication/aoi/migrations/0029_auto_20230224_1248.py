# Generated by Django 3.1 on 2023-02-24 12:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0028_component_date_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='component',
            name='date_type',
            field=models.IntegerField(choices=[(1, 'YEAR'), (2, 'DATE RANGE'), (3, 'SEASON'), (4, 'DAY')], default=2),
        ),
    ]
