from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CaseManagementView,
    CaseViewSet,
    DashboardView,
    FarmerViewSet,
    AdminSummaryView,
    AlertRuleViewSet,
    AppPermissionViewSet,
    EntityViewSet,
    RegisterUserView,
    RequestOtpView,
    RoleViewSet,
    ScoutingReportViewSet,
    UserViewSet,
    VerifyOtpView,
)

router = DefaultRouter()
router.register(r'api/permissions', AppPermissionViewSet, basename='permission')
router.register(r'api/users', UserViewSet, basename='user')
router.register(r'api/roles', RoleViewSet, basename='role')
router.register(r'api/entities', EntityViewSet, basename='entity')
router.register(r'api/alert_rules', AlertRuleViewSet, basename='alert_rule')
router.register(r'api/farmers', FarmerViewSet, basename='farmer')
router.register(r'api/cases', CaseViewSet, basename='case')
router.register(r'api/scouting_reports', ScoutingReportViewSet, basename='scouting_report')

urlpatterns = [
    path('api/users/request_otp/', RequestOtpView.as_view()),
    path('api/users/register/', RegisterUserView.as_view()),
    path('api/users/verify_otp/', VerifyOtpView.as_view()),
    path('api/admin/summary/', AdminSummaryView.as_view()),
    path('api/dashboard/', DashboardView.as_view()),
    path('api/case_management/', CaseManagementView.as_view()),
    *router.urls,
]
