import uuid
from django.db import models, transaction
from django.conf import settings
from django.utils import timezone

from api.models import FarmerProfile


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


class ChinaFarmIdSequence(models.Model):
    """
    Tracks last issued China Farm ID sequence number per year.

    Generates codes like: CHN-FRM-0001-2026
    """

    year = models.PositiveIntegerField(unique=True)
    last_number = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['year']

    def __str__(self):
        return f'{self.year}: {self.last_number}'


class ChinaFarmCertification(models.Model):
    """
    KEPHIS-issued certification for a farm to support China market requirements.

    Issued after pest inspection; includes inspector and management insights.
    """

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('suspended', 'Suspended'),
        ('revoked', 'Revoked'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='china_certifications')
    china_farm_id = models.CharField(max_length=32, unique=True, null=True, blank=True, default=None)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='draft')

    inspected_at = models.DateTimeField(null=True, blank=True)
    issued_at = models.DateTimeField(null=True, blank=True)
    inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='china_farm_certifications_issued',
    )

    export_approved_at = models.DateTimeField(null=True, blank=True)
    export_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='china_farm_export_approvals',
    )

    # Narrative insights KEPHIS provides after inspection
    management_insights = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-created_at']
        indexes = [
            models.Index(fields=['farmer', '-updated_at']),
            models.Index(fields=['status', '-updated_at']),
        ]

    @staticmethod
    def _format_id(n: int, year: int) -> str:
        return f'CHN-FRM-{n:04d}-{year}'

    def _compute_year(self) -> int:
        if self.inspected_at:
            return int(self.inspected_at.year)
        return int(timezone.now().year)

    def ensure_china_farm_id(self):
        if self.china_farm_id:
            return
        year = self._compute_year()
        with transaction.atomic():
            seq, _ = ChinaFarmIdSequence.objects.select_for_update().get_or_create(year=year)
            seq.last_number = int(seq.last_number or 0) + 1
            seq.save(update_fields=['last_number'])
            self.china_farm_id = self._format_id(seq.last_number, year)

    def save(self, *args, **kwargs):
        if not self.china_farm_id and self.status in {'issued', 'suspended', 'revoked'}:
            self.ensure_china_farm_id()
        if self.status == 'issued' and not self.issued_at:
            self.issued_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'ChinaCert {self.china_farm_id or self.id} ({self.status})'
