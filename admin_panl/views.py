from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import FormView, View
from django.contrib.auth import authenticate, login ,logout
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import ContactInfo ,CustomAdmin
from projects .models import Project

@method_decorator(login_required, name='dispatch')
class AdminPanel(View):
      template_name ='admin_pan.html'
      def get(self,request):
         admins= CustomAdmin.objects.all()
         projects = Project.objects.all()
         contact = ContactInfo.get_solo_instance()
         context={
              'admins':admins,
            'contact':contact,
            'projects':projects
        }
         return render(request,self.template_name,context)   

class AdminLoginView(View):
    template_name ='login.html'
    def get(self, request):
        return render(request, self.template_name)
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username ,password=password )
        if user is not None:
            login(request , user)
            return redirect('adminpan')
        else:
            messages.error(request,'Invalid UserName or Password')
            return render(request, self.template_name)
        
class AdminLogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('adminpan_login')

def addAdmin(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')

        if not username or not email or not password:
                return JsonResponse({'status':False,'message': 'All fields are required.'})
        
        if CustomAdmin.objects.filter(username=username).exists():
                return JsonResponse({'status': False, 'message': 'Username already exists.'})
        
        if CustomAdmin.objects.filter(email=email).exists():
                return JsonResponse({'status': False, 'message': 'Email already exists.'})
        
        user = CustomAdmin.objects.create_user(username=username , password=password , email=email)

        return JsonResponse({
             'status': True,
             'message': 'Admin added successfully',
             'admin': {
                 'id': user.id,
                 'username': user.username,
                 'email': user.email
             }
         })
    return JsonResponse({'status':False,'message':'Invalid request method'})

def deleteAdmin(request,admin_id):
     if request.method == 'POST':
          
          if CustomAdmin.objects.count() <= 1:
               return JsonResponse({'status': False, 'message': 'Cannot delete the last admin.'})
          try:
              admin = CustomAdmin.objects.get(id=admin_id)
              admin.delete()
              return JsonResponse({'status': True, 'message': 'Admin deleted successfully!'})
          except CustomAdmin.DoesNotExist:
               return JsonResponse({'status': False, 'message': 'Admin not found.'})
          
     return JsonResponse({'status': False, 'message': 'Invalid request method.'})

def getAdmin(request , admin_id):
     if request.method == 'GET':
        try:
          admin = CustomAdmin.objects.get(id=admin_id)
          return JsonResponse({
               'status': True,
                'message': 'Admin found successfully',
                'admin':{
                     'id':admin.id,
                     'username':admin.username,
                     'email':admin.email
                }
            })
        except CustomAdmin.DoesNotExist:
             return JsonResponse({'status': False, 'message': 'Admin not found.'})
        
     return JsonResponse({'status': False, 'message': 'Invalid request method.'})

def updateAdmin(request, admin_id):
     if request.method == 'POST':
        try:
            admin=CustomAdmin.objects.get(id=admin_id)
            admin.username=request.POST.get('Edit-username',admin.username)
            admin.email=request.POST.get('Edit-email',admin.email)
            newPassword = request.POST.get('Edit-password')
            if newPassword: 
                admin.set_password(newPassword)
            admin.save()
            return JsonResponse({
                'status': True,
                'message': 'Admin updated successfully!',
                'admin': {
                    'id': admin.id,
                    'username': admin.username,
                    'email': admin.email
                }
            })
        except CustomAdmin.DoesNotExist:
            return JsonResponse({
                'status': False,
                'message': 'Admin not found.'
            })
        except Exception as e:
            return JsonResponse({
                'status': False,
                'message': f'Error updating admin: {str(e)}'
            })
     return JsonResponse({
         'status': False,
         'message': 'Invalid request method.'
    })

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


