"""
County-level aggregates for HCDA (no farm-level PII in responses).
"""
from __future__ import annotations

from collections import defaultdict
from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from accounts.models import User
from pest_scouting.models import WeeklyRecord


def county_for_farmer_user(user: User) -> str:
    try:
        prof = user.farmer_profile
    except ObjectDoesNotExist:
        prof = None
    if prof:
        c = (prof.county or "").strip()
        if c:
            return c
    return (user.county or "").strip() or "Unknown"


def danger_level(*, max_pests_per_trap: Decimal, max_trees_affected: int, has_fcm: bool) -> str:
    if has_fcm or max_pests_per_trap >= Decimal("10") or max_trees_affected >= 15:
        return "high"
    if max_pests_per_trap >= Decimal("5") or max_trees_affected >= 10:
        return "elevated"
    if max_pests_per_trap >= Decimal("3") or max_trees_affected >= 6:
        return "watch"
    return "low"


def build_county_overview(*, window_days: int) -> dict:
    window_days = max(1, min(int(window_days or 30), 365))
    since = timezone.now() - timedelta(days=window_days)

    farmer_counts: dict[str, int] = defaultdict(int)
    farmers = User.objects.filter(role__role_name="Farmer", is_active=True).select_related(
        "role",
        "farmer_profile",
    )
    # farmer_profile is accessed per user — small N for demo; optimize with prefetch if needed
    for u in farmers:
        farmer_counts[county_for_farmer_user(u)] += 1

    total_farmers = sum(farmer_counts.values())

    records = (
        WeeklyRecord.objects.filter(timestamp__gte=since)
        .select_related("farmer")
        .only(
            "id",
            "farmer_id",
            "pests_observed",
            "disease",
            "pests_per_trap",
            "number_of_trees_affected",
            "any_pests_observed",
            "timestamp",
        )
    )

    county_record_count: dict[str, int] = defaultdict(int)
    county_farmer_ids: dict[str, set] = defaultdict(set)
    county_pest_counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    county_disease_counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    county_max_trap: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    county_max_trees: dict[str, int] = defaultdict(int)
    county_fcm: dict[str, bool] = defaultdict(bool)

    for rec in records:
        farmer = rec.farmer
        if not farmer:
            continue
        cty = county_for_farmer_user(farmer)
        county_record_count[cty] += 1
        county_farmer_ids[cty].add(str(farmer.id))

        ppt = rec.pests_per_trap or Decimal("0")
        if ppt > county_max_trap[cty]:
            county_max_trap[cty] = ppt

        trees = int(rec.number_of_trees_affected or 0)
        if trees > county_max_trees[cty]:
            county_max_trees[cty] = trees

        pest = (rec.pests_observed or "").strip()
        if pest:
            county_pest_counts[cty][pest] += 1
            if "False codling" in pest or "codling moth" in pest.lower():
                county_fcm[cty] = True

        disease = (rec.disease or "").strip()
        if disease:
            county_disease_counts[cty][disease] += 1

    counties_out = []
    all_counties = sorted(set(farmer_counts.keys()) | set(county_record_count.keys()))

    for cty in all_counties:
        pests_map = county_pest_counts.get(cty, {})
        diseases_map = county_disease_counts.get(cty, {})

        pest_ranked = sorted(pests_map.items(), key=lambda x: (-x[1], x[0]))
        disease_ranked = sorted(diseases_map.items(), key=lambda x: (-x[1], x[0]))

        pest_of_concern = pest_ranked[0][0] if pest_ranked else None

        dlevel = danger_level(
            max_pests_per_trap=county_max_trap.get(cty, Decimal("0")),
            max_trees_affected=county_max_trees.get(cty, 0),
            has_fcm=county_fcm.get(cty, False),
        )

        counties_out.append(
            {
                "county": cty,
                "farmerCount": int(farmer_counts.get(cty, 0)),
                "scoutingRecordsInWindow": int(county_record_count.get(cty, 0)),
                "distinctFarmersWithScouting": len(county_farmer_ids.get(cty, set())),
                "pestOfConcern": pest_of_concern,
                "dangerLevel": dlevel,
                "topPests": [{"label": k, "recordCount": v} for k, v in pest_ranked[:5]],
                "topDiseases": [{"label": k, "recordCount": v} for k, v in disease_ranked[:5]],
            }
        )

    counties_out.sort(key=lambda r: (-r["scoutingRecordsInWindow"], r["county"]))

    return {
        "windowDays": window_days,
        "totalFarmersUsingTool": total_farmers,
        "totalScoutingRecordsInWindow": int(sum(county_record_count.values())),
        "counties": counties_out,
    }
