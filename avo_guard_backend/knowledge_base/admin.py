from django.contrib import admin
from .models import Category, KnowledgeEntry


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(KnowledgeEntry)
class KnowledgeEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'severity', 'approved_content', 'chemical_gate', 'views', 'created_at')
    list_filter = ('category', 'severity', 'approved_content', 'chemical_gate')
    search_fields = ('title', 'content', 'tags')
    readonly_fields = ('views', 'created_at', 'updated_at')

