# Generated by Django 3.1 on 2021-01-20 16:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0006_rename_aoi_user_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='request',
            old_name='aoi_id',
            new_name='aoi',
        ),
        migrations.RenameField(
            model_name='request',
            old_name='jupyter_notebook_id',
            new_name='notebook',
        ),
        migrations.RenameField(
            model_name='request',
            old_name='user_id',
            new_name='user',
        ),
    ]
