from django.db.models.signals import post_save
from django.dispatch import receiver

from pest_scouting.models import WeeklyRecord
from pest_scouting.integration import mirror_weekly_to_scouting_report


@receiver(post_save, sender=WeeklyRecord)
def weekly_record_mirror_to_dashboard(sender, instance: WeeklyRecord, created: bool, **kwargs):
    if not created:
        return
    try:
        mirror_weekly_to_scouting_report(instance)
    except Exception:
        # Avoid breaking scouting saves if dashboard mirror has an unexpected issue.
        import logging

        logging.getLogger(__name__).exception('mirror_weekly_to_scouting_report failed for %s', instance.pk)
