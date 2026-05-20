from datetime import timedelta

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from advisory_services.models import Advisory
from pest_scouting.models import WeeklyRecord, FarmBlock

from .models import Alert
from .utils import create_alert


@receiver(post_save, sender=Advisory)
def notify_advisory_ready(sender, instance, created, **kwargs):
    if not created:
        return

    title = "✅ Advisory Ready"
    subject = "your farm"
    if instance.weekly_record:
        if instance.weekly_record.disease:
            subject = instance.weekly_record.disease
        elif instance.weekly_record.pests_observed:
            subject = instance.weekly_record.pests_observed

    message = f"Response on {subject}"
    create_alert(instance.farmer, title, message, send_sms=False)


@receiver(post_save, sender=WeeklyRecord)
def notify_high_severity(sender, instance, created, **kwargs):
    if not created:
        return

    is_urgent = False
    reason = ""

    if instance.number_of_trees_affected >= 10:
        is_urgent = True
        reason = "High number of affected trees"
    elif float(instance.pests_per_trap or 0) >= 10:
        is_urgent = True
        reason = "High pest count per trap"

    if is_urgent:
        title = "🔴 Urgent: High Severity"
        message = f"{instance.block.block_name} needs action. {reason}."
        create_alert(instance.farmer, title, message)

    farmer = instance.farmer
    all_blocks = FarmBlock.objects.filter(farmer=farmer)

    today = timezone.now().date()
    start_of_week = today - timedelta(days=today.weekday())

    for block in all_blocks:
        if block == instance.block:
            continue

        has_record = WeeklyRecord.objects.filter(block=block, timestamp__date__gte=start_of_week).exists()
        if has_record:
            continue

        title = "Weekly Record Due"
        message = f"{block.block_name} not yet recorded"

        if not Alert.objects.filter(
            farmer=farmer,
            title=title,
            message=message,
            timestamp__date__gte=start_of_week,
        ).exists():
            create_alert(farmer, title, message, send_sms=True)

