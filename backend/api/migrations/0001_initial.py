import uuid

import django.db.models.deletion
from django.contrib.auth.models import UserManager
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='AppPermission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, unique=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Entity',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    'entity_type',
                    models.CharField(
                        choices=[
                            ('Exporter', 'Exporter'),
                            ('Government - KEPHIS', 'Government - KEPHIS'),
                            ('Government - HCDA', 'Government - HCDA'),
                            ('Partner Organization', 'Partner Organization'),
                        ],
                        max_length=64,
                    ),
                ),
                ('company_name', models.CharField(max_length=255)),
                ('HCDA_license', models.CharField(blank=True, max_length=128)),
                ('license_expiry_date', models.DateField(blank=True, null=True)),
                ('head_agronomist', models.CharField(blank=True, max_length=255)),
                ('linked_farmers', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('company_email', models.EmailField(blank=True, max_length=254)),
                ('phone_number', models.CharField(blank=True, max_length=32)),
                ('primary_county', models.CharField(blank=True, max_length=128)),
            ],
            options={
                'verbose_name_plural': 'entities',
                'ordering': ['company_name'],
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role_name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('permissions', models.ManyToManyField(blank=True, related_name='roles', to='api.apppermission')),
            ],
            options={
                'ordering': ['role_name'],
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                (
                    'is_superuser',
                    models.BooleanField(
                        default=False,
                        help_text='Designates that this user has all permissions without explicitly assigning them.',
                        verbose_name='superuser status',
                    ),
                ),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('phone_number', models.CharField(max_length=32, unique=True)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('first_name', models.CharField(blank=True, max_length=150)),
                ('last_name', models.CharField(blank=True, max_length=150)),
                ('county', models.CharField(blank=True, max_length=128, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                (
                    'entity',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='users',
                        to='api.entity',
                    ),
                ),
                (
                    'role',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='users',
                        to='api.role',
                    ),
                ),
                (
                    'groups',
                    models.ManyToManyField(
                        blank=True,
                        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
                        related_name='user_set',
                        related_query_name='user',
                        to='auth.group',
                        verbose_name='groups',
                    ),
                ),
                (
                    'user_permissions',
                    models.ManyToManyField(
                        blank=True,
                        help_text='Specific permissions for this user.',
                        related_name='user_set',
                        related_query_name='user',
                        to='auth.permission',
                        verbose_name='user permissions',
                    ),
                ),
            ],
            options={
                'ordering': ['phone_number'],
            },
            managers=[
                ('objects', UserManager()),
            ],
        ),
    ]
