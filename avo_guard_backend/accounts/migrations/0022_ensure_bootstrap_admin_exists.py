# Ensure the bootstrap admin account exists on any environment.
#
# Why: earlier migration 0014 only updated an existing row and would do nothing
# on a fresh/emptied database. This migration is idempotent and safe to run on
# prod: it creates the user only if missing and does not reset password if the
# row already exists.

from django.contrib.auth.hashers import make_password
from django.db import migrations


ADMIN_PHONE = "+254798208346"
ADMIN_EMAIL = "angiemuteti@gmail.com"
ADMIN_PASSWORD = "Password123"
ADMIN_ROLE_NAME = "Administrator"


def forwards(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Role = apps.get_model("accounts", "Role")

    user = User.objects.filter(phone_number=ADMIN_PHONE).first()
    role = Role.objects.filter(role_name=ADMIN_ROLE_NAME).first()

    if user:
        # Do not reset password; just make sure the account is active/staff and
        # has an admin role if roles exist.
        changed = False
        if user.is_active is not True:
            user.is_active = True
            changed = True
        if user.is_staff is not True:
            user.is_staff = True
            changed = True
        if not user.email:
            user.email = ADMIN_EMAIL
            changed = True
        if role and user.role_id != role.pk:
            user.role_id = role.pk
            changed = True
        if changed:
            user.save()
        return

    user = User(
        phone_number=ADMIN_PHONE,
        email=ADMIN_EMAIL,
        password=make_password(ADMIN_PASSWORD),
        is_active=True,
        is_staff=True,
        is_superuser=False,
    )
    if role:
        user.role_id = role.pk
    user.save()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0021_merge_20260422_2321"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]

