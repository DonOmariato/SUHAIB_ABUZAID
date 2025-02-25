from django.shortcuts import render

# Create your views here.
def adminpan(request):
    return render(request, 'admin_pan.html')
def login(request):
    return render(request, 'login.html')