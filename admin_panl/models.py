from django.db import models
from django.contrib.auth.models import AbstractUser



class CustomAdmin(AbstractUser):
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.username


class ContactInfo(models.Model):
     phone1=models.CharField(max_length=15)
     phone2=models.CharField(max_length=15, blank=True, null=True)
     email=models.EmailField()
     address=models.TextField()
  
     @staticmethod
     def get_solo_instance():
        instance, created =ContactInfo.objects.get_or_create(id=1)
        return instance 
     
     def save(self,*args,**kwargs):
         self.pk=1
         super().save(*args,**kwargs)
    
     def __str__(self):
         return "Contact Information"

 
         
