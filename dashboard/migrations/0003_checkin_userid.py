# Generated by Django 4.0.2 on 2023-06-22 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0002_checkin'),
    ]

    operations = [
        migrations.AddField(
            model_name='checkin',
            name='userId',
            field=models.CharField(default=0, max_length=50),
            preserve_default=False,
        ),
    ]