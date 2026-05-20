import logging

import requests
from django.conf import settings
from requests import RequestException

logger = logging.getLogger(__name__)


class AdvantaSMSConfigurationError(Exception):
    """Missing ADVANTA_* settings."""


class AdvantaSMSDeliveryError(Exception):
    """Upstream SMS gateway failed (HTTP/network)."""


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

    if not payload.get('apikey') or not payload.get('partnerID') or not payload.get('shortcode'):
        raise AdvantaSMSConfigurationError(
            'Advanta SMS is not configured (missing ADVANTA_API_KEY / ADVANTA_PARTNER_ID / ADVANTA_SHORT_CODE).'
        )

    try:
        response = requests.get(url, params=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        status = e.response.status_code if e.response is not None else None
        logger.warning('Advanta SMS HTTP error status=%s (mobile suffix …%s)', status, phone_number[-4:])
        raise AdvantaSMSDeliveryError(f'Advanta returned HTTP {status}') from None
    except RequestException as e:
        logger.warning('Advanta SMS network error: %s', type(e).__name__)
        raise AdvantaSMSDeliveryError('Advanta SMS network error') from None
