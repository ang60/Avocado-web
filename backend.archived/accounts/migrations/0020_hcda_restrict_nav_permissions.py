# HCDA: county-level work only — no farmer directory, scouting/case queues, compliance hub, or scouting review.

from django.db import migrations

TO_REMOVE = (
    'nav.farmers',
    'nav.scouting',
    'nav.cases',
    'nav.reports',
    'scouting.manage',
)


def forwards(apps, schema_editor):
    AppPermission = apps.get_model('accounts', 'AppPermission')
    Role = apps.get_model('accounts', 'Role')
    role = Role.objects.filter(role_name='HCDA').first()
    if not role:
        return
    for name in TO_REMOVE:
        perm = AppPermission.objects.filter(name=name).first()
        if perm and role.permissions.filter(pk=perm.pk).exists():
            role.permissions.remove(perm)


def backwards(apps, schema_editor):
    AppPermission = apps.get_model('accounts', 'AppPermission')
    Role = apps.get_model('accounts', 'Role')
    role = Role.objects.filter(role_name='HCDA').first()
    if not role:
        return
    for name in TO_REMOVE:
        perm = AppPermission.objects.filter(name=name).first()
        if perm and not role.permissions.filter(pk=perm.pk).exists():
            role.permissions.add(perm)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_link_demo_farmer_to_demo_agronomist'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
