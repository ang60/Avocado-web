from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db.models import Q

from accounts.models import Entity, Role, User
from case_management.models import Case
from hcda_registry.models import FarmerRegistration
from kephis_quarantine.models import QuarantineManagement
from knowledge_base.models import Category, KnowledgeEntry
from pest_scouting.models import FarmBlock, WeeklyRecord


class Command(BaseCommand):
    help = "Seed demo data for existing modules (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete previously seeded records (where applicable) before reseeding.",
        )

    def handle(self, *args, **options):
        reset = options["reset"]
        seed_tag = "DEMO-SEED-EXISTING-MODULES"

        if reset:
            self.stdout.write("Resetting previously seeded module data...")
            Case.objects.filter(notes__icontains=seed_tag).delete()
            WeeklyRecord.objects.filter(additional_notes__icontains=seed_tag).delete()
            FarmBlock.objects.filter(block_name__startswith="Demo Block").delete()
            QuarantineManagement.objects.filter(farmName__startswith="Demo Farm").delete()
            KnowledgeEntry.objects.filter(title__startswith="[DEMO]").delete()
            FarmerRegistration.objects.filter(hcdaRegNumber__startswith="HCDA-DEMO-").delete()

        # Roles
        role_farmer, _ = Role.objects.get_or_create(
            role_name="Farmer",
            defaults={"description": "Farmer role"},
        )
        role_agronomist, _ = Role.objects.get_or_create(
            role_name="Agronomist",
            defaults={"description": "Agronomist role"},
        )

        # Entity
        entity, _ = Entity.objects.get_or_create(
            HCDA_license="HCDA-DEMO-LICENSE-001",
            defaults={
                "entity_type": "Exporter",
                "company_name": "Demo Exporters Ltd",
                "license_expiry_date": date.today() + timedelta(days=365),
                "head_agronomist": "Demo Agronomist",
                "primary_county": "Murang'a",
                "company_email": "demo.exporter@avoguard.local",
                "phone_number": "+254700990001",
                "is_active": True,
            },
        )

        # Users (upsert by phone OR email to avoid unique-email collisions)
        def upsert_demo_user(*, phone, email, first_name, last_name, role, managed_by=None):
            user = User.objects.filter(Q(phone_number=phone) | Q(email__iexact=email)).first()
            created = False
            if not user:
                user = User(phone_number=phone, email=email)
                created = True
            else:
                # Keep seeded phone/email canonical to make reruns stable.
                user.phone_number = phone
                user.email = email

            user.first_name = first_name
            user.last_name = last_name
            user.county = "Murang'a"
            user.role = role
            user.entity = entity
            user.managed_by = managed_by
            user.is_active = True
            user.save()

            if created or not user.check_password("DemoPass123!"):
                user.set_password("DemoPass123!")
                user.save(update_fields=["password"])

            return user

        agronomist = upsert_demo_user(
            phone="+254700990010",
            email="demo.agronomist@avoguard.local",
            first_name="Demo",
            last_name="Agronomist",
            role=role_agronomist,
        )
        farmer = upsert_demo_user(
            phone="+254700990011",
            email="demo.farmer@avoguard.local",
            first_name="Demo",
            last_name="Farmer",
            role=role_farmer,
            managed_by=agronomist,
        )

        # Pest scouting data
        block_a, _ = FarmBlock.objects.get_or_create(
            farmer=farmer,
            block_name="Demo Block A",
            defaults={"number_of_trees": 120},
        )
        block_b, _ = FarmBlock.objects.get_or_create(
            farmer=farmer,
            block_name="Demo Block B",
            defaults={"number_of_trees": 90},
        )
        # Keep polygon boundaries stable for demo farmer map experience.
        block_a.number_of_trees = 120
        block_a.boundary_points = [
            {"lat": -0.73215, "lng": 37.15240},
            {"lat": -0.73182, "lng": 37.15295},
            {"lat": -0.73234, "lng": 37.15325},
            {"lat": -0.73262, "lng": 37.15275},
        ]
        block_a.save(update_fields=["number_of_trees", "boundary_points"])

        block_b.number_of_trees = 90
        block_b.boundary_points = [
            {"lat": -0.73305, "lng": 37.15165},
            {"lat": -0.73272, "lng": 37.15210},
            {"lat": -0.73320, "lng": 37.15245},
            {"lat": -0.73346, "lng": 37.15195},
        ]
        block_b.save(update_fields=["number_of_trees", "boundary_points"])

        yes = "Yes"
        no = "No"
        pest = WeeklyRecord.PEST_CHOICES[0][0]
        beneficial = WeeklyRecord.BENEFICIAL_INSECT_CHOICES[0][0]
        plant_part = WeeklyRecord.PLANT_PART_CHOICES[0][0]
        crop_stage = WeeklyRecord.CROP_STAGE_CHOICES[0][0]
        detect_method = WeeklyRecord.DETECTION_METHOD_CHOICES[0][0]
        disease = WeeklyRecord.DISEASE_CHOICES[0][0]
        action = WeeklyRecord.ACTION_TAKEN_CHOICES[0][0]
        outcome = WeeklyRecord.OUTCOME_CHOICES[0][0]

        weekly_1, _ = WeeklyRecord.objects.get_or_create(
            farmer=farmer,
            block=block_a,
            start_date=date.today() - timedelta(days=7),
            end_date=date.today() - timedelta(days=1),
            defaults={
                "variety": "Hass",
                "type_of_trap": "Yellow sticky trap",
                "number_of_trap": 6,
                "traps_replaced": 2,
                "any_pests_observed": yes,
                "pests_observed": pest,
                "beneficial_insects_observed": beneficial,
                "number_of_trees_affected": 18,
                "pest_plant_part_affected": plant_part,
                "pest_crop_stage": crop_stage,
                "pest_detection_method": detect_method,
                "pests_per_trap": "2.50",
                "any_diseases_observed": no,
                "actions_taken": action,
                "outcome": outcome,
                "location": "Murang'a North",
                "additional_notes": f"{seed_tag} weekly record 1",
            },
        )

        weekly_2, _ = WeeklyRecord.objects.get_or_create(
            farmer=farmer,
            block=block_b,
            start_date=date.today() - timedelta(days=14),
            end_date=date.today() - timedelta(days=8),
            defaults={
                "variety": "Fuerte",
                "type_of_trap": "Bucket trap",
                "number_of_trap": 4,
                "traps_replaced": 1,
                "any_pests_observed": yes,
                "pests_observed": pest,
                "beneficial_insects_observed": beneficial,
                "number_of_trees_affected": 10,
                "pest_plant_part_affected": plant_part,
                "pest_crop_stage": crop_stage,
                "pest_detection_method": detect_method,
                "pests_per_trap": "1.75",
                "any_diseases_observed": yes,
                "disease": disease,
                "disease_plant_part": plant_part,
                "disease_crop_stage": crop_stage,
                "disease_detection_method": detect_method,
                "actions_taken": action,
                "outcome": outcome,
                "location": "Murang'a South",
                "additional_notes": f"{seed_tag} weekly record 2",
            },
        )

        # Case management data
        Case.objects.get_or_create(
            case_title="[DEMO] FCM on Demo Block A",
            pest_scouting_record=weekly_1,
            defaults={
                "severity": "high",
                "notes": f"{seed_tag} case from scouting record",
                "assigned_agronomist": agronomist,
            },
        )
        Case.objects.get_or_create(
            case_title="[DEMO] Root rot suspicion on Demo Block B",
            pest_scouting_record=weekly_2,
            defaults={
                "severity": "medium",
                "notes": f"{seed_tag} second case from scouting record",
                "assigned_agronomist": agronomist,
            },
        )

        # KEPHIS quarantine data
        for i, status in enumerate(["gated", "pending", "cleared"], start=1):
            QuarantineManagement.objects.get_or_create(
                blockId=f"DEMO-BLK-{i:03d}",
                defaults={
                    "farmName": f"Demo Farm {i}",
                    "county": "Murang'a",
                    "pestType": "False codling moth",
                    "captureRate": "3.25",
                    "lastInspection": date.today() - timedelta(days=i),
                    "kephisStatus": status,
                    "inspector": "Demo Inspector",
                    "selected": False,
                },
            )

        # Knowledge base data
        cat_pest, _ = Category.objects.get_or_create(name="Pest Management")
        cat_disease, _ = Category.objects.get_or_create(name="Disease Management")

        KnowledgeEntry.objects.get_or_create(
            title="[DEMO] False Codling Moth Management",
            defaults={
                "category": cat_pest,
                "content": "Use monitoring traps, sanitation, and timely control interventions.",
                "severity": "high",
                "tags": ["fcm", "trap", "scouting"],
                "active_use_cases": "High FCM pressure in Murang'a blocks.",
                "approved_content": True,
                "chemical_gate": "open",
            },
        )
        KnowledgeEntry.objects.get_or_create(
            title="[DEMO] Phytophthora Root Rot Advisory",
            defaults={
                "category": cat_disease,
                "content": "Improve drainage and avoid over-irrigation to reduce root rot pressure.",
                "severity": "medium",
                "tags": ["root-rot", "drainage"],
                "active_use_cases": "Wet-season orchard monitoring.",
                "approved_content": True,
                "chemical_gate": "open",
            },
        )

        # HCDA registry data
        FarmerRegistration.objects.get_or_create(
            hcdaRegNumber="HCDA-DEMO-FARMER-001",
            defaults={
                "farmerName": "Demo Farmer",
                "ward": "Kandara",
                "county": "Murang'a",
                "acreage": 3.2,
                "globalGAPStatus": "compliant",
                "globalGAPExpiry": date.today() + timedelta(days=120),
                "primaryExporter": entity.company_name,
                "lat": -0.7328,
                "lng": 37.1522,
            },
        )
        for i in range(1, 6):
            FarmerRegistration.objects.get_or_create(
                hcdaRegNumber=f"HCDA-DEMO-{i:04d}",
                defaults={
                    "farmerName": f"Demo Farmer {i}",
                    "ward": "Kandara",
                    "county": "Murang'a",
                    "acreage": 2.5 + i,
                    "globalGAPStatus": "compliant" if i % 2 == 0 else "expired",
                    "globalGAPExpiry": date.today() + timedelta(days=90 - i * 10),
                    "primaryExporter": entity.company_name,
                    "lat": -0.7500 + (i * 0.01),
                    "lng": 37.1500 + (i * 0.01),
                },
            )

        self.stdout.write(self.style.SUCCESS("Seed complete for existing modules."))
        self.stdout.write("Created/updated demo users:")
        self.stdout.write("  - Farmer: +254700990011 / DemoPass123!")
        self.stdout.write("  - Agronomist: +254700990010 / DemoPass123!")

