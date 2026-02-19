import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0045_request_polygon_nullable'),
        ('user', '0026_user_country'),
    ]

    operations = [
        migrations.CreateModel(
            name='UploadMissions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('gcs_path', models.CharField(blank=True, max_length=500, verbose_name='GCS session folder')),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('in_progress', 'In Progress'),
                        ('completed', 'Completed'),
                        ('failed', 'Failed'),
                    ],
                    default='pending',
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='upload_missions',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('trajectory_request', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to='aoi.Request',
                    verbose_name='Trajectory Grid Preview request',
                )),
            ],
        ),
    ]
