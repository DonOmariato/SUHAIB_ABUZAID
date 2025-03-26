from django.urls import path
from admin_panl.views import *  


urlpatterns = [
    path('', AdminPanel.as_view(), name='adminpan'),  
    path('adminpan/contact-Info/',contactInfo,name='contact_Info'),
]
 
