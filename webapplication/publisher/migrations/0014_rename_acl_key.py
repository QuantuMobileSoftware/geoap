# Generated by Django 3.1 on 2021-01-20 16:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0013_rename_result_foreign_key'),
    ]

    operations = [
        migrations.RenameField(
            model_name='acl',
            old_name='user_id',
            new_name='user',
        ),
    ]
