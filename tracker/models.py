from django.db import models

# Create your models here.
class StudyTracker(models.Model):

    userId = models.CharField(max_length=20)
    userName = models.CharField(max_length=100)
    discordUserId = models.CharField(max_length=100)
    studyDate = models.DateField()
    studyTopic = models.CharField(default='Study', max_length=100)
    studyTime = models.FloatField()

    def __str__(self):
        return "UserName:" + str(self.userName) + "; studyDate:" + str(self.studyDate)
