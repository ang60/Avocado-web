from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'farmer', 'is_read', 'timestamp')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('title', 'message', 'farmer__phone_number')
    readonly_fields = ('id', 'timestamp')
