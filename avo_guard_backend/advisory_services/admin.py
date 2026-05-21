from django.contrib import admin
from .models import Advisory

@admin.register(Advisory)
class AdvisoryAdmin(admin.ModelAdmin):
    list_display = ('farmer', 'weekly_record', 'outcome', 'timestamp')
    list_filter = ('outcome', 'timestamp')
    search_fields = ('farmer__phone_number', 'advisory_message', 'remarks')
    readonly_fields = ('id', 'timestamp')
