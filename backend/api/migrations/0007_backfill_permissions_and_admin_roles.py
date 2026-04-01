from django.db import migrations


def forwards(apps, schema_editor):
    Role = apps.get_model('api', 'Role')
    AppPermission = apps.get_model('api', 'AppPermission')

    perm_names = [
        'users.view',
        'users.manage',
        'roles.view',
        'roles.manage',
        'entities.view',
        'entities.manage',
        'permissions.view',
        'alert_rules.view',
        'alert_rules.manage',
        'admin.summary',
    ]

    perms = []
    for name in perm_names:
        p, _ = AppPermission.objects.get_or_create(name=name)
        perms.append(p)

    # Ensure admin-like roles have everything needed for admin UI
    for role_name in ['Administrator', 'KEPHIS', 'HCDA']:
        role = Role.objects.filter(role_name=role_name).first()
        if role:
            role.permissions.set(perms)


def backwards(apps, schema_editor):
    # Keep permissions; just detach from roles
    Role = apps.get_model('api', 'Role')
    for role_name in ['Administrator', 'KEPHIS', 'HCDA']:
        role = Role.objects.filter(role_name=role_name).first()
        if role:
            role.permissions.clear()


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0006_domain_models_farmer_case'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]

