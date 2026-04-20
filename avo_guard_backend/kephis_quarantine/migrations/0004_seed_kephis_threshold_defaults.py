from django.db import migrations


def seed_threshold_defaults(apps, schema_editor):
    KephisThresholdSetting = apps.get_model('kephis_quarantine', 'KephisThresholdSetting')
    KephisThresholdSetting.objects.get_or_create(
        pk=1,
        defaults={
            'fruit_fly_limit': 5,
            'fcm_limit': 2,
            'thrips_limit': 10,
        },
    )


def unseed_threshold_defaults(apps, schema_editor):
    KephisThresholdSetting = apps.get_model('kephis_quarantine', 'KephisThresholdSetting')
    KephisThresholdSetting.objects.filter(pk=1).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('kephis_quarantine', '0003_seed_quarantine_management_demo_data'),
    ]

    operations = [
        migrations.RunPython(seed_threshold_defaults, unseed_threshold_defaults),
    ]

