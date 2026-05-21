from django.contrib import admin
from .models import Case

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_title', 'severity', 'assigned_agronomist', 'pest_scouting_record', 'created_at')
    list_filter = ('severity', 'assigned_agronomist', 'created_at')
    search_fields = ('case_title', 'notes')
    readonly_fields = ('created_at', 'updated_at')
