from django.shortcuts import render
from django.views.generic import View
from admin_panl.models import ContactInfo
# Create your views here.

class HomePageView(View):
    template_name = 'index.html'

    def get(self, request):
        contact = ContactInfo.get_solo_instance()  
        context = {
            'contact': contact,  
        }
        return render(request, self.template_name, context)


def aboutus(request):
     contact = ContactInfo.get_solo_instance()  
     context = {
            'contact': contact,  
        }
     return render(request,'about.html',context)