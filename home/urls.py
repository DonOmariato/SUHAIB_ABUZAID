from django.urls import path
from .views import HomePageView, aboutus
urlpatterns = [ 
    path('', HomePageView.as_view(), name='index'),
    path('aboutus/',aboutus,name='aboutus'),
]