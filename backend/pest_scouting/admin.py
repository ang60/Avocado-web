from django.contrib import admin
from .models import Farm, FarmBlock, ProblemReport, TrapLog, WeeklyRecord


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('farm_name', 'farmer', 'location', 'number_of_blocks', 'farm_size', 'created_at')
    search_fields = ('farm_name', 'location', 'farmer__phone_number')


@admin.register(TrapLog)
class TrapLogAdmin(admin.ModelAdmin):
    list_display = ('trap_name', 'farmer', 'number_of_traps', 'timestamp')
    list_filter = ('trap_name',)


@admin.register(ProblemReport)
class ProblemReportAdmin(admin.ModelAdmin):
    list_display = ('problem_type', 'urgency', 'farmer', 'timestamp')
    list_filter = ('problem_type', 'urgency')


@admin.register(FarmBlock)
class FarmBlockAdmin(admin.ModelAdmin):
    list_display = ('block_name', 'farmer', 'farm', 'number_of_trees', 'timestamp')
    search_fields = ('block_name', 'farmer__phone_number', 'farmer__first_name', 'farmer__last_name')


@admin.register(WeeklyRecord)
class WeeklyRecordAdmin(admin.ModelAdmin):
    list_display = ('block', 'farmer', 'any_pests_observed', 'any_diseases_observed', 'timestamp')
    list_filter = ('any_pests_observed', 'any_diseases_observed', 'actions_taken', 'outcome')
    search_fields = ('block__block_name', 'farmer__phone_number', 'pests_observed', 'disease')

