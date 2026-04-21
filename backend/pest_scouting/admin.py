from django.contrib import admin
from .models import FarmBlock, WeeklyRecord


@admin.register(FarmBlock)
class FarmBlockAdmin(admin.ModelAdmin):
    list_display = ('block_name', 'farmer', 'number_of_trees', 'timestamp')
    search_fields = ('block_name', 'farmer__phone_number', 'farmer__first_name', 'farmer__last_name')


@admin.register(WeeklyRecord)
class WeeklyRecordAdmin(admin.ModelAdmin):
    list_display = ('block', 'farmer', 'any_pests_observed', 'any_diseases_observed', 'timestamp')
    list_filter = ('any_pests_observed', 'any_diseases_observed', 'actions_taken', 'outcome')
    search_fields = ('block__block_name', 'farmer__phone_number', 'pests_observed', 'disease')

