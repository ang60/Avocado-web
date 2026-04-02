import requests
from django.conf import settings

def send_advanta_sms(phone_number, message):
    """
    Sends an SMS via Advanta Bulk SMS API.
    API documentation: https://advanta.africa/bulk-sms-api
    """
    url = "https://quicksms.advantasms.com/api/services/sendsms/"
    
    # Cleaning the phone number if it contains '+'
    if phone_number.startswith('+'):
        phone_number = phone_number[1:]
    
    payload = {
        'apikey': settings.ADVANTA_API_KEY,
        'partnerID': settings.ADVANTA_PARTNER_ID,
        'message': message,
        'shortcode': settings.ADVANTA_SHORT_CODE,
        'mobile': phone_number,
    }
    
    try:
        response = requests.get(url, params=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"Failed to send SMS via Advanta: {str(e)}")
