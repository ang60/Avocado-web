from rest_framework import serializers
from .models import Category, KnowledgeEntry

class CategorySerializer(serializers.ModelSerializer):
    material_count = serializers.IntegerField(read_only=True)
    active_use_cases_count = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'material_count', 'active_use_cases_count']

class KnowledgeEntrySerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    last_updated = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = KnowledgeEntry
        fields = [
            'id', 'category', 'category_id', 'title', 'content', 
            'severity', 'tags', 'views', 'active_use_cases', 
            'approved_content', 'chemical_gate', 'source_file', 
            'image', 'created_at', 'last_updated'
        ]
        read_only_fields = ['id', 'created_at', 'last_updated', 'views']

    def to_internal_value(self, data):
        data = data.copy()
        if 'category' in data and not isinstance(data['category'], dict):
            data['category_id'] = data.pop('category')
        return super().to_internal_value(data)
