from django.db import migrations


def seed(apps, schema_editor):
    Role = apps.get_model('api', 'Role')
    AppPermission = apps.get_model('api', 'AppPermission')

    # Core app permissions used by the UI / API
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
    perms = {}
    for name in perm_names:
        perms[name], _ = AppPermission.objects.get_or_create(name=name)

    def upsert_role(role_name: str, description: str, perm_list: list[str]):
        role, _ = Role.objects.get_or_create(role_name=role_name, defaults={'description': description})
        if description and role.description != description:
            role.description = description
            role.save(update_fields=['description'])
        role.permissions.set([perms[p] for p in perm_list])
        return role

    admin_like_perms = [
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

    upsert_role('Administrator', 'Full system access and configuration', admin_like_perms)
    upsert_role('KEPHIS', 'Regulatory oversight (KEPHIS)', admin_like_perms)
    upsert_role('HCDA', 'Regulatory oversight (HCDA)', admin_like_perms)

    upsert_role('Exporter', 'Exporter entity admin and oversight', [])
    upsert_role('Agronomist', 'Review cases and provide recommendations', [])
    upsert_role('Farm Manager', 'Manage farm and view compliance', [])
    upsert_role('Farmer', 'View own farm info and advisories', [])


def unseed(apps, schema_editor):
    Role = apps.get_model('api', 'Role')
    AppPermission = apps.get_model('api', 'AppPermission')
    Role.objects.filter(
        role_name__in=['KEPHIS', 'HCDA', 'Exporter', 'Agronomist', 'Farm Manager', 'Farmer']
    ).delete()
    AppPermission.objects.filter(
        name__in=[
            'alert_rules.view',
            'alert_rules.manage',
            'admin.summary',
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0004_merge_0003_alertrule_0003_alter_user_managers'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]

