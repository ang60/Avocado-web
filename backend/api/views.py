import random
from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, Q
from django.db.models.functions import TruncWeek
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .drf_permissions import CanManageScoutingReview, IsSelfOrAdminLike, require_permission
from .models import AlertRule, AppPermission, Case, Entity, FarmerProfile, Role, ScoutingReport, User
from .rbac import ROLE_AGRONOMIST, ROLE_EXPORTER, ROLE_FARMER, is_admin_like, role_name
from .serializers import (
    AlertRuleSerializer,
    AppPermissionSerializer,
    AuthUserSerializer,
    CaseCreateSerializer,
    CaseDetailSerializer,
    CaseManagementRowSerializer,
    EntitySerializer,
    FarmerDetailSerializer,
    FarmerListSerializer,
    RequestOtpSerializer,
    RegisterUserSerializer,
    RoleDetailSerializer,
    RoleListSerializer,
    RoleWriteSerializer,
    ScoutingFeedItemSerializer,
    ScoutingReportPatchSerializer,
    ScoutingReportWriteSerializer,
    UserCreateSerializer,
    UserSerializer,
    VerifyOtpSerializer,
)
from .sms import send_sms


def touch_user_last_login(user):
    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])


class RequestOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RequestOtpSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data['phone_number'].strip()
        code = f'{random.randint(0, 999999):06d}'
        cache.set(f'{settings.OTP_CACHE_PREFIX}{phone}', code, settings.OTP_TTL_SECONDS)
        msg = f'Your AvoGuard OTP is {code}. It expires in {int(settings.OTP_TTL_SECONDS / 60)} minutes.'
        sms_res = send_sms(phone_number=phone, message=msg)
        if not sms_res.ok and settings.DEBUG:
            # In dev, keep console OTP as a fallback.
            print(f'[OTP] {phone} -> {code}')
        return Response(status=status.HTTP_204_NO_CONTENT)


class RegisterUserView(APIView):
    """
    Registration step: collect name/email/phone, create/update user (no role),
    then send OTP to provided phone number.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterUserSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data['phone_number'].strip()
        name = ser.validated_data['name'].strip()
        email = ser.validated_data['email'].strip().lower()

        parts = [p for p in name.split() if p]
        first_name = parts[0] if parts else ''
        last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''

        user, _ = User.objects.get_or_create(phone_number=phone, defaults={'first_name': first_name, 'last_name': last_name, 'email': email})
        # If user already exists, update their profile fields (but do not assign roles here)
        changed = False
        if email and user.email != email:
            user.email = email
            changed = True
        if first_name and user.first_name != first_name:
            user.first_name = first_name
            changed = True
        if last_name and user.last_name != last_name:
            user.last_name = last_name
            changed = True
        if changed:
            user.save(update_fields=['email', 'first_name', 'last_name'])

        # Send OTP
        code = f'{random.randint(0, 999999):06d}'
        cache.set(f'{settings.OTP_CACHE_PREFIX}{phone}', code, settings.OTP_TTL_SECONDS)
        msg = f'Your AvoGuard OTP is {code}. It expires in {int(settings.OTP_TTL_SECONDS / 60)} minutes.'
        sms_res = send_sms(phone_number=phone, message=msg)
        if not sms_res.ok and settings.DEBUG:
            print(f'[OTP] {phone} -> {code}')
        return Response(status=status.HTTP_204_NO_CONTENT)


class VerifyOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = VerifyOtpSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data['phone_number'].strip()
        code = ser.validated_data['code'].strip()
        key = f'{settings.OTP_CACHE_PREFIX}{phone}'
        cached = cache.get(key)
        if not cached or cached != code:
            return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)
        cache.delete(key)
        user, created = User.objects.get_or_create(
            phone_number=phone,
            defaults={'first_name': '', 'last_name': ''},
        )
        touch_user_last_login(user)
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': AuthUserSerializer(user).data,
                'is_new_user': created,
            }
        )


class DashboardView(APIView):
    """
    Returns the DashboardPayload used by the Dashboard page.
    Derived from Case, FarmerProfile, and ScoutingReport where possible.
    """

    _PEST_COLORS = ['#2D6A4F', '#74C69D', '#D97706', '#4338CA', '#7C3AED']

    def get(self, request):
        user = request.user
        cases_qs = Case.objects.all() if is_admin_like(user) else self._scoped_cases_qs(user)
        farmers_qs = FarmerProfile.objects.all() if is_admin_like(user) else self._scoped_farmers_qs(user)
        scouting_qs = ScoutingReport.objects.all() if is_admin_like(user) else self._scoped_scouting_qs(user)

        total_cases = cases_qs.count()
        total_farmers = farmers_qs.count()
        compliance_pct = self._avg_farmer_compliance(farmers_qs)

        payload = {
            'metrics': self._build_metrics(total_cases, total_farmers, compliance_pct),
            'weeklyComplianceData': self._weekly_compliance_series(compliance_pct, scouting_qs),
            'weeklyTrends': self._weekly_case_trends(cases_qs),
            'pestDistribution': self._pest_distribution(cases_qs),
            'triageQueue': self._triage_queue(cases_qs),
            'recentScoutingRecords': self._recent_scouting_records(scouting_qs),
            'complianceSummary': {'target': 95, 'current': compliance_pct},
            'todayLabel': timezone.now().date().isoformat(),
        }
        return Response(payload)

    def _build_metrics(self, total_cases, total_farmers, compliance_pct):
        comp_display = f'{compliance_pct}%'
        return [
            {
                'label': 'Active cases',
                'value': total_cases,
                'trendUp': True,
                'trendPercent': 0,
                'trendVs': 'vs last week',
                'icon': 'alert',
                'iconBg': '#FEF3C7',
                'iconColor': '#D97706',
                'sublabel': None,
            },
            {
                'label': 'Registered farmers',
                'value': total_farmers,
                'trendUp': True,
                'trendPercent': 0,
                'trendVs': 'vs last month',
                'icon': 'activity',
                'iconBg': '#DCFCE7',
                'iconColor': '#2D6A4F',
                'sublabel': None,
            },
            {
                'label': 'Compliance',
                'value': comp_display,
                'trendUp': compliance_pct >= 90,
                'trendPercent': 0,
                'trendVs': 'target 95%',
                'icon': 'check',
                'iconBg': '#E0E7FF',
                'iconColor': '#4338CA',
                'sublabel': None,
            },
            {
                'label': 'Avg response time',
                'value': '18h',
                'trendUp': False,
                'trendPercent': 0,
                'trendVs': 'vs last week',
                'icon': 'clock',
                'iconBg': '#F3F4F6',
                'iconColor': '#374151',
                'sublabel': None,
            },
        ]

    def _avg_farmer_compliance(self, farmers_qs):
        scores = []
        for row in farmers_qs.values_list('weekly_scouting_logs_4w', flat=True):
            logs = list(row or [])[:4]
            if not logs:
                continue
            try:
                pct = int(round((sum(1 for x in logs if int(x) == 1) / 4) * 100))
            except (TypeError, ValueError):
                continue
            scores.append(pct)
        if scores:
            return int(round(sum(scores) / len(scores)))
        return 92

    def _weekly_compliance_series(self, current_pct, scouting_qs):
        target = 95
        now = timezone.now()
        out = []
        for i in range(3, -1, -1):
            start = now - timedelta(weeks=i + 1)
            end = now - timedelta(weeks=i)
            week_n = 4 - i
            submitted = scouting_qs.filter(submitted_at__gte=start, submitted_at__lt=end).count()
            bump = min(4, submitted)
            comp = max(70, min(99, current_pct - 3 + week_n + bump))
            out.append({'week': f'W{week_n}', 'compliance': comp, 'target': target})
        return out

    def _weekly_case_trends(self, cases_qs):
        now = timezone.now()
        start = now - timedelta(days=28)
        base = cases_qs.exclude(date_submitted__isnull=True).filter(date_submitted__gte=start)
        rows = list(
            base.annotate(w=TruncWeek('date_submitted'))
            .values('w')
            .annotate(cases=Count('id'), resolved=Count('id', filter=~Q(status='new')))
            .order_by('w')
        )
        rows = rows[-4:]
        while len(rows) < 4:
            rows.insert(0, {'cases': 0, 'resolved': 0})
        trends = []
        for i, r in enumerate(rows[-4:]):
            trends.append({'week': f'W{i + 1}', 'cases': r.get('cases') or 0, 'resolved': r.get('resolved') or 0})
        return trends

    def _pest_distribution(self, cases_qs):
        rows = (
            cases_qs.exclude(pest_disease='')
            .values('pest_disease')
            .annotate(c=Count('id'))
            .order_by('-c')[:5]
        )
        out = []
        for i, r in enumerate(rows):
            name = r['pest_disease'] or 'Unknown'
            out.append({'name': name, 'value': r['c'], 'color': self._PEST_COLORS[i % len(self._PEST_COLORS)]})
        if not out:
            out = [
                {'name': 'Thrips', 'value': 1, 'color': self._PEST_COLORS[0]},
                {'name': 'No data yet', 'value': 1, 'color': '#94A3B8'},
            ]
        return out

    def _triage_queue(self, cases_qs):
        now = timezone.now()
        open_qs = cases_qs.filter(status='new').order_by('date_submitted')[:10]
        triage = []
        sev_rank = {'high': 0, 'medium': 1, 'low': 2, 'unknown': 3}
        for c in open_qs.select_related('farmer'):
            submitted = c.date_submitted or now
            hours = max(0, int((now - submitted).total_seconds() / 3600))
            triage.append(
                {
                    'id': str(c.id),
                    'farm': c.farmer.farm_name or c.farmer.name,
                    'location': c.farmer.location or c.farmer.county or '',
                    'severity': c.severity if c.severity in ('high', 'medium', 'low') else 'medium',
                    'pest': c.pest_disease or '—',
                    'scout': c.scout_name or '—',
                    'submittedHours': hours,
                    'priority': sev_rank.get(c.severity, 3) * 100 + min(hours, 99),
                }
            )
        triage.sort(key=lambda x: (x['priority'], -x['submittedHours']))
        return triage

    def _recent_scouting_records(self, scouting_qs):
        records = []
        for r in scouting_qs.select_related('farmer', 'assigned_to')[:8]:
            dt = r.submitted_at
            label_scout = (r.scout_name or '').strip() or r.farmer.name
            status_label = 'Reviewed' if r.reviewed == ScoutingReport.ReviewStatus.REVIEWED else 'Pending'
            records.append(
                {
                    'id': str(r.id),
                    'scout': label_scout,
                    'farm': r.farmer.farm_name or r.farmer.name,
                    'location': r.farmer.location or r.farmer.county or '',
                    'date': dt.strftime('%d %b, %Y') if dt else '',
                    'time': dt.strftime('%H:%M') if dt else '',
                    'blocksInspected': 1,
                    'issuesFound': 1 if r.status == ScoutingReport.DetectionStatus.DETECTED else 0,
                    'status': status_label,
                }
            )
        return records

    def _scoped_scouting_qs(self, user):
        qs = ScoutingReport.objects.all()
        rn = role_name(user)
        if rn == ROLE_FARMER and getattr(user, 'farmer_profile', None):
            return qs.filter(farmer_id=user.farmer_profile_id)
        if rn == ROLE_EXPORTER and user.entity_id:
            return qs.filter(farmer__linked_exporter_id=user.entity_id)
        if rn == ROLE_AGRONOMIST:
            farmer_ids = Case.objects.filter(assigned_agronomist_id=user.id).values_list(
                'farmer_id', flat=True
            ).distinct()
            return qs.filter(Q(farmer_id__in=farmer_ids) | Q(assigned_to_id=user.id))
        return qs.none()

    def _scoped_farmers_qs(self, user):
        rn = role_name(user)
        if rn == ROLE_FARMER and getattr(user, 'farmer_profile', None):
            return FarmerProfile.objects.filter(id=user.farmer_profile_id)
        if rn == ROLE_EXPORTER and user.entity_id:
            return FarmerProfile.objects.filter(linked_exporter_id=user.entity_id)
        return FarmerProfile.objects.none()

    def _scoped_cases_qs(self, user):
        rn = role_name(user)
        if rn == ROLE_FARMER and getattr(user, 'farmer_profile', None):
            return Case.objects.filter(farmer_id=user.farmer_profile_id)
        if rn == ROLE_EXPORTER and user.entity_id:
            return Case.objects.filter(farmer__linked_exporter_id=user.entity_id)
        if rn == ROLE_AGRONOMIST:
            return Case.objects.filter(assigned_agronomist_id=user.id)
        return Case.objects.none()


class ScoutingReportViewSet(viewsets.ModelViewSet):
    """
    List/create field scouting submissions; PATCH for review workflow (staff/agronomist).
    """

    queryset = ScoutingReport.objects.select_related(
        'farmer', 'block', 'assigned_to', 'farmer__user'
    ).all()
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action in ('partial_update', 'update'):
            return [CanManageScoutingReview()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return ScoutingReportWriteSerializer
        if self.action in ('partial_update', 'update'):
            return ScoutingReportPatchSerializer
        return ScoutingFeedItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if is_admin_like(self.request.user):
            return qs
        rn = role_name(self.request.user)
        if rn == ROLE_FARMER and getattr(self.request.user, 'farmer_profile', None):
            return qs.filter(farmer_id=self.request.user.farmer_profile_id)
        if rn == ROLE_EXPORTER and self.request.user.entity_id:
            return qs.filter(farmer__linked_exporter_id=self.request.user.entity_id)
        if rn == ROLE_AGRONOMIST:
            farmer_ids = Case.objects.filter(assigned_agronomist_id=self.request.user.id).values_list(
                'farmer_id', flat=True
            ).distinct()
            return qs.filter(Q(farmer_id__in=farmer_ids) | Q(assigned_to_id=self.request.user.id))
        return qs.none()

    def perform_create(self, serializer):
        report = serializer.save()
        farmer = report.farmer
        farmer.last_scouting_status = (
            'pests-detected' if report.status == ScoutingReport.DetectionStatus.DETECTED else 'no-pests'
        )
        farmer.last_scouting_finding = report.finding or ''
        farmer.last_scouting_date = timezone.localdate(report.submitted_at).isoformat()
        if report.scout_name:
            farmer.last_scouting_scout_name = report.scout_name
        farmer.save(
            update_fields=[
                'last_scouting_status',
                'last_scouting_finding',
                'last_scouting_date',
                'last_scouting_scout_name',
            ]
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        data = ScoutingFeedItemSerializer(serializer.instance, context=self.get_serializer_context()).data
        return Response(data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()
        data = ScoutingFeedItemSerializer(instance, context=self.get_serializer_context()).data
        return Response(data)


class FarmerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FarmerProfile.objects.select_related('user', 'linked_exporter').all()
    serializer_class = FarmerListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if is_admin_like(self.request.user):
            return qs
        rn = role_name(self.request.user)
        if rn == ROLE_FARMER and getattr(self.request.user, 'farmer_profile', None):
            return qs.filter(id=self.request.user.farmer_profile_id)
        if rn == ROLE_EXPORTER and self.request.user.entity_id:
            return qs.filter(linked_exporter_id=self.request.user.entity_id)
        return qs.none()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FarmerDetailSerializer
        return FarmerListSerializer


class CaseViewSet(mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Case.objects.select_related('farmer', 'farmer__user', 'block').all()

    def get_permissions(self):
        if self.action == 'create':
            return [CanManageScoutingReview()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if is_admin_like(self.request.user):
            return qs
        rn = role_name(self.request.user)
        if rn == ROLE_FARMER and getattr(self.request.user, 'farmer_profile', None):
            return qs.filter(farmer_id=self.request.user.farmer_profile_id)
        if rn == ROLE_EXPORTER and self.request.user.entity_id:
            return qs.filter(farmer__linked_exporter_id=self.request.user.entity_id)
        if rn == ROLE_AGRONOMIST:
            return qs.filter(assigned_agronomist_id=self.request.user.id)
        return qs.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return CaseCreateSerializer
        if self.action == 'retrieve':
            return CaseDetailSerializer
        return CaseManagementRowSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case = serializer.save()
        out = CaseManagementRowSerializer(case, context=self.get_serializer_context())
        return Response(out.data, status=status.HTTP_201_CREATED)


class CaseManagementView(APIView):
    def get(self, request):
        qs = CaseViewSet.queryset
        # Reuse scoping
        viewset = CaseViewSet()
        viewset.request = request
        qs = viewset.get_queryset()
        data = CaseManagementRowSerializer(qs[:200], many=True).data
        payload = {
            'kpis': [
                {'title': 'Open Cases', 'value': str(qs.filter(status='new').count()), 'icon': 'folder', 'iconColor': '#2D6A4F', 'iconBg': '#DCFCE7'},
                {'title': 'High Severity', 'value': str(qs.filter(severity='high').count()), 'icon': 'alert', 'iconColor': '#C0392B', 'iconBg': '#FEE2E2'},
                {'title': 'Farmers Affected', 'value': str(qs.values('farmer_id').distinct().count()), 'icon': 'users', 'iconColor': '#4338CA', 'iconBg': '#E0E7FF'},
                {'title': 'Resolved', 'value': str(qs.exclude(status='new').count()), 'icon': 'check', 'iconColor': '#15803D', 'iconBg': '#DCFCE7'},
            ],
            'cases': data,
        }
        return Response(payload)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('role', 'entity').all()
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.action == 'list':
            return [require_permission('users.view')()]
        if self.action in ('create', 'destroy'):
            return [require_permission('users.manage')()]
        if self.action in ('retrieve', 'partial_update', 'update'):
            # Non-admins can see/update only themselves (used by profile flows later)
            return [IsSelfOrAdminLike()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        if is_admin_like(self.request.user):
            return qs
        # Non-admins: only themselves
        return qs.filter(id=self.request.user.id)

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related('permissions').all()
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [require_permission('roles.view')()]
        return [require_permission('roles.manage')()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoleDetailSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return RoleWriteSerializer
        return RoleListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        return Response(RoleDetailSerializer(role).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        return Response(RoleDetailSerializer(role).data)


class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [require_permission('entities.view')()]
        if self.action in ('create', 'destroy', 'update', 'partial_update'):
            return [require_permission('entities.manage')()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        if is_admin_like(self.request.user):
            return qs
        # Exporters/government can only see their own entity if assigned
        ent_id = getattr(self.request.user, 'entity_id', None)
        if ent_id:
            return qs.filter(id=ent_id)
        return qs.none()

class AppPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AppPermission.objects.all()
    serializer_class = AppPermissionSerializer
    permission_classes = [require_permission('permissions.view')]


class AlertRuleViewSet(viewsets.ModelViewSet):
    queryset = AlertRule.objects.all()
    serializer_class = AlertRuleSerializer
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [require_permission('alert_rules.view')()]
        return [require_permission('alert_rules.manage')()]


class AdminSummaryView(APIView):
    """Counts for the admin dashboard cards (matches frontend Admin system stats)."""
    permission_classes = [require_permission('admin.summary')]

    def get(self, request):
        active_users = User.objects.filter(is_active=True).count()
        roles = Role.objects.count()
        entities = Entity.objects.count()
        entities_active = Entity.objects.filter(is_active=True).count()
        alert_rules = AlertRule.objects.count()
        alert_rules_active = AlertRule.objects.filter(status=AlertRule.Status.ACTIVE).count()
        permissions = AppPermission.objects.count()
        return Response(
            {
                'active_users': active_users,
                'roles_count': roles,
                'entities_count': entities,
                'entities_active_count': entities_active,
                'alert_rules_count': alert_rules,
                'alert_rules_active_count': alert_rules_active,
                'permissions_count': permissions,
            }
        )
