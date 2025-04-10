from django.shortcuts import render
from django.views.generic import View
from admin_panl.models import ContactInfo
from projects .models import Project ,ProjectImages
# Create your views here.

class HomePageView(View):
    template_name = 'index.html'

    def get(self, request):
        contact = ContactInfo.get_solo_instance()  
        projects = Project.objects.all().order_by('id')[:4]
        context = {
            'contact': contact,  
            'projects': projects,
        }
        return render(request, self.template_name, context)

 
def aboutus(request):
     contact = ContactInfo.get_solo_instance()  
     context = {
            'contact': contact,  
        }
     return render(request,'about.html',context)