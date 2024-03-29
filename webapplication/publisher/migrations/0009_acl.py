# Generated by Django 3.1 on 2020-12-07 23:37

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('publisher', '0008_auto_20201207_1647'),
    ]

    operations = [
        migrations.CreateModel(
            name='ACL',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restrict_projects_to', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=20), blank=True, size=None, verbose_name='Restrict projects to')),
                ('user_id', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='User name')),
            ],
            options={
                'verbose_name': 'Access Control List',
                'verbose_name_plural': 'Access Control Lists',
                'ordering': ['user_id'],
            },
        ),
    ]
