from datetime import date
from decimal import Decimal

from django.db import migrations


def seed_quarantine_management_demo_data(apps, schema_editor):
    QuarantineManagement = apps.get_model('kephis_quarantine', 'QuarantineManagement')

    rows = [
        {
            'blockId': 'BLK-DEM-A',
            'farmName': 'Demo Farm A',
            'county': "Murang'a",
            'pestType': 'Fruit Fly',
            'captureRate': Decimal('7.40'),
            'lastInspection': date(2026, 4, 10),
            'kephisStatus': 'gated',
            'inspector': 'KEPHIS Inspector 1',
            'selected': False,
        },
        {
            'blockId': 'BLK-DEM-B',
            'farmName': 'Demo Farm B',
            'county': 'Kiambu',
            'pestType': 'FCM',
            'captureRate': Decimal('3.10'),
            'lastInspection': date(2026, 4, 11),
            'kephisStatus': 'pending',
            'inspector': 'KEPHIS Inspector 2',
            'selected': False,
        },
        {
            'blockId': 'BLK-DEM-C',
            'farmName': 'Demo Farm C',
            'county': 'Meru',
            'pestType': 'Thrips',
            'captureRate': Decimal('11.20'),
            'lastInspection': date(2026, 4, 12),
            'kephisStatus': 'gated',
            'inspector': 'KEPHIS Inspector 3',
            'selected': False,
        },
        {
            'blockId': 'BLK-DEM-D',
            'farmName': 'Demo Farm D',
            'county': 'Nyeri',
            'pestType': 'Fruit Fly',
            'captureRate': Decimal('0.90'),
            'lastInspection': date(2026, 4, 13),
            'kephisStatus': 'cleared',
            'inspector': 'KEPHIS Inspector 1',
            'selected': False,
        },
    ]

    for row in rows:
        QuarantineManagement.objects.get_or_create(
            blockId=row['blockId'],
            defaults=row,
        )


def remove_quarantine_management_demo_data(apps, schema_editor):
    QuarantineManagement = apps.get_model('kephis_quarantine', 'QuarantineManagement')
    QuarantineManagement.objects.filter(blockId__in=['BLK-DEM-A', 'BLK-DEM-B', 'BLK-DEM-C', 'BLK-DEM-D']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('kephis_quarantine', '0002_kephisthresholdsetting'),
    ]

    operations = [
        migrations.RunPython(seed_quarantine_management_demo_data, remove_quarantine_management_demo_data),
    ]

