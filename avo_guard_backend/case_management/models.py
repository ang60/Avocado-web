import uuid
from django.db import models
from django.conf import settings

class Case(models.Model):
    SEVERITY_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
        ('unknown', 'Unknown'),
    )

    STATUS_CHOICES = (
        ('Under Review', 'Under Review'),
        ('Advisory Issued', 'Advisory Issued'),
        ('Closed', 'Closed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    case_title = models.CharField(max_length=255)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='unknown')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Under Review')
    pest_scouting_record = models.ForeignKey(
        'pest_scouting.WeeklyRecord',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases'
    )
    initial_notes = models.TextField(null=True, blank=True)
    notes = models.TextField()
    diagnosis = models.TextField(null=True, blank=True)
    recommended_actions = models.TextField(null=True, blank=True)
    recommended_chemical = models.CharField(max_length=255, null=True, blank=True)
    application_rate = models.CharField(max_length=255, null=True, blank=True)
    pre_harvest_interval = models.CharField(max_length=255, null=True, blank=True)
    assigned_agronomist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_cases'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.case_title} - {self.severity}"
