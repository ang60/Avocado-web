import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

class Alert(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alerts')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    category = models.CharField(max_length=500, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.title} - {self.farmer.phone_number}"

    @property
    def time_ago(self) -> str:
        now = timezone.now()
        diff = now - self.timestamp
        
        if diff.days == 0:
            if diff.seconds < 60:
                return "Just now"
            if diff.seconds < 3600:
                minutes = diff.seconds // 60
                return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        if diff.days == 1:
            return "Yesterday"
        if diff.days < 7:
            return f"{diff.days} days ago"
        return self.timestamp.strftime("%Y-%m-%d")
