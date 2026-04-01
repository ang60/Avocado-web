import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0007_backfill_permissions_and_admin_roles'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScoutingReport',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('source', models.CharField(choices=[('app', 'app'), ('ussd', 'ussd')], default='app', max_length=16)),
                (
                    'severity',
                    models.CharField(
                        choices=[('high', 'high'), ('medium', 'medium'), ('low', 'low')],
                        default='low',
                        max_length=16,
                    ),
                ),
                ('finding', models.CharField(blank=True, default='', max_length=512)),
                (
                    'status',
                    models.CharField(choices=[('clean', 'clean'), ('detected', 'detected')], default='clean', max_length=16),
                ),
                ('media_preview', models.URLField(blank=True, default='')),
                ('ussd_code', models.CharField(blank=True, default='', max_length=32)),
                ('scout_name', models.CharField(blank=True, default='', max_length=255)),
                (
                    'reviewed',
                    models.CharField(
                        choices=[('new', 'new'), ('under-review', 'under-review'), ('reviewed', 'reviewed')],
                        default='new',
                        max_length=32,
                    ),
                ),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                (
                    'assigned_to',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='assigned_scouting_reports',
                        to='api.user',
                    ),
                ),
                (
                    'block',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='scouting_reports',
                        to='api.farmblock',
                    ),
                ),
                (
                    'farmer',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='scouting_reports',
                        to='api.farmerprofile',
                    ),
                ),
                (
                    'related_case',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='source_scouting_reports',
                        to='api.case',
                    ),
                ),
            ],
            options={
                'ordering': ['-submitted_at'],
            },
        ),
        migrations.AddIndex(
            model_name='scoutingreport',
            index=models.Index(fields=['-submitted_at'], name='api_scoutin_submitt_a4832d_idx'),
        ),
        migrations.AddIndex(
            model_name='scoutingreport',
            index=models.Index(fields=['farmer', '-submitted_at'], name='api_scoutin_farmer__6df7e4_idx'),
        ),
    ]
