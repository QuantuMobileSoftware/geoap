import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0045_request_polygon_nullable'),
        ('user', '0029_uploadmissions_component'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='default_upload_component',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='aoi.component',
                verbose_name='Default auto-run component after upload',
            ),
        ),
    ]
