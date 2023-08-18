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
    rangeDateFormat = '%Y-%m-%d'

    def get(self, request, *args, **kwargs):
        # print("GET")
        print(request.GET)
        if 'viewType' in request.GET:
            discordUserId = "NA"
            currentUserId ="NA"
            if 'discordUserId' in self.request.GET and self.request.GET['discordUserId'] != 'None':
                discordUserId = self.request.GET['discordUserId']
            if 'currentUserId' in self.request.GET and self.request.GET['currentUserId'] != 'None':
                currentUserId = self.request.GET['currentUserId']
            if request.GET['viewType'] == 'tableView':
                filterQuery = StudyTracker.objects.all()
                filterQuery = filterQuery.filter(
                    Q(userId=currentUserId) | Q(discordUserId=discordUserId)
                )
                data = list(filterQuery.values('studyDate', 'studyTopic', 'studyTime'))
                return JsonResponse(data, safe=False)
            elif request.GET['viewType'] == 'goalView':
                filterQuery = GoalTracker.objects.all()
                filterQuery = filterQuery.filter(
                    Q(userId=currentUserId) | Q(discordUserId=discordUserId)
                )
                data = []
                for itm in filterQuery:
                    data.append(
                        {
                            "goalStartDate": itm.goalStartDate,
                            "goalEndDate": itm.goalEndDate,
                            "goalTopic": itm.goalTopic,
                            "goalTarget": itm.goalTarget,
                            "goalComplete": round(itm.get_total_study_time(itm.goalStartDate, itm.goalEndDate), 2)
                        }
                    )
                data.sort(key=lambda x: x['goalTarget'])
                # data = list(filterQuery.values())
                return JsonResponse(data, safe=False)
        return render(request, self.template_name)

    def post(self, request):
        print(request.POST)
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
                elif request.POST['postType'] == 'goalTracker':
                    goalFunction = request.POST['function']
                    # print(f"CURRENT FUNCTION IS {goalFunction}")
                    if goalFunction == 'graph':
                        goalStartDate = datetime.strptime(self.request.POST['goalStartDate'], self.dateFormat)
                        goalEndDate = datetime.strptime(self.request.POST['goalEndDate'], self.dateFormat)
                        allRecord = GoalTracker.objects.filter(
                            Q(userId=currentUserId) | Q(discordUserId=discordUserId),
                            goalEndDate__gte=goalStartDate,
                        )
                        data = []
                        for record in allRecord:
                            # print("IN RECORD!")
                            # print(record)
                            studyRecord = StudyTracker.objects.filter(
                                Q(userId=currentUserId) | Q(discordUserId=discordUserId),
                                studyTopic__icontains=record.goalTopic
                            )
                            # filter by the user selected range
                            studyRecord = studyRecord.filter(
                                studyDate__range=(goalStartDate, goalEndDate)
                            )
                            # print("FILTER 1")
                            # print(list(studyRecord.values()))
                            # # filter by the goal dates
                            # studyRecord = studyRecord.filter(
                            #     studyDate__range=(record.goalStartDate, record.goalEndDate)
                            # )
                            # print("FILTER 2")
                            # print(list(studyRecord.values()))                            
                            completeTime = -1
                            if goalEndDate.date() >= record.goalStartDate:
                                completeTime = record.get_total_study_time(goalStartDate, goalEndDate)
                            # print(goalStartDate)
                            # print(goalEndDate)
                            # print(completeTime)
                            # print(list(studyRecord.values()))
                            data.append({
                                'userId': record.userId,
                                'userName': record.userName,
                                'discordUserId': record.discordUserId,
                                'goalStartDate': record.goalStartDate,
                                'goalEndDate': record.goalEndDate,
                                'goalTopic': record.goalTopic,
                                'goalTarget': record.goalTarget,
                                'goalComplete': completeTime,
                                'goalRecords': list(studyRecord.values())
                            })
                        return JsonResponse(data, safe=False, encoder=DjangoJSONEncoder)
                    else:
                        try:
                            oldGoalStartDate = request.POST['oldGoalStartDate']
                            oldGoalEndDate = request.POST['oldGoalEndDate']
                            oldGoalTopic = request.POST['oldGoalTopic']
                            oldGoalTarget = request.POST['oldGoalTarget']
                            # oldGoalComplete = request.POST['oldGoalComplete']
                            goalStartDate = request.POST['goalStartDate']
                            goalEndDate = request.POST['goalEndDate']
                            goalTopic = request.POST['goalTopic']
                            goalTarget = request.POST['goalTarget']
                            goalComplete = 0 if request.POST['goalComplete'] == '' else request.POST['goalComplete']
                            # print(f"sd:{goalStartDate}, ed:{goalEndDate}, topic:{goalTopic}, target:{goalTarget}, complete:{goalComplete}")
                            existRecord = GoalTracker.objects.filter(
                                Q(userId=currentUserId) | Q(discordUserId=discordUserId),
                                goalStartDate=goalStartDate,
                                goalEndDate=goalEndDate,
                                goalTopic=goalTopic,
                                # goalTarget=goalTarget,
                                # goalComplete=goalComplete,
                            )
                            if goalFunction == 'delete':
                                try:
                                    # print("Delete!")
                                    existRecord.delete()
                                    return JsonResponse({'message': 'Records deleted!'}, status=200)
                                except Exception as e:
                                    print("Error while delete the goal tracker goal!")
                                    return JsonResponse({'message': 'Delete goal failed', 'error': str(e)}, status=400)
                            else:
                                # print("Updated")
                                if oldGoalStartDate != '' and oldGoalEndDate !='':
                                    oldRecord = GoalTracker.objects.filter(
                                        Q(userId=currentUserId) | Q(discordUserId=discordUserId),
                                        goalStartDate=oldGoalStartDate,
                                        goalEndDate=oldGoalEndDate,
                                        goalTopic=oldGoalTopic,
                                        goalTarget=oldGoalTarget,
                                        # goalComplete = oldGoalComplete,
                                    )
                                    if oldRecord.exists():
                                        # print("Delete old")
                                        oldRecord.delete()
                                if existRecord.exists():
                                    # print("Exists!")
                                    return JsonResponse({'message': 'Records exists!'}, status=200)
                                else:
                                    # print("New Record!")
                                    newRecord = GoalTracker(
                                        userId = currentUserId,
                                        userName = '',
                                        discordUserId = discordUserId,
                                        goalStartDate = goalStartDate,
                                        goalEndDate = goalEndDate,
                                        goalTopic = goalTopic,
                                        goalTarget = goalTarget,
                                        goalComplete = goalComplete,
                                    )
                                    newRecord.save()
                                    return JsonResponse({'message': 'Update successful'}, status=200)
                        except Exception as e:
                            print("ERROR!")
                    return JsonResponse({'message': 'Update failed', 'error': str(e)}, status=400)
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
            elif request.POST['postType'] == 'rankView':
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
    
