# Generated by Django 3.1 on 2021-01-14 16:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0003_request'),
        ('publisher', '0011_result_request_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='result',
            name='request_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='aoi.request', verbose_name="Client's request id"),
        ),
    ]