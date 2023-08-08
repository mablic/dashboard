from django.views import View
from django.shortcuts import render
from django.views.generic import ListView
from django.db.models.expressions import RawSQL
from .models import StudyTracker
from django.http import HttpResponse, JsonResponse
from .models import StudyTracker, GoalTracker
from django.db.models import Q, Avg, Sum, F
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta
from json import dumps
from bson.objectid import ObjectId
from django.core.serializers.json import DjangoJSONEncoder
from users.models import Profile, User


class trackerView(ListView):
    model = StudyTracker
    paginate_by = 30
    template_name = 'tracker/trackerBase.html'  # Relative path to the template file
    dateFormat = '%m-%d-%Y'

    def get(self, request, *args, **kwargs):
        # print(request.GET)
        if 'viewType' in request.GET and request.GET['viewType'] == 'tableView':
            discordUserId = "NA"
            currentUserId ="NA"
            filterQuery = StudyTracker.objects.all()
            if 'discordUserId' in self.request.GET and self.request.GET['discordUserId'] != 'None':
                discordUserId = self.request.GET['discordUserId']
            if 'currentUserId' in self.request.GET and self.request.GET['currentUserId'] != 'None':
                currentUserId = self.request.GET['currentUserId']
            filterQuery = filterQuery.filter(
                Q(userId=currentUserId) | Q(discordUserId=discordUserId)
            )
            # data = list(StudyTracker.objects.all().values('_id', 'studyDate', 'studyTopic', 'studyTime'))
            data = list(filterQuery.values('studyDate', 'studyTopic', 'studyTime'))
            return JsonResponse(data, safe=False)
        return render(request, self.template_name)

    def post(self, request):
        filterQuery = StudyTracker.objects.all()
        data = []
        if 'postType' in request.POST:
            if request.POST['postType'] != 'rankView' and self.request.user.is_authenticated:
                if 'discordUserId' in self.request.POST and self.request.POST['discordUserId'] != 'None':
                    discordUserId = self.request.POST['discordUserId']
                else:
                    discordUserId = "NA"
                if 'currentUserId' in self.request.POST and self.request.POST['currentUserId'] != 'None':
                    currentUserId = self.request.POST['currentUserId']
                else:
                    currentUserId ="NA"
                if request.POST['postType'] == 'graphView':
                    if 'endDate' in self.request.POST and self.request.POST['endDate'] != "":
                        # print(type(self.request.GET['endDate']))
                        # endDate = datetime.strptime(self.request.GET['endDate'], self.dateFormat)
                        endDate = datetime.strptime(self.request.POST['endDate'], self.dateFormat)
                    else:
                        endDate = datetime(2020,1,1)
                    if 'startDate' in self.request.POST and self.request.POST['startDate'] != "":
                        startDate = datetime.strptime(self.request.POST['startDate'], self.dateFormat)
                    else:
                        startDate = datetime(2020,1,1)
                    userQuery = filterQuery.filter(
                        Q(userId=currentUserId) | Q(discordUserId=discordUserId),
                        studyDate__gte=startDate,
                        studyDate__lte=endDate
                    ).values('studyDate', 'studyTime', 'studyTopic').order_by('studyDate')
                    allQuery = filterQuery.filter(
                        studyDate__gte=startDate,
                        studyDate__lte=endDate
                    ).values('studyDate', 'studyTime', 'studyTopic').order_by('studyDate')
                    data = {
                        'userData': list(userQuery.values()),
                        'avgData': list(allQuery.values())
                    }
                elif request.POST['postType'] == 'tableViewUpdate':
                    studyDate = datetime(2020,1,1)
                    studyTopic = 'NA'
                    studyTime = 0
                    if 'studyDate' in self.request.POST:
                        studyDate = self.request.POST['studyDate']
                    if 'studyTopic' in self.request.POST:
                        studyTopic = self.request.POST['studyTopic']
                    if 'studyTime' in self.request.POST:
                        studyTime = self.request.POST['studyTime']
                    if request.POST['function'] == 'edit' or request.POST['function'] == 'delete':
                        # print("IN EDIT")
                        oldStudyDate = datetime(2020,1,1)
                        oldStudyTopic = 'NA'
                        oldStudyTime = 0
                        
                        if 'oldStudyDate' in self.request.POST:
                            oldStudyDate = self.request.POST['oldStudyDate']
                        if 'oldStudyTopic' in self.request.POST:
                            oldStudyTopic = self.request.POST['oldStudyTopic']
                        if 'oldStudyTime' in self.request.POST:
                            oldStudyTime = self.request.POST['oldStudyTime']
                        try:
                            # print(f"Change at:{studyDate}, studyTime:{studyTime}, studyTopic:{studyTopic}, userId:{currentUserId}, discordUserId: {discordUserId}")
                            record = filterQuery.filter(
                                Q(userId=currentUserId) | Q(discordUserId=discordUserId),
                                studyDate=oldStudyDate,
                                studyTopic=oldStudyTopic,
                                studyTime=oldStudyTime
                            )
                            if request.POST['function'] == 'delete':
                                try:
                                    record.delete()
                                    return JsonResponse({'message': 'Update successful'}, status=200)
                                except Exception as e:
                                    print("DELETE ERROR")
                                    return JsonResponse({'message': 'Update successful'}, status=200)
                            record.update(studyDate=studyDate, studyTopic=studyTopic, studyTime=studyTime)
                            return JsonResponse({'message': 'Update successful'}, status=200)
                        except Exception as e:
                            print("ERROR!")
                            return JsonResponse({'message': 'Update failed', 'error': str(e)}, status=400)
                    elif request.POST['function'] == 'add':
                        # print("IN ADD")
                        try:
                            newRecord = StudyTracker(
                                userId=currentUserId,
                                userName="",
                                discordUserId=discordUserId,
                                studyDate=studyDate,
                                studyTopic=studyTopic,
                                studyTime=studyTime
                            )
                            # Save the new record to the database
                            newRecord.save()
                            return JsonResponse({'message': 'Update successful'}, status=200)
                        except Exception as e:
                            print("ERROR!")
                            return JsonResponse({'message': 'Update failed', 'error': str(e)}, status=400)
                    else:
                        # print("IN OTHERS")
                        pass
            if request.POST['postType'] == 'rankView':
                if 'endDate' in self.request.POST and self.request.POST['endDate'] != "":
                    # print(type(self.request.GET['endDate']))
                    # endDate = datetime.strptime(self.request.GET['endDate'], self.dateFormat)
                    endDate = datetime.strptime(self.request.POST['endDate'], self.dateFormat)
                else:
                    endDate = datetime(2020,1,1)
                if 'startDate' in self.request.POST and self.request.POST['startDate'] != "":
                    startDate = datetime.strptime(self.request.POST['startDate'], self.dateFormat)
                else:
                    startDate = datetime(2020,1,1)
                # print(f"Change startDate:{startDate}, endDate:{endDate}")
                filterQuery = filterQuery.filter(
                        studyDate__gte=startDate,
                        studyDate__lte=endDate
                    ).values('discordUserId', 'id', 'userName', 'studyTime')
                profileQuery = Profile.objects.all().values('user_id', 'discordId')
                userQuery = User.objects.all().values('id', 'username')

                discordDict = {}
                userName = {}
                for user in userQuery:
                    userName[user['id']] = user['username']
                for user in profileQuery:
                    if user['discordId'] is not None:
                        discordDict[user['discordId']] = [userName[user['user_id']], 0]
                cnt = 0
                for user in filterQuery:
                    # print(user)
                    if user['discordUserId'] not in discordDict.keys():
                        discordDict[user['discordUserId']] = ['anonymous' + str(cnt), 0]
                        cnt += 1
                    discordDict[user['discordUserId']][1] += user['studyTime']

                # print(discordDict)
                data = [val for key, val in discordDict.items()]
                
        else:
            pass
        return JsonResponse(data, safe=False, encoder=DjangoJSONEncoder)
    
