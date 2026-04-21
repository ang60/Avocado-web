# Seed demo operational data so dashboards and charts have content.
#
# Safe to re-run: this migration is idempotent and will not duplicate rows
# if the seed marker farmers already exist.

from __future__ import annotations

from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.db import migrations
from django.utils import timezone


SEED_TAG = 'DEMO-SEED-2026-04'

# Create a few farmer users + profiles (linked to accounts.User).
DEMO_FARMERS = [
    # phone, name, county, location, acres, export_eligibility
    ('+254700009201', 'Joseph Kamau', "Murang'a", 'Kangema, Murang\'a', 12.5, 'ready'),
    ('+254700009202', 'Mary Wanjiku', 'Kiambu', 'Gatundu North, Kiambu', 8.3, 'at-risk'),
    ('+254700009203', 'Peter Mwangi', 'Meru', 'Nkubu, Meru', 15.0, 'ready'),
    ('+254700009204', 'Grace Njeri', 'Nyeri', 'Kieni, Nyeri', 6.7, 'suspended'),
    ('+254700009205', 'David Kariuki', 'Embu', 'Runyenjes, Embu', 10.2, 'ready'),
]

DEMO_PASSWORD = 'DemoPass123!'


def _split_name(full: str) -> tuple[str, str]:
    parts = [p for p in str(full or '').split() if p]
    if not parts:
        return '', ''
    return parts[0], ' '.join(parts[1:]) if len(parts) > 1 else ''


def seed_demo_data(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    Role = apps.get_model('accounts', 'Role')
    FarmerProfile = apps.get_model('api', 'FarmerProfile')
    FarmBlock = apps.get_model('api', 'FarmBlock')
    ScoutingReport = apps.get_model('api', 'ScoutingReport')
    Case = apps.get_model('api', 'Case')
    AlertRule = apps.get_model('api', 'AlertRule')

    # If we already seeded (marker farmer exists), skip.
    if FarmerProfile.objects.filter(owner=SEED_TAG).exists():
        return

    farmer_role = Role.objects.filter(role_name='Farmer').first()
    agronomist_user = User.objects.filter(phone_number='+254700000106').first()  # demo agronomist (accounts.0013)
    now = timezone.now()

    farmer_profiles = []
    for phone, name, county, location, acres, eligibility in DEMO_FARMERS:
        first, last = _split_name(name)

        user = User.objects.filter(phone_number=phone).first()
        if not user:
            user = User(
                phone_number=phone,
                email=f'demo.{phone[-4:]}@avoguard.local',
                first_name=first,
                last_name=last or ' ',
                password=make_password(DEMO_PASSWORD),
                is_active=True,
                is_staff=False,
                is_superuser=False,
                county=county,
                role_id=farmer_role.pk if farmer_role else None,
            )
            user.save()

        fp = FarmerProfile.objects.filter(user_id=user.pk).first()
        if not fp:
            fp = FarmerProfile(
                user_id=user.pk,
                name=name,
                owner=SEED_TAG,
                farm_name=f'{first} Farm',
                location=location,
                county=county,
                ward='',
                sub_county='',
                primary_channel='smartphone',
                registration_date=now.date() - timedelta(days=90),
                total_acres=float(acres),
                blocks_managed=2,
                trees_count=int(round(float(acres) * 120)),
                export_eligibility=eligibility,
                weekly_scouting_logs_4w=[1, 1, 0, 1],
                overdue_scouts=False,
                last_inspection=(now.date() - timedelta(days=7)).isoformat(),
                last_scouting_status='no-pests',
                last_scouting_finding='',
                last_scouting_date=now.strftime('%Y-%m-%d %H:%M'),
                last_scouting_scout_name='',
            )
            fp.save()
        farmer_profiles.append(fp)

        # Two blocks each.
        for idx in (1, 2):
            blk_name = f'Block {idx}'
            if not FarmBlock.objects.filter(farmer_id=fp.pk, name=blk_name).exists():
                FarmBlock.objects.create(
                    farmer_id=fp.pk,
                    name=blk_name,
                    acres=float(acres) / 2.0,
                    trees=int(round(float(acres) * 60)),
                    status='active',
                    last_inspection=(now.date() - timedelta(days=7)).isoformat(),
                    latitude=None,
                    longitude=None,
                )

    # Scouting reports (recent 8)
    all_blocks = list(FarmBlock.objects.filter(farmer_id__in=[fp.pk for fp in farmer_profiles]).order_by('name')[:20])
    findings = [
        ('clean', 'low', 'No pests detected'),
        ('detected', 'medium', 'Thrips damage on young leaves'),
        ('detected', 'high', 'Signs of Phytophthora root rot'),
        ('detected', 'low', 'Mite hotspots in one section'),
    ]
    for i in range(8):
        blk = all_blocks[i % len(all_blocks)]
        status, severity, finding = findings[i % len(findings)]
        ScoutingReport.objects.create(
            farmer_id=blk.farmer_id,
            block_id=blk.pk,
            source='app',
            severity=severity,
            finding=finding,
            status=status,
            media_preview='',
            ussd_code='',
            scout_name='Field Scout',
            reviewed='new' if i < 4 else 'under-review',
            assigned_to_id=agronomist_user.pk if agronomist_user else None,
            related_case_id=None,
            # submitted_at is auto_now_add; leave it as now-ish for demo
        )

    # Cases across the last 6 weeks to populate trends
    pests = [
        ('Avocado Thrips', 'medium'),
        ('Phytophthora Root Rot', 'high'),
        ('Persea Mite', 'low'),
        ('Anthracnose', 'medium'),
    ]
    statuses = ['new', 'under-review', 'advisory-issued']
    for week in range(0, 6):
        dt = now - timedelta(days=7 * week + 1)
        for j in range(2):
            blk = all_blocks[(week * 2 + j) % len(all_blocks)]
            pest, sev = pests[(week + j) % len(pests)]
            Case.objects.create(
                farmer_id=blk.farmer_id,
                block_id=blk.pk,
                severity=sev,
                pest_disease=pest,
                pest_disease_kiswahili='',
                date_submitted=dt,
                submission_channel='smartphone',
                scout_name='Field Scout',
                scout_phone='',
                affected_trees=5 + (week * 2) + j,
                symptoms=['leaf damage', 'spots'] if sev != 'low' else ['minor leaf damage'],
                symptom_codes=[],
                notes=f'{SEED_TAG}: seeded case',
                status=statuses[(week + j) % len(statuses)],
                assigned_agronomist_id=agronomist_user.pk if agronomist_user else None,
            )

    # A couple of alert rules so Alerts + Admin pages aren't empty.
    if not AlertRule.objects.exists():
        AlertRule.objects.create(
            name='High severity cases threshold',
            condition='weekly_high_severity',
            threshold='>= 7',
            county="Murang'a",
            pest='',
            action='notify',
            recipients='Admins',
            status='active',
            triggered_count=2,
            last_triggered_at=now - timedelta(days=2),
        )
        AlertRule.objects.create(
            name='Overdue scouting inspections',
            condition='overdue_scouting',
            threshold='>= 14 days',
            county='',
            pest='',
            action='notify',
            recipients='Agronomists',
            status='active',
            triggered_count=1,
            last_triggered_at=now - timedelta(days=4),
        )


def unseed_demo_data(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    FarmerProfile = apps.get_model('api', 'FarmerProfile')
    FarmBlock = apps.get_model('api', 'FarmBlock')
    ScoutingReport = apps.get_model('api', 'ScoutingReport')
    Case = apps.get_model('api', 'Case')

    fps = list(FarmerProfile.objects.filter(owner=SEED_TAG))
    fp_ids = [fp.pk for fp in fps]
    user_ids = [fp.user_id for fp in fps]

    # Delete domain rows first.
    Case.objects.filter(farmer_id__in=fp_ids).delete()
    ScoutingReport.objects.filter(farmer_id__in=fp_ids).delete()
    FarmBlock.objects.filter(farmer_id__in=fp_ids).delete()
    FarmerProfile.objects.filter(id__in=fp_ids).delete()

    # Delete demo farmer users (keep if they were reused for some reason).
    User.objects.filter(id__in=user_ids, phone_number__startswith='+254700009').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        ('accounts', '0014_set_admin_login_for_0798208346'),
    ]

    operations = [
        migrations.RunPython(seed_demo_data, unseed_demo_data),
    ]

