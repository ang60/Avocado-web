import os
import uuid
from django.db import models

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

def knowledge_source_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return f'knowledge_base/sources/{instance.id}/{unique_filename}'

def knowledge_image_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return f'knowledge_base/images/{instance.id}/{unique_filename}'

class KnowledgeEntry(models.Model):
    SEVERITY_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='entries')
    title = models.CharField(max_length=255)
    content = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    tags = models.JSONField(default=list, blank=True)
    views = models.PositiveIntegerField(default=0)
    active_use_cases = models.TextField(blank=True, null=True)
    approved_content = models.BooleanField(default=False)
    chemical_gate = models.CharField(
        max_length=10, 
        choices=(('gated', 'Gated'), ('open', 'Open')), 
        default='open'
    )
    source_file = models.FileField(upload_to=knowledge_source_path, blank=True, null=True, max_length=500)
    image = models.ImageField(upload_to=knowledge_image_path, blank=True, null=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Knowledge Entries"
        ordering = ['-created_at']

    def __str__(self):
        return self.title
