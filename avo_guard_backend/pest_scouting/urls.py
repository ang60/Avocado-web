from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmBlockViewSet,
    FarmViewSet,
    ProblemReportViewSet,
    ScoutingReportViewSet,
    ScoutingSessionViewSet,
    TrapLogViewSet,
    WeeklyRecordViewSet,
)

router = DefaultRouter()
router.register(r'farms', FarmViewSet, basename='pest-farms')
router.register(r'trap-logs', TrapLogViewSet, basename='trap-logs')
router.register(r'problem-reports', ProblemReportViewSet, basename='problem-reports')
router.register(r'farm-blocks', FarmBlockViewSet)
router.register(r'scouting-sessions', ScoutingSessionViewSet, basename='scouting-sessions')
router.register(r'weekly-records', WeeklyRecordViewSet)
router.register(r'scouting-reports', ScoutingReportViewSet, basename='scouting-reports')

urlpatterns = [
    path('', include(router.urls)),
]

