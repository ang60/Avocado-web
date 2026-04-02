import uuid

from django.conf import settings
from django.db import models


class EntityType(models.TextChoices):
    EXPORTER = 'Exporter', 'Exporter'
    KEPHIS = 'Government - KEPHIS', 'Government - KEPHIS'
    HCDA = 'Government - HCDA', 'Government - HCDA'
    PARTNER = 'Partner Organization', 'Partner Organization'


class FarmerProfile(models.Model):
    """
    Farmer registry record (domain model).

    Note: This project already has `accounts.User` as the auth user model.
    """

    class PrimaryChannel(models.TextChoices):
        SMARTPHONE = 'smartphone', 'smartphone'
        USSD = 'ussd', 'ussd'

    class ExportEligibility(models.TextChoices):
        READY = 'ready', 'ready'
        AT_RISK = 'at-risk', 'at-risk'
        SUSPENDED = 'suspended', 'suspended'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_profile',
    )

    name = models.CharField(max_length=255)
    owner = models.CharField(max_length=255, blank=True, default='')
    farm_name = models.CharField(max_length=255, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    county = models.CharField(max_length=128, blank=True, default='')
    ward = models.CharField(max_length=128, blank=True, default='')
    sub_county = models.CharField(max_length=128, blank=True, default='')

    primary_channel = models.CharField(
        max_length=16,
        choices=PrimaryChannel.choices,
        default=PrimaryChannel.SMARTPHONE,
    )
    registration_date = models.DateField(null=True, blank=True)

    total_acres = models.FloatField(default=0)
    blocks_managed = models.PositiveIntegerField(default=0)
    trees_count = models.PositiveIntegerField(default=0)

    export_eligibility = models.CharField(
        max_length=16,
        choices=ExportEligibility.choices,
        default=ExportEligibility.READY,
    )

    weekly_scouting_logs_4w = models.JSONField(default=list)  # expected length 4 ints
    overdue_scouts = models.BooleanField(default=False)
    last_inspection = models.CharField(max_length=64, blank=True, default='')

    last_scouting_status = models.CharField(max_length=32, blank=True, default='no-pests')
    last_scouting_finding = models.CharField(max_length=255, blank=True, default='')
    last_scouting_date = models.CharField(max_length=64, blank=True, default='')
    last_scouting_scout_name = models.CharField(max_length=255, blank=True, default='')

    # Optional link to exporter entity (accounts.Entity)
    linked_exporter = models.ForeignKey(
        'accounts.Entity',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='linked_farmers_profiles',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.id})'


class FarmBlock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(
        FarmerProfile,
        on_delete=models.CASCADE,
        related_name='blocks',
    )
    name = models.CharField(max_length=128)
    acres = models.FloatField(default=0)
    trees = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=64, blank=True, default='')
    last_inspection = models.CharField(max_length=64, blank=True, default='')

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Case(models.Model):
    class Severity(models.TextChoices):
        HIGH = 'high', 'high'
        MEDIUM = 'medium', 'medium'
        LOW = 'low', 'low'
        UNKNOWN = 'unknown', 'unknown'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='cases')
    block = models.ForeignKey(FarmBlock, null=True, blank=True, on_delete=models.SET_NULL, related_name='cases')
    severity = models.CharField(max_length=16, choices=Severity.choices, default=Severity.UNKNOWN)

    pest_disease = models.CharField(max_length=255, blank=True, default='')
    pest_disease_kiswahili = models.CharField(max_length=255, blank=True, default='')

    date_submitted = models.DateTimeField(null=True, blank=True)
    submission_channel = models.CharField(max_length=32, blank=True, default='smartphone')

    scout_name = models.CharField(max_length=255, blank=True, default='')
    scout_phone = models.CharField(max_length=32, blank=True, default='')

    affected_trees = models.PositiveIntegerField(default=0)
    symptoms = models.JSONField(default=list)
    symptom_codes = models.JSONField(default=list)
    notes = models.TextField(blank=True, default='')

    # UI expects: new | under-review | advisory-issued (we keep it flexible as CharField)
    status = models.CharField(max_length=64, blank=True, default='new')
    assigned_agronomist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_cases',
    )

    class Meta:
        ordering = ['-date_submitted']

    def __str__(self):
        return f'Case {self.id}'


class ScoutingReport(models.Model):
    """Field scouting submission (app / USSD) — feeds Scouting Reports UI and dashboard."""

    class Source(models.TextChoices):
        APP = 'app', 'app'
        USSD = 'ussd', 'ussd'

    class Severity(models.TextChoices):
        HIGH = 'high', 'high'
        MEDIUM = 'medium', 'medium'
        LOW = 'low', 'low'

    class DetectionStatus(models.TextChoices):
        CLEAN = 'clean', 'clean'
        DETECTED = 'detected', 'detected'

    class ReviewStatus(models.TextChoices):
        NEW = 'new', 'new'
        UNDER_REVIEW = 'under-review', 'under-review'
        REVIEWED = 'reviewed', 'reviewed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='scouting_reports')
    block = models.ForeignKey(FarmBlock, null=True, blank=True, on_delete=models.SET_NULL, related_name='scouting_reports')

    source = models.CharField(max_length=16, choices=Source.choices, default=Source.APP)
    severity = models.CharField(max_length=16, choices=Severity.choices, default=Severity.LOW)
    finding = models.CharField(max_length=512, blank=True, default='')
    status = models.CharField(max_length=16, choices=DetectionStatus.choices, default=DetectionStatus.CLEAN)

    media_preview = models.URLField(blank=True, default='')
    ussd_code = models.CharField(max_length=32, blank=True, default='')
    scout_name = models.CharField(max_length=255, blank=True, default='')

    reviewed = models.CharField(max_length=32, choices=ReviewStatus.choices, default=ReviewStatus.NEW)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_scouting_reports',
    )
    related_case = models.ForeignKey(Case, null=True, blank=True, on_delete=models.SET_NULL, related_name='source_scouting_reports')

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['-submitted_at']),
            models.Index(fields=['farmer', '-submitted_at']),
        ]

    def __str__(self):
        return f'ScoutingReport {self.id}'


class AlertRule(models.Model):
    """Configurable alert rules for outbreak/compliance notifications."""

    class Status(models.TextChoices):
        ACTIVE = 'active', 'active'
        INACTIVE = 'inactive', 'inactive'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    condition = models.CharField(max_length=64)
    threshold = models.CharField(max_length=64)
    county = models.CharField(max_length=128, blank=True, default='')
    pest = models.CharField(max_length=255, blank=True, default='')
    action = models.CharField(max_length=32)
    recipients = models.TextField(blank=True, default='')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)

    triggered_count = models.PositiveIntegerField(default=0)
    last_triggered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
