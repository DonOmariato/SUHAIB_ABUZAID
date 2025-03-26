from django.urls import path
from .views import projects,addNewProject,get_projects,delete_project,update_project
 
urlpatterns = [
    path('',projects.as_view(), name='projects'),  
    path('addProject/',addNewProject,name='addNewProject'),
    path('getProjects/<int:project_id>/',get_projects,name='getProjects'),
    path('deleteProject/<int:project_id>/',delete_project,name='deleteProject'),
    path('updateProject/<int:project_id>/',update_project,name='updateProject'),

]
