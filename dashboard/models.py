from django.db import models
from django.urls import reverse

class LeetCode(models.Model):

    questionNo = models.CharField(max_length=20)
    questionName = models.TextField()
    link = models.TextField()
    accptRate = models.CharField(max_length=20)
    hardType = models.CharField(max_length=50)
    questionType = models.TextField()

    def __str__(self):
        return self.questionNo

    def get_absolute_url(self):
        return reverse('post-detail', kwargs={'pk': self.pk})

    def get_question_type(self):
        if self.questionType is not None:
            return self.questionType.split(';')
        return self.questionType

    def get_answer_by_num(self):
        return UserAnswer.objects.filter(leetCodeNo=self.questionNo)

    def get_answer_count_by_num(self):
        return str(UserAnswer.objects.filter(leetCodeNo=self.questionNo).count())

    def get_types(self):
        allObj = LeetCode.objects.values_list("questionType").distinct()
        outList = set()
        for itm in allObj:
            tmpList = list(itm)[0].split(';')
            for tmpItm in tmpList:
                outList.add(tmpItm)
        return list(outList)
    

class UserAnswer(models.Model):
    leetCodeNo = models.IntegerField()
    userId = models.CharField(max_length=50)
    userName = models.CharField(max_length=20)
    timeComplexity = models.CharField(max_length=20)
    spaceComplexity = models.CharField(max_length=20)
    answerType = models.CharField(max_length=20)

    def __str__(self):
        return "leetCode:" + str(self.leetCodeNo) + "; userName:" + str(self.userName)
    
    def update_user_id(oldUserId, newUseId):
        userAnswers = UserAnswer.objects.filter(userId=oldUserId)
        for ans in userAnswers:
            ans.userId = newUseId
            ans.save()


class CheckIn(models.Model):
    checkInTime = models.DateField()
    userName = models.CharField(max_length=255)
    userId = models.CharField(max_length=50, default=0)
    userDiscordId = models.CharField(max_length=100)
    checkInDiscordServer = models.CharField(max_length=100)
    checkInDiscordChannel = models.CharField(max_length=200)
    questionNo = models.CharField(max_length=20)
    notificationFlag = models.BooleanField()
    tmrFlag = models.BooleanField()

    def __str__(self):
        return "UserName:" + str(self.userName) + "; userId:" + str(self.userDiscordId) + "; Time:" +str(self.checkInTime)
    
    def update_user_id(oldUserId, newUseId):
        userCheckIn = CheckIn.objects.filter(userId=oldUserId)
        print(userCheckIn)
        for checkIn in userCheckIn:
            checkIn.userId = newUseId
            print(f"checkin is: {checkIn}")
            checkIn.save()