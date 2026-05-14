import uuid
from django.db import models
from django.conf import settings


class Advisory(models.Model):
    """Advisory linked to a weekly scouting record. actions_taken / outcome accept mobile free text or legacy labels."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    weekly_record = models.ForeignKey(
        'pest_scouting.WeeklyRecord', on_delete=models.CASCADE, related_name='advisories'
    )
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='advisories')
    advisory_message = models.TextField()
    actions_taken = models.CharField(max_length=255, null=True, blank=True)
    outcome = models.CharField(max_length=255, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=64, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Advisories"
        ordering = ['-timestamp']

    def __str__(self):
        return f"Advisory for {self.farmer.phone_number} - {self.timestamp.date()}"

    @property
    def time_ago(self):
        from django.utils import timezone

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

