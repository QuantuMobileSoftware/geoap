# Generated by Django 3.1 on 2021-01-27 13:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0008_change_verbose_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='success',
            field=models.BooleanField(default=False, verbose_name='Is execution succeeded'),
        ),
    ]
