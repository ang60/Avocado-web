# HCDA: no farmer directory / individual farmer records (county-level surveillance only).

from django.db import migrations


def forwards(apps, schema_editor):
    AppPermission = apps.get_model('accounts', 'AppPermission')
    Role = apps.get_model('accounts', 'Role')
    role = Role.objects.filter(role_name='HCDA').first()
    perm = AppPermission.objects.filter(name='nav.farmers').first()
    if role and perm and role.permissions.filter(pk=perm.pk).exists():
        role.permissions.remove(perm)


def backwards(apps, schema_editor):
    AppPermission = apps.get_model('accounts', 'AppPermission')
    Role = apps.get_model('accounts', 'Role')
    role = Role.objects.filter(role_name='HCDA').first()
    perm = AppPermission.objects.filter(name='nav.farmers').first()
    if role and perm:
        role.permissions.add(perm)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_link_demo_farmer_to_demo_agronomist'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
