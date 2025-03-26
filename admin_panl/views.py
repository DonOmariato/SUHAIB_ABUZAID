from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import FormView, View
from .models import ContactInfo
from projects .models import Project
# Create your views here.
#class AdminPanel(LoginRequiredMixin,View):
class AdminPanel(View):
      template_name ='admin_pan.html'
      def get(self,request):
         projects = Project.objects.all()
         contact = ContactInfo.get_solo_instance()
         context={
            'contact':contact,
            'projects':projects
        }
         return render(request,self.template_name,context)   

def contactInfo(request):  
    if request.method == 'POST':
        email1=request.POST.get('email1')
        phone1=request.POST.get('phone1')
        phone2=request.POST.get('phone2')
        address=request.POST.get('address')

        contact = ContactInfo.get_solo_instance()

        contact.email=email1
        contact.phone1=phone1
        contact.phone2=phone2
        contact.address=address
        contact.save()
        
        return JsonResponse({
           'email':contact.email,
           'phone1':contact.phone1,
           'phone2':contact.phone2,
           'address':contact.address,
           'status': 'success',
           'message':'contact info saved successflly'
        })
    return JsonResponse({'status':'erorr','message':'invaled request'},status=400)
