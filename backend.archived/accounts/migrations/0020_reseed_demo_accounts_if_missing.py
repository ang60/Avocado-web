# Re-create demo sign-in accounts if they are missing (idempotent).
#
# Why: Django data migrations (0013, etc.) run only once per database. If the DB
# was replaced, restored without data, or rows were deleted, accounts disappear until
# you re-seed. This migration can be applied on any server to restore missing demos.
#
# Password for all created/updated rows: DemoPass123!

from django.contrib.auth.hashers import make_password
from django.db import migrations


DEMO_PASSWORD = "DemoPass123!"

# Same as 0013_seed_demo_users_by_role — phone, first, last, role_name, email
ROLE_DEMO_USERS = (
    ("+254700000101", "Demo", "Administrator", "Administrator", "demo.administrator@avoguard.local"),
    ("+254700000102", "Demo", "Farmer", "Farmer", "demo.farmer@avoguard.local"),
    ("+254700000103", "Demo", "FarmManager", "Farm Manager", "demo.farmmanager@avoguard.local"),
    ("+254700000104", "Demo", "KEPHIS", "KEPHIS", "demo.kephis@avoguard.local"),
    ("+254700000105", "Demo", "HCDA", "HCDA", "demo.hcda@avoguard.local"),
    ("+254700000106", "Demo", "Agronomist", "Agronomist", "demo.agronomist@avoguard.local"),
    ("+254700000107", "Demo", "Exporter", "Exporter", "demo.exporter@avoguard.local"),
)

# Pair used in docs / seed_existing_modules — distinct emails to avoid clashing with 000102/000106.
SCRATCH_AGRONOMIST = (
    "+254700990010",
    "Demo",
    "Agronomist",
    "Agronomist",
    "demo.agronomist990010@avoguard.local",
)
SCRATCH_FARMER = (
    "+254700990011",
    "Demo",
    "Farmer",
    "Farmer",
    "demo.farmer990011@avoguard.local",
)


def _unique_email(User, email, phone):
    conflict = User.objects.filter(email__iexact=email).exclude(phone_number=phone).first()
    if conflict:
        return f"{phone.replace('+', '')}_demo@avoguard.local"
    return email


def _ensure_user(apps, phone, first_name, last_name, role_name, email):
    User = apps.get_model("accounts", "User")
    Role = apps.get_model("accounts", "Role")

    role = Role.objects.filter(role_name=role_name).first()
    email = _unique_email(User, email, phone)

    user = User.objects.filter(phone_number=phone).first()
    if user:
        # Row already exists: do not reset password (may have been changed on purpose).
        return user

    user = User(
        phone_number=phone,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=make_password(DEMO_PASSWORD),
        role_id=role.pk if role else None,
        is_active=True,
        is_staff=False,
        is_superuser=False,
        county="Murang'a",
    )
    user.save()
    return user


def forwards(apps, schema_editor):
    for phone, first, last, role_name, email in ROLE_DEMO_USERS:
        _ensure_user(apps, phone, first, last, role_name, email)

    ag = _ensure_user(apps, *SCRATCH_AGRONOMIST)
    farmer = _ensure_user(apps, *SCRATCH_FARMER)
    if ag and farmer:
        farmer_role = getattr(getattr(farmer, "role", None), "role_name", None)
        agro_role = getattr(getattr(ag, "role", None), "role_name", None)
        if farmer_role == "Farmer" and agro_role == "Agronomist":
            farmer.managed_by_id = ag.pk
            farmer.save(update_fields=["managed_by_id"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0019_link_demo_farmer_to_demo_agronomist"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
