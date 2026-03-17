from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0045_request_polygon_nullable'),
    ]

    operations = [
        migrations.AddField(
            model_name='component',
            name='upload_config',
            field=models.JSONField(blank=True, help_text='Example:<br><pre>{\n  "unit_folder": "unit",\n  "upload": {\n    "data_video": "DCIM",\n    "log": "GPS_LOG",\n    "calibration_video": null\n  }\n}</pre>', null=True, verbose_name='Upload config'),
        ),
    ]
