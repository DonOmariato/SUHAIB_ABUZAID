from django.urls import path
from admin_panl.views import *  


urlpatterns = [
    path('', AdminPanel.as_view(), name='adminpan'),
    path('login/', AdminLoginView.as_view(), name='adminpan_login'),
    path('logout/', AdminLogoutView.as_view(), name='adminpan_logout'),
    path('adminpan/add-Admin/',addAdmin,name='add_Admin'),
    path('adminpan/delete-Admin/<int:admin_id>/',deleteAdmin,name='delete_Admin'),
    path('adminpan/get-Admin/<int:admin_id>/',getAdmin,name='get_Admin'),
    path('adminpan/update-Admin/<int:admin_id>/',updateAdmin,name='update_Admin'),
    path('adminpan/contact-Info/',contactInfo,name='contact_Info'),
]
 
