# Set/normalize credentials for the admin bootstrap account (phone-based username).
#
# This is a data migration so production servers can apply it via `migrate`
# without manual shell steps.

from django.contrib.auth.hashers import make_password
from django.db import migrations


ADMIN_PHONE = '+254798208346'

# Update these defaults if you want different credentials.
ADMIN_EMAIL = 'angiemuteti@gmail.com'
ADMIN_PASSWORD = 'Password123'
ADMIN_ROLE_NAME = 'Administrator'


def set_admin_credentials(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    Role = apps.get_model('accounts', 'Role')

    user = User.objects.filter(phone_number=ADMIN_PHONE).first()
    if not user:
        return

    role = Role.objects.filter(role_name=ADMIN_ROLE_NAME).first()

    updates = {
        'email': ADMIN_EMAIL,
        'password': make_password(ADMIN_PASSWORD),
        'is_active': True,
        'is_staff': True,
    }
    if role:
        updates['role_id'] = role.pk

    for k, v in updates.items():
        setattr(user, k, v)
    user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0013_seed_demo_users_by_role'),
    ]

    operations = [
        migrations.RunPython(set_admin_credentials, migrations.RunPython.noop),
    ]

