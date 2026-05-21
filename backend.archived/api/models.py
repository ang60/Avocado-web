import uuid

from django.conf import settings
from django.db import models, transaction
from django.utils import timezone


class EntityType(models.TextChoices):
    EXPORTER = 'Exporter', 'Exporter'
    KEPHIS = 'Government - KEPHIS', 'Government - KEPHIS'
    HCDA = 'Government - HCDA', 'Government - HCDA'
    PARTNER = 'Partner Organization', 'Partner Organization'


class FarmerCodeSequence(models.Model):
    """
    Tracks the last issued farmer sequence number for a given year.

    Generates Farmer IDs like: FRM-0001-2026
    """

    year = models.PositiveIntegerField(unique=True)
    last_number = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['year']

    def __str__(self):
        return f'{self.year}: {self.last_number}'


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

    class ComplianceStatus(models.TextChoices):
        COMPLIANT = 'compliant', 'compliant'
        NEEDS_FOLLOW_UP = 'needs-follow-up', 'needs-follow-up'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Nullable so migrations can add it safely before backfill; uniqueness is still enforced
    # for non-null values (Postgres allows multiple NULLs).
    farmer_code = models.CharField(max_length=32, unique=True, null=True, blank=True, default=None)
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
    agronomist_compliance_status = models.CharField(
        max_length=32,
        choices=ComplianceStatus.choices,
        default=ComplianceStatus.COMPLIANT,
    )
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

    @staticmethod
    def _format_farmer_code(n: int, year: int) -> str:
        return f'FRM-{n:04d}-{year}'

    def _compute_farmer_code_year(self) -> int:
        if self.registration_date:
            return int(self.registration_date.year)
        return int(timezone.now().year)

    def ensure_farmer_code(self):
        if self.farmer_code:
            return
        year = self._compute_farmer_code_year()
        with transaction.atomic():
            seq, _ = FarmerCodeSequence.objects.select_for_update().get_or_create(year=year)
            seq.last_number = int(seq.last_number or 0) + 1
            seq.save(update_fields=['last_number'])
            self.farmer_code = self._format_farmer_code(seq.last_number, year)

    def save(self, *args, **kwargs):
        if not self.farmer_code:
            self.ensure_farmer_code()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.farmer_code or self.id})'


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


class CaseCodeSequence(models.Model):
    """
    Tracks the last issued case sequence number for a given year.

    Generates Case IDs like: CSE-0001-2026
    """

    year = models.PositiveIntegerField(unique=True)
    last_number = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['year']

    def __str__(self):
        return f'{self.year}: {self.last_number}'


class Case(models.Model):
    class Severity(models.TextChoices):
        HIGH = 'high', 'high'
        MEDIUM = 'medium', 'medium'
        LOW = 'low', 'low'
        UNKNOWN = 'unknown', 'unknown'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Nullable so we can backfill safely; uniqueness enforced for non-null values.
    case_code = models.CharField(max_length=32, unique=True, null=True, blank=True, default=None)
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

    @staticmethod
    def _format_case_code(n: int, year: int) -> str:
        return f'CSE-{n:04d}-{year}'

    def _compute_case_code_year(self) -> int:
        if self.date_submitted:
            try:
                return int(self.date_submitted.year)
            except Exception:
                pass
        return int(timezone.now().year)

    def ensure_case_code(self):
        if self.case_code:
            return
        year = self._compute_case_code_year()
        with transaction.atomic():
            seq, _ = CaseCodeSequence.objects.select_for_update().get_or_create(year=year)
            seq.last_number = int(seq.last_number or 0) + 1
            seq.save(update_fields=['last_number'])
            self.case_code = self._format_case_code(seq.last_number, year)

    def save(self, *args, **kwargs):
        if not self.case_code:
            self.ensure_case_code()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'Case {self.case_code or self.id}'


class ScoutingRecordCodeSequence(models.Model):
    """
    Tracks the last issued scouting record sequence number for a given year.

    Generates Record IDs like: REC-0001-2026
    """

    year = models.PositiveIntegerField(unique=True)
    last_number = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['year']

    def __str__(self):
        return f'{self.year}: {self.last_number}'


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
    record_code = models.CharField(max_length=32, unique=True, null=True, blank=True, default=None)
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

    @staticmethod
    def _format_record_code(n: int, year: int) -> str:
        return f'REC-{n:04d}-{year}'

    def _compute_record_code_year(self) -> int:
        if self.submitted_at:
            try:
                return int(self.submitted_at.year)
            except Exception:
                pass
        return int(timezone.now().year)

    def ensure_record_code(self):
        if self.record_code:
            return
        year = self._compute_record_code_year()
        with transaction.atomic():
            seq, _ = ScoutingRecordCodeSequence.objects.select_for_update().get_or_create(year=year)
            seq.last_number = int(seq.last_number or 0) + 1
            seq.save(update_fields=['last_number'])
            self.record_code = self._format_record_code(seq.last_number, year)

    def save(self, *args, **kwargs):
        if not self.record_code:
            self.ensure_record_code()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'ScoutingReport {self.record_code or self.id}'


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


class ProductionVolumeSubmission(models.Model):
    class SourceType(models.TextChoices):
        REGULATOR = 'regulator', 'regulator'
        EXPORTER = 'exporter', 'exporter'
        COOPERATIVE = 'cooperative', 'cooperative'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'draft'
        SUBMITTED = 'submitted', 'submitted'
        APPROVED = 'approved', 'approved'
        REJECTED = 'rejected', 'rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()  # 1-12

    county = models.CharField(max_length=128, blank=True, default='')
    sub_county = models.CharField(max_length=128, blank=True, default='')
    ward = models.CharField(max_length=128, blank=True, default='')
    village = models.CharField(max_length=128, blank=True, default='')

    tonnage_mt = models.DecimalField(max_digits=12, decimal_places=2)

    source_type = models.CharField(max_length=16, choices=SourceType.choices)
    source_entity = models.ForeignKey(
        'accounts.Entity',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='production_volume_submissions',
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='production_volume_submissions',
    )

    status = models.CharField(max_length=16, choices=Status.choices, default=Status.SUBMITTED)
    notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', '-month', '-updated_at']
        indexes = [
            models.Index(fields=['-year', '-month']),
            models.Index(fields=['county', 'ward']),
            models.Index(fields=['source_type']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        where = ' / '.join([x for x in [self.county, self.ward, self.village] if x])
        return f'ProductionVolume {self.year}-{self.month:02d} {where} ({self.tonnage_mt}mt)'


class BroadcastCampaign(models.Model):
    class Status(models.TextChoices):
        QUEUED = 'queued', 'queued'
        SENDING = 'sending', 'sending'
        COMPLETED = 'completed', 'completed'
        FAILED = 'failed', 'failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    county = models.CharField(max_length=128, blank=True, default='')
    ward = models.CharField(max_length=128, blank=True, default='')
    village = models.CharField(max_length=128, blank=True, default='')
    message = models.TextField()

    status = models.CharField(max_length=16, choices=Status.choices, default=Status.QUEUED)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='broadcast_campaigns',
    )
    total_recipients = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        where = ' / '.join([x for x in [self.county, self.ward, self.village] if x]) or 'All'
        return f'Broadcast {where} ({self.status})'


class BroadcastRecipient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(BroadcastCampaign, on_delete=models.CASCADE, related_name='recipients')
    farmer = models.ForeignKey('api.FarmerProfile', null=True, blank=True, on_delete=models.SET_NULL, related_name='broadcast_deliveries')
    phone_number = models.CharField(max_length=32)
    status = models.CharField(max_length=16, blank=True, default='queued')
    error = models.TextField(blank=True, default='')
    provider_response = models.JSONField(default=dict, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-sent_at', '-id']
        indexes = [
            models.Index(fields=['campaign', 'status']),
            models.Index(fields=['phone_number']),
        ]
