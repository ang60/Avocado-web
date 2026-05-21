from django.db.models.signals import post_save
from django.dispatch import receiver
from advisory_services.models import Advisory
from pest_scouting.models import WeeklyRecord, FarmBlock
from .utils import create_alert
from django.utils import timezone
from datetime import timedelta

@receiver(post_save, sender=Advisory)
def notify_advisory_ready(sender, instance, created, **kwargs):
    if created:
        title = "✅ Advisory Ready"
        # Extract disease or pest from advisory message or linked record
        subject = "your farm"
        if instance.weekly_record:
            if instance.weekly_record.any_diseases_observed == 'Yes':
                subject = instance.weekly_record.get_formatted_diseases()
            elif instance.weekly_record.any_pests_observed == 'Yes':
                subject = instance.weekly_record.get_formatted_pests()
        
        if not subject:
            subject = "your farm"
            
        message = f"Response on {subject}"
        create_alert(instance.farmer, title, message)

@receiver(post_save, sender=WeeklyRecord)
def notify_high_severity(sender, instance, created, **kwargs):
    if created:
        # Define high severity logic
        is_urgent = False
        reason = ""
        
        # Check trap counts if available
        if instance.trap_use and isinstance(instance.trap_use, list):
            for trap in instance.trap_use:
                if isinstance(trap, dict) and trap.get('total_no_of_pests', 0) >= 10:
                    is_urgent = True
                    reason = "High total pest count"
                    break
            
        if is_urgent:
            title = "🔴 Urgent: High Severity"
            message = f"{instance.block.block_name} needs action. {reason}."
            create_alert(instance.farmer, title, message)

        # Logic for "Weekly Record Due" for other blocks
        farmer = instance.farmer
        all_blocks = FarmBlock.objects.filter(farmer=farmer)
        
        # Current week range (rough estimate)
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        
        for block in all_blocks:
            if block == instance.block:
                continue
            
            # Check if this block has a record this week
            has_record = WeeklyRecord.objects.filter(
                block=block, 
                timestamp__date__gte=start_of_week
            ).exists()
            
            if not has_record:
                title = "Weekly Record Due"
                message = f"{block.block_name} not yet recorded"
                
                # Avoid duplicate alerts for the same block in the same week
                from .models import Alert
                if not Alert.objects.filter(
                    farmer=farmer, 
                    title=title, 
                    message=message, 
                    timestamp__date__gte=start_of_week
                ).exists():
                    create_alert(farmer, title, message, send_sms=True)
