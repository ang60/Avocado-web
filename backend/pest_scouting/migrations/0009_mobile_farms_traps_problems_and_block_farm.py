# Generated manually for mobile app integration

import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('pest_scouting', '0008_seed_kephis_incident_hotlist_demo_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='Farm',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('farm_name', models.CharField(max_length=255)),
                ('location', models.CharField(blank=True, default='', max_length=512)),
                ('number_of_blocks', models.PositiveIntegerField(default=0)),
                ('farm_size', models.FloatField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'farmer',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='pest_scouting_farms',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='farmblock',
            name='farm',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='blocks',
                to='pest_scouting.farm',
            ),
        ),
        migrations.CreateModel(
            name='TrapLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('trap_name', models.CharField(max_length=255)),
                ('number_of_traps', models.PositiveIntegerField(default=0)),
                ('photo', models.URLField(blank=True, default='', max_length=2048)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                (
                    'farmer',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='trap_logs',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    'farm',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='trap_logs',
                        to='pest_scouting.farm',
                    ),
                ),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='ProblemReport',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    'problem_type',
                    models.CharField(
                        choices=[('Pest', 'Pest'), ('Disease', 'Disease'), ('Other', 'Other')],
                        default='Other',
                        max_length=32,
                    ),
                ),
                (
                    'urgency',
                    models.CharField(
                        choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')],
                        default='Low',
                        max_length=16,
                    ),
                ),
                ('photo', models.URLField(blank=True, default='', max_length=2048)),
                ('description', models.TextField(blank=True, default='')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                (
                    'farmer',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='problem_reports',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
