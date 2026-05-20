import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from pest_scouting.models import Farm, FarmBlock, WeeklyRecord
from pest_scouting.integration import mirror_weekly_to_scouting_report

logger = logging.getLogger(__name__)


@receiver(post_save, sender=WeeklyRecord)
def weekly_record_mirror_to_dashboard(sender, instance: WeeklyRecord, created: bool, **kwargs):
    if not created:
        return
    try:
        mirror_weekly_to_scouting_report(instance)
    except Exception:
        logger.exception('mirror_weekly_to_scouting_report failed for %s', instance.pk)


def _sync_registry_from_mobile(user_id) -> None:
    try:
        from api.mobile_profile_sync import sync_farmer_profile_from_mobile

        sync_farmer_profile_from_mobile(user_id)
    except Exception:
        logger.exception('sync_farmer_profile_from_mobile failed for user %s', user_id)


@receiver(post_save, sender=Farm)
def farm_sync_farmer_registry(sender, instance: Farm, **kwargs):
    _sync_registry_from_mobile(instance.farmer_id)


@receiver(post_save, sender=FarmBlock)
def farm_block_sync_farmer_registry(sender, instance: FarmBlock, **kwargs):
    _sync_registry_from_mobile(instance.farmer_id)
