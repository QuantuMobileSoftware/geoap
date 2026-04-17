from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0035_add_uploading_status_to_stonesdetectionchunk'),
        ('devices', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.DeleteModel(
            name='CameraToken',
        ),
        migrations.AlterField(
            model_name='stonesdetectionchunk',
            name='user',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='stones_chunks',
                to=settings.AUTH_USER_MODEL,
                verbose_name='User',
            ),
        ),
    ]
