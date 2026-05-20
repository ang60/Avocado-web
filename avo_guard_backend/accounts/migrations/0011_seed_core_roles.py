# Generated manually — seed standard AvoGuard roles for RBAC and the Admin UI.

from django.db import migrations


CORE_ROLES = (
    (
        'Administrator',
        'Full system administration, directory management, and configuration.',
    ),
    (
        'Farmer',
        'Farm-level access: scouting, cases, and farmer profile data.',
    ),
    (
        'Farm Manager',
        'Oversees farm operations, compliance, and reporting.',
    ),
    (
        'KEPHIS',
        'Government KEPHIS regulator workflows and oversight.',
    ),
    (
        'HCDA',
        'Government HCDA regulator workflows and oversight.',
    ),
    (
        'Agronomist',
        'Technical review of scouting, cases, and agronomic recommendations.',
    ),
    (
        'Exporter',
        'Exporter organization users: compliance, farmers, and exports.',
    ),
)


def seed_core_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    for role_name, description in CORE_ROLES:
        Role.objects.get_or_create(
            role_name=role_name,
            defaults={'description': description},
        )


def unseed_core_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    names = [r[0] for r in CORE_ROLES]
    Role.objects.filter(role_name__in=names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_alter_apppermission_options_alter_role_options'),
    ]

    operations = [
        migrations.RunPython(seed_core_roles, unseed_core_roles),
    ]
