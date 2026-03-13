from django.contrib.gis.db import models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0044_request_estimated_finish_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='request',
            name='polygon',
            field=models.PolygonField(blank=True, null=True, spatial_index=True, verbose_name='Polygon'),
        ),
    ]
