from django.contrib.auth.hashers import make_password
from django.db import migrations


KEPHIS_PHONE = '+254700000104'
KEPHIS_EMAIL = 'demo.kephis@avoguard.local'
KEPHIS_PASSWORD = 'DemoPass123!'
KEPHIS_ROLE_NAME = 'KEPHIS'


def set_kephis_credentials(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    Role = apps.get_model('accounts', 'Role')

    role = Role.objects.filter(role_name=KEPHIS_ROLE_NAME).first()
    user = User.objects.filter(phone_number=KEPHIS_PHONE).first()

    if not user:
        user = User(phone_number=KEPHIS_PHONE)

    user.email = KEPHIS_EMAIL
    user.first_name = 'Demo'
    user.last_name = 'KEPHIS'
    user.password = make_password(KEPHIS_PASSWORD)
    user.is_active = True
    user.is_staff = False
    user.is_superuser = False
    user.county = user.county or "Murang'a"
    if role:
        user.role_id = role.pk
    user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0014_set_admin_login_for_0798208346'),
    ]

    operations = [
        migrations.RunPython(set_kephis_credentials, migrations.RunPython.noop),
    ]

