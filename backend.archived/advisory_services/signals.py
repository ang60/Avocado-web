import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.sms_utils import send_advanta_sms
from pest_scouting.models import WeeklyRecord

from .models import Advisory

logger = logging.getLogger(__name__)


@receiver(post_save, sender=WeeklyRecord)
def create_advisory_on_weekly_record(sender, instance, created, **kwargs):
    if not created:
        return

    pest = getattr(instance, 'pests_observed', None) or ''
    disease = getattr(instance, 'disease', None) or ''
    block = getattr(instance, 'block', None)
    block_name = getattr(block, 'block_name', None) or 'Unknown block'

    message = f"Advisory for {block_name}:\n"

    advice = ""
    disease_lower = disease.lower() if isinstance(disease, str) else ""
    pest_lower = pest.lower() if isinstance(pest, str) else ""

    if disease and ('spot' in disease_lower or 'leaf spot' in disease_lower):
        advice = (
            "Spray copper medicine on sick leaves. Remove and throw away the bad leaves. "
            "Cut some branches so air can flow better. Check trees every week for 4 weeks."
        )
    elif pest and 'fruit fly' in pest_lower:
        advice = "Set fly traps. Remove fallen fruit. Use approved spray."
    else:
        advice = "Monitor your farm regularly and follow good agricultural practices."

    advisory_message = f"{message}{advice}"

    Advisory.objects.create(
        weekly_record=instance,
        farmer=instance.farmer,
        advisory_message=advisory_message,
    )

    try:
        name = instance.farmer.first_name or 'Farmer'
        sms_message = f"Hello {name}, a new advisory has been issued for {block_name}: {advice}"
        send_advanta_sms(instance.farmer.phone_number, sms_message)
    except Exception as e:
        logger.error("Failed to send advisory SMS: %s", str(e))

