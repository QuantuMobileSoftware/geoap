import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0030_user_default_upload_component'),
    ]

    operations = [
        migrations.CreateModel(
            name='CameraToken',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=64, unique=True, verbose_name='Token')),
                ('cam_serial_num', models.CharField(max_length=128, verbose_name='Camera serial number')),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='camera_tokens',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='User',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
            ],
            options={
                'verbose_name': 'Camera Token',
                'verbose_name_plural': 'Camera Tokens',
            },
        ),
    ]
