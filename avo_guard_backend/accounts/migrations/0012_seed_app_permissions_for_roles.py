# Seed AppPermission rows and attach them to core roles (accounts.0011).

from django.db import migrations

# Keep in sync with api.drf_permissions + frontend nav (src/app/rbac.ts).
PERMISSION_NAMES = (
    'nav.dashboard',
    'nav.scouting',
    'nav.cases',
    'nav.outbreak',
    'nav.kephis',
    'nav.hcda',
    'nav.exporter',
    'nav.alerts',
    'nav.knowledge',
    'nav.symptom_codebook',
    'nav.farmers',
    'nav.reports',
    'nav.admin',
    'alert_rules.view',
    'alert_rules.manage',
    'scouting.manage',
)

ALL_PERMS = list(PERMISSION_NAMES)

ROLE_PERMISSIONS = {
    'Administrator': ALL_PERMS,
    'KEPHIS': [
        'nav.dashboard',
        'nav.scouting',
        'nav.cases',
        'nav.outbreak',
        'nav.kephis',
        'nav.alerts',
        'nav.knowledge',
        'nav.symptom_codebook',
        'nav.farmers',
        'nav.reports',
        'alert_rules.view',
        'scouting.manage',
    ],
    'HCDA': [
        'nav.dashboard',
        'nav.scouting',
        'nav.cases',
        'nav.outbreak',
        'nav.hcda',
        'nav.alerts',
        'nav.knowledge',
        'nav.symptom_codebook',
        'nav.farmers',
        'nav.reports',
        'alert_rules.view',
        'scouting.manage',
    ],
    'Exporter': [
        'nav.dashboard',
        'nav.scouting',
        'nav.cases',
        'nav.exporter',
        'nav.alerts',
        'nav.knowledge',
        'nav.symptom_codebook',
        'nav.farmers',
        'nav.reports',
        'alert_rules.view',
    ],
    'Farm Manager': [
        'nav.dashboard',
        'nav.scouting',
        'nav.cases',
        'nav.outbreak',
        'nav.alerts',
        'nav.knowledge',
        'nav.symptom_codebook',
        'nav.farmers',
        'nav.reports',
        'alert_rules.view',
    ],
    'Farmer': [
        'nav.dashboard',
        'nav.scouting',
        'nav.cases',
        'nav.alerts',
        'nav.knowledge',
        'nav.symptom_codebook',
        'nav.farmers',
        'alert_rules.view',
    ],
    'Agronomist': [
        'nav.dashboard',
        'nav.scouting',
        'nav.cases',
        'nav.outbreak',
        'nav.alerts',
        'nav.knowledge',
        'nav.symptom_codebook',
        'nav.farmers',
        'nav.reports',
        'alert_rules.view',
        'scouting.manage',
    ],
}


def seed_permissions(apps, schema_editor):
    AppPermission = apps.get_model('accounts', 'AppPermission')
    Role = apps.get_model('accounts', 'Role')
    for name in PERMISSION_NAMES:
        AppPermission.objects.get_or_create(name=name)

    perm_by_name = {p.name: p for p in AppPermission.objects.filter(name__in=PERMISSION_NAMES)}

    for role_name, wanted in ROLE_PERMISSIONS.items():
        role = Role.objects.filter(role_name=role_name).first()
        if not role:
            continue
        objs = [perm_by_name[n] for n in wanted if n in perm_by_name]
        role.permissions.set(objs)


def unseed_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    for role in Role.objects.filter(role_name__in=list(ROLE_PERMISSIONS.keys())):
        role.permissions.clear()
    AppPermission = apps.get_model('accounts', 'AppPermission')
    AppPermission.objects.filter(name__in=PERMISSION_NAMES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_seed_core_roles'),
    ]

    operations = [
        migrations.RunPython(seed_permissions, unseed_permissions),
    ]
