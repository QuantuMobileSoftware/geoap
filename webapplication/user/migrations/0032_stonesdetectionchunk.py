import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0031_cameratoken'),
    ]

    operations = [
        migrations.CreateModel(
            name='StonesDetectionChunk',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='stones_chunks',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='User',
                )),
                ('date', models.DateField(verbose_name='UTC date')),
                ('chunk', models.IntegerField(verbose_name='Chunk index (0–5)')),
                ('type', models.CharField(
                    max_length=16,
                    choices=[('predictions', 'Predictions'), ('coverage', 'Coverage')],
                    verbose_name='Type',
                )),
                ('gcs_path', models.CharField(max_length=500, verbose_name='GCS base path')),
                ('processing_start_date', models.DateTimeField(verbose_name='Processing start date (UTC)')),
                ('status', models.CharField(
                    max_length=16,
                    choices=[
                        ('pending', 'Pending'),
                        ('processing', 'Processing'),
                        ('done', 'Done'),
                        ('failed', 'Failed'),
                    ],
                    default='pending',
                    verbose_name='Status',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
            ],
            options={
                'verbose_name': 'Stones Detection Chunk',
                'verbose_name_plural': 'Stones Detection Chunks',
            },
        ),
        migrations.AddConstraint(
            model_name='stonesdetectionchunk',
            constraint=models.UniqueConstraint(
                fields=('user', 'date', 'chunk', 'type'),
                name='unique_user_date_chunk_type',
            ),
        ),
    ]
