from rest_framework import serializers
from .models import Category, KnowledgeEntry


class CategorySerializer(serializers.ModelSerializer):
    material_count = serializers.IntegerField(read_only=True)
    active_use_cases_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'material_count', 'active_use_cases_count']


class KnowledgeEntrySerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    last_updated = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = KnowledgeEntry
        fields = [
            'id', 'category', 'category_name', 'title', 'content',
            'severity', 'tags', 'views', 'active_use_cases',
            'approved_content', 'chemical_gate', 'source_file',
            'image', 'regional_alerts', 'created_at', 'last_updated'
        ]
        read_only_fields = ['id', 'created_at', 'last_updated', 'views']

