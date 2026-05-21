"""Keep api.FarmerProfile aligned with pest_scouting mobile onboarding (Farm / FarmBlock)."""

from __future__ import annotations

from django.db.models import Sum

from .models import FarmerProfile


def _sanitize_block_count(n) -> int | None:
    try:
        v = int(n)
    except (TypeError, ValueError):
        return None
    if v <= 0 or v >= 2147483647 or v > 50_000:
        return None
    return v


def sync_farmer_profile_from_mobile(user_id) -> FarmerProfile | None:
    """
    After mobile farm/block saves, mirror name, location, size, and block counts
    into the web farmer registry (FarmerProfile).
    """
    try:
        from pest_scouting.models import Farm, FarmBlock
    except ImportError:
        return None

    fp = FarmerProfile.objects.filter(user_id=user_id).select_related('user').first()
    if not fp:
        return None

    farm = Farm.objects.filter(farmer_name_id=user_id).order_by('-timestamp').first()
    update_fields: list[str] = []

    if farm:
        fn = (farm.farm_name or '').strip()
        if fn and fn != (fp.farm_name or '').strip():
            fp.farm_name = fn[:255]
            update_fields.append('farm_name')
        if fn and fn != (fp.owner or '').strip():
            fp.owner = fn[:255]
            update_fields.append('owner')

        loc = (farm.location or '').strip()
        if loc and loc != (fp.location or '').strip():
            fp.location = loc[:255]
            update_fields.append('location')

        fs = float(farm.farm_size or 0)
        if 0 < fs < 10**7 and float(fp.total_acres or 0) != round(fs, 2):
            fp.total_acres = round(fs, 2)
            update_fields.append('total_acres')

        nb = _sanitize_block_count(farm.number_of_blocks)
        if nb is not None and int(fp.blocks_managed or 0) != nb:
            fp.blocks_managed = nb
            update_fields.append('blocks_managed')

    block_n = FarmBlock.objects.filter(farmer_id=user_id).count()
    if block_n:
        capped = min(block_n, 50_000)
        if int(fp.blocks_managed or 0) < capped:
            fp.blocks_managed = capped
            if 'blocks_managed' not in update_fields:
                update_fields.append('blocks_managed')

    agg = FarmBlock.objects.filter(farmer_id=user_id).aggregate(s=Sum('number_of_trees'))
    trees = agg.get('s')
    if trees is not None and 0 <= int(trees) < 2147483647:
        capped_trees = min(int(trees), 50_000_000)
        if int(fp.trees_count or 0) != capped_trees:
            fp.trees_count = capped_trees
            update_fields.append('trees_count')

    if fp.primary_channel != FarmerProfile.PrimaryChannel.SMARTPHONE:
        fp.primary_channel = FarmerProfile.PrimaryChannel.SMARTPHONE
        update_fields.append('primary_channel')

    if update_fields:
        fp.save(update_fields=list(dict.fromkeys(update_fields)))
    return fp
