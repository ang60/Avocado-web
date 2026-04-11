from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmBlockViewSet, WeeklyRecordViewSet, ScoutingReportViewSet

router = DefaultRouter()
router.register(r'farm-blocks', FarmBlockViewSet)
router.register(r'weekly-records', WeeklyRecordViewSet)
router.register(r'scouting-reports', ScoutingReportViewSet, basename='scouting-reports')

urlpatterns = [
    path('', include(router.urls)),
]

