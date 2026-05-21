from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmViewSet, FarmBlockViewSet, WeeklyRecordViewSet, 
    ScoutingReportViewSet, TrapViewSet, ProblemReportViewSet
)
from .ussd_views import ussd_callback

router = DefaultRouter()
router.register(r'farms', FarmViewSet)
router.register(r'farm-blocks', FarmBlockViewSet)
router.register(r'weekly-records', WeeklyRecordViewSet)
router.register(r'scouting-reports', ScoutingReportViewSet, basename='scouting-reports')
router.register(r'traps', TrapViewSet)
router.register(r'problem-reports', ProblemReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ussd/', ussd_callback, name='ussd-callback'),
]
