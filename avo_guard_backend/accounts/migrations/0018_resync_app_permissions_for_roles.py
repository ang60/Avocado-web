# Re-sync AppPermission rows and role assignments.
#
# Rationale: production DBs may have drifted role permissions from earlier seeds
# (e.g., Agronomist missing nav.*). This migration re-applies the canonical
# permission mapping in an idempotent way.

from django.db import migrations


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


def forwards(apps, schema_editor):
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


def backwards(apps, schema_editor):
    # Keep rollback non-destructive; do not delete permission rows.
    Role = apps.get_model('accounts', 'Role')
    for role_name in ROLE_PERMISSIONS.keys():
        role = Role.objects.filter(role_name=role_name).first()
        if role:
            role.permissions.clear()


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0017_grant_nav_permissions_to_agronomist'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]

