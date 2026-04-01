from django.db import migrations


def forwards(apps, schema_editor):
    Role = apps.get_model('api', 'Role')
    AppPermission = apps.get_model('api', 'AppPermission')

    for name in ('scouting.view', 'scouting.manage'):
        AppPermission.objects.get_or_create(name=name)

    perm_objs = list(AppPermission.objects.filter(name__in=['scouting.view', 'scouting.manage']))
    for role_name in ['Administrator', 'KEPHIS', 'HCDA', 'Agronomist', 'Farm Manager']:
        role = Role.objects.filter(role_name=role_name).first()
        if role:
            for p in perm_objs:
                role.permissions.add(p)


def backwards(apps, schema_editor):
    Role = apps.get_model('api', 'Role')
    AppPermission = apps.get_model('api', 'AppPermission')
    perm_qs = AppPermission.objects.filter(name__in=['scouting.view', 'scouting.manage'])
    for role_name in ['Administrator', 'KEPHIS', 'HCDA', 'Agronomist', 'Farm Manager']:
        role = Role.objects.filter(role_name=role_name).first()
        if role:
            role.permissions.remove(*list(perm_qs))


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0008_scouting_report'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
