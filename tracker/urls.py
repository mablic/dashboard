
from django.contrib import admin
from django.urls import path
from .views import trackerView

urlpatterns = [
    path('', trackerView.as_view(), name='tracker'),
    # path('', trackerView, name='tracker-view'),
    # path('<str:username>', trackerView.as_view(), name='user-tracker'),
]
