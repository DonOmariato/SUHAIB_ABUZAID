from django.db import models

# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=100)
    location=models.CharField(max_length=100)
    duration=models.CharField(max_length=20)
    description = models.TextField()
class ProjectImages(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE,related_name="images")
    images = models.ImageField(upload_to='project_images/') 