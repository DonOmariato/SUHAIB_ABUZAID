from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request,'index.html')
def aboutus(request):
    return render(request,'about.html')