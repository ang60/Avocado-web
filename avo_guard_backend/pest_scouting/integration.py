"""Bridge pest_scouting weekly records into api.ScoutingReport for the web dashboard."""

from __future__ import annotations

from pest_scouting.models import WeeklyRecord
from pest_scouting.weekly_helpers import disease_list, pests_observed_list


def mirror_weekly_to_scouting_report(weekly: WeeklyRecord) -> None:
    from api.models import FarmerProfile, FarmBlock as ApiFarmBlock, ScoutingReport

    fp = FarmerProfile.objects.filter(user_id=weekly.farmer_id).first()
    if not fp:
        return

    pb = weekly.block
    api_block, _ = ApiFarmBlock.objects.get_or_create(
        farmer=fp,
        name=pb.block_name,
        defaults={'trees': pb.number_of_trees, 'acres': 0},
    )
    if api_block.trees != pb.number_of_trees:
        api_block.trees = pb.number_of_trees
        api_block.save(update_fields=['trees'])

    parts: list[str] = []
    if weekly.any_pests_observed == 'Yes':
        parts.extend(pests_observed_list(weekly))
    if weekly.any_diseases_observed == 'Yes':
        for x in disease_list(weekly):
            if x and x not in parts:
                parts.append(x)
    finding = ', '.join(dict.fromkeys(parts)) if parts else 'No Pests Found'
    finding = finding[:512]

    if weekly.any_pests_observed == 'Yes' or weekly.any_diseases_observed == 'Yes':
        status = ScoutingReport.DetectionStatus.DETECTED
        severity = ScoutingReport.Severity.HIGH
    else:
        status = ScoutingReport.DetectionStatus.CLEAN
        severity = ScoutingReport.Severity.LOW

    u = weekly.farmer
    scout = f'{u.first_name} {u.last_name}'.strip() or (u.phone_number or '')[:255]

    from pest_scouting.media_urls import weekly_record_image_urls

    images = weekly_record_image_urls(weekly)
    media = images[0][:200] if images else ''

    ScoutingReport.objects.create(
        farmer=fp,
        block=api_block,
        source=ScoutingReport.Source.APP,
        severity=severity,
        finding=finding,
        status=status,
        media_preview=media,
        scout_name=scout[:255],
        reviewed=ScoutingReport.ReviewStatus.NEW,
    )
