# Generated by Django 4.0.2 on 2023-08-09 04:35

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GoalTracker',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('userId', models.CharField(max_length=20)),
                ('userName', models.CharField(max_length=100)),
                ('discordUserId', models.CharField(max_length=100)),
                ('goalWeek', models.DateField()),
                ('goalTopic', models.CharField(default='Study', max_length=100)),
                ('goalTarget', models.FloatField()),
                ('goalCompleted', models.FloatField()),
                ('goalRate', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='StudyTracker',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('userId', models.CharField(max_length=20)),
                ('userName', models.CharField(max_length=100)),
                ('discordUserId', models.CharField(max_length=100)),
                ('studyDate', models.DateField()),
                ('studyTopic', models.CharField(default='Study', max_length=100)),
                ('studyTime', models.FloatField()),
            ],
        ),
    ]
