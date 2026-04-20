import uuid
from django.db import models
from django.conf import settings


class QuarantineManagement(models.Model):
    STATUS_CHOICES = (
        ('gated', 'Gated'),
        ('pending', 'Pending'),
        ('cleared', 'Cleared'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blockId = models.CharField(max_length=50)
    farmName = models.CharField(max_length=255)
    county = models.CharField(max_length=100)
    pestType = models.CharField(max_length=100)
    captureRate = models.DecimalField(max_digits=10, decimal_places=2)
    lastInspection = models.DateField()
    kephisStatus = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    inspector = models.CharField(max_length=255)
    evidence_url = models.URLField(blank=True, null=True)
    lift_requested_at = models.DateTimeField(blank=True, null=True)
    lift_recommended_at = models.DateTimeField(blank=True, null=True)
    lift_recommended_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kephis_lift_recommendations',
    )
    lift_approved_at = models.DateTimeField(blank=True, null=True)
    lift_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kephis_lift_approvals',
    )
    selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.blockId} - {self.farmName}"

    class Meta:
        verbose_name_plural = "Quarantine Management"


class KephisThresholdSetting(models.Model):
    """
    Singleton-style national threshold settings controlled by KEPHIS.
    """

    fruit_fly_limit = models.PositiveIntegerField(default=5)
    fcm_limit = models.PositiveIntegerField(default=2)
    thrips_limit = models.PositiveIntegerField(default=10)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "KEPHIS Threshold Setting"
        verbose_name_plural = "KEPHIS Threshold Settings"

    def __str__(self):
        return (
            f"Thresholds (Fruit fly={self.fruit_fly_limit}, "
            f"FCM={self.fcm_limit}, Thrips={self.thrips_limit})"
        )


class QuarantineActionLog(models.Model):
    ACTION_CHOICES = (
        ('issue_restriction', 'Issue Restriction'),
        ('request_lift', 'Request Lift'),
        ('recommend_lift', 'Recommend Lift'),
        ('approve_lift', 'Approve Lift'),
        ('manual_update', 'Manual Update'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quarantine = models.ForeignKey(
        QuarantineManagement,
        on_delete=models.CASCADE,
        related_name='action_logs',
    )
    action_type = models.CharField(max_length=40, choices=ACTION_CHOICES)
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20, blank=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kephis_quarantine_actions',
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.quarantine.blockId} {self.action_type} ({self.from_status}->{self.to_status})'
