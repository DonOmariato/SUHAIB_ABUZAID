from django.urls import path
from . import views  

urlpatterns = [
    path('', views.adminpan, name='adminpan'),  
    path('login/',views.login, name='login'),
]

