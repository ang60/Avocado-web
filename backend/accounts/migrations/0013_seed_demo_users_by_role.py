# Demo sign-in accounts (one per core role). Password for all: DemoPass123!
# Phones +254700000101–107. Skips any row whose phone already exists.

from django.contrib.auth.hashers import make_password
from django.db import migrations


DEMO_PASSWORD = 'DemoPass123!'

# phone, first_name, last_name, role_name, email
DEMO_USERS = (
    ('+254700000101', 'Demo', 'Administrator', 'Administrator', 'demo.administrator@avoguard.local'),
    ('+254700000102', 'Demo', 'Farmer', 'Farmer', 'demo.farmer@avoguard.local'),
    ('+254700000103', 'Demo', 'FarmManager', 'Farm Manager', 'demo.farmmanager@avoguard.local'),
    ('+254700000104', 'Demo', 'KEPHIS', 'KEPHIS', 'demo.kephis@avoguard.local'),
    ('+254700000105', 'Demo', 'HCDA', 'HCDA', 'demo.hcda@avoguard.local'),
    ('+254700000106', 'Demo', 'Agronomist', 'Agronomist', 'demo.agronomist@avoguard.local'),
    ('+254700000107', 'Demo', 'Exporter', 'Exporter', 'demo.exporter@avoguard.local'),
)


def seed_demo_users(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    Role = apps.get_model('accounts', 'Role')
    for phone, first, last, role_name, email in DEMO_USERS:
        if User.objects.filter(phone_number=phone).exists():
            continue
        role = Role.objects.filter(role_name=role_name).first()
        # Historical User from migrations has no set_password; hash explicitly.
        user = User(
            phone_number=phone,
            email=email,
            first_name=first,
            last_name=last,
            password=make_password(DEMO_PASSWORD),
            role_id=role.pk if role else None,
            is_active=True,
            is_staff=False,
            is_superuser=False,
            county='Murang\'a',
        )
        user.save()


def remove_demo_users(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    phones = [row[0] for row in DEMO_USERS]
    User.objects.filter(phone_number__in=phones).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_seed_app_permissions_for_roles'),
    ]

    operations = [
        migrations.RunPython(seed_demo_users, remove_demo_users),
    ]
