from django.urls import path, re_path, include
from . import views
from .views import homeView


urlpatterns = [
    # path('', views.home, name='dashboard'),
    path('dashboard/', homeView.as_view(), name='dashboard'),
    path('dashboard/<str:username>', homeView.as_view(), name='user-dashboard'),
    re_path(r'^(.*?)filter/', homeView.as_view(), name='user-filter'),
    path('', views.home, name='home'),
    # path('profile/', include('users.urls', namespace='users')),
]

# if settings.DEBUG:
#     print(settings.MEDIA_URL)
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
