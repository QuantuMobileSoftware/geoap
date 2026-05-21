from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0038_uploadmissions_error'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='stones_storage_edge',
            field=models.CharField(
                blank=True,
                default=None,
                max_length=64,
                null=True,
                verbose_name='GCS bucket for automatic edge detection uploads',
            ),
        ),
    ]