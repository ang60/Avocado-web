# Generated for mobile ↔ dashboard merge

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pest_scouting', '0022_problemreport_farmer'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='weeklyrecord',
            name='raw_payload',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.CreateModel(
            name='TrapLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('trap_name', models.CharField(max_length=255)),
                ('number_of_traps', models.PositiveIntegerField(default=0)),
                ('photo', models.URLField(blank=True, default='', max_length=2048)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('farm', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='trap_logs', to='pest_scouting.farm')),
                ('farmer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trap_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='ScoutingReview',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('identified_label', models.CharField(max_length=255)),
                ('management_protocol', models.TextField(blank=True, null=True)),
                ('review_status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('needs_follow_up', 'Needs Follow Up')], default='confirmed', max_length=20)),
                ('training_tagged', models.BooleanField(default=True)),
                ('review_notes', models.TextField(blank=True, null=True)),
                ('pushed_to_farmer', models.BooleanField(default=False)),
                ('reviewed_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('record', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='triage_review', to='pest_scouting.weeklyrecord')),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='scouting_reviews', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-reviewed_at'],
            },
        ),
    ]
