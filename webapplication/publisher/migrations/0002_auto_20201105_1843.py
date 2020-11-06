# Generated by Django 3.1 on 2020-11-05 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publisher', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='result',
            options={'ordering': ['-modifiedat'], 'verbose_name': 'Result', 'verbose_name_plural': 'Results'},
        ),
        migrations.AlterField(
            model_name='result',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='Layer description'),
        ),
        migrations.AlterField(
            model_name='result',
            name='layer_type',
            field=models.CharField(choices=[('GEOJSON', 'GEOJSON'), ('XYZ', 'XYZ')], max_length=7, verbose_name='Layer type'),
        ),
        migrations.AlterField(
            model_name='result',
            name='name',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Layer name'),
        ),
        migrations.AlterField(
            model_name='result',
            name='options',
            field=models.JSONField(blank=True, null=True, verbose_name='Layer options'),
        ),
        migrations.AlterField(
            model_name='result',
            name='end_date',
            field=models.DateField(blank=True, null=True, verbose_name='End date'),
        ),
        migrations.AlterField(
            model_name='result',
            name='start_date',
            field=models.DateField(blank=True, null=True, verbose_name='Start date'),
        ),
    ]
