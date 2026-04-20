from datetime import date
from decimal import Decimal

from django.db import migrations


SEED_REMARK = 'KEPHIS_SEED_2026'


def _pick_farmer(User):
    farmer = User.objects.filter(phone_number='+254700000102').first()
    if farmer:
        return farmer
    return User.objects.filter(role__role_name='Farmer').first()


def seed_kephis_dashboard_data(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    FarmBlock = apps.get_model('pest_scouting', 'FarmBlock')
    WeeklyRecord = apps.get_model('pest_scouting', 'WeeklyRecord')

    farmer = _pick_farmer(User)
    if not farmer:
        return

    blocks_data = [
        {
            'block_name': 'Demo Block A',
            'number_of_trees': 180,
            'boundary_points': [
                {'lat': -0.7112, 'lng': 37.1499},
                {'lat': -0.7101, 'lng': 37.1518},
                {'lat': -0.7122, 'lng': 37.1525},
                {'lat': -0.7130, 'lng': 37.1506},
            ],
        },
        {
            'block_name': 'Demo Block B',
            'number_of_trees': 140,
            'boundary_points': [
                {'lat': -0.7188, 'lng': 37.1411},
                {'lat': -0.7172, 'lng': 37.1428},
                {'lat': -0.7182, 'lng': 37.1444},
                {'lat': -0.7195, 'lng': 37.1431},
            ],
        },
        {
            'block_name': 'Demo Block C',
            'number_of_trees': 210,
            'boundary_points': [
                {'lat': -0.7048, 'lng': 37.1601},
                {'lat': -0.7031, 'lng': 37.1616},
                {'lat': -0.7044, 'lng': 37.1630},
                {'lat': -0.7059, 'lng': 37.1615},
            ],
        },
    ]

    blocks = []
    for row in blocks_data:
        block, _ = FarmBlock.objects.get_or_create(
            farmer=farmer,
            block_name=row['block_name'],
            defaults={
                'number_of_trees': row['number_of_trees'],
                'boundary_points': row['boundary_points'],
            },
        )
        blocks.append(block)

    # Avoid duplicating seed records.
    if WeeklyRecord.objects.filter(farmer=farmer, remarks=SEED_REMARK).exists():
        return

    common = {
        'farmer': farmer,
        'variety': 'Hass',
        'type_of_trap': 'Pheromone trap',
        'number_of_trap': 12,
        'traps_replaced': 2,
        'beneficial_insects_observed': '🐝 Bees',
        'beneficial_insects_observed_list': ['🐝 Bees'],
        'number_of_trees_affected': 16,
        'pest_plant_part_affected': '🍃 Leaves',
        'pest_plant_parts_affected_list': ['🍃 Leaves'],
        'pest_crop_stage': '🟡 Maturing',
        'pest_detection_method': '🏢 Agronomist',
        'any_diseases_observed': 'Yes',
        'disease': '🟤 Anthracnose',
        'disease_list': ['🟤 Anthracnose'],
        'disease_plant_part': '🍃 Leaves',
        'disease_plant_parts_list': ['🍃 Leaves'],
        'disease_crop_stage': '🟡 Maturing',
        'disease_detection_method': '🏢 Agronomist',
        'number_of_photos_taken': 4,
        'additional_notes': 'Seeded KEPHIS demo scouting payload.',
        'actions_taken': '🪤 Traps installed',
        'actions_taken_list': ['🪤 Traps installed'],
        'outcome': '⚠️ Still present',
        'outcome_list': ['⚠️ Still present'],
        'remarks': SEED_REMARK,
        'start_date': date(2026, 4, 10),
        'end_date': date(2026, 4, 10),
    }

    records = [
        {
            **common,
            'block': blocks[0],
            'any_pests_observed': 'Yes',
            'pests_observed': '🦟 Mango fruit fly',
            'pests_observed_list': ['🦟 Mango fruit fly'],
            'pests_per_trap': Decimal('7.40'),
            'location': "Murang'a",
            'gps_latitude': Decimal('-0.711200000000000'),
            'gps_longitude': Decimal('37.150600000000000'),
            'raw_payload': {
                '0_start_gps': '-0.7112,37.1499',
                '0_end_gps': '-0.7113,37.1506',
                '0_start_timestamp': '2026-04-10T08:00:00Z',
                '0_end_timestamp': '2026-04-10T08:18:00Z',
                '3_detection_method': '🏢 Agronomist',
                '2_traps_replaced': 2,
                '1_avocado_variety': 'Hass',
                '3_pests_per_trap': '7.40',
                '3_select_pests_observed': ['🦟 Mango fruit fly'],
            },
        },
        {
            **common,
            'block': blocks[1],
            'any_pests_observed': 'Yes',
            'pests_observed': '🐛 False codling moth',
            'pests_observed_list': ['🐛 False codling moth'],
            'pests_per_trap': Decimal('3.10'),
            'location': 'Kiambu',
            'gps_latitude': Decimal('-0.718800000000000'),
            'gps_longitude': Decimal('37.143100000000000'),
            'raw_payload': {
                '0_start_gps': '-0.7188,37.1411',
                '0_end_gps': '-0.7195,37.1431',
                '0_start_timestamp': '2026-04-11T09:00:00Z',
                '0_end_timestamp': '2026-04-11T09:15:00Z',
                '3_detection_method': '👷 Extension officer',
                '2_traps_replaced': 1,
                '1_avocado_variety': 'Fuerte',
                '3_pests_per_trap': '3.10',
                '3_select_pests_observed': ['🐛 False codling moth'],
                '3_select_pests_observed_i_dont_know_photo': 'https://example.com/evidence/fcm-demo.jpg',
            },
        },
        {
            **common,
            'block': blocks[2],
            'any_pests_observed': 'Yes',
            'pests_observed': '🦗 Thrips',
            'pests_observed_list': ['🦗 Thrips'],
            'pests_per_trap': Decimal('11.20'),
            'location': 'Meru',
            'gps_latitude': Decimal('-0.704800000000000'),
            'gps_longitude': Decimal('37.161500000000000'),
            'raw_payload': {
                '0_start_gps': '-0.7048,37.1601',
                '0_end_gps': '-0.7048,37.1601',
                '0_start_timestamp': '2026-04-12T11:00:00Z',
                '0_end_timestamp': '2026-04-12T11:01:00Z',
                '3_detection_method': '👁 Self-observation',
                '2_traps_replaced': 0,
                '1_avocado_variety': 'Hass',
                '3_pests_per_trap': '11.20',
                '3_select_pests_observed': ['🦗 Thrips'],
            },
        },
    ]

    for payload in records:
        WeeklyRecord.objects.create(**payload)


def remove_kephis_dashboard_data(apps, schema_editor):
    WeeklyRecord = apps.get_model('pest_scouting', 'WeeklyRecord')
    WeeklyRecord.objects.filter(remarks=SEED_REMARK).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_set_kephis_login_for_demo_account'),
        ('pest_scouting', '0006_weeklyrecord_mobile_payload_fields'),
    ]

    operations = [
        migrations.RunPython(seed_kephis_dashboard_data, remove_kephis_dashboard_data),
    ]

