from django.db import migrations


def seed(apps, schema_editor):
    AppPermission = apps.get_model('api', 'AppPermission')
    Role = apps.get_model('api', 'Role')
    names = [
        'users.view',
        'users.manage',
        'roles.view',
        'roles.manage',
        'entities.view',
        'entities.manage',
        'permissions.view',
    ]
    for n in names:
        AppPermission.objects.get_or_create(name=n)
    admin = Role.objects.filter(role_name='Administrator').first()
    if not admin:
        admin = Role.objects.create(role_name='Administrator', description='Default admin role with all app permissions')
    admin.permissions.set(list(AppPermission.objects.all()))


def unseed(apps, schema_editor):
    AppPermission = apps.get_model('api', 'AppPermission')
    Role = apps.get_model('api', 'Role')
    Role.objects.filter(role_name='Administrator').delete()
    AppPermission.objects.filter(
        name__in=[
            'users.view',
            'users.manage',
            'roles.view',
            'roles.manage',
            'entities.view',
            'entities.manage',
            'permissions.view',
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
