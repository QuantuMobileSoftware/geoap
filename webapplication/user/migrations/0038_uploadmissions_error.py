from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('user', '0037_stonesdetectionchunk_gpx_request'),
    ]

    operations = [
        migrations.AddField(
            model_name='uploadmissions',
            name='error',
            field=models.TextField(blank=True, default='', verbose_name='Error message'),
        ),
    ]
