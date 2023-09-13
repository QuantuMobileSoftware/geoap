# Generated by Django 3.1 on 2023-06-30 09:04

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0033_request_request_origin'),
    ]

    operations = [
        migrations.CreateModel(
            name='TransactionErrorMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_readable_error', models.CharField(blank=True, max_length=400, null=True, verbose_name='User-readable Error Message')),
                ('original_component_error', models.CharField(blank=True, max_length=400, null=True, unique=True, verbose_name='Original component "error" example')),
            ],
        ),
        migrations.AddField(
            model_name='request',
            name='user_readable_errors',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=250), blank=True, null=True, size=None, verbose_name='User-readable errors'),
        ),
    ]
