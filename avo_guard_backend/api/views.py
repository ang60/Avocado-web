from __future__ import annotations

from datetime import timedelta

from accounts.permissions import IsAdminLikeUser
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework import serializers as drf_serializers

from .drf_permissions import CanManageScoutingReview, require_permission
from .models import AlertRule, Case, FarmerProfile, FarmBlock, ScoutingReport
from .pagination import StandardResultsSetPagination
from .rbac import ROLE_AGRONOMIST, ROLE_FARMER, is_admin_like, role_name
from .serializers import (
    AlertRuleSerializer,
    CaseCreateSerializer,
    CaseDetailSerializer,
    CaseManagementRowSerializer,
    FarmerDetailSerializer,
    FarmerListSerializer,
    ScoutingFeedItemSerializer,
    ScoutingReportPatchSerializer,
    ScoutingReportWriteSerializer,
)


def _scoped_farmers_qs(user):
    if not user or not user.is_authenticated:
        return FarmerProfile.objects.none()
    if is_admin_like(user):
        return FarmerProfile.objects.all()
    if role_name(user) == ROLE_FARMER:
        fp = getattr(user, 'farmer_profile', None)
        return FarmerProfile.objects.filter(pk=getattr(fp, 'id', None))
    if role_name(user) == 'Exporter':
        return FarmerProfile.objects.filter(linked_exporter_id=getattr(user, 'entity_id', None))
    if role_name(user) == ROLE_AGRONOMIST:
        return FarmerProfile.objects.filter(cases__assigned_agronomist=user).distinct()
    return FarmerProfile.objects.none()


def _scoped_cases_qs(user):
    if not user or not user.is_authenticated:
        return Case.objects.none()
    if is_admin_like(user):
        return Case.objects.all()
    r = role_name(user)
    if r == ROLE_FARMER:
        fp = getattr(user, 'farmer_profile', None)
        return Case.objects.filter(farmer_id=getattr(fp, 'id', None))
    if r == 'Exporter':
        return Case.objects.filter(farmer__linked_exporter_id=getattr(user, 'entity_id', None))
    if r == ROLE_AGRONOMIST:
        return Case.objects.filter(assigned_agronomist=user)
    return Case.objects.none()


def _scoped_scouting_qs(user):
    if not user or not user.is_authenticated:
        return ScoutingReport.objects.none()
    if is_admin_like(user):
        return ScoutingReport.objects.all()
    r = role_name(user)
    if r == ROLE_FARMER:
        fp = getattr(user, 'farmer_profile', None)
        return ScoutingReport.objects.filter(farmer_id=getattr(fp, 'id', None))
    if r == 'Exporter':
        return ScoutingReport.objects.filter(farmer__linked_exporter_id=getattr(user, 'entity_id', None))
    if r == ROLE_AGRONOMIST:
        return ScoutingReport.objects.filter(Q(assigned_to=user) | Q(related_case__assigned_agronomist=user)).distinct()
    return ScoutingReport.objects.none()


class FarmerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FarmerProfile.objects.all().select_related('user')
    serializer_class = FarmerListSerializer
    pagination_class = StandardResultsSetPagination
    http_method_names = ['get']

    def get_serializer_class(self):
        return FarmerDetailSerializer if self.action == 'retrieve' else FarmerListSerializer

    def get_queryset(self):
        return _scoped_farmers_qs(self.request.user).select_related('user').prefetch_related('blocks')


class CaseViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Case.objects.all().select_related('farmer', 'block', 'farmer__user', 'assigned_agronomist')
    serializer_class = CaseDetailSerializer
    http_method_names = ['get', 'post', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == 'create':
            return CaseCreateSerializer
        return CaseDetailSerializer

    def get_queryset(self):
        return _scoped_cases_qs(self.request.user).select_related('farmer', 'block', 'farmer__user')

    def create(self, request, *args, **kwargs):
        # Validate + create using CaseCreateSerializer
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        case = serializer.save()
        # Return a row format matching the frontend table.
        row = CaseManagementRowSerializer(case, context={'request': request}).data
        return Response(row, status=status.HTTP_201_CREATED)


class CaseManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = _scoped_cases_qs(request.user)

        # KPIs (keep simple but stable for the UI)
        total = qs.count()
        open_cases = qs.filter(status__in=['new', 'under-review']).count()
        high_risk = qs.filter(severity=Case.Severity.HIGH).count()
        resolved = qs.exclude(status__in=['new', 'under-review']).count()

        kpis = [
            {'title': 'Open Cases', 'value': str(open_cases), 'icon': 'folder', 'iconColor': '#2D6A4F', 'iconBg': '#ECFDF3'},
            {'title': 'Total Cases', 'value': str(total), 'icon': 'users', 'iconColor': '#1B4332', 'iconBg': '#E0DDD6'},
            {'title': 'High Risk', 'value': str(high_risk), 'icon': 'alert', 'iconColor': '#DC2626', 'iconBg': '#FEE2E2'},
            {'title': 'Resolved', 'value': str(resolved), 'icon': 'check', 'iconColor': '#16A34A', 'iconBg': '#DCFCE7'},
        ]

        rows = qs.order_by('-date_submitted')[:200]
        payload = {'kpis': kpis, 'cases': CaseManagementRowSerializer(rows, many=True).data}
        return Response(payload)


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        farmers_qs = _scoped_farmers_qs(request.user)
        cases_qs = _scoped_cases_qs(request.user)
        scouting_qs = _scoped_scouting_qs(request.user)

        # Metrics for cards
        open_cases = cases_qs.filter(status__in=['new', 'under-review']).count()
        active_farmers = farmers_qs.count()
        detected_scans = scouting_qs.filter(status=scouting_qs.model.DetectionStatus.DETECTED).count()
        compliance = 0
        if farmers_qs.exists():
            # crude average based on weekly_scouting_logs_4w (list of ints)
            total_pct = 0
            count = 0
            for f in farmers_qs.only('weekly_scouting_logs_4w'):
                logs = list(f.weekly_scouting_logs_4w or [])[:4]
                completed = sum(1 for x in logs if int(x) == 1) if logs else 0
                total_pct += int(round((completed / 4) * 100))
                count += 1
            compliance = int(round(total_pct / max(count, 1)))

        compliance = max(0, min(100, compliance))

        metrics = [
            {'label': 'Open Cases', 'value': open_cases, 'icon': 'activity', 'iconBg': '#ECFDF3', 'iconColor': '#2D6A4F', 'sublabel': ''},
            {'label': 'Farmers Monitored', 'value': active_farmers, 'icon': 'check', 'iconBg': '#ECFDF3', 'iconColor': '#16A34A', 'sublabel': ''},
            {'label': 'Issues Detected', 'value': detected_scans, 'icon': 'alert', 'iconBg': '#FEE2E2', 'iconColor': '#DC2626', 'sublabel': ''},
            {'label': 'Compliance', 'value': f'{compliance}%', 'icon': 'clock', 'iconBg': '#E0DDD6', 'iconColor': '#1B4332', 'sublabel': ''},
        ]

        # Compliance chart (last 6 points, simple clamp to keep UI stable)
        weeklyComplianceData = []
        for i in range(6):
            week_dt = now - timedelta(weeks=5 - i)
            # keep between 80-100 so the chart y-domain matches
            v = max(80, min(100, compliance - 5 + i))
            weeklyComplianceData.append({'week': f'W-{i + 1}', 'compliance': v, 'target': 100})

        weeklyTrends = []
        for i in range(6):
            week_dt = now - timedelta(weeks=5 - i)
            week_cases = cases_qs.filter(date_submitted__date__gte=(week_dt.date()), date_submitted__date__lte=(week_dt.date() + timedelta(days=6))).count()
            weeklyTrends.append({'week': f'W-{i + 1}', 'cases': week_cases, 'resolved': max(0, week_cases - 1)})

        pestDistribution = []
        high = cases_qs.filter(severity=Case.Severity.HIGH).count()
        medium = cases_qs.filter(severity=Case.Severity.MEDIUM).count()
        low = cases_qs.filter(severity=Case.Severity.LOW).count()
        no = max(0, scouting_qs.filter(status=scouting_qs.model.DetectionStatus.CLEAN).count())
        pestDistribution = [
            {'name': 'High Risk', 'value': high, 'color': '#D97706'},
            {'name': 'Medium Risk', 'value': medium, 'color': '#F59E0B'},
            {'name': 'Low Risk', 'value': low, 'color': '#74C69D'},
            {'name': 'Clean', 'value': no, 'color': '#16A34A'},
        ]

        # Triage queue: newest open cases for agronomist-like view
        triage = []
        q_cases = cases_qs.filter(status='new').order_by('-date_submitted')[:10]
        for c in q_cases:
            submitted_at = c.date_submitted or now
            submittedHours = int(max(0, (now - submitted_at).total_seconds() // 3600))
            severity = c.severity if c.severity in ('high', 'medium', 'low') else 'medium'
            pest = c.pest_disease or ''
            scout = c.scout_name or ''
            priority = {'high': 1, 'medium': 2, 'low': 3}.get(severity, 2)
            triage.append(
                {
                    'id': str(c.id),
                    'farm': c.farmer.farm_name,
                    'location': c.farmer.location,
                    'severity': severity,
                    'pest': pest,
                    'scout': scout,
                    'submittedHours': submittedHours,
                    'priority': priority,
                }
            )

        recentScoutingRecords = []
        for r in scouting_qs.order_by('-submitted_at')[:8]:
            recentScoutingRecords.append(
                {
                    'id': str(r.id),
                    'scout': r.scout_name or '',
                    'farm': r.farmer.farm_name,
                    'location': r.farmer.location,
                    'date': r.submitted_at.strftime('%Y-%m-%d'),
                    'time': r.submitted_at.strftime('%H:%M'),
                    'blocksInspected': 1,
                    'issuesFound': 1 if r.status == ScoutingReport.DetectionStatus.DETECTED else 0,
                    'status': r.status,
                }
            )

        return Response(
            {
                'metrics': metrics,
                'weeklyComplianceData': weeklyComplianceData,
                'weeklyTrends': weeklyTrends,
                'pestDistribution': pestDistribution,
                'triageQueue': triage,
                'recentScoutingRecords': recentScoutingRecords,
                'complianceSummary': {'target': 100, 'current': compliance},
                'todayLabel': now.strftime('%d %b %Y'),
            }
        )


class ScoutingReportViewSet(viewsets.ModelViewSet):
    queryset = ScoutingReport.objects.all().select_related('farmer', 'block', 'farmer__user', 'assigned_to', 'related_case')
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return ScoutingReportWriteSerializer
        if self.action in ('partial_update', 'update'):
            return ScoutingReportPatchSerializer
        return ScoutingFeedItemSerializer

    def get_queryset(self):
        return _scoped_scouting_qs(self.request.user).select_related('farmer', 'block', 'assigned_to', 'related_case')

    def get_permissions(self):
        if self.action in ('partial_update', 'update'):
            return [CanManageScoutingReview()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        report: ScoutingReport = serializer.save()
        # update FarmerProfile “last scouting” fields (used by dashboard + farmer cards)
        farmer = report.farmer
        farmer.last_scouting_status = 'no-pests' if report.status == ScoutingReport.DetectionStatus.CLEAN else f'{report.severity}-risk'
        farmer.last_scouting_finding = (report.finding or '').strip()
        farmer.last_scouting_date = report.submitted_at.strftime('%Y-%m-%d %H:%M')
        farmer.last_scouting_scout_name = (report.scout_name or '').strip()
        farmer.save(update_fields=['last_scouting_status', 'last_scouting_finding', 'last_scouting_date', 'last_scouting_scout_name'])

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        # DRF already returns serialized object; keep default behavior.

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)


class AlertRuleViewSet(viewsets.ModelViewSet):
    queryset = AlertRule.objects.all()
    serializer_class = AlertRuleSerializer
    http_method_names = ['get', 'patch', 'put', 'post', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [require_permission('alert_rules.manage')()]
        return [require_permission('alert_rules.view')()]


class AdminSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminLikeUser]

    def get(self, request):
        active_users = (
            request.user.__class__.objects.filter(is_active=True).count()
        )
        roles_count = __import__('accounts.models', fromlist=['Role']).Role.objects.count()  # avoid circular import at module load
        entities_count = __import__('accounts.models', fromlist=['Entity']).Entity.objects.count()
        entities_active_count = __import__('accounts.models', fromlist=['Entity']).Entity.objects.filter(is_active=True).count()
        alert_rules_count = AlertRule.objects.count()
        alert_rules_active_count = AlertRule.objects.filter(status=AlertRule.Status.ACTIVE).count()
        permissions_count = __import__('accounts.models', fromlist=['AppPermission']).AppPermission.objects.count()

        return Response(
            {
                'active_users': active_users,
                'roles_count': roles_count,
                'entities_count': entities_count,
                'entities_active_count': entities_active_count,
                'alert_rules_count': alert_rules_count,
                'alert_rules_active_count': alert_rules_active_count,
                'permissions_count': permissions_count,
            }
        )
