from django.db import models
from django.db.models import Q, Sum
from datetime import datetime

# Create your models here.
class StudyTracker(models.Model):

    userId = models.CharField(max_length=20)
    userName = models.CharField(max_length=100)
    discordUserId = models.CharField(max_length=100)
    studyDate = models.DateField()
    studyTopic = models.CharField(default='Study', max_length=100)
    studyTime = models.FloatField()

    def __str__(self):
        return "UserId:" + str(self.userName) + "; DiscordId:" + str(self.discordUserId) + "; studyDate:" + str(self.studyDate)
        

class GoalTracker(models.Model):

    userId = models.CharField(max_length=20)
    userName = models.CharField(max_length=100)
    discordUserId = models.CharField(max_length=100)
    goalStartDate = models.DateField()
    goalEndDate = models.DateField()
    goalTopic = models.CharField(default='Study', max_length=100)
    goalTarget = models.FloatField()
    goalComplete = models.FloatField()

    def __str__(self):
        return "UserName:" + str(self.userName) + "; discordId:" + str(self.discordUserId) + ";topic:" + self.goalTopic + ";sd:" + datetime.strftime(self.goalStartDate,'%m-%d-%Y') + ";ed:" + datetime.strftime(self.goalEndDate,'%m-%d-%Y')
    
    def get_total_study_time(self, goalStartDate, goalEndDate):
        if self.goalComplete != 0:
            return self.goalComplete
        # print(f"GoalTracker - userId: {self.userId}, goalTopic: {self.goalTopic}, goalStartDate: {self.goalStartDate}, goalEndDate: {self.goalEndDate}")
        totalStudyTime = StudyTracker.objects.filter(
            Q(userId=self.userId) | Q(discordUserId=self.discordUserId),
            studyTopic__icontains=self.goalTopic)
        totalStudyTime = totalStudyTime.filter(
            studyDate__range=(goalStartDate, goalEndDate)
            ).aggregate(totalTime=Sum('studyTime'))

        return totalStudyTime['totalTime'] or 0