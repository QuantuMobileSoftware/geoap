from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0045_request_polygon_nullable'),
    ]

    operations = [
        migrations.AddField(
            model_name='component',
            name='upload_config',
            field=models.JSONField(blank=True, null=True, verbose_name='Upload config'),
        ),
    ]
