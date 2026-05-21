import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, Entity, Role, AppPermission
from pest_scouting.models import Farm, FarmBlock, WeeklyRecord
from advisory_services.models import Advisory
from alerts.models import Alert
from hcda_registry.models import FarmerRegistration
from kephis_quarantine.models import QuarantineManagement
from case_management.models import Case
from knowledge_base.models import Category, KnowledgeEntry

class Command(BaseCommand):
    help = 'Prepopulate the database with sample test data for all models'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating sample data...')

        # 1. Create AppPermissions
        permissions = ['view_reports', 'add_records', 'edit_records', 'delete_records', 'manage_users']
        perm_objects = []
        for perm_name in permissions:
            perm, _ = AppPermission.objects.get_or_create(name=perm_name)
            perm_objects.append(perm)

        # 2. Create Roles
        farmer_role = Role.objects.filter(role_name='Farmer').first()
        if not farmer_role:
            farmer_role = Role.objects.create(role_name='Farmer', description='A farmer who owns farm blocks and submits weekly records')
        farmer_role.permissions.set(perm_objects[1:3]) # add, edit records

        agronomist_role = Role.objects.filter(role_name='Agronomist').first()
        if not agronomist_role:
            agronomist_role = Role.objects.create(role_name='Agronomist', description='An agronomist who reviews scouting reports')
        agronomist_role.permissions.set(perm_objects) # all perms

        # 3. Create Entities
        entities_data = [
            {
                'entity_type': 'Exporter',
                'company_name': 'Wanjiru Farm',
                'HCDA_license': 'EXP-2026-001',
                'license_expiry_date': date(2027, 12, 31),
                'head_agronomist': 'Dr. James Kariuki',
                'primary_county': "Murang'a",
                'company_email': 'info@wanjirufarm.com',
                'phone_number': '+254711111111'
            },
            {
                'entity_type': 'Exporter',
                'company_name': 'Kipchirchir Estates',
                'HCDA_license': 'EXP-2026-002',
                'license_expiry_date': date(2027, 6, 30),
                'head_agronomist': 'Sarah Chemutai',
                'primary_county': 'Kiambu',
                'company_email': 'contact@kipchirchir.com',
                'phone_number': '+254722222222'
            },
            {
                'entity_type': 'Government - KEPHIS',
                'company_name': 'KEPHIS HQ',
                'HCDA_license': 'GOV-KEPHIS-001',
                'license_expiry_date': date(2030, 1, 1),
                'head_agronomist': 'Chief Inspector',
                'primary_county': 'Nairobi',
                'company_email': 'info@kephis.org',
                'phone_number': '+254733333333'
            }
        ]

        entity_objs = []
        for data in entities_data:
            entity, _ = Entity.objects.get_or_create(
                HCDA_license=data['HCDA_license'],
                defaults=data
            )
            entity_objs.append(entity)

        # 4. Create Users
        users_data = [
            {
                'phone_number': '+254700000001',
                'email': 'grace@wanjirufarm.com',
                'first_name': 'Grace',
                'last_name': 'Wanjiru',
                'role': farmer_role,
                'county': "Murang'a",
                'entity': entity_objs[0]
            },
            {
                'phone_number': '+254700000002',
                'email': 'david@kipchirchir.com',
                'first_name': 'David',
                'last_name': 'Kipchirchir',
                'role': farmer_role,
                'county': 'Kiambu',
                'entity': entity_objs[1]
            },
            {
                'phone_number': '+254700000003',
                'email': 'peter@mwangi.com',
                'first_name': 'Peter',
                'last_name': 'Mwangi',
                'role': farmer_role,
                'county': "Murang'a",
                'entity': None # Individual farmer
            },
            {
                'phone_number': '+254700000004',
                'email': 'james.kariuki@avo.com',
                'first_name': 'James',
                'last_name': 'Kariuki',
                'role': agronomist_role,
                'county': 'Nairobi',
                'entity': entity_objs[0]
            }
        ]

        user_objs = []
        for data in users_data:
            user = User.objects.filter(phone_number=data['phone_number']).first()
            if not user:
                user = User.objects.create_user(**data)
                self.stdout.write(f'Created user: {user.phone_number}')
            user_objs.append(user)

        # 5. Create Farms and FarmBlocks
        self.stdout.write('Creating farms and blocks...')
        farms_data = [
            {'farmer_name': user_objs[0], 'farm_name': 'Wanjiru Main Farm', 'location': "Murang'a"},
            {'farmer_name': user_objs[1], 'farm_name': 'Kipchirchir Main Estate', 'location': 'Kiambu'},
            {'farmer_name': user_objs[2], 'farm_name': 'Mwangi Avocado Farm', 'location': "Murang'a"},
        ]
        farm_objs = []
        for f_data in farms_data:
            farm, _ = Farm.objects.get_or_create(
                farmer_name=f_data['farmer_name'],
                farm_name=f_data['farm_name'],
                defaults={'location': f_data['location']}
            )
            farm_objs.append(farm)

        blocks_data = [
            {'farmer': user_objs[0], 'block_name': 'Block B', 'number_of_trees': 150, 'farm': farm_objs[0]},
            {'farmer': user_objs[1], 'block_name': 'Block A-12', 'number_of_trees': 300, 'farm': farm_objs[1]},
            {'farmer': user_objs[2], 'block_name': 'Block C', 'number_of_trees': 80, 'farm': farm_objs[2]},
            {'farmer': user_objs[0], 'block_name': 'Block D-05', 'number_of_trees': 120, 'farm': farm_objs[0]},
        ]

        block_objs = []
        for data in blocks_data:
            block, _ = FarmBlock.objects.get_or_create(
                farmer=data['farmer'],
                block_name=data['block_name'],
                defaults={
                    'farm_name': data['farm'],
                    'number_of_trees': data['number_of_trees'],
                    'boundary_points': []
                }
            )
            block_objs.append(block)

        # 6. Create WeeklyRecords
        pests = [c[0] for c in WeeklyRecord.PEST_CHOICES]
        diseases = [c[0] for c in WeeklyRecord.DISEASE_CHOICES]
        plant_parts = [c[0] for c in WeeklyRecord.PLANT_PART_CHOICES]
        crop_stages = [c[0] for c in WeeklyRecord.CROP_STAGE_CHOICES]
        detection_methods = [c[0] for c in WeeklyRecord.DETECTION_METHOD_CHOICES]
        actions = [c[0] for c in WeeklyRecord.ACTION_TAKEN_CHOICES]
        outcomes = [c[0] for c in WeeklyRecord.OUTCOME_CHOICES]

        # Ensure we have records matching ScoutingReports.tsx
        specific_records = [
            # Grace Wanjiru, Block B, False Codling Moth, Detected
            {
                'farmer': user_objs[0],
                'block': block_objs[0],
                'variety': 'Hass',
                'trap_use': [
                    {
                        'type_of_trap': 'Delta Trap',
                        'number_of_trap': 2,
                        'traps_replaced': 0,
                        'total_no_of_pests': 12.5,
                    }
                ],
                'any_pests_observed': 'Yes',
                'pests_observed': '🐛 False codling moth',
                'any_diseases_observed': 'No',
                'actions_taken': '💊 Chemical control',
                'outcome': '⚠️ Still present',
                'start_date': date.today() - timedelta(days=7),
                'end_date': date.today(),
                'location': "Murang'a",
            },
            # David Kipchirchir, Block A-12, Clean
            {
                'farmer': user_objs[1],
                'block': block_objs[1],
                'variety': 'Fuerte',
                'trap_use': [
                    {
                        'type_of_trap': 'McPhail',
                        'number_of_trap': 4,
                        'traps_replaced': 1,
                        'total_no_of_pests': 0,
                    }
                ],
                'any_pests_observed': 'No',
                'any_diseases_observed': 'No',
                'actions_taken': '❌ No action taken',
                'outcome': '✅ Controlled',
                'start_date': date.today() - timedelta(days=7),
                'end_date': date.today(),
                'location': 'Kiambu',
            },
            # Peter Mwangi, Block C, Root Rot, Detected
            {
                'farmer': user_objs[2],
                'block': block_objs[2],
                'variety': 'Hass',
                'trap_use': [
                    {
                        'type_of_trap': 'None',
                        'number_of_trap': 0,
                        'traps_replaced': 0,
                        'total_no_of_pests': 0,
                    }
                ],
                'any_pests_observed': 'No',
                'any_diseases_observed': 'Yes',
                'disease': '🌊 Phytophthora root rot',
                'disease_plant_part': '🌱 Roots',
                'disease_crop_stage': '🌸 Flowering',
                'disease_detection_method': '🏢 Agronomist',
                'actions_taken': '💊 Chemical control',
                'outcome': '🔄 Follow-up needed',
                'start_date': date.today() - timedelta(days=7),
                'end_date': date.today(),
                'location': "Murang'a",
            }
        ]

        for r_data in specific_records:
            WeeklyRecord.objects.create(**r_data)

        # Create some random records
        for i in range(50):
            block = random.choice(block_objs)
            any_pests = random.choice(['Yes', 'No'])
            any_diseases = random.choice(['Yes', 'No'])
            
            # Select random dates within the last 6 months
            end_date = date.today() - timedelta(days=random.randint(0, 180))
            start_date = end_date - timedelta(days=7)

            reviewed_val = random.choice([True, False])
            record = WeeklyRecord.objects.create(
                farmer=block.farmer,
                block=block,
                variety=random.choice(['Hass', 'Fuerte', 'Pinkerton', 'Reed']),
                trap_use=[
                    {
                        'type_of_trap': random.choice(['Delta', 'McPhail', 'Jackson', 'Yellow Sticky Trap']),
                        'number_of_trap': random.randint(1, 15),
                        'traps_replaced': random.randint(0, 7),
                        'total_no_of_pests': random.uniform(0, 50),
                    }
                ],
                any_pests_observed=any_pests,
                pests_observed=random.choice(pests) if any_pests == 'Yes' else None,
                any_diseases_observed=any_diseases,
                disease=random.choice(diseases) if any_diseases == 'Yes' else None,
                disease_plant_part=random.choice(plant_parts) if any_diseases == 'Yes' else None,
                disease_crop_stage=random.choice(crop_stages) if any_diseases == 'Yes' else None,
                disease_detection_method=random.choice(detection_methods) if any_diseases == 'Yes' else None,
                actions_taken=random.choice(actions),
                outcome=random.choice(outcomes),
                start_date=start_date,
                end_date=end_date,
                location=block.farmer.county or "Unknown",
                reviewed=reviewed_val,
                status=random.choice(['New', 'Under Review', 'Closed']) if reviewed_val else 'New'
            )

            # Create an advisory for some records
            if any_pests == 'Yes' or any_diseases == 'Yes':
                if random.random() > 0.5:
                    findings = []
                    if record.any_pests_observed == 'Yes':
                        findings.append(record.get_formatted_pests())
                    if record.any_diseases_observed == 'Yes':
                        findings.append(record.get_formatted_diseases())
                    
                    finding_str = " & ".join(findings) if findings else "your farm"
                    
                    Advisory.objects.create(
                        weekly_record=record,
                        farmer=record.farmer,
                        advisory_message=f"Please apply recommended treatment for {finding_str}.",
                        actions_taken=random.choice([c[0] for c in Advisory.ACTION_TAKEN_CHOICES]),
                        outcome=random.choice([c[0] for c in Advisory.OUTCOME_CHOICES]),
                        remarks="Follow up in 2 weeks."
                    )
                
                # Create a case for high severity records
                if any_pests == 'Yes' and random.random() > 0.7:
                    finding_str = record.get_formatted_pests() or record.get_formatted_diseases()
                    Case.objects.create(
                        case_title=f"Outbreak: {finding_str} at {record.block.block_name}",
                        severity=random.choice(['high', 'medium']),
                        pest_scouting_record=record,
                        notes="Urgent attention required.",
                        assigned_agronomist=user_objs[3] # James Kariuki
                    )

        # 7. Create Alerts
        self.stdout.write('Creating alerts...')
        for user in user_objs:
            Alert.objects.create(
                farmer=user,
                title="System Update",
                message="New features have been added to the AvoGuard platform.",
                is_read=random.choice([True, False])
            )
            if user.role.role_name == 'Farmer':
                Alert.objects.create(
                    farmer=user,
                    title="Scouting Reminder",
                    message="Don't forget to submit your weekly scouting report.",
                    is_read=False
                )

        # 8. Create Farmer Registrations (HCDA)
        self.stdout.write('Creating HCDA registrations...')
        registrations_data = [
            {
                'farmerName': 'Grace Wanjiru',
                'hcdaRegNumber': 'HCDA/AVO/1001',
                'ward': 'Kandara',
                'county': "Murang'a",
                'acreage': 5.5,
                'globalGAPStatus': 'compliant',
                'globalGAPExpiry': date(2026, 12, 31),
                'primaryExporter': 'Wanjiru Farm',
                'lat': -0.897,
                'lng': 37.123
            },
            {
                'farmerName': 'David Kipchirchir',
                'hcdaRegNumber': 'HCDA/AVO/1002',
                'ward': 'Limuru',
                'county': 'Kiambu',
                'acreage': 12.0,
                'globalGAPStatus': 'expired',
                'globalGAPExpiry': date(2025, 12, 31),
                'primaryExporter': 'Kipchirchir Estates',
                'lat': -1.102,
                'lng': 36.645
            }
        ]
        for r_data in registrations_data:
            FarmerRegistration.objects.get_or_create(
                hcdaRegNumber=r_data['hcdaRegNumber'],
                defaults=r_data
            )

        # 9. Create Quarantine Management records (KEPHIS)
        self.stdout.write('Creating KEPHIS quarantine records...')
        quarantine_data = [
            {
                'blockId': 'B-101',
                'farmName': 'Wanjiru Farm',
                'county': "Murang'a",
                'pestType': 'False Codling Moth',
                'captureRate': 15.5,
                'lastInspection': date.today() - timedelta(days=10),
                'kephisStatus': 'gated',
                'inspector': 'Inspector Mutua'
            },
            {
                'blockId': 'A-12',
                'farmName': 'Kipchirchir Estates',
                'county': 'Kiambu',
                'pestType': 'Fruit Fly',
                'captureRate': 2.1,
                'lastInspection': date.today() - timedelta(days=5),
                'kephisStatus': 'cleared',
                'inspector': 'Inspector Sarah'
            }
        ]
        for q_data in quarantine_data:
            QuarantineManagement.objects.get_or_create(
                blockId=q_data['blockId'],
                defaults=q_data
            )

        # 10. Populate Knowledge Base
        self.stdout.write('Populating knowledge base...')
        pest_cat, _ = Category.objects.get_or_create(name='Pest Management')
        disease_cat, _ = Category.objects.get_or_create(name='Disease Management')
        biology_cat, _ = Category.objects.get_or_create(name='Pest Biology')

        entries = [
            {
                'category': pest_cat,
                'title': 'Fruit Fly Management in Avocado',
                'content': 'Fruit flies (Ceratitis capitata, Bactrocera dorsalis) are major pests of avocado. Management include: \n1. Orchard sanitation - remove and bury fallen fruits. \n2. Protein baiting - use of protein hydrolysate. \n3. Pheromone traps - for monitoring and mass trapping.'
            },
            {
                'category': pest_cat,
                'title': 'False Codling Moth (FCM) Control',
                'content': 'False Codling Moth (Thaumatotibia leucotreta) is a regulated pest. Control measures: \n1. Regular scouting for symptoms (entry holes, frass). \n2. Pheromone mating disruption. \n3. Augmentative biological control using Trichogramma wasps.'
            },
            {
                'category': disease_cat,
                'title': 'Avocado Root Rot (Phytophthora cinnamomi)',
                'content': 'The most serious disease of avocado worldwide. Symptoms: \n1. Pale, wilted leaves. \n2. Sparse foliage. \n3. Blackened feeder roots. \nControl: Improve drainage, use resistant rootstocks (e.g., Dusa), and apply phosphonate fungicides.'
            },
            {
                'category': biology_cat,
                'title': 'Life Cycle of Avocado Thrips',
                'content': 'Avocado thrips (Scirtothrips perseae) have several life stages: egg, two larval stages, two pupal stages (pseudopupae), and adult. Larvae feed on young fruit causing scarring ("alligator skin").'
            }
        ]

        for entry_data in entries:
            KnowledgeEntry.objects.get_or_create(
                title=entry_data['title'],
                defaults={'category': entry_data['category'], 'content': entry_data['content']}
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated all sample data!'))
