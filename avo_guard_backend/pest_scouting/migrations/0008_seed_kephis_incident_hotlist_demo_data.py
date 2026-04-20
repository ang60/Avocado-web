from datetime import date
from decimal import Decimal

from django.db import migrations


INCIDENT_REMARK = 'KEPHIS_INCIDENT_HOTLIST_SEED_2026'


def _pick_farmer(User):
    farmer = User.objects.filter(phone_number='+254700000102').first()
    if farmer:
        return farmer
    return User.objects.filter(role__role_name='Farmer').first()


def seed_kephis_incident_hotlist(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    FarmBlock = apps.get_model('pest_scouting', 'FarmBlock')
    WeeklyRecord = apps.get_model('pest_scouting', 'WeeklyRecord')

    farmer = _pick_farmer(User)
    if not farmer:
        return

    if WeeklyRecord.objects.filter(farmer=farmer, remarks=INCIDENT_REMARK).exists():
        return

    block_a, _ = FarmBlock.objects.get_or_create(
        farmer=farmer,
        block_name='Demo Block A',
        defaults={
            'number_of_trees': 180,
            'boundary_points': [
                {'lat': -0.7112, 'lng': 37.1499},
                {'lat': -0.7101, 'lng': 37.1518},
                {'lat': -0.7122, 'lng': 37.1525},
                {'lat': -0.7130, 'lng': 37.1506},
            ],
        },
    )
    block_b, _ = FarmBlock.objects.get_or_create(
        farmer=farmer,
        block_name='Demo Block B',
        defaults={
            'number_of_trees': 140,
            'boundary_points': [
                {'lat': -0.7188, 'lng': 37.1411},
                {'lat': -0.7172, 'lng': 37.1428},
                {'lat': -0.7182, 'lng': 37.1444},
                {'lat': -0.7195, 'lng': 37.1431},
            ],
        },
    )

    common = {
        'farmer': farmer,
        'variety': 'Hass',
        'type_of_trap': 'Pheromone trap',
        'number_of_trap': 10,
        'traps_replaced': 1,
        'beneficial_insects_observed': '🐝 Bees',
        'beneficial_insects_observed_list': ['🐝 Bees'],
        'number_of_trees_affected': 18,
        'pest_plant_part_affected': '🍃 Leaves',
        'pest_plant_parts_affected_list': ['🍃 Leaves'],
        'pest_crop_stage': '🟡 Maturing',
        'pest_detection_method': '🔬 KEPHIS inspector',
        'any_diseases_observed': 'No',
        'number_of_photos_taken': 3,
        'additional_notes': 'Seeded incident hotlist data for KEPHIS module.',
        'actions_taken': '🌿 Farm sanitation',
        'actions_taken_list': ['🌿 Farm sanitation'],
        'outcome': '⚠️ Still present',
        'outcome_list': ['⚠️ Still present'],
        'remarks': INCIDENT_REMARK,
    }

    records = [
        {
            **common,
            'block': block_a,
            'any_pests_observed': 'Yes',
            'pests_observed': '🦟 Mango fruit fly',
            'pests_observed_list': ['🦟 Mango fruit fly'],
            'pests_per_trap': Decimal('6.20'),
            'start_date': date(2026, 4, 8),
            'end_date': date(2026, 4, 8),
            'location': "Murang'a",
            'gps_latitude': Decimal('-0.711200000000000'),
            'gps_longitude': Decimal('37.150600000000000'),
            'raw_payload': {
                '0_start_gps': '-0.7112,37.1499',
                '0_end_gps': '-0.7113,37.1506',
                '0_start_timestamp': '2026-04-08T08:00:00Z',
                '0_end_timestamp': '2026-04-08T08:20:00Z',
                '3_detection_method': '🔬 KEPHIS inspector',
                '2_traps_replaced': 1,
                '1_avocado_variety': 'Hass',
                '3_pests_per_trap': '6.20',
                '3_select_pests_observed': ['🦟 Mango fruit fly'],
                '3_select_pests_observed_i_dont_know_photo': 'https://example.com/evidence/fruit-fly-1.jpg',
            },
        },
        {
            **common,
            'block': block_a,
            'any_pests_observed': 'Yes',
            'pests_observed': '🦟 Mango fruit fly',
            'pests_observed_list': ['🦟 Mango fruit fly'],
            'pests_per_trap': Decimal('7.10'),
            'start_date': date(2026, 4, 9),
            'end_date': date(2026, 4, 9),
            'location': "Murang'a",
            'gps_latitude': Decimal('-0.711200000000000'),
            'gps_longitude': Decimal('37.150600000000000'),
            'raw_payload': {
                '0_start_gps': '-0.7112,37.1499',
                '0_end_gps': '-0.7113,37.1506',
                '0_start_timestamp': '2026-04-09T08:00:00Z',
                '0_end_timestamp': '2026-04-09T08:22:00Z',
                '3_detection_method': '🔬 KEPHIS inspector',
                '2_traps_replaced': 1,
                '1_avocado_variety': 'Hass',
                '3_pests_per_trap': '7.10',
                '3_select_pests_observed': ['🦟 Mango fruit fly'],
                '3_select_pests_observed_i_dont_know_photo': 'https://example.com/evidence/fruit-fly-2.jpg',
            },
        },
        {
            **common,
            'block': block_a,
            'any_pests_observed': 'Yes',
            'pests_observed': '🦟 Mango fruit fly',
            'pests_observed_list': ['🦟 Mango fruit fly'],
            'pests_per_trap': Decimal('8.40'),
            'start_date': date(2026, 4, 10),
            'end_date': date(2026, 4, 10),
            'location': "Murang'a",
            'gps_latitude': Decimal('-0.711200000000000'),
            'gps_longitude': Decimal('37.150600000000000'),
            'raw_payload': {
                '0_start_gps': '-0.7112,37.1499',
                '0_end_gps': '-0.7113,37.1506',
                '0_start_timestamp': '2026-04-10T08:00:00Z',
                '0_end_timestamp': '2026-04-10T08:25:00Z',
                '3_detection_method': '🔬 KEPHIS inspector',
                '2_traps_replaced': 2,
                '1_avocado_variety': 'Hass',
                '3_pests_per_trap': '8.40',
                '3_select_pests_observed': ['🦟 Mango fruit fly'],
                '3_select_pests_observed_i_dont_know_photo': 'https://example.com/evidence/fruit-fly-3.jpg',
            },
        },
        {
            **common,
            'block': block_b,
            'any_pests_observed': 'Yes',
            'pests_observed': '🐛 False codling moth',
            'pests_observed_list': ['🐛 False codling moth'],
            'pests_per_trap': Decimal('3.60'),
            'start_date': date(2026, 4, 11),
            'end_date': date(2026, 4, 11),
            'location': 'Kiambu',
            'gps_latitude': Decimal('-0.718800000000000'),
            'gps_longitude': Decimal('37.143100000000000'),
            'raw_payload': {
                '0_start_gps': '-0.7188,37.1411',
                '0_end_gps': '-0.7195,37.1431',
                '0_start_timestamp': '2026-04-11T09:10:00Z',
                '0_end_timestamp': '2026-04-11T09:28:00Z',
                '3_detection_method': '👷 Extension officer',
                '2_traps_replaced': 1,
                '1_avocado_variety': 'Fuerte',
                '3_pests_per_trap': '3.60',
                '3_select_pests_observed': ['🐛 False codling moth'],
                '3_select_pests_observed_i_dont_know_photo': 'https://example.com/evidence/fcm-hotlist.jpg',
            },
        },
    ]

    for row in records:
        WeeklyRecord.objects.create(**row)


def remove_kephis_incident_hotlist(apps, schema_editor):
    WeeklyRecord = apps.get_model('pest_scouting', 'WeeklyRecord')
    WeeklyRecord.objects.filter(remarks=INCIDENT_REMARK).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('pest_scouting', '0007_seed_kephis_dashboard_demo_data'),
    ]

    operations = [
        migrations.RunPython(seed_kephis_incident_hotlist, remove_kephis_incident_hotlist),
    ]
