# Generated by Django 4.0.2 on 2023-06-22 13:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CheckIn',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('checkInTime', models.DateField()),
                ('userName', models.CharField(max_length=255)),
                ('userDiscordId', models.CharField(max_length=100)),
                ('checkInDiscordServer', models.CharField(max_length=100)),
                ('checkInDiscordChannel', models.CharField(max_length=200)),
                ('questionNo', models.CharField(max_length=20)),
                ('notificationFlag', models.BooleanField()),
                ('tmrFlag', models.BooleanField()),
            ],
        ),
    ]