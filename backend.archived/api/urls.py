from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AlertRuleViewSet,
    BroadcastCampaignViewSet,
    CaseManagementView,
    CaseViewSet,
    DashboardView,
    FarmerViewSet,
    ProductionVolumeSubmissionViewSet,
    ScoutingReportViewSet,
    AdminSummaryView,
)

router = DefaultRouter()
router.register(r'farmers', FarmerViewSet, basename='farmers')
router.register(r'cases', CaseViewSet, basename='cases')
router.register(r'scouting_reports', ScoutingReportViewSet, basename='scouting-reports')
router.register(r'alert_rules', AlertRuleViewSet, basename='alert-rules')
router.register(r'production_volumes', ProductionVolumeSubmissionViewSet, basename='production-volumes')
router.register(r'kephis/broadcasts', BroadcastCampaignViewSet, basename='kephis-broadcasts')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('case_management/', CaseManagementView.as_view(), name='case-management'),
    path('admin/summary/', AdminSummaryView.as_view(), name='admin-summary'),
    path('', include(router.urls)),
]

