from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0027_uploadmissions'),
    ]

    operations = [
        migrations.AddField(
            model_name='uploadmissions',
            name='uploaded_files',
            field=models.JSONField(blank=True, default=list, verbose_name='Uploaded files'),
        ),
    ]
