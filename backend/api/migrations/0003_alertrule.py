import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_seed_permissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlertRule',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('condition', models.CharField(max_length=64)),
                ('threshold', models.CharField(max_length=64)),
                ('county', models.CharField(blank=True, default='', max_length=128)),
                ('pest', models.CharField(blank=True, default='', max_length=255)),
                ('action', models.CharField(max_length=32)),
                ('recipients', models.TextField(blank=True, default='')),
                ('status', models.CharField(choices=[('active', 'active'), ('inactive', 'inactive')], default='active', max_length=16)),
                ('triggered_count', models.PositiveIntegerField(default=0)),
                ('last_triggered_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
