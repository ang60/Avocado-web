"""
Map Android / mobile JSON scouting payloads into pest_scouting.WeeklyRecord rows.

The app sends nested trap_use, pests_observed[{name, number_per_trap}], plain-text
disease names, etc. We normalize into model choice fields where possible and keep
the full body in raw_payload.
"""

from __future__ import annotations

import re
import uuid
from decimal import Decimal, InvalidOperation
from typing import Any

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.dateparse import parse_date

from .models import FarmBlock, WeeklyRecord

User = get_user_model()


def _norm_key(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '', (s or '').lower())


def _match_choice_list(raw_items: list[Any], choices: tuple) -> list[str]:
    """Map free-text items to WeeklyRecord choice values (emoji-prefixed)."""
    keys = [c for c, _ in choices]
    out: list[str] = []
    for item in raw_items or []:
        if isinstance(item, dict):
            label = str(item.get('name') or item.get('label') or '').strip()
        else:
            label = str(item).strip()
        if not label:
            continue
        nk = _norm_key(label)
        matched = None
        for choice in keys:
            base = re.sub(r'[^\w\s]', '', choice).strip().lower()
            if nk in _norm_key(choice) or _norm_key(choice).startswith(nk) or nk in base.replace(' ', ''):
                matched = choice
                break
            if label.lower() in choice.lower() or base and nk in _norm_key(base):
                matched = choice
                break
        if matched and matched not in out:
            out.append(matched)
    return out


def _match_single_choice(text: str | None, choices: tuple) -> str | None:
    if not text:
        return None
    t = str(text).strip()
    keys = [c for c, _ in choices]
    if t in keys:
        return t
    nt = _norm_key(t)
    for choice in keys:
        if nt == _norm_key(choice) or nt in _norm_key(choice):
            return choice
    lowered = {c.lower(): c for c in keys}
    return lowered.get(t.lower())


def _beneficial_from_strings(items: list[str]) -> list[str]:
    hints = (
        ('bee', '🐝 Bees'),
        ('ladybird', '🐞 Ladybirds'),
        ('ladybug', '🐞 Ladybirds'),
        ('lacewing', '🪰 Lacewings'),
        ('mite', '🕷️ Predatory mites'),
    )
    out: list[str] = []
    for raw in items or []:
        s = str(raw).strip()
        if not s:
            continue
        nk = _norm_key(s)
        hit = None
        for needle, choice in hints:
            if needle in nk:
                hit = choice
                break
        if not hit:
            hit = _match_single_choice(s, WeeklyRecord.BENEFICIAL_INSECT_CHOICES)
        if hit and hit not in out:
            out.append(hit)
    return out


def _actions_from_list(items: list[Any]) -> list[str]:
    out: list[str] = []
    for x in items or []:
        s = str(x).strip() if not isinstance(x, dict) else str(x.get('name') or x).strip()
        if not s:
            continue
        m = _match_single_choice(s, WeeklyRecord.ACTION_TAKEN_CHOICES)
        if m and m not in out:
            out.append(m)
        elif s and s not in out:
            out.append(s[:100])
    return out


def _outcome_from_mobile(text: str | None) -> str:
    if not text:
        return 'Follow-up needed'
    m = _match_single_choice(text, WeeklyRecord.OUTCOME_CHOICES)
    return m or 'Follow-up needed'


def _trap_aggregate(trap_use: list[Any]) -> tuple[str, int, Decimal]:
    if not trap_use:
        return 'Unknown trap', 0, Decimal('0')
    names: list[str] = []
    total_traps = 0
    weighted = Decimal('0')
    count = 0
    for row in trap_use:
        if not isinstance(row, dict):
            continue
        tname = str(row.get('type_of_trap') or '').strip() or 'Trap'
        names.append(tname)
        n = int(row.get('number_of_trap') or row.get('number_of_traps') or 0)
        total_traps += max(n, 0)
        try:
            avg = Decimal(str(row.get('average_no_of_pest_per_trap') or '0'))
        except (InvalidOperation, TypeError):
            avg = Decimal('0')
        if n > 0:
            weighted += avg * n
            count += n
    label = ', '.join(names[:3]) if names else 'Unknown trap'
    if len(label) > 100:
        label = label[:97] + '...'
    pests_per = (weighted / count) if count else Decimal('0')
    return label, max(total_traps, 0), pests_per


def _parse_decimal(val: Any, default: str = '0') -> Decimal | None:
    if val is None or val == '':
        return None
    try:
        return Decimal(str(val).strip())
    except InvalidOperation:
        try:
            return Decimal(default)
        except InvalidOperation:
            return None


def _parse_date_field(val: Any) -> str:
    if not val:
        return timezone.localdate().isoformat()
    if isinstance(val, str):
        d = parse_date(val[:10])
        if d:
            return d.isoformat()
    return timezone.localdate().isoformat()


def resolve_block_for_android(user: User, data: dict) -> FarmBlock:
    raw_block = data.get('block')
    if raw_block is None:
        raise ValueError('Missing block')

    # UUID of pest_scouting.FarmBlock
    if isinstance(raw_block, str):
        s = raw_block.strip()
        try:
            uid = uuid.UUID(s)
            block = FarmBlock.objects.filter(id=uid, farmer=user).first()
            if block:
                return block
        except (ValueError, TypeError):
            pass
        # composite description: try to find block_name substring
        blocks = list(FarmBlock.objects.filter(farmer=user).order_by('-timestamp'))
        for b in blocks:
            if b.block_name and b.block_name.lower() in s.lower():
                return b
        if blocks:
            return blocks[0]
        raise ValueError(f'No farm block could be resolved from: {s[:80]}')

    raise ValueError('Invalid block reference')


def build_weekly_record_kwargs(user: User, data: dict) -> dict:
    block = resolve_block_for_android(user, data)

    trap_use = data.get('trap_use') if isinstance(data.get('trap_use'), list) else []
    type_of_trap, number_of_trap, pests_per_trap = _trap_aggregate(trap_use)

    pests_raw = data.get('pests_observed')
    if isinstance(pests_raw, list) and pests_raw and isinstance(pests_raw[0], dict):
        pest_list = _match_choice_list(pests_raw, WeeklyRecord.PEST_CHOICES)
    elif isinstance(pests_raw, list):
        pest_list = _match_choice_list([{'name': x} for x in pests_raw], WeeklyRecord.PEST_CHOICES)
    else:
        pest_list = []

    any_pests = 'Yes' if str(data.get('any_pests_observed', '')).strip().lower() == 'yes' or pest_list else 'No'
    if any_pests == 'No' and pest_list:
        any_pests = 'Yes'

    ben_list = data.get('beneficial_insects_observed')
    if isinstance(ben_list, list):
        beneficials = _beneficial_from_strings([str(x) for x in ben_list])
    else:
        beneficials = []

    diseases_raw = data.get('disease')
    if isinstance(diseases_raw, list):
        disease_list = _match_choice_list([{'name': x} for x in diseases_raw], WeeklyRecord.DISEASE_CHOICES)
    else:
        disease_list = []

    any_dis = str(data.get('any_diseases_observed', '')).strip().lower() == 'yes' or bool(disease_list)
    any_diseases = 'Yes' if any_dis else 'No'

    dparts = data.get('disease_plant_part')
    if isinstance(dparts, list):
        disease_parts = [_match_single_choice(str(x), WeeklyRecord.PLANT_PART_CHOICES) for x in dparts]
        disease_parts = [x for x in disease_parts if x]
    else:
        disease_parts = []

    actions_raw = data.get('actions_taken')
    if isinstance(actions_raw, list):
        actions_list = _actions_from_list(actions_raw)
    else:
        actions_list = _actions_from_list([actions_raw] if actions_raw else [])

    outcome_str = _outcome_from_mobile(str(data.get('outcome') or '').strip())

    variety = str(data.get('variety') or 'Hass').strip()[:100] or 'Hass'
    start_date = _parse_date_field(data.get('start_date'))
    end_date = _parse_date_field(data.get('end_date'))
    location = str(data.get('location') or user.county or block.block_name or '').strip()[:255]

    gps_lat = _parse_decimal(data.get('gps_latitude'))
    gps_lng = _parse_decimal(data.get('gps_longitude'))

    photo_count = 0
    for key in (
        'dont_know_variety_photo',
        'dont_know_trap_photo',
        'other_trap_photo',
        'dont_know_pest_photo',
        'dont_know_beneficial_insects_observed_photo',
    ):
        v = data.get(key)
        if isinstance(v, str) and v.startswith('http'):
            photo_count += 1

    other_challenges = data.get('other_production_challenges')
    if isinstance(other_challenges, str):
        other_challenges = [x.strip() for x in other_challenges.split(',') if x.strip()]
    elif not isinstance(other_challenges, list):
        other_challenges = None

    return {
        'farmer': user,
        'block': block,
        'variety': variety,
        'trap_use': trap_use if isinstance(trap_use, list) else [],
        'any_pests_observed': any_pests,
        'pests_observed': pest_list or None,
        'beneficial_insects_observed': beneficials or None,
        'other_production_challenges': other_challenges,
        'any_diseases_observed': any_diseases,
        'disease': disease_list or None,
        'disease_plant_part': disease_parts or None,
        'disease_crop_stage': _match_single_choice(str(data.get('disease_crop_stage') or ''), WeeklyRecord.CROP_STAGE_CHOICES),
        'disease_detection_method': _match_single_choice(str(data.get('disease_detection_method') or ''), WeeklyRecord.DETECTION_METHOD_CHOICES),
        'additional_notes': (str(data.get('additional_notes') or '').strip() or None),
        'actions_taken': actions_list or ['No action taken'],
        'outcome': outcome_str[:500],
        'remarks': (str(data.get('remarks') or '').strip() or None),
        'start_date': start_date,
        'end_date': end_date,
        'location': location,
        'gps_latitude': gps_lat,
        'gps_longitude': gps_lng,
        'raw_payload': data,
    }


def is_android_scouting_payload(data: Any) -> bool:
    """Detect rich mobile JSON vs flat DRF weekly-record create."""
    if not isinstance(data, dict):
        return False
    tu = data.get('trap_use')
    if isinstance(tu, list) and tu and isinstance(tu[0], dict):
        return True
    po = data.get('pests_observed')
    if isinstance(po, list) and po and isinstance(po[0], dict):
        return True
    return False


def maybe_create_pending_review(record: WeeklyRecord, data: dict) -> None:
    """When the app marks the submission as new / not reviewed, open triage."""
    from .models import ScoutingReview

    reviewed = data.get('reviewed')
    status_m = str(data.get('status') or '').strip().lower()

    open_triage = False
    if status_m in ('new', 'pending'):
        open_triage = True
    if reviewed is False:
        open_triage = True
    if reviewed is True:
        open_triage = False

    if not open_triage:
        return

    existing = ScoutingReview.objects.filter(record=record).first()
    if existing and existing.review_status == 'confirmed':
        return

    from .weekly_helpers import disease_list as _disease_list, pests_observed_list as _pests_list

    label_parts: list[str] = []
    if record.any_pests_observed == 'Yes':
        label_parts.extend(_pests_list(record))
    if record.any_diseases_observed == 'Yes':
        label_parts.extend(_disease_list(record))
    identified = ', '.join(dict.fromkeys(label_parts))[:255] or 'Pending triage'

    ScoutingReview.objects.update_or_create(
        record=record,
        defaults={
            'identified_label': identified,
            'review_status': 'pending',
            'review_notes': (str(data.get('review_notes') or '').strip() or None),
            'pushed_to_farmer': False,
            'training_tagged': False,
        },
    )
