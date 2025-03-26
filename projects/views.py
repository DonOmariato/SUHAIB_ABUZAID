from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.generic import View
from django.shortcuts import get_object_or_404
import os
from django.conf import settings
from admin_panl.models import ContactInfo
from . models import Project ,ProjectImages
from .forms import ProjectForm

class projects(View):
    template_name='projects.html'
    def get(self, request):
        contact = ContactInfo.get_solo_instance()  
        projects = Project.objects.all()
        latest_projects = Project.objects.all().order_by('-id')[:6]
        
        
        context = {
            'contact': contact,  
            'projects':projects,
            'latest_projects':latest_projects,
            
        }
        return render(request,self.template_name,context)

def addNewProject(request):
    if request.method == 'POST':
       # print("🔵post request:", request.POST)  
       # print("🟢 uploded files:", request.FILES)  
        form = ProjectForm({
        'name': request.POST.get('project_Name'),
        'location': request.POST.get('project_Location'),
        'duration': request.POST.get('project_Duration'),
        'description': request.POST.get('project_Description'),
          })

        if form.is_valid():
            project = form.save() 
            images = request.FILES.getlist('project_Images')  
            
            image_urls = []
            for image in images:
                project_image = ProjectImages.objects.create(project=project, images=image)
                image_urls.append(project_image.images.url)

            return JsonResponse({
                'status': 'success',
                'project': {
                    'id': project.id,
                    'name': project.name,
                    'location': project.location,
                    'duration': project.duration,
                    'description': project.description,
                    'imageUrls': image_urls,
                },
                'message': 'Project added successfully!'
            })
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid form data.'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})

def get_projects(request,project_id):
   if request.method == 'GET':
        project = get_object_or_404(Project, id=project_id)
        images = [{'id': image.id, 'url': image.images.url} for image in project.images.all()]
        return JsonResponse({
            'status': 'success',
            'project':{
                'id':project.id,
                'name':project.name,
                'location':project.location,
                'duration':project.duration,
                'description':project.description,
                'images':images
            }
        })
   return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=400)


def delete_project(request, project_id):
    if request.method == 'POST':
        project = get_object_or_404(Project, id=project_id)
        projectImages=project.images.all()
        for image in projectImages:
             if os.path.isfile(image.images.path):
                    os.remove(image.images.path) 
             image.delete() 
        project.delete()
        return JsonResponse({'success': True, 'message': 'Project deleted successfully!'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=400)

def update_project(request, project_id):
    if request.method == 'POST':
        try:
           
            project = get_object_or_404(Project, id=project_id)

            
            project.name = request.POST.get('name', project.name)
            project.location = request.POST.get('location', project.location)
            project.duration = request.POST.get('duration', project.duration)
            project.description = request.POST.get('description', project.description)
            project.save()

          
            deleted_images = request.POST.get('deleted_images', '[]')
            deleted_images = json.loads(deleted_images)
            if deleted_images:
                
                ProjectImages.objects.filter(id__in=deleted_images, project=project).delete()

           
            if 'images' in request.FILES:
                for image in request.FILES.getlist('images'):
                    ProjectImages.objects.create(project=project, images=image) 

            
            return JsonResponse({
                'success': True,
                'message': 'Project updated successfully!',
                'project': {
                    'id': project.id,
                    'name': project.name,
                    'location': project.location,
                    'duration': project.duration,
                    'description': project.description,
                    'images': [img.images.url for img in project.images.all()]  
                }
            })
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

        
