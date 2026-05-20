from django.core.management.base import BaseCommand

from knowledge_base.models import Category, KnowledgeEntry


class Command(BaseCommand):
    help = 'Populate knowledge base with representative entries'

    def handle(self, *args, **options):
        pest_cat, _ = Category.objects.get_or_create(name='Pest Management')
        disease_cat, _ = Category.objects.get_or_create(name='Disease Management')
        biology_cat, _ = Category.objects.get_or_create(name='Pest Biology')

        entries = [
            {
                'category': pest_cat,
                'title': 'Fruit Fly Management in Avocado',
                'content': (
                    'Fruit flies (Ceratitis capitata, Bactrocera dorsalis) are major pests of avocado.\n'
                    'Management includes orchard sanitation, protein baiting, and pheromone traps.'
                ),
            },
            {
                'category': pest_cat,
                'title': 'False Codling Moth (FCM) Control',
                'content': (
                    'FCM is a regulated pest. Control measures include regular scouting, '
                    'pheromone mating disruption, and biological control.'
                ),
            },
            {
                'category': disease_cat,
                'title': 'Avocado Root Rot (Phytophthora cinnamomi)',
                'content': (
                    'Symptoms include wilting and blackened feeder roots. '
                    'Control includes improved drainage, resistant rootstocks, and phosphonate fungicides.'
                ),
            },
            {
                'category': biology_cat,
                'title': 'Life Cycle of Avocado Thrips',
                'content': (
                    'Avocado thrips have egg, larval, pupal, and adult stages. '
                    'Larvae feed on young fruit and can cause scarring.'
                ),
            },
        ]

        for entry_data in entries:
            KnowledgeEntry.objects.get_or_create(
                title=entry_data['title'],
                defaults={
                    'category': entry_data['category'],
                    'content': entry_data['content'],
                },
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated knowledge base with representative data.'))

