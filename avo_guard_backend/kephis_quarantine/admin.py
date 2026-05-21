from django.contrib import admin
from .models import QuarantineManagement

@admin.register(QuarantineManagement)
class QuarantineManagementAdmin(admin.ModelAdmin):
    list_display = ('blockId', 'farmName', 'county', 'pestType', 'kephisStatus', 'inspector', 'lastInspection')
    list_filter = ('kephisStatus', 'county', 'pestType', 'lastInspection')
    search_fields = ('blockId', 'farmName', 'inspector')
    readonly_fields = ('created_at', 'updated_at')
