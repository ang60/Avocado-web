from django.contrib import admin
from .models import Advisory


@admin.register(Advisory)
class AdvisoryAdmin(admin.ModelAdmin):
    list_display = ('farmer', 'weekly_record', 'timestamp', 'outcome', 'actions_taken', 'category')
    list_filter = ('outcome', 'actions_taken', 'timestamp', 'category')
    search_fields = ('advisory_message', 'remarks', 'farmer__phone_number')
    readonly_fields = ('id', 'timestamp')

