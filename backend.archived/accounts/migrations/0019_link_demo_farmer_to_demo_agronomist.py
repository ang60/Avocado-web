# Link demo farmer to demo agronomist (managed_by).
#
# This makes demo agronomist "own" the demo farmer in scoped views.

from django.db import migrations


DEMO_FARMER_PHONE = "+254700990011"
DEMO_AGRONOMIST_PHONE = "+254700990010"


def forwards(apps, schema_editor):
    User = apps.get_model("accounts", "User")

    farmer = User.objects.filter(phone_number=DEMO_FARMER_PHONE).first()
    agronomist = User.objects.filter(phone_number=DEMO_AGRONOMIST_PHONE).first()
    if not farmer or not agronomist:
        return

    # Only link when roles match expected demo intent.
    farmer_role = getattr(getattr(farmer, "role", None), "role_name", None)
    agro_role = getattr(getattr(agronomist, "role", None), "role_name", None)
    if farmer_role != "Farmer" or agro_role != "Agronomist":
        return

    farmer.managed_by = agronomist
    farmer.save(update_fields=["managed_by"])


def backwards(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    farmer = User.objects.filter(phone_number=DEMO_FARMER_PHONE).first()
    if not farmer:
        return
    farmer.managed_by = None
    farmer.save(update_fields=["managed_by"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0018_resync_app_permissions_for_roles"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]

