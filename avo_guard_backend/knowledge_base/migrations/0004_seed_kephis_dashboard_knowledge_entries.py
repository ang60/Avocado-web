from django.db import migrations


def seed_kephis_kb_entries(apps, schema_editor):
    Category = apps.get_model('knowledge_base', 'Category')
    KnowledgeEntry = apps.get_model('knowledge_base', 'KnowledgeEntry')

    pest_cat, _ = Category.objects.get_or_create(
        name='Pest Surveillance',
        defaults={'description': 'Regulated pest identification and threshold guidance for national oversight.'},
    )
    protocol_cat, _ = Category.objects.get_or_create(
        name='National Protocols',
        defaults={'description': 'Official KEPHIS management protocols and phytosanitary standards.'},
    )

    entries = [
        {
            'category': pest_cat,
            'title': 'False Codling Moth National Surveillance Guideline',
            'content': (
                'Use trap density and scouting confirmation to classify outbreak pressure. '
                'Prioritize immediate containment for hotspots crossing the economic threshold.'
            ),
            'severity': 'high',
            'tags': ['FCM', 'false codling moth', 'threshold', 'KEPHIS', 'surveillance'],
            'active_use_cases': 'County risk escalation, quarantine initiation, exporter readiness checks.',
            'approved_content': True,
            'chemical_gate': 'gated',
            'regional_alerts': [
                {
                    'county': "Murang'a",
                    'alert': 'FCM pressure elevated above baseline. Intensify trap servicing and perimeter checks.',
                    'active': True,
                    'created_at': '2026-04-14T10:00:00Z',
                    'created_by': 'KEPHIS',
                }
            ],
        },
        {
            'category': pest_cat,
            'title': 'Fruit Fly Rapid Response Protocol',
            'content': (
                'If county average pests per trap exceeds configured threshold, activate amber surveillance mode '
                'and initiate targeted inspection on impacted blocks.'
            ),
            'severity': 'high',
            'tags': ['fruit fly', 'rapid response', 'economic threshold', 'traceability'],
            'active_use_cases': 'Pest pulse monitoring, incident triage, county pressure reporting.',
            'approved_content': True,
            'chemical_gate': 'open',
            'regional_alerts': [],
        },
        {
            'category': protocol_cat,
            'title': 'National Phytosanitary Readiness Checklist',
            'content': (
                'Verify scouting integrity, quarantine status, and evidence traceability before movement permit issuance '
                'for high-value export corridors.'
            ),
            'severity': 'medium',
            'tags': ['phytosanitary', 'export', 'KEPHIS', 'compliance', 'audit'],
            'active_use_cases': 'Export report generation, partner audit preparation, permit governance.',
            'approved_content': True,
            'chemical_gate': 'open',
            'regional_alerts': [],
        },
    ]

    for item in entries:
        KnowledgeEntry.objects.get_or_create(
            title=item['title'],
            defaults=item,
        )


def unseed_kephis_kb_entries(apps, schema_editor):
    KnowledgeEntry = apps.get_model('knowledge_base', 'KnowledgeEntry')
    titles = [
        'False Codling Moth National Surveillance Guideline',
        'Fruit Fly Rapid Response Protocol',
        'National Phytosanitary Readiness Checklist',
    ]
    KnowledgeEntry.objects.filter(title__in=titles).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('knowledge_base', '0003_knowledgeentry_regional_alerts'),
    ]

    operations = [
        migrations.RunPython(seed_kephis_kb_entries, unseed_kephis_kb_entries),
    ]

