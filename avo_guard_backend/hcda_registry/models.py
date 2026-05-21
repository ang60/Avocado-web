import uuid
from django.db import models

class FarmerRegistration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmerName = models.CharField(max_length=255)
    hcdaRegNumber = models.CharField(max_length=500, unique=True)
    ward = models.CharField(max_length=500)
    county = models.CharField(max_length=500)
    acreage = models.FloatField()
    globalGAPStatus = models.CharField(max_length=50)  # compliant, expired, non-compliant
    globalGAPExpiry = models.DateField()
    primaryExporter = models.CharField(max_length=255)
    lat = models.FloatField()
    lng = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.farmerName} ({self.hcdaRegNumber})"

    class Meta:
        verbose_name = "Farmer Registration"
        verbose_name_plural = "Farmer Registrations"
        ordering = ['-created_at']
