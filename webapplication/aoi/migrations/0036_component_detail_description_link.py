# Generated by Django 3.1 on 2023-10-05 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0035_auto_20230919_1238'),
    ]

    operations = [
        migrations.AddField(
            model_name='component',
            name='detail_description_link',
            field=models.CharField(blank=True, max_length=400, null=True, verbose_name='Detail description link'),
        ),
    ]