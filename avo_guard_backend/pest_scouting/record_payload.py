"""Build a mobile-shaped payload dict from WeeklyRecord model columns + raw_payload."""

from __future__ import annotations

import json
from typing import Any

from .models import Farm, WeeklyRecord
from .weekly_helpers import (
    actions_taken_list,
    beneficial_insects_list,
    disease_list,
    outcome_list,
    pests_observed_list,
)


def _as_list(value: Any) -> list:
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value.strip():
        if value.strip().startswith('['):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass
        return [value.strip()]
    return []


def weekly_record_display_payload(record: WeeklyRecord) -> dict:
    """
    Unified JSON for dashboards and the SPA: merge stored raw_payload with
    live model fields (multipart uploads often only populate model columns).
    """
    raw: dict = dict(record.raw_payload) if isinstance(record.raw_payload, dict) else {}

    def set_if_missing(key: str, value: Any) -> None:
        if value is None or value == '' or value == []:
            return
        if key not in raw or raw[key] in (None, '', [], {}):
            raw[key] = value

    set_if_missing('variety', record.variety)
    set_if_missing('location', record.location)
    set_if_missing('any_pests_observed', record.any_pests_observed)
    set_if_missing('any_diseases_observed', record.any_diseases_observed)
    set_if_missing('outcome', record.outcome or (outcome_list(record)[0] if outcome_list(record) else ''))
    set_if_missing('additional_notes', record.additional_notes)
    set_if_missing('remarks', record.remarks)
    set_if_missing('start_date', record.start_date.isoformat() if record.start_date else None)
    set_if_missing('end_date', record.end_date.isoformat() if record.end_date else None)

    if record.gps_latitude is not None:
        set_if_missing('gps_latitude', str(record.gps_latitude))
    if record.gps_longitude is not None:
        set_if_missing('gps_longitude', str(record.gps_longitude))

    if record.trap_use:
        set_if_missing('trap_use', record.trap_use)

    pests = pests_observed_list(record)
    if pests:
        set_if_missing('pests_observed', record.pests_observed if isinstance(record.pests_observed, list) else pests)

    diseases = disease_list(record)
    if diseases:
        set_if_missing('disease', record.disease if isinstance(record.disease, list) else diseases)

    ben = beneficial_insects_list(record)
    if ben:
        set_if_missing(
            'beneficial_insects_observed',
            record.beneficial_insects_observed if isinstance(record.beneficial_insects_observed, list) else ben,
        )

    actions = actions_taken_list(record)
    if actions:
        set_if_missing('actions_taken', record.actions_taken if isinstance(record.actions_taken, list) else actions)

    if record.other_production_challenges:
        set_if_missing('other_production_challenges', record.other_production_challenges)

    if record.disease_plant_part:
        set_if_missing('disease_plant_part', record.disease_plant_part)
    if record.disease_crop_stage:
        set_if_missing('disease_crop_stage', record.disease_crop_stage)
    if record.disease_detection_method:
        set_if_missing('disease_detection_method', record.disease_detection_method)

    block = getattr(record, 'block', None)
    if block:
        set_if_missing('block_name', block.block_name)
        farm = getattr(block, 'farm_name', None)
        if isinstance(farm, Farm):
            set_if_missing('farm_name', farm.farm_name)
            set_if_missing('number_of_blocks', farm.number_of_blocks)
            set_if_missing('farm_size', farm.farm_size)
        elif farm:
            set_if_missing('farm_name', str(farm))

    farmer = getattr(record, 'farmer', None)
    if farmer:
        name = f'{getattr(farmer, "first_name", "")} {getattr(farmer, "last_name", "")}'.strip()
        if name:
            set_if_missing('farmer_name', name)
        if getattr(farmer, 'county', None):
            set_if_missing('county', farmer.county)

    return raw
