# Generated by Django 3.1 on 2023-10-17 08:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0022_merge_20230727_1024'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='receive_news',
            field=models.BooleanField(default=False, verbose_name='Receive News'),
        ),
    ]
