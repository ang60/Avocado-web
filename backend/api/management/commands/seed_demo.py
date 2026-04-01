from __future__ import annotations

from datetime import date, datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import Case, Entity, EntityType, FarmBlock, FarmerProfile, Role, ScoutingReport, User


class Command(BaseCommand):
    help = 'Seed demo data for Avoguard (idempotent).'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Delete existing demo data first.')

    def handle(self, *args, **options):
        reset = bool(options.get('reset'))

        demo_tag = 'DEMO'

        if reset:
            self.stdout.write('Resetting demo data…')
            ScoutingReport.objects.filter(farmer__owner__icontains=demo_tag).delete()
            Case.objects.filter(notes__icontains=demo_tag).delete()
            FarmBlock.objects.filter(name__icontains=demo_tag).delete()
            FarmerProfile.objects.filter(owner__icontains=demo_tag).delete()
            User.objects.filter(first_name=demo_tag).delete()
            Entity.objects.filter(company_name__icontains=demo_tag).delete()

        roles = {r.role_name: r for r in Role.objects.all()}
        admin_role = roles.get('Administrator')
        exporter_role = roles.get('Exporter')
        agronomist_role = roles.get('Agronomist')
        farmer_role = roles.get('Farmer')

        exporter_entity, _ = Entity.objects.get_or_create(
            company_name=f'Vegpro Kenya Ltd ({demo_tag})',
            defaults={
                'entity_type': EntityType.EXPORTER,
                'HCDA_license': 'HCDA/EX/2026/0001',
                'license_expiry_date': date.today() + timedelta(days=365),
                'head_agronomist': 'Dr. Demo Agronomist',
                'linked_farmers': 0,
                'is_active': True,
                'company_email': 'demo@vegpro.example',
                'phone_number': '+254700000001',
                'primary_county': "Murang'a",
            },
        )

        # Core users
        admin_user, _ = User.objects.get_or_create(
            phone_number='+254700000010',
            defaults={
                'first_name': demo_tag,
                'last_name': 'Admin',
                'email': 'demo.admin@example.com',
                'county': "Murang'a",
                'role': admin_role,
                'entity': None,
                'is_staff': True,
                'is_active': True,
            },
        )
        if admin_role and admin_user.role_id != admin_role.id:
            admin_user.role = admin_role
            admin_user.is_staff = True
            admin_user.save(update_fields=['role', 'is_staff'])

        exporter_user, _ = User.objects.get_or_create(
            phone_number='+254700000020',
            defaults={
                'first_name': demo_tag,
                'last_name': 'Exporter',
                'email': 'demo.exporter@example.com',
                'county': "Murang'a",
                'role': exporter_role,
                'entity': exporter_entity,
                'is_active': True,
            },
        )
        if exporter_role and exporter_user.role_id != exporter_role.id:
            exporter_user.role = exporter_role
            exporter_user.entity = exporter_entity
            exporter_user.save(update_fields=['role', 'entity'])

        agronomist_user, _ = User.objects.get_or_create(
            phone_number='+254700000030',
            defaults={
                'first_name': demo_tag,
                'last_name': 'Agronomist',
                'email': 'demo.agronomist@example.com',
                'county': "Murang'a",
                'role': agronomist_role,
                'entity': None,
                'is_active': True,
            },
        )
        if agronomist_role and agronomist_user.role_id != agronomist_role.id:
            agronomist_user.role = agronomist_role
            agronomist_user.save(update_fields=['role'])

        # Farmers
        farmer_defs = [
            {
                'phone': '+254700001001',
                'name': 'Peter Mwangi',
                'farm_name': 'Kangema Avocado Growers',
                'location': 'Kangema',
                'county': "Murang'a",
                'ward': 'Kangema',
                'sub_county': 'Kangema',
                'eligibility': 'at-risk',
                'finding': 'False Codling Moth',
                'status': 'high-risk',
                'overdue': True,
                'logs': [1, 1, 0, 0],
            },
            {
                'phone': '+254700001002',
                'name': 'Grace Achieng',
                'farm_name': 'Kakuzi Demo Farm',
                'location': 'Makuyu',
                'county': "Murang'a",
                'ward': 'Makuyu',
                'sub_county': 'Maragua',
                'eligibility': 'ready',
                'finding': 'No issues detected',
                'status': 'no-pests',
                'overdue': False,
                'logs': [1, 1, 1, 1],
            },
        ]

        created_profiles = []
        for fd in farmer_defs:
            u, _ = User.objects.get_or_create(
                phone_number=fd['phone'],
                defaults={
                    'first_name': demo_tag,
                    'last_name': 'Farmer',
                    'email': None,
                    'county': fd['county'],
                    'role': farmer_role,
                    'entity': None,
                    'is_active': True,
                },
            )
            if farmer_role and u.role_id != farmer_role.id:
                u.role = farmer_role
                u.save(update_fields=['role'])

            prof, _ = FarmerProfile.objects.get_or_create(
                user=u,
                defaults={
                    'name': fd['name'],
                    'owner': f'{demo_tag} owner',
                    'farm_name': fd['farm_name'],
                    'location': fd['location'],
                    'county': fd['county'],
                    'ward': fd['ward'],
                    'sub_county': fd['sub_county'],
                    'primary_channel': 'smartphone',
                    'registration_date': date.today() - timedelta(days=180),
                    'total_acres': 25.0,
                    'blocks_managed': 2,
                    'trees_count': 320,
                    'export_eligibility': fd['eligibility'],
                    'weekly_scouting_logs_4w': fd['logs'],
                    'overdue_scouts': fd['overdue'],
                    'last_inspection': (date.today() - timedelta(days=3)).isoformat(),
                    'last_scouting_status': fd['status'],
                    'last_scouting_finding': fd['finding'],
                    'last_scouting_date': (date.today() - timedelta(days=3)).isoformat(),
                    'last_scouting_scout_name': 'Jane Wambui',
                    'linked_exporter': exporter_entity,
                },
            )
            created_profiles.append(prof)

            # Blocks
            b1, _ = FarmBlock.objects.get_or_create(
                farmer=prof,
                name=f'Block A-12 ({demo_tag})',
                defaults={
                    'acres': 12.0,
                    'trees': 160,
                    'status': 'at-risk' if fd['status'] != 'no-pests' else 'healthy',
                    'last_inspection': (date.today() - timedelta(days=3)).isoformat(),
                    'latitude': -0.6833,
                    'longitude': 37.0167,
                },
            )
            FarmBlock.objects.get_or_create(
                farmer=prof,
                name=f'Block B-08 ({demo_tag})',
                defaults={
                    'acres': 13.0,
                    'trees': 160,
                    'status': 'healthy',
                    'last_inspection': (date.today() - timedelta(days=6)).isoformat(),
                    'latitude': -0.6825,
                    'longitude': 37.0181,
                },
            )

            # Cases (only for first farmer)
            demo_case = None
            if fd['status'] != 'no-pests':
                demo_case, _ = Case.objects.get_or_create(
                    farmer=prof,
                    block=b1,
                    pest_disease=fd['finding'],
                    defaults={
                        'severity': 'high',
                        'pest_disease_kiswahili': '',
                        'date_submitted': timezone.now() - timedelta(days=2),
                        'submission_channel': 'smartphone',
                        'scout_name': 'Jane Wambui',
                        'scout_phone': '+254700000099',
                        'affected_trees': 45,
                        'symptoms': ['Fruit damage', 'Larvae in fruit', 'Premature fruit drop'],
                        'symptom_codes': ['FCM-01', 'FCM-03'],
                        'notes': f'{demo_tag}: Heavy infestation observed. Recommend immediate pheromone trap deployment.',
                        'status': 'new',
                        'assigned_agronomist': agronomist_user,
                    },
                )

            ScoutingReport.objects.get_or_create(
                farmer=prof,
                block=b1,
                finding=fd['finding'],
                source=ScoutingReport.Source.APP,
                defaults={
                    'severity': ScoutingReport.Severity.HIGH if fd['status'] != 'no-pests' else ScoutingReport.Severity.LOW,
                    'status': (
                        ScoutingReport.DetectionStatus.DETECTED
                        if fd['status'] != 'no-pests'
                        else ScoutingReport.DetectionStatus.CLEAN
                    ),
                    'scout_name': 'Jane Wambui',
                    'reviewed': (
                        ScoutingReport.ReviewStatus.NEW if fd['status'] != 'no-pests' else ScoutingReport.ReviewStatus.REVIEWED
                    ),
                    'assigned_to': agronomist_user if fd['status'] != 'no-pests' else None,
                    'related_case': demo_case,
                    'submitted_at': timezone.now() - timedelta(days=1 if fd['status'] != 'no-pests' else 3),
                },
            )
            if fd['status'] == 'no-pests':
                ScoutingReport.objects.get_or_create(
                    farmer=prof,
                    block=b1,
                    finding='Routine check',
                    source=ScoutingReport.Source.USSD,
                    defaults={
                        'severity': ScoutingReport.Severity.LOW,
                        'status': ScoutingReport.DetectionStatus.CLEAN,
                        'ussd_code': '*104#',
                        'scout_name': '',
                        'reviewed': ScoutingReport.ReviewStatus.REVIEWED,
                        'submitted_at': timezone.now() - timedelta(hours=8),
                    },
                )

        # Update exporter entity linked farmers count (for admin list)
        exporter_entity.linked_farmers = FarmerProfile.objects.filter(linked_exporter=exporter_entity).count()
        exporter_entity.save(update_fields=['linked_farmers'])

        self.stdout.write(self.style.SUCCESS('Demo data seeded.'))
        self.stdout.write('Log in via OTP with one of these demo phones:')
        self.stdout.write(f'- Admin: {admin_user.phone_number}')
        self.stdout.write(f'- Exporter: {exporter_user.phone_number}')
        self.stdout.write(f'- Agronomist: {agronomist_user.phone_number}')
        for prof in created_profiles:
            self.stdout.write(f'- Farmer: {prof.user.phone_number} ({prof.name})')

