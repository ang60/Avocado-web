"""Normalize weekly record list fields across legacy flat columns and JSON payloads."""

from __future__ import annotations

from typing import Any


def _items_as_strings(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            if isinstance(item, dict):
                label = str(item.get('name') or item.get('label') or '').strip()
                if label:
                    out.append(label)
            elif item is not None:
                text = str(item).strip()
                if text:
                    out.append(text)
        return out
    if isinstance(value, str):
        text = value.strip()
        return [text] if text else []
    return [str(value).strip()] if str(value).strip() else []


def pests_observed_list(weekly) -> list[str]:
    legacy = getattr(weekly, 'pests_observed_list', None)
    if legacy:
        return [str(x).strip() for x in legacy if str(x).strip()]
    return _items_as_strings(weekly.pests_observed)


def disease_list(weekly) -> list[str]:
    legacy = getattr(weekly, 'disease_list', None)
    if legacy:
        return [str(x).strip() for x in legacy if str(x).strip()]
    return _items_as_strings(weekly.disease)


def beneficial_insects_list(weekly) -> list[str]:
    legacy = getattr(weekly, 'beneficial_insects_observed_list', None)
    if legacy:
        return [str(x).strip() for x in legacy if str(x).strip()]
    return _items_as_strings(weekly.beneficial_insects_observed)


def actions_taken_list(weekly) -> list[str]:
    legacy = getattr(weekly, 'actions_taken_list', None)
    if legacy:
        return [str(x).strip() for x in legacy if str(x).strip()]
    return _items_as_strings(weekly.actions_taken)


def outcome_list(weekly) -> list[str]:
    legacy = getattr(weekly, 'outcome_list', None)
    if legacy:
        return [str(x).strip() for x in legacy if str(x).strip()]
    outcome = getattr(weekly, 'outcome', None)
    if outcome:
        return [str(outcome).strip()]
    return []
