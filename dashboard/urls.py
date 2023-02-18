from django.urls import path, re_path
from . import views
from .views import homeView


urlpatterns = [
    # path('', views.home, name='dashboard'),
    path('dashboard/', homeView.as_view(), name='dashboard'),
    path('dashboard/<str:username>', homeView.as_view(), name='user-dashboard'),
    re_path(r'^(.*?)filter/', homeView.as_view(), name='user-filter'),
    path('', views.home, name='home'),
]
