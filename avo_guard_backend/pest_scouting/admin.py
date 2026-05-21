from django.contrib import admin
from .models import Farm, FarmBlock, WeeklyRecord, Trap, ProblemReport

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('farm_name', 'farmer_name', 'location', 'number_of_blocks', 'farm_size', 'timestamp')
    search_fields = ('farm_name', 'farmer_name__phone_number', 'location')

@admin.register(FarmBlock)
class FarmBlockAdmin(admin.ModelAdmin):
    list_display = ('block_name', 'farmer', 'number_of_trees', 'timestamp')
    search_fields = ('block_name', 'farmer__phone_number', 'farmer__first_name', 'farmer__last_name')

@admin.register(WeeklyRecord)
class WeeklyRecordAdmin(admin.ModelAdmin):
    list_display = ('block', 'farmer', 'status', 'reviewed', 'any_pests_observed', 'any_diseases_observed', 'timestamp')
    list_filter = ('status', 'reviewed', 'any_pests_observed', 'any_diseases_observed', 'actions_taken', 'outcome')
    search_fields = ('block__block_name', 'farmer__phone_number', 'pests_observed', 'disease')
    fieldsets = (
        ('Basic Information', {
            'fields': ('farmer', 'block', 'variety', 'trap_use')
        }),
        ('Pest Observation', {
            'fields': (
                'any_pests_observed', 'pests_observed'
            )
        }),
        ('Disease Observation', {
            'fields': (
                'any_diseases_observed', 'disease', 'disease_plant_part', 
                'disease_crop_stage', 'disease_detection_method'
            )
        }),
        ('I Don\'t Know Fields', {
            'fields': (
                'dont_know_variety', 'dont_know_variety_photo', 'dont_know_variety_voice', 'dont_know_variety_note',
                'dont_know_trap', 'dont_know_trap_photo', 'other_trap_photo',
                'dont_know_pest', 'dont_know_pest_photo', 'dont_know_pest_note',
                'dont_know_beneficial_insects_observed', 'dont_know_beneficial_insects_observed_photo', 'dont_know_beneficial_insects_observed_note',
                'dont_know_disease', 'dont_know_disease_note'
            )
        }),
        ('Other Data', {
            'fields': ('beneficial_insects_observed', 'overall_image', 'voice_note', 'additional_notes', 'other_production_challenges')
        }),
        ('Action & Outcome', {
            'fields': ('status', 'reviewed', 'review_notes', 'actions_taken', 'outcome', 'remarks')
        }),
        ('Location & Date', {
            'fields': ('start_date', 'end_date', 'location', 'gps_latitude', 'gps_longitude')
        }),
    )

@admin.register(Trap)
class TrapAdmin(admin.ModelAdmin):
    list_display = ('trap_name', 'number_of_traps', 'timestamp')
    search_fields = ('trap_name',)

@admin.register(ProblemReport)
class ProblemReportAdmin(admin.ModelAdmin):
    list_display = ('problem_type', 'urgency', 'timestamp')
    list_filter = ('problem_type', 'urgency')
    search_fields = ('description',)
