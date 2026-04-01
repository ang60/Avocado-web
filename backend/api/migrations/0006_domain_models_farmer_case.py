import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0005_seed_roles_rbac'),
    ]

    operations = [
        migrations.CreateModel(
            name='FarmerProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('owner', models.CharField(blank=True, default='', max_length=255)),
                ('farm_name', models.CharField(blank=True, default='', max_length=255)),
                ('location', models.CharField(blank=True, default='', max_length=255)),
                ('county', models.CharField(blank=True, default='', max_length=128)),
                ('ward', models.CharField(blank=True, default='', max_length=128)),
                ('sub_county', models.CharField(blank=True, default='', max_length=128)),
                (
                    'primary_channel',
                    models.CharField(
                        choices=[('smartphone', 'smartphone'), ('ussd', 'ussd')],
                        default='smartphone',
                        max_length=16,
                    ),
                ),
                ('registration_date', models.DateField(blank=True, null=True)),
                ('total_acres', models.FloatField(default=0)),
                ('blocks_managed', models.PositiveIntegerField(default=0)),
                ('trees_count', models.PositiveIntegerField(default=0)),
                (
                    'export_eligibility',
                    models.CharField(
                        choices=[('ready', 'ready'), ('at-risk', 'at-risk'), ('suspended', 'suspended')],
                        default='ready',
                        max_length=16,
                    ),
                ),
                ('weekly_scouting_logs_4w', models.JSONField(default=list)),
                ('overdue_scouts', models.BooleanField(default=False)),
                ('last_inspection', models.CharField(blank=True, default='', max_length=64)),
                ('last_scouting_status', models.CharField(blank=True, default='no-pests', max_length=32)),
                ('last_scouting_finding', models.CharField(blank=True, default='', max_length=255)),
                ('last_scouting_date', models.CharField(blank=True, default='', max_length=64)),
                ('last_scouting_scout_name', models.CharField(blank=True, default='', max_length=255)),
                (
                    'linked_exporter',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='linked_farmers_profiles',
                        to='api.entity',
                    ),
                ),
                (
                    'user',
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='farmer_profile', to='api.user'),
                ),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='FarmBlock',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=128)),
                ('acres', models.FloatField(default=0)),
                ('trees', models.PositiveIntegerField(default=0)),
                ('status', models.CharField(blank=True, default='', max_length=64)),
                ('last_inspection', models.CharField(blank=True, default='', max_length=64)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                (
                    'farmer',
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='blocks', to='api.farmerprofile'),
                ),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='Case',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    'severity',
                    models.CharField(
                        choices=[('high', 'high'), ('medium', 'medium'), ('low', 'low'), ('unknown', 'unknown')],
                        default='unknown',
                        max_length=16,
                    ),
                ),
                ('pest_disease', models.CharField(blank=True, default='', max_length=255)),
                ('pest_disease_kiswahili', models.CharField(blank=True, default='', max_length=255)),
                ('date_submitted', models.DateTimeField(blank=True, null=True)),
                ('submission_channel', models.CharField(blank=True, default='smartphone', max_length=32)),
                ('scout_name', models.CharField(blank=True, default='', max_length=255)),
                ('scout_phone', models.CharField(blank=True, default='', max_length=32)),
                ('affected_trees', models.PositiveIntegerField(default=0)),
                ('symptoms', models.JSONField(default=list)),
                ('symptom_codes', models.JSONField(default=list)),
                ('notes', models.TextField(blank=True, default='')),
                ('status', models.CharField(blank=True, default='new', max_length=64)),
                (
                    'assigned_agronomist',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='assigned_cases',
                        to='api.user',
                    ),
                ),
                (
                    'block',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='cases',
                        to='api.farmblock',
                    ),
                ),
                (
                    'farmer',
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cases', to='api.farmerprofile'),
                ),
            ],
            options={'ordering': ['-date_submitted']},
        ),
    ]

