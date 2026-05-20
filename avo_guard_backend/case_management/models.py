import uuid
from django.db import models, transaction
from django.conf import settings
from django.utils import timezone


class CaseCodeSequence(models.Model):
    """
    Tracks last issued case sequence number per year.

    Generates codes like: CSE-0001-2026
    """

    year = models.PositiveIntegerField(unique=True)
    last_number = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['year']

    def __str__(self):
        return f'{self.year}: {self.last_number}'


class Case(models.Model):
    SEVERITY_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
        ('unknown', 'Unknown'),
    )
    STATUS_CHOICES = (
        ('new', 'New'),
        ('under_review', 'Under Review'),
        ('verified', 'Verified'),
        ('closed', 'Closed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    # Nullable to allow safe backfill before uniqueness matters.
    case_code = models.CharField(max_length=32, unique=True, null=True, blank=True, default=None)
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    diagnosis = models.TextField(blank=True, null=True)
    recommended_actions = models.JSONField(default=list, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    assigned_agronomist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='case_management_assigned_cases'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def _format_case_code(n: int, year: int) -> str:
        return f'CSE-{n:04d}-{year}'

    def _compute_case_code_year(self) -> int:
        # Prefer created_at year if available.
        if self.created_at:
            try:
                return int(self.created_at.year)
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
        return f"{self.case_title} - {self.severity} ({self.case_code or self.id})"

