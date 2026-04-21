# Ensure the Agronomist role can access SPA nav + dashboard APIs.
#
# This migration is intentionally additive: it does not remove any existing
# permissions already attached to the Agronomist role.

from django.db import migrations


AGRONOMIST_REQUIRED = (
    # SPA navigation
    'nav.dashboard',
    'nav.scouting',
    'nav.cases',
    'nav.outbreak',
    'nav.alerts',
    'nav.knowledge',
    'nav.symptom_codebook',
    'nav.farmers',
    'nav.reports',
    # Feature gates used in API
    'alert_rules.view',
    'scouting.manage',
)


def forwards(apps, schema_editor):
    AppPermission = apps.get_model('accounts', 'AppPermission')
    Role = apps.get_model('accounts', 'Role')

    # Ensure permission rows exist
    for name in AGRONOMIST_REQUIRED:
        AppPermission.objects.get_or_create(name=name)

    role = Role.objects.filter(role_name='Agronomist').first()
    if not role:
        return

    perms = list(AppPermission.objects.filter(name__in=AGRONOMIST_REQUIRED))
    role.permissions.add(*perms)


def backwards(apps, schema_editor):
    # Non-destructive rollback: remove only the permissions this migration added.
    AppPermission = apps.get_model('accounts', 'AppPermission')
    Role = apps.get_model('accounts', 'Role')
    role = Role.objects.filter(role_name='Agronomist').first()
    if not role:
        return
    perms = list(AppPermission.objects.filter(name__in=AGRONOMIST_REQUIRED))
    if perms:
        role.permissions.remove(*perms)


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0016_merge_20260417_0610'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]

