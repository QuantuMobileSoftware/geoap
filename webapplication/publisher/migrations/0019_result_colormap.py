# Generated by Django 3.1 on 2021-09-24 14:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0018_result_labels'),
    ]

    operations = [
        migrations.AddField(
            model_name='result',
            name='colormap',
            field=models.JSONField(blank=True, null=True, verbose_name='Result colormap'),
        ),
    ]
