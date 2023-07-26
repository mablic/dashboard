from django.shortcuts import render, redirect
from django.views.generic import ListView
from .models import LeetCode, UserAnswer, CheckIn
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.db.models import IntegerField
from django.db.models.functions import Cast
from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.urls import reverse
from datetime import datetime
import json

class homeView(ListView):

    model = LeetCode
    paginate_by = 30
    template_name = 'dashboard/dashboard.html'  # <app>/<model>_<viewtype>.html
    checkInDiscordServer = 1046106445617311824
    checkInDiscordChannel = 1061332651690180608
    context_object_name = 'leetCode'
    LeetCode.objects.annotate(int_field=Cast('questionNo', IntegerField())).order_by('int_field')
    currentUser = "all_user_filter"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # get all the filter and users list
        # print(f"Before filter get_context_data is: {context}")
        if 'userFilter' in self.request.GET:
            context.pop('filter', None)
        if 'filters' in context.keys():
            if 'difficult' in context['filters'].keys():
                try:
                    context['filters']['difficult'].index(self.request.GET['difficult'])
                except Exception as e:
                    context['filters']['difficult'].append(self.request.GET['difficult'])
                finally:
                    pass
            if 'userName' in context['filters'].keys():
                try:
                    context['filters']['userName'].index(self.request.GET['userName'])
                except Exception as e:
                    context['filters']['userName'] = self.request.GET['userName']
                    # context['filters']['userName'].append(self.request.GET['userName'])
                finally:
                    pass
            if 'question' in context['filters'].keys():
                try:
                    context['filters']['question'].index(self.request.GET['question'])
                except Exception as e:
                    context['filters']['question'] = self.request.GET['question']
                finally:
                    pass
            if 'textFilter' in context['filters'].keys():
                try:
                    context['filters']['textFilter'].index(self.request.GET['textFilter'])
                except Exception as e:
                    context['filters']['textFilter'] = self.request.GET['textFilter']
                finally:
                    pass
            if 'startDate' in context['filters'].keys() and 'endDate' in context['filters'].keys():
                try:
                    # datetime.strptime(checkInTime, "%Y-%m-%d")
                    context['filters']['startDate'].index(datetime.strptime(self.request.GET['startDate'], "%m/%d/%Y"))
                    context['filters']['endDate'].index(datetime.strptime(self.request.GET['endDate'], "%m/%d/%Y"))
                except Exception as e:
                    context['filters']['startDate'] = datetime.strptime(self.request.GET['startDate'], "%m/%d/%Y")
                    context['filters']['endDate'] = datetime.strptime(self.request.GET['endDate'], )
                finally:
                    pass                          
        else:
            context['filters'] = self.request.GET.copy()
        
        if 'typeList' not in context.keys():
            context['typeList'] = LeetCode().get_types()     
        # print("IN GET CONTEXT:")
        # print(context['typeList'])  
        context['filters'].pop('page', None)
        paginator = context['paginator']
        paginator.filters = self.request.GET.copy()
        paginator.filters.pop('page', None)
        self.object_list = self.get_queryset()
        # print(f"After get_context_data: {context}")
        return context

    def get_queryset(self, *args ,**kwargs):
        print(f"THE GET QUERY: {self.request.GET}")
        print(f"IN GET QUERYSET KWARGS: {self.args} and Keys: {self.kwargs}")
        filterQuery = LeetCode.objects.all()

        if 'userName' in self.request.GET:
            self.currentUser = self.request.GET['userName']
        if 'difficult' in self.request.GET and self.request.GET['difficult'] != "All":
            dList = self.request.GET['difficult'].split(';')
            if dList != []:
                query = Q(hardType=str(dList[0]))
                for i in range(1, len(dList)):
                    query.add(Q(hardType=str(dList[i])), Q.OR)
                filterQuery = filterQuery.filter(query)
        if 'question' in self.request.GET and self.request.GET['question'] != "All":
            filterValue = self.request.GET['question']
            if filterValue != "":
                filterQuery = filterQuery.filter(questionType__icontains=filterValue)
        if 'textFilter' in self.request.GET and self.request.GET['textFilter'] != "":
            filterValue = self.request.GET['textFilter']
            filterQuery = filterQuery.filter(questionName__icontains=filterValue)
        if 'endDate' in self.request.GET and self.request.GET['endDate'] != "" and 'startDate' in self.request.GET and self.request.GET['startDate'] != "" and self.request.GET['userDiscordId'] !="":
            startDate = datetime.strptime(self.request.GET['startDate'], "%m/%d/%Y")
            endDate = datetime.strptime(self.request.GET['endDate'], "%m/%d/%Y")
            userDiscordId = self.request.GET['userDiscordId']
            # print(f"start date is:{startDate}, end date is: {endDate}")
            checkInQuery = Q(checkInTime__gte=startDate, checkInTime__lte=endDate, userDiscordId__icontains=userDiscordId)
            # dateRangeFilter[]
            questionQuery = CheckIn.objects.filter(checkInQuery)
            questionList = [questionQuery[i].questionNo for i in range(len(questionQuery))]
            # print(f"Question List is:{questionList}")
            if questionList != []:
                leetCodeQuery = Q(questionNo=str(questionList[0]))
                for i in range(1, len(questionList)):
                    leetCodeQuery.add(Q(questionNo=str(questionList[i])), Q.OR)
                filterQuery = filterQuery.filter(leetCodeQuery)
            else:
                filterQuery = filterQuery.filter(questionNo="-1")   

        # print(f"Filter after User: {filterQuery}")      
        if self.request.user.is_authenticated:
            if self.currentUser != 'all_user_filter':
                username = get_object_or_404(User, username=self.currentUser)   #self.kwargs.get('username'))
                allAnswer = UserAnswer.objects.filter(userName=username).values_list("leetCodeNo")
                allAnswer = [x[0] for x in allAnswer]
                if allAnswer != []:
                    query = Q(questionNo=str(allAnswer[0]))
                    for i in range(1, len(allAnswer)):
                        query.add(Q(questionNo=str(allAnswer[i])), Q.OR)
                    filterQuery = filterQuery.filter(query)
        # print(f"Filter after User: {filterQuery}")
        if 'currentView' in self.request.GET and self.request.user.is_authenticated:
            if self.request.GET['currentView'] == 'checkInView' or self.request.GET['currentView'] == 'calendarView':
                # print("IN CHECK IN VIEW QUEST")
                startDate = datetime.strptime(self.request.GET['startDate'], "%m/%d/%Y")
                endDate = datetime.strptime(self.request.GET['endDate'], "%m/%d/%Y")
                userDiscordId = self.request.GET['userDiscordId']
                # print(f"start date is:{startDate}, end date is: {endDate}")
                checkInQuery = Q(checkInTime__gte=startDate, checkInTime__lte=endDate, userDiscordId__icontains=userDiscordId)
                checkInQuery = CheckIn.objects.filter(checkInQuery)

                dateQuery = checkInQuery.order_by('-checkInTime').values_list("checkInTime", flat=True).distinct()
                # dateQuery = dateQuery.sort('checkInTime', -1)
                if self.request.GET['currentView'] == 'checkInView':
                    tableData = []
                    # print(f"Data Query is: {dateQuery}")
                    for d in dateQuery:
                        questionQuery = checkInQuery.filter(checkInTime=d)
                        questionList = [questionQuery[i].questionNo for i in range(len(questionQuery))]
                        questionList.sort(key=lambda x: int(x))
                        # print(questionList)
                        # print(f"Question list is: {questionList}")
                        if questionList != []:
                            leetCodeQuery = Q(questionNo=str(questionList[0]))
                            for i in range(1, len(questionList)):
                                leetCodeQuery.add(Q(questionNo=str(questionList[i])), Q.OR)
                            # for itm in filterQuery.filter(leetCodeQuery):
                            #     print(f"{itm.questionNo}")
                            tableData.append({"dateTime": datetime.strftime(d, "%A, %d %B %Y"), 
                                            "items": filterQuery.filter(leetCodeQuery)})

                    # for item in tableData:
                    #     for detail in item['items']:
                    #         print(f"Current DateTime is: {item['dateTime']}, QuestionNo is: {detail.questionName}")
                    return tableData
                
                if self.request.GET['currentView'] == 'calendarView':
                    tableData = []
                    for d in dateQuery:
                        questionQuery = checkInQuery.filter(checkInTime=d)
                        questionList = [questionQuery[i].questionNo for i in range(len(questionQuery))]
                        questionList.sort(key=lambda x: int(x))
                        # print(questionList)
                        questionLink = []
                        for i in range(len(questionList)):
                            question = LeetCode.objects.filter(questionNo=str(questionList[i]))
                            # print(question[0].questionName)
                            questionList[i] = str(questionList[i]) + ":" + str(question[0].questionName)
                            questionLink.append(question[0].link)
                        tableData.append([datetime.strftime(d, "%d"), questionList, questionLink])
                    # print(tableData)
                    return tableData
        # print(f"After the filter: {filterQuery.count()}")
        return filterQuery

    def get(self, request, *args, **kwargs):
        # print("IN GET")
        response = super().get(request, *args, **kwargs)
        # print(response)
        if 'currentView' in self.request.GET and self.request.GET['currentView'] == 'calendarView':
            # Create the context data for JSON serialization
            return JsonResponse(self.object_list, safe=False)
        # Return the default HTTP response
        return response

    def get_page_url(self, page_number):
        url = super().get_page_url(page_number)
        # print("IN GET URL:" + self.paginator.filters)
        if self.paginator.filters:
            return f"{url}&{self.paginator.filters.urlencode()}"
        return url

    def post(self, request):
        print({request.POST['postType']})
        questionNo = request.POST['quesiontNo']
        userId = request.POST['userId']      
        if request.POST['postType'] == 'addUser':
            response = ""
            try:
                ansType = request.POST['ansType']
                userName = request.POST['userName']
                try:
                    currObject = UserAnswer.objects.get(userId=userId, leetCodeNo=questionNo)
                except Exception as e:
                    currObject = None
                finally:
                    pass
                if not currObject:
                    currObject = UserAnswer(userId=userId, leetCodeNo=questionNo, userName=userName, answerType=ansType)
                    currObject.save()
                    response = "Success added!"
                else:
                    response = "You have already added to the questions!"
            except Exception as e:
                print(f"Error while add post for users {userId} with leetCode {questionNo}")
            finally:
                pass
            context = {
                'response': response,
            }
            return JsonResponse(context)
        elif request.POST['postType'] == 'viewCheckIn':
            userDiscordId = request.POST['userDiscordId']
            try:
                # print(f"Current checkIn Question is: {questionNo} . UserDiscordID is: {userDiscordId} . userId is: {userId}")
                currObject = CheckIn.objects.filter(userId=userId, userDiscordId=userDiscordId, questionNo=questionNo)
                # print("Current currObject is: ")
                checkInList = []
                checkInQuestList = []
                for ans in currObject:
                    checkInList.append(ans.checkInTime)
                    checkInQuestList.append(questionNo)
                context = {
                    'checkInTime': checkInList,
                    'questionNo': checkInQuestList,
                }
                return JsonResponse(context)
            except:
                print(f"Error while view the checkIn for users {userId} checkIn on leetCode {questionNo}")
            finally:
                pass
        elif request.POST['postType'] == 'addCheckIn':
            # check in for users
            userDiscordId = request.POST['userDiscordId']
            checkInTime = request.POST['checkInTime']
            # print("in the post add checkin:" + userDiscordId)
            try:
                currObject = CheckIn.objects.filter(userId=userId, userDiscordId=userDiscordId, checkInTime=checkInTime, questionNo=questionNo)
                context = {
                    'checkIn': False,
                }
                # print("check In")
                if currObject.count() == 0:
                    # haven't check in on that question yet for the day
                    currObject = CheckIn(userId=userId, 
                                         userDiscordId=userDiscordId, checkInTime=checkInTime, questionNo=questionNo,
                                         checkInDiscordServer=self.checkInDiscordServer, checkInDiscordChannel=self.checkInDiscordChannel,
                                         notificationFlag=0, tmrFlag=0)
                    # print(currObject)
                    currObject.save()
                    context['checkIn'] = True
                # return JsonResponse(context)
            except:
                print(f"Error while add post for users {userId} checkIn on leetCode {questionNo}")
            finally:
                return JsonResponse(context)
        elif request.POST['postType'] == 'removeCheckIn':
            userDiscordId = request.POST['userDiscordId']
            checkInTime = request.POST['checkInTime']
            try:
                context = {
                    'checkIn': False,
                }
                print(f"Remove checkIn/ userId:{userId}, userDiscordId:{userDiscordId}, checkInTime:{checkInTime}, questionNo:{questionNo}")
                CheckIn.objects.filter(userId=userId, userDiscordId=userDiscordId, checkInTime=datetime.strptime(checkInTime, "%Y-%m-%d"), questionNo=questionNo).delete()
                print("remove checkIn post")
                context['checkIn'] = True
            except:
                print(f"Error while remove checkIn for users {userId} checkIn on leetCode {questionNo}")
            finally:
                return JsonResponse(context)
        elif request.POST['postType'] == 'delete':
            try:
                try:
                    UserAnswer.objects.filter(userId=userId, leetCodeNo=questionNo).delete()
                except Exception as e:
                    currObject = None
                finally:
                    pass
            except Exception as e:
                print(f"Error while add post for users {userId} with leetCode {questionNo}")
            finally:
                pass
        else:
            if request.POST['postType'] == 'submitDetails':
                # print('In details posted!')
                try:
                    timeComplexity = request.POST['timeComplexity']
                    spaceComplexity = request.POST['spaceComplexity']
                    currObject = UserAnswer.objects.get(userId=userId, leetCodeNo=questionNo)
                    currObject.timeComplexity = timeComplexity
                    currObject.spaceComplexity = spaceComplexity
                    currObject.save()
                except Exception as e:
                    print(f"Error while details post for users {userId} with leetCode {questionNo}")
                finally:
                    pass 
                # print(questionNo)
        result = UserAnswer.objects.filter(leetCodeNo=str(questionNo))
        if not result:
            pass
        else:
            userDict = {}
            for ans in result:
                if str(ans.answerType) not in userDict.keys():
                    userDict[str(ans.answerType)] = []
                userDict[str(ans.answerType)].append([ans.userId, ans.userName, ans.timeComplexity, ans.spaceComplexity])
            context = {
                'userAnswer': userDict,
                'userId': userId,
                'questionNo': questionNo,
            }
            return JsonResponse(context)

        return HttpResponse('dashboard/home.html')

def home(request):
    # print("In the HOME VIEW")
    return render(request, 'dashboard/home.html', {'title': 'Home'})
