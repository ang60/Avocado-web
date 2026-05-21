import uuid
from django.db import models

class QuarantineManagement(models.Model):
    STATUS_CHOICES = (
        ('gated', 'Gated'),
        ('pending', 'Pending'),
        ('cleared', 'Cleared'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blockId = models.CharField(max_length=50)
    farmName = models.CharField(max_length=255)
    county = models.CharField(max_length=500)
    pestType = models.CharField(max_length=500)
    captureRate = models.DecimalField(max_digits=10, decimal_places=2)
    lastInspection = models.DateField()
    kephisStatus = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    inspector = models.CharField(max_length=255)
    selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.blockId} - {self.farmName}"

    class Meta:
        verbose_name_plural = "Quarantine Management"
        ordering = ['-created_at']
