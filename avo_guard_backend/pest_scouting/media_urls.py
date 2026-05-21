"""Build browser-ready URLs for weekly scouting photos (uploaded files + raw JSON)."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from django.conf import settings
from django.core.files.storage import default_storage

from .models import WeeklyRecord

_RAW_PHOTO_KEYS = (
    'dont_know_variety_photo',
    'dont_know_trap_photo',
    'other_trap_photo',
    'dont_know_pest_photo',
    'dont_know_beneficial_insects_observed_photo',
)

_WEEKLY_IMAGE_FIELD_NAMES = (
    'dont_know_variety_photo',
    'dont_know_trap_photo',
    'other_trap_photo',
    'dont_know_pest_photo',
    'dont_know_beneficial_insects_observed_photo',
    'overall_image',
)


def _looks_like_media_url(value: str) -> bool:
    s = value.strip()
    if not s:
        return False
    if s.startswith(('http://', 'https://', '/media/', 'media/')):
        return True
    low = s.split('?')[0].lower()
    return low.endswith(
        ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.m4a', '.mp3', '.aac', '.wav', '.ogg')
    )


def _media_object_name(url: str) -> str | None:
    """Object key inside default storage (without location prefix)."""
    s = url.strip()
    if not s:
        return None
    path = s
    if s.startswith(('http://', 'https://')):
        path = urlparse(s).path or ''
    path = path.split('?', 1)[0]
    media_url = settings.MEDIA_URL or '/media/'
    if not media_url.startswith('/'):
        media_url = f'/{media_url}'
    if path.startswith(media_url):
        name = path[len(media_url) :].lstrip('/')
    elif path.startswith('/media/'):
        name = path[len('/media/') :].lstrip('/')
    elif path.startswith('media/'):
        name = path[len('media/') :].lstrip('/')
    else:
        return None
    if name.startswith('mediafiles/'):
        name = name[len('mediafiles/') :]
    return name or None


def _storage_public_url(url: str) -> str | None:
    name = _media_object_name(url)
    if not name:
        return None
    try:
        return default_storage.url(name)
    except Exception:
        return None


def _absolute_url(url: str, request: Any | None) -> str:
    if not url:
        return url
    stored = _storage_public_url(url)
    if stored:
        return stored
    if url.startswith(('http://', 'https://')):
        host = (urlparse(url).hostname or '').lower()
        if host in ('localhost', '127.0.0.1') and '/media/' in url:
            retry = _storage_public_url(url)
            if retry:
                return retry
        return url
    if url.startswith(('/media/', 'media/')):
        retry = _storage_public_url(url)
        if retry:
            return retry
    if request is not None:
        try:
            built = request.build_absolute_uri(url)
            retry = _storage_public_url(built)
            return retry or built
        except Exception:
            pass
    if url.startswith('/'):
        return url
    return f'/{url.lstrip("/")}'


def _file_field_url(field_file: Any, request: Any | None) -> str | None:
    if not field_file:
        return None
    name = getattr(field_file, 'name', None)
    if not name:
        return None
    try:
        url = field_file.url
    except Exception:
        return None
    return _absolute_url(url, request)


def _urls_from_raw_payload(raw: dict, request: Any | None) -> list[str]:
    urls: list[str] = []
    for key in _RAW_PHOTO_KEYS:
        v = raw.get(key)
        if isinstance(v, str) and _looks_like_media_url(v):
            urls.append(_absolute_url(v.strip(), request))
    for key, v in raw.items():
        if not isinstance(key, str) or 'photo' not in key.lower():
            continue
        if key in _RAW_PHOTO_KEYS:
            continue
        if isinstance(v, str) and _looks_like_media_url(v):
            urls.append(_absolute_url(v.strip(), request))
    tu = raw.get('trap_use')
    if isinstance(tu, list):
        for row in tu:
            if isinstance(row, dict):
                p = row.get('photo')
                if isinstance(p, str) and _looks_like_media_url(p):
                    urls.append(_absolute_url(p.strip(), request))
    po = raw.get('pests_observed')
    if isinstance(po, list):
        for row in po:
            if isinstance(row, dict):
                p = row.get('photo')
                if isinstance(p, str) and _looks_like_media_url(p):
                    urls.append(_absolute_url(p.strip(), request))
    return urls


def weekly_record_media_urls(record: WeeklyRecord, request: Any | None = None) -> list[str]:
    """All image/audio URLs for a weekly record (stored files first, then raw payload)."""
    urls: list[str] = []
    for field_name in _WEEKLY_IMAGE_FIELD_NAMES:
        u = _file_field_url(getattr(record, field_name, None), request)
        if u:
            urls.append(u)
    u = _file_field_url(getattr(record, 'voice_note', None), request)
    if u:
        urls.append(u)
    raw = record.raw_payload if isinstance(record.raw_payload, dict) else {}
    if raw:
        uploaded = raw.get('uploaded_media_urls')
        if isinstance(uploaded, list):
            for u in uploaded:
                if isinstance(u, str) and u.strip():
                    urls.append(_absolute_url(u.strip(), request))
        urls.extend(_urls_from_raw_payload(raw, request))
    seen: set[str] = set()
    out: list[str] = []
    for u in urls:
        if u and u not in seen:
            seen.add(u)
            out.append(u)
    return out


def weekly_record_image_urls(record: WeeklyRecord, request: Any | None = None) -> list[str]:
    audio_ext = ('.m4a', '.mp3', '.aac', '.wav', '.ogg')
    images: list[str] = []
    for u in weekly_record_media_urls(record, request):
        path = u.split('?')[0].lower()
        if path.endswith(audio_ext) or 'voice_note' in path.lower():
            continue
        images.append(u)
    return images
