from django.urls import path
from .views import index,aboutus
urlpatterns = [
    path('',index,name='index'),
    path('aboutus/',aboutus,name='aboutus'),
]