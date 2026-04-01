from __future__ import annotations

import json
from dataclasses import dataclass

import requests
from django.conf import settings


@dataclass(frozen=True)
class SmsSendResult:
    ok: bool
    status_code: int | None = None
    response_text: str | None = None


def _mask_phone(phone: str) -> str:
    p = phone.strip()
    if len(p) <= 6:
        return '***'
    return f'{p[:3]}***{p[-3:]}'


def send_sms(*, phone_number: str, message: str) -> SmsSendResult:
    """
    Sends SMS using QuickSMS Advanta endpoint (if configured).
    Reads credentials from Django settings:
      SMS_API_URL, SMS_API_KEY, SMS_PARTNER_ID, SMS_SHORTCODE
    """
    url = getattr(settings, 'SMS_API_URL', '') or ''
    api_key = getattr(settings, 'SMS_API_KEY', '') or ''
    partner_id = getattr(settings, 'SMS_PARTNER_ID', '') or ''
    shortcode = getattr(settings, 'SMS_SHORTCODE', '') or ''

    if not (url and api_key and partner_id and shortcode):
        # Not configured: treat as no-op (still allow OTP flow in dev)
        return SmsSendResult(ok=False, status_code=None, response_text='SMS not configured')

    payload = {
        'apikey': api_key,
        'partnerID': str(partner_id),
        'shortcode': str(shortcode),
        'mobile': phone_number,
        'message': message,
    }

    try:
        res = requests.post(url, data=payload, timeout=12)
        ok = 200 <= res.status_code < 300
        # Keep response text for troubleshooting, but don't leak secrets
        txt = res.text[:2000] if res.text else ''
        if not ok:
            txt = f'Failed for {_mask_phone(phone_number)}: {txt}'
        return SmsSendResult(ok=ok, status_code=res.status_code, response_text=txt)
    except Exception as e:
        return SmsSendResult(ok=False, status_code=None, response_text=f'Exception for {_mask_phone(phone_number)}: {e}')

