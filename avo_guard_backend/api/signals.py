from __future__ import annotations

from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User

from .models import FarmerProfile


def _user_role_name(user: User) -> str:
    try:
        return str(getattr(getattr(user, "role", None), "role_name", "") or "")
    except Exception:
        return ""


@receiver(post_save, sender=User)
def ensure_farmer_profile_exists(sender, instance: User, created: bool, **kwargs):
    """
    Ensure that creating a Farmer user in Django admin also creates a FarmerProfile,
    since the UI farmer registry reads from FarmerProfile (not accounts.User).
    """
    role = _user_role_name(instance)
    if role != "Farmer":
        return

    # Already has a profile.
    if FarmerProfile.objects.filter(user_id=instance.id).exists():
        return

    first = (instance.first_name or "").strip()
    last = (instance.last_name or "").strip()
    full_name = f"{first} {last}".strip() or instance.phone_number

    FarmerProfile.objects.create(
        user=instance,
        name=full_name,
        county=(instance.county or "").strip(),
        weekly_scouting_logs_4w=[0, 0, 0, 0],
    )

