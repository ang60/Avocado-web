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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    case_title = models.CharField(max_length=255)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='unknown')
    pest_scouting_record = models.ForeignKey(
        'pest_scouting.WeeklyRecord',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases'
    )
    notes = models.TextField()
    assigned_agronomist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='case_management_assigned_cases'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.case_title} - {self.severity}"

