from django.contrib import admin
from .models import FarmerRegistration

@admin.register(FarmerRegistration)
class FarmerRegistrationAdmin(admin.ModelAdmin):
    list_display = ('farmerName', 'hcdaRegNumber', 'county', 'ward', 'globalGAPStatus', 'globalGAPExpiry')
    list_filter = ('globalGAPStatus', 'county', 'primaryExporter')
    search_fields = ('farmerName', 'hcdaRegNumber', 'ward', 'county')
    readonly_fields = ('created_at', 'updated_at')
