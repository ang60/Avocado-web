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
    source_file = models.FileField(upload_to='knowledge_base/sources/', blank=True, null=True)
    image = models.ImageField(upload_to='knowledge_base/images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Knowledge Entries"

    def __str__(self):
        return self.title

