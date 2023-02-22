from django.shortcuts import render, redirect
from django.views.generic import ListView
from .models import LeetCode, UserAnswer
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.db.models import IntegerField
from django.db.models.functions import Cast
from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.urls import reverse

class homeView(ListView):

    model = LeetCode
    paginate_by = 30
    template_name = 'dashboard/dashboard.html'  # <app>/<model>_<viewtype>.html
    context_object_name = 'leetCode'
    LeetCode.objects.annotate(int_field=Cast('questionNo', IntegerField())).order_by('int_field')
    currentUser = "all_user_filter"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # get all the filter and users list
        # print(f"Before filter get_context_data is: {self.request.GET}")
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
                    context['filters']['userName'] = self.request.GET['question']
                finally:
                    pass
        else:
            context['filters'] = self.request.GET.copy()
        if 'typeList' not in context.keys():
            context['typeList'] = LeetCode().get_types()
        # if 'getQuestionCount' not in context.keys():
        #     print(f"Question Answer: {LeetCode.objects.first().get_answer_count_by_num()}")
        #     context['getQuestionCount'] = LeetCode.objects.first().get_answer_count_by_num()        
        context['filters'].pop('page', None)
        paginator = context['paginator']
        paginator.filters = self.request.GET.copy()
        paginator.filters.pop('page', None)
        self.object_list = self.get_queryset()
        # print(f"After get_context_data: {context['filters']}")
        return context

    def get_queryset(self, *args ,**kwargs):
        print(f"IN GET QUERYSET KWARGS: {self.kwargs}")
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
        return filterQuery


    def get_page_url(self, page_number):
        url = super().get_page_url(page_number)
        if self.paginator.filters:
            return f"{url}&{self.paginator.filters.urlencode()}"
        return url

    def post(self, request):
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
                print('In details posted!')
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
    return render(request, 'dashboard/home.html', {'title': 'Home'})
