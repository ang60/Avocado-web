from django.contrib import admin
from .models import FarmerProfile, FarmBlock, Case, ScoutingReport, AlertRule


@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ("farmer_code", "name", "county", "primary_channel", "export_eligibility", "linked_exporter")
    search_fields = ("farmer_code", "name", "county", "user__phone_number", "user__email")
    list_filter = ("county", "primary_channel", "export_eligibility")
    autocomplete_fields = ("user", "linked_exporter")


@admin.register(FarmBlock)
class FarmBlockAdmin(admin.ModelAdmin):
    list_display = ("name", "farmer", "acres", "trees", "status")
    search_fields = ("name", "farmer__name", "farmer__farmer_code")
    autocomplete_fields = ("farmer",)


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ("id", "farmer", "severity", "status", "date_submitted")
    search_fields = ("id", "farmer__name", "farmer__farmer_code", "pest_disease")
    list_filter = ("severity", "status")
    autocomplete_fields = ("farmer", "block")


@admin.register(ScoutingReport)
class ScoutingReportAdmin(admin.ModelAdmin):
    list_display = ("id", "farmer", "status", "submitted_at")
    search_fields = ("id", "farmer__name", "farmer__farmer_code")
    list_filter = ("status",)
    autocomplete_fields = ("farmer", "block", "assigned_to")


@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status", "triggered_count", "last_triggered_at", "updated_at")
    search_fields = ("name",)
    list_filter = ("status", "county", "condition", "action")

# Register your models here.
