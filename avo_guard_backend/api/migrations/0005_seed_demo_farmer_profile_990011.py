# Ensure the demo Farmer user (+254700990011) has a FarmerProfile row.
#
# Some environments have demo auth users without the domain FarmerProfile records,
# which breaks /api/farmers/ and agronomist "My Farmers" views.

from __future__ import annotations

from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.db import migrations
from django.utils import timezone


DEMO_FARMER_PHONE = "+254700990011"
DEMO_PASSWORD = "DemoPass123!"


def forwards(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Role = apps.get_model("accounts", "Role")
    FarmerProfile = apps.get_model("api", "FarmerProfile")
    FarmBlock = apps.get_model("api", "FarmBlock")

    now = timezone.now()
    farmer_role = Role.objects.filter(role_name="Farmer").first()

    user = User.objects.filter(phone_number=DEMO_FARMER_PHONE).first()
    if not user:
        user = User(
            phone_number=DEMO_FARMER_PHONE,
            email="demo.farmer@avoguard.local",
            first_name="Demo",
            last_name="Farmer",
            password=make_password(DEMO_PASSWORD),
            is_active=True,
            is_staff=False,
            is_superuser=False,
            county="Kiambu",
            role_id=farmer_role.pk if farmer_role else None,
        )
        user.save()
    elif farmer_role and user.role_id != farmer_role.pk:
        user.role_id = farmer_role.pk
        user.save(update_fields=["role"])

    fp = FarmerProfile.objects.filter(user_id=user.pk).first()
    if not fp:
        fp = FarmerProfile(
            user_id=user.pk,
            name="Demo Farmer",
            owner="DEMO-AUTH-2026",
            farm_name="Demo Farm",
            location="Kiambu",
            county="Kiambu",
            ward="",
            sub_county="",
            primary_channel="smartphone",
            registration_date=(now.date() - timedelta(days=30)),
            total_acres=5.0,
            blocks_managed=2,
            trees_count=600,
            export_eligibility="ready",
            weekly_scouting_logs_4w=[1, 0, 1, 1],
            overdue_scouts=False,
            last_inspection=(now.date() - timedelta(days=7)).isoformat(),
            last_scouting_status="no-pests",
            last_scouting_finding="",
            last_scouting_date=now.strftime("%Y-%m-%d %H:%M"),
            last_scouting_scout_name="",
        )
        fp.save()

    # Add two blocks if missing.
    for idx in (1, 2):
        blk_name = f"Block {idx}"
        if not FarmBlock.objects.filter(farmer_id=fp.pk, name=blk_name).exists():
            FarmBlock.objects.create(
                farmer_id=fp.pk,
                name=blk_name,
                acres=2.5,
                trees=300,
                status="active",
                last_inspection=(now.date() - timedelta(days=7)).isoformat(),
                latitude=None,
                longitude=None,
            )


def backwards(apps, schema_editor):
    # Keep rollback non-destructive; do not delete potentially real data.
    return


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0004_farmerprofile_farmer_code"),
        ("accounts", "0019_link_demo_farmer_to_demo_agronomist"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]

