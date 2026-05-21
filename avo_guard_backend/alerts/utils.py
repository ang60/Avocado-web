from .models import Alert
from accounts.sms_utils import send_advanta_sms
from accounts.models import FCMDevice
from firebase_admin import messaging
import logging

logger = logging.getLogger(__name__)

def send_fcm_notification(user, title, message, data=None):
    """
    Sends a push notification to all active devices of a user.
    """
    devices = FCMDevice.objects.filter(user=user, is_active=True)
    if not devices.exists():
        logger.info(f"No active FCM devices found for user {user.phone_number}")
        return

    registration_ids = list(devices.values_list('registration_id', flat=True))
    
    # Construct the message
    notification = messaging.Notification(
        title=title,
        body=message
    )
    
    multicast_message = messaging.MulticastMessage(
        notification=notification,
        data=data,
        tokens=registration_ids
    )

    try:
        response = messaging.send_multicast(multicast_message)
        logger.info(f"Successfully sent {response.success_count} FCM messages for user {user.phone_number}")
        
        # Handle failed tokens (e.g., expired or invalid)
        if response.failure_count > 0:
            for idx, res in enumerate(response.responses):
                if not res.success:
                    # If the token is invalid or not registered, deactivate it
                    if res.exception.code in ['registration-token-not-registered', 'invalid-registration-token']:
                        token = registration_ids[idx]
                        FCMDevice.objects.filter(registration_id=token).update(is_active=False)
                        logger.info(f"Deactivated invalid FCM token: {token}")

    except Exception as e:
        logger.error(f"Error sending FCM multicast message: {str(e)}")

def create_alert(farmer, title, message, send_sms=True, send_fcm=True, data=None):
    alert = Alert.objects.create(
        farmer=farmer,
        title=title,
        message=message
    )
    
    if send_sms:
        try:
            # We can use a prefix or just the message
            sms_text = f"{title}: {message}"
            send_advanta_sms(farmer.phone_number, sms_text)
        except Exception as e:
            logger.error(f"Failed to send alert SMS: {str(e)}")
            
    if send_fcm:
        try:
            send_fcm_notification(farmer, title, message, data=data)
        except Exception as e:
            logger.error(f"Failed to send alert FCM: {str(e)}")

    return alert
