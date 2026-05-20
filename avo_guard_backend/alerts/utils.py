import logging

from accounts.sms_utils import send_advanta_sms

from .models import Alert

logger = logging.getLogger(__name__)


def create_alert(farmer, title, message, send_sms=True):
    alert = Alert.objects.create(
        farmer=farmer,
        title=title,
        message=message,
    )

    if send_sms:
        try:
            sms_text = f"{title}: {message}"
            send_advanta_sms(farmer.phone_number, sms_text)
        except Exception as e:
            logger.error("Failed to send alert SMS: %s", str(e))

    return alert

