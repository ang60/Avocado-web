from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('kephis_quarantine', '0004_seed_kephis_threshold_defaults'),
    ]

    operations = [
        migrations.AddField(
            model_name='quarantinemanagement',
            name='evidence_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='quarantinemanagement',
            name='lift_approved_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='quarantinemanagement',
            name='lift_approved_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='kephis_lift_approvals',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='quarantinemanagement',
            name='lift_recommended_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='quarantinemanagement',
            name='lift_recommended_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='kephis_lift_recommendations',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='quarantinemanagement',
            name='lift_requested_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='QuarantineActionLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action_type', models.CharField(choices=[('issue_restriction', 'Issue Restriction'), ('request_lift', 'Request Lift'), ('recommend_lift', 'Recommend Lift'), ('approve_lift', 'Approve Lift'), ('manual_update', 'Manual Update')], max_length=40)),
                ('from_status', models.CharField(blank=True, max_length=20)),
                ('to_status', models.CharField(blank=True, max_length=20)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='kephis_quarantine_actions', to=settings.AUTH_USER_MODEL)),
                ('quarantine', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='action_logs', to='kephis_quarantine.quarantinemanagement')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
