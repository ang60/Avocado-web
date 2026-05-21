from django.db.models.signals import post_save
from django.dispatch import receiver
from pest_scouting.models import WeeklyRecord
from .models import Advisory
from accounts.sms_utils import send_advanta_sms
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=WeeklyRecord)
def create_advisory_on_weekly_record(sender, instance, created, **kwargs):
    if created:
        # Generate advisory message
        pest_str = instance.get_formatted_pests()
        disease_str = instance.get_formatted_diseases()
        
        farm_name = instance.block.farm_name.farm_name if instance.block.farm_name else "Unknown Farm"
        block_name = instance.block.block_name
        
        message = f"Advisory for {farm_name} - {block_name}:\n"
        if disease_str:
            message += f"Diseases detected: {disease_str}\n"
        if pest_str:
            message += f"Pests detected: {pest_str}\n"
        
        advice = ""
        # Convert to lower for keyword matching
        disease_match = disease_str.lower()
        pest_match = pest_str.lower()
        
        if 'spot' in disease_match or 'leaf spots' in disease_match:
            advice = "Spray copper medicine on sick leaves. Remove and throw away the bad leaves. Cut some branches so air can flow better. Check trees every week for 4 weeks."
        elif 'fruit fly' in pest_match:
            advice = "Set fly traps. Remove fallen fruit. Use approved spray."
        else:
            advice = "Monitor your farm regularly and follow good agricultural practices."
        
        advisory_message = f"{message}\nAdvice: {advice}"
        
        # Create Advisory object
        advisory = Advisory.objects.create(
            weekly_record=instance,
            farmer=instance.farmer,
            advisory_message=advisory_message
        )
        
        # Send SMS notification
        try:
            sms_message = f"Hello {instance.farmer.first_name or 'Farmer'}, a new advisory has been issued for {farm_name} - {block_name}: {advice}"
            send_advanta_sms(instance.farmer.phone_number, sms_message)
        except Exception as e:
            logger.error(f"Failed to send advisory SMS: {str(e)}")
