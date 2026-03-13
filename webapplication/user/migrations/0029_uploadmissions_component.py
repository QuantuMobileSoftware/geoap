import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0045_request_polygon_nullable'),
        ('user', '0028_uploadmissions_uploaded_files'),
    ]

    operations = [
        migrations.AddField(
            model_name='uploadmissions',
            name='component',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='aoi.component',
                verbose_name='Auto-run component after upload',
            ),
        ),
    ]
