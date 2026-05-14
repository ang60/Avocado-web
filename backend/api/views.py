from __future__ import annotations

from datetime import timedelta

from accounts.permissions import IsAdminLikeUser
from django.db.models import Count, Prefetch, Q
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework import serializers as drf_serializers

from .drf_permissions import CanManageScoutingReview, require_permission
from .models import (
    AlertRule,
    BroadcastCampaign,
    BroadcastRecipient,
    Case,
    FarmerProfile,
    FarmBlock,
    ProductionVolumeSubmission,
    ScoutingReport,
)
from .pagination import StandardResultsSetPagination
from .rbac import ROLE_AGRONOMIST, ROLE_FARMER, is_admin_like, role_name
from .serializers import (
    AlertRuleSerializer,
    BroadcastCampaignSerializer,
    CaseCreateSerializer,
    CaseDetailSerializer,
    CaseManagementRowSerializer,
    FarmerComplianceStatusPatchSerializer,
    FarmerDetailSerializer,
    FarmerListSerializer,
    ProductionVolumeSubmissionSerializer,
    ScoutingFeedItemSerializer,
    ScoutingReportPatchSerializer,
    ScoutingReportWriteSerializer,
)
from pest_scouting.models import Farm as PestScoutingFarm, TrapLog, WeeklyRecord
from accounts.sms_utils import send_advanta_sms
import logging

logger = logging.getLogger(__name__)


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
        # Agronomists should see farmers explicitly linked to them (accounts.User.managed_by),
        # plus any farmers that have cases assigned to them.
        return (
            FarmerProfile.objects.filter(Q(user__managed_by=user) | Q(cases__assigned_agronomist=user))
            .distinct()
        )
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


def _weekly_logs_list(raw) -> list:
    """weekly_scouting_logs_4w must be a list; bad JSON types must not crash the dashboard."""
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw[:4]
    return []


def _weekly_completion_fraction(logs: list) -> float:
    if not logs:
        return 0.0
    completed = 0
    for x in logs:
        try:
            if int(x) == 1:
                completed += 1
        except (TypeError, ValueError):
            continue
    return completed / 4.0


def _ensure_aware(dt):
    """Avoid subtracting naive and aware datetimes (raises TypeError → HTTP 500)."""
    if dt is None:
        return None
    if timezone.is_naive(dt):
        return timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


def _scoped_farmer_auth_user_ids(user):
    """User ids whose pest_scouting / trap data is visible (aligned with farmer registry scope)."""
    if not user or not user.is_authenticated:
        return []
    if is_admin_like(user):
        return None
    ids = list(_scoped_farmers_qs(user).values_list('user_id', flat=True))
    return ids


def _scoped_weekly_records_qs(user):
    qs = WeeklyRecord.objects.all().select_related('farmer', 'block', 'block__farm')
    uid_list = _scoped_farmer_auth_user_ids(user)
    if uid_list is not None:
        if not uid_list:
            return WeeklyRecord.objects.none()
        return qs.filter(farmer_id__in=uid_list)
    return qs


def _scoped_trap_logs_qs(user):
    qs = TrapLog.objects.all().select_related('farmer', 'farm')
    uid_list = _scoped_farmer_auth_user_ids(user)
    if uid_list is not None:
        if not uid_list:
            return TrapLog.objects.none()
        return qs.filter(farmer_id__in=uid_list)
    return qs


def _weekly_raw_dict(wr: WeeklyRecord) -> dict:
    raw = wr.raw_payload
    return raw if isinstance(raw, dict) else {}


def _pest_strings_from_mobile_raw(raw: dict) -> list[str]:
    """Mobile weekly form: pests_observed is [{name, number_per_trap}, ...]."""
    po = raw.get('pests_observed')
    out: list[str] = []
    if isinstance(po, list):
        for row in po:
            if not isinstance(row, dict):
                continue
            n = str(row.get('name') or '').strip()
            if not n:
                continue
            pt = row.get('number_per_trap')
            if pt is not None and str(pt).strip() != '':
                out.append(f'{n} ({pt})')
            else:
                out.append(n)
    return out


def _disease_strings_from_mobile_raw(raw: dict) -> list[str]:
    """Mobile weekly form: disease is [str, ...] or a single string."""
    d = raw.get('disease')
    if isinstance(d, list):
        return [str(x).strip() for x in d if str(x).strip()]
    if isinstance(d, str) and d.strip():
        return [d.strip()]
    return []


def _beneficial_summary_from_raw(raw: dict) -> str:
    ben = raw.get('beneficial_insects_observed')
    if isinstance(ben, list):
        items = [str(x).strip() for x in ben if str(x).strip()]
        return ', '.join(dict.fromkeys(items))[:280]
    return ''


def _disease_meta_summary_from_raw(raw: dict) -> str:
    """Plant parts, crop stage, detection method — matches mobile weekly JSON."""
    parts: list[str] = []
    dpp = raw.get('disease_plant_part')
    if isinstance(dpp, list):
        joined = ', '.join(str(x).strip() for x in dpp if str(x).strip())
        if joined:
            parts.append(joined)
    for key in ('disease_crop_stage', 'disease_detection_method'):
        v = raw.get(key)
        if isinstance(v, str) and v.strip():
            parts.append(v.strip())
    return ' · '.join(parts)[:320]


def _gps_summary_from_raw(raw: dict) -> str:
    la = str(raw.get('gps_latitude') or '').strip()
    lo = str(raw.get('gps_longitude') or '').strip()
    if la and lo:
        return f'{la}, {lo}'
    return ''


def _trap_summary_from_weekly(wr: WeeklyRecord) -> str:
    bits: list[str] = []
    if wr.type_of_trap:
        bits.append(f'{wr.type_of_trap} (×{wr.number_of_trap})')
    raw = _weekly_raw_dict(wr)
    tu = raw.get('trap_use') if isinstance(raw.get('trap_use'), list) else []
    for row in tu[:8]:
        if isinstance(row, dict):
            tn = str(row.get('type_of_trap') or '').strip()
            nn = row.get('number_of_trap') if row.get('number_of_trap') is not None else row.get('number_of_traps')
            avg = row.get('average_no_of_pest_per_trap')
            if tn:
                seg = f'{tn} (×{nn})'
                if avg is not None and str(avg).strip() != '':
                    seg += f', avg {avg}'
                bits.append(seg)
    seen: list[str] = []
    for b in bits:
        if b and b not in seen:
            seen.append(b)
    return ', '.join(seen)[:240]


def _pest_summary_from_weekly(wr: WeeklyRecord) -> str:
    raw = _weekly_raw_dict(wr)
    mobile = _pest_strings_from_mobile_raw(raw)
    if mobile:
        return ', '.join(dict.fromkeys(mobile))[:400]
    parts: list[str] = []
    if wr.any_pests_observed == 'Yes':
        parts.extend([x for x in (wr.pests_observed_list or []) if x])
        if wr.pests_observed:
            parts.append(wr.pests_observed)
    return ', '.join(dict.fromkeys([p for p in parts if p]))[:400]


def _disease_summary_from_weekly(wr: WeeklyRecord) -> str:
    raw = _weekly_raw_dict(wr)
    mobile = _disease_strings_from_mobile_raw(raw)
    if mobile:
        return ', '.join(dict.fromkeys(mobile))[:400]
    parts: list[str] = []
    if wr.any_diseases_observed == 'Yes':
        parts.extend([x for x in (wr.disease_list or []) if x])
        if wr.disease:
            parts.append(wr.disease)
    return ', '.join(dict.fromkeys([p for p in parts if p]))[:400]


def _finding_summary_from_weekly(wr: WeeklyRecord) -> str:
    """Narrative line: pests/diseases plus beneficials, outcome, and production challenges from mobile raw."""
    raw = _weekly_raw_dict(wr)
    pest_line = _pest_summary_from_weekly(wr)
    dis_line = _disease_summary_from_weekly(wr)
    bits: list[str] = []
    if pest_line:
        bits.append(f'Pests: {pest_line}')
    if dis_line:
        bits.append(f'Diseases: {dis_line}')
    ben = raw.get('beneficial_insects_observed')
    if isinstance(ben, list) and ben:
        bits.append('Beneficials: ' + ', '.join(str(x).strip() for x in ben if str(x).strip())[:200])
    outcome = str(raw.get('outcome') or wr.outcome or '').strip()
    if outcome:
        bits.append(f'Outcome: {outcome}')
    ch = raw.get('other_production_challenges')
    if isinstance(ch, list) and ch:
        bits.append('Challenges: ' + ', '.join(str(x).strip() for x in ch if str(x).strip())[:200])
    if bits:
        return ' · '.join(bits)[:512]
    return 'No pests or diseases reported'


def _dashboard_recent_from_weekly(wr: WeeklyRecord, fp_by_uid: dict) -> dict:
    u = wr.farmer
    fp = fp_by_uid.get(wr.farmer_id)
    raw = _weekly_raw_dict(wr)
    farm = (fp.farm_name if fp else '') or (wr.block.block_name if wr.block else '')
    location = (fp.location if fp else '') or (getattr(u, 'county', None) or '') or wr.location
    scout = f'{u.first_name} {u.last_name}'.strip() or (u.phone_number or '')
    st = wr.timestamp
    pest_mobile = _pest_strings_from_mobile_raw(raw)
    dis_mobile = _disease_strings_from_mobile_raw(raw)
    has_pest = wr.any_pests_observed == 'Yes' or bool(pest_mobile)
    has_dis = wr.any_diseases_observed == 'Yes' or bool(dis_mobile)
    issues = 1 if (has_pest or has_dis) else 0
    status = ScoutingReport.DetectionStatus.DETECTED if issues else ScoutingReport.DetectionStatus.CLEAN
    short = str(wr.id).replace('-', '')[:8].upper()
    variety = str(raw.get('variety') or wr.variety or '').strip()
    mobile_block = str(raw.get('block') or '').strip()
    farm_name_submitted = str(raw.get('farm_name') or '').strip()[:512]
    submission_loc = str(raw.get('location') or '').strip()[:512]
    return {
        'id': f'app-weekly-{wr.id}',
        'recordCode': f'APP-{short}',
        'weeklyRecordId': str(wr.id),
        'scout': scout,
        'farm': farm,
        'location': location,
        'date': st.strftime('%Y-%m-%d') if st else '',
        'time': st.strftime('%H:%M') if st else '',
        'blocksInspected': 1,
        'issuesFound': issues,
        'status': status,
        'source': 'mobile_app',
        'trapSummary': _trap_summary_from_weekly(wr),
        'findingSummary': _finding_summary_from_weekly(wr),
        'blockName': wr.block.block_name if wr.block else '',
        'variety': variety,
        'pestSummary': _pest_summary_from_weekly(wr),
        'diseaseSummary': _disease_summary_from_weekly(wr),
        'mobileBlockLine': mobile_block,
        'farmNameAsSubmitted': farm_name_submitted,
        'submissionLocation': submission_loc,
        'beneficialSummary': _beneficial_summary_from_raw(raw),
        'diseaseMetaSummary': _disease_meta_summary_from_raw(raw),
        'gpsSummary': _gps_summary_from_raw(raw),
    }


def _dashboard_recent_from_registry(r: ScoutingReport) -> dict:
    st = r.submitted_at
    rf = r.farmer
    issues = 1 if r.status == ScoutingReport.DetectionStatus.DETECTED else 0
    return {
        'id': str(r.id),
        'recordCode': getattr(r, 'record_code', None) or '',
        'weeklyRecordId': None,
        'scout': r.scout_name or '',
        'farm': rf.farm_name if rf else '',
        'location': rf.location if rf else '',
        'date': st.strftime('%Y-%m-%d') if st else '',
        'time': st.strftime('%H:%M') if st else '',
        'blocksInspected': 1,
        'issuesFound': issues,
        'status': r.status,
        'source': 'registry',
        'trapSummary': '',
        'findingSummary': (r.finding or '')[:512],
        'blockName': r.block.name if r.block_id else '',
        'variety': '',
        'pestSummary': '',
        'diseaseSummary': '',
        'mobileBlockLine': '',
        'farmNameAsSubmitted': '',
        'submissionLocation': '',
        'beneficialSummary': '',
        'diseaseMetaSummary': '',
        'gpsSummary': '',
    }


def _merge_dashboard_recent_scouting(user, farmers_qs, scouting_qs, limit: int = 12) -> list:
    fp_by_uid = {fp.user_id: fp for fp in farmers_qs.select_related('user')}
    weekly_qs = _scoped_weekly_records_qs(user).order_by('-timestamp')[:20]
    # Rows mirrored from WeeklyRecord use source=app — list them only once via weekly records.
    sr_list = list(
        scouting_qs.exclude(source=ScoutingReport.Source.APP).order_by('-submitted_at')[:20]
    )
    wk_list = list(weekly_qs)
    candidates: list[tuple] = []
    for r in sr_list:
        st = r.submitted_at or timezone.now()
        candidates.append((_ensure_aware(st) or timezone.now(), 'sr', r))
    for w in wk_list:
        candidates.append((_ensure_aware(w.timestamp) or timezone.now(), 'wk', w))
    candidates.sort(key=lambda x: x[0], reverse=True)
    out: list[dict] = []
    for _ts, kind, obj in candidates:
        if len(out) >= limit:
            break
        if kind == 'sr':
            out.append(_dashboard_recent_from_registry(obj))
        else:
            out.append(_dashboard_recent_from_weekly(obj, fp_by_uid))
    return out


def _weekly_record_has_issue_q() -> Q:
    return Q(any_pests_observed='Yes') | Q(any_diseases_observed='Yes')


def _trap_activity_rows(user, farmers_qs, limit: int = 8) -> list:
    fp_by_uid = {fp.user_id: fp for fp in farmers_qs.select_related('user')}
    rows = []
    for t in _scoped_trap_logs_qs(user).order_by('-timestamp')[:limit]:
        u = t.farmer
        fp = fp_by_uid.get(u.id)
        farm = ''
        location = ''
        county = ''
        if t.farm_id:
            farm = t.farm.farm_name
        if fp:
            farm = farm or fp.farm_name
            location = fp.location
            county = fp.county or ''
        st = t.timestamp
        rows.append(
            {
                'id': str(t.id),
                'trapName': t.trap_name,
                'numberOfTraps': t.number_of_traps,
                'farm': farm or (u.phone_number or ''),
                'location': location or county,
                'county': county,
                'date': st.strftime('%Y-%m-%d') if st else '',
                'time': st.strftime('%H:%M') if st else '',
            }
        )
    return rows


class FarmerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FarmerProfile.objects.all().select_related('user')
    serializer_class = FarmerListSerializer
    pagination_class = StandardResultsSetPagination
    http_method_names = ['get', 'patch']
    permission_classes = [permissions.IsAuthenticated, require_permission('nav.farmers')]

    def get_serializer_class(self):
        return FarmerDetailSerializer if self.action == 'retrieve' else FarmerListSerializer

    def get_queryset(self):
        qs = _scoped_farmers_qs(self.request.user).select_related('user').prefetch_related('blocks')
        return qs.prefetch_related(
            Prefetch(
                'user__pest_scouting_farms',
                queryset=PestScoutingFarm.objects.order_by('-updated_at'),
            )
        )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, require_permission('nav.farmers')])
    def compliance_status(self, request, pk=None):
        farmer = self.get_object()
        serializer = FarmerComplianceStatusPatchSerializer(farmer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(FarmerListSerializer(farmer, context={'request': request}).data, status=status.HTTP_200_OK)


class CaseViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Case.objects.all().select_related('farmer', 'block', 'farmer__user', 'assigned_agronomist')
    serializer_class = CaseDetailSerializer
    http_method_names = ['get', 'post', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated, require_permission('nav.cases')]
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
    permission_classes = [permissions.IsAuthenticated, require_permission('nav.cases')]

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
    permission_classes = [permissions.IsAuthenticated, require_permission('nav.dashboard')]

    def get(self, request):
        now = timezone.now()
        farmers_qs = _scoped_farmers_qs(request.user)
        cases_qs = _scoped_cases_qs(request.user).select_related('farmer')
        scouting_qs = _scoped_scouting_qs(request.user).select_related('farmer', 'block')

        # Metrics for cards
        open_cases = cases_qs.filter(status__in=['new', 'under-review']).count()
        active_farmers = farmers_qs.count()
        thirty_days_ago = now - timedelta(days=30)
        weekly_qs_scoped = _scoped_weekly_records_qs(request.user)
        issue_q = _weekly_record_has_issue_q()
        weekly_detected_30d = weekly_qs_scoped.filter(timestamp__gte=thirty_days_ago).filter(issue_q).count()
        weekly_clean_30d = weekly_qs_scoped.filter(timestamp__gte=thirty_days_ago).exclude(issue_q).count()
        # Mirrored api.ScoutingReport rows from WeeklyRecord use source=app — exclude from registry counts to avoid double-counting.
        app_src = ScoutingReport.Source.APP
        registry_detected_30d = (
            scouting_qs.filter(
                status=ScoutingReport.DetectionStatus.DETECTED,
                submitted_at__gte=thirty_days_ago,
            )
            .exclude(source=app_src)
            .count()
        )
        registry_clean_30d = (
            scouting_qs.filter(
                status=ScoutingReport.DetectionStatus.CLEAN,
                submitted_at__gte=thirty_days_ago,
            )
            .exclude(source=app_src)
            .count()
        )
        detected_scans = weekly_detected_30d + registry_detected_30d

        trap_checks_30d = _scoped_trap_logs_qs(request.user).filter(timestamp__gte=thirty_days_ago).count()

        # Compliance headline + chart: prefer real weekly submissions from the mobile pipeline when any exist in scope.
        compliance_sublabel = ''
        compliance = 0
        has_mobile_history = weekly_qs_scoped.filter(timestamp__gte=now - timedelta(days=56)).exists()
        if has_mobile_history:
            weeklyComplianceData = []
            for i in range(6):
                week_dt = now - timedelta(weeks=5 - i)
                start_d = week_dt.date()
                end_d = start_d + timedelta(days=6)
                submitted_farmers = (
                    weekly_qs_scoped.filter(timestamp__date__gte=start_d, timestamp__date__lte=end_d)
                    .values('farmer_id')
                    .distinct()
                    .count()
                )
                if active_farmers > 0:
                    pct = int(round(100 * submitted_farmers / active_farmers))
                else:
                    pct = 100 if submitted_farmers else 0
                pct = max(0, min(100, pct))
                weeklyComplianceData.append({'week': f'W-{i + 1}', 'compliance': pct, 'target': 100})
            compliance = int(round(sum(p['compliance'] for p in weeklyComplianceData) / max(len(weeklyComplianceData), 1)))
            compliance_sublabel = 'Farmers filing weekly app report (6-wk avg)'
        else:
            if farmers_qs.exists():
                total_pct = 0
                count = 0
                for f in farmers_qs.only('weekly_scouting_logs_4w'):
                    logs = _weekly_logs_list(f.weekly_scouting_logs_4w)
                    frac = _weekly_completion_fraction(logs)
                    total_pct += int(round(frac * 100))
                    count += 1
                compliance = int(round(total_pct / max(count, 1)))
            compliance = max(0, min(100, compliance))
            weeklyComplianceData = [{'week': f'W-{i + 1}', 'compliance': compliance, 'target': 100} for i in range(6)]
            compliance_sublabel = 'Farmer profile 4-wk log (no recent app data)'

        issues_sublabel = ''
        if weekly_detected_30d or registry_detected_30d:
            issues_sublabel = f'{weekly_detected_30d} app weekly · {registry_detected_30d} web/USSD (30d)'

        metrics = [
            {'label': 'Open Cases', 'value': open_cases, 'icon': 'activity', 'iconBg': '#ECFDF3', 'iconColor': '#2D6A4F', 'sublabel': ''},
            {'label': 'Farmers Monitored', 'value': active_farmers, 'icon': 'check', 'iconBg': '#ECFDF3', 'iconColor': '#16A34A', 'sublabel': ''},
            {
                'label': 'Issues Detected',
                'value': detected_scans,
                'icon': 'alert',
                'iconBg': '#FEE2E2',
                'iconColor': '#DC2626',
                'sublabel': issues_sublabel,
            },
            {
                'label': 'Compliance',
                'value': f'{compliance}%',
                'icon': 'clock',
                'iconBg': '#E0DDD6',
                'iconColor': '#1B4332',
                'sublabel': compliance_sublabel,
            },
            {
                'label': 'Trap checks (30d)',
                'value': trap_checks_30d,
                'icon': 'target',
                'iconBg': '#E0F2FE',
                'iconColor': '#0369A1',
                'sublabel': 'Mobile trap log',
            },
        ]

        cases_30d = cases_qs.filter(date_submitted__gte=thirty_days_ago)
        weeklyTrends = []
        for i in range(6):
            week_dt = now - timedelta(weeks=5 - i)
            start_d = week_dt.date()
            end_d = start_d + timedelta(days=6)
            week_cases = cases_qs.filter(
                date_submitted__date__gte=start_d,
                date_submitted__date__lte=end_d,
            ).count()
            week_reports_wk = weekly_qs_scoped.filter(timestamp__date__gte=start_d, timestamp__date__lte=end_d).count()
            week_reports_sr = (
                scouting_qs.filter(
                    submitted_at__date__gte=start_d,
                    submitted_at__date__lte=end_d,
                )
                .exclude(source=app_src)
                .count()
            )
            field_reports = week_reports_wk + week_reports_sr
            weeklyTrends.append(
                {
                    'week': f'W-{i + 1}',
                    'cases': week_cases,
                    'resolved': max(0, week_cases - 1),
                    'fieldReports': field_reports,
                }
            )

        high = cases_30d.filter(severity=Case.Severity.HIGH).count()
        medium = cases_30d.filter(severity=Case.Severity.MEDIUM).count()
        low = cases_30d.filter(severity=Case.Severity.LOW).count()
        clean_scans_30d = weekly_clean_30d + registry_clean_30d
        pestDistribution = [
            {'name': 'High Risk', 'value': high, 'color': '#D97706'},
            {'name': 'Medium Risk', 'value': medium, 'color': '#F59E0B'},
            {'name': 'Low Risk', 'value': low, 'color': '#74C69D'},
            {'name': 'Clean scans (30d)', 'value': clean_scans_30d, 'color': '#16A34A'},
        ]

        # Triage queue: newest open cases for agronomist-like view
        triage = []
        q_cases = cases_qs.filter(status='new').order_by('-date_submitted')[:10]
        for c in q_cases:
            submitted_raw = c.date_submitted
            submitted_at = _ensure_aware(submitted_raw) if submitted_raw else now
            submittedHours = int(max(0, (now - submitted_at).total_seconds() // 3600))
            severity = c.severity if c.severity in ('high', 'medium', 'low') else 'medium'
            pest = c.pest_disease or ''
            scout = c.scout_name or ''
            priority = {'high': 1, 'medium': 2, 'low': 3}.get(severity, 2)
            farmer = c.farmer
            triage.append(
                {
                    'id': str(c.id),
                    'caseCode': getattr(c, 'case_code', None) or '',
                    'farm': farmer.farm_name if farmer else '',
                    'location': farmer.location if farmer else '',
                    'severity': severity,
                    'pest': pest,
                    'scout': scout,
                    'submittedHours': submittedHours,
                    'priority': priority,
                }
            )

        recentScoutingRecords = _merge_dashboard_recent_scouting(request.user, farmers_qs, scouting_qs, limit=12)
        recentTrapActivity = _trap_activity_rows(request.user, farmers_qs, limit=8)

        return Response(
            {
                'metrics': metrics,
                'weeklyComplianceData': weeklyComplianceData,
                'weeklyTrends': weeklyTrends,
                'pestDistribution': pestDistribution,
                'triageQueue': triage,
                'recentScoutingRecords': recentScoutingRecords,
                'recentTrapActivity': recentTrapActivity,
                'complianceSummary': {'target': 100, 'current': compliance},
                'todayLabel': now.strftime('%d %b %Y'),
                'todayDateKey': now.strftime('%Y-%m-%d'),
            }
        )


class ScoutingReportViewSet(viewsets.ModelViewSet):
    queryset = ScoutingReport.objects.all().select_related('farmer', 'block', 'farmer__user', 'assigned_to', 'related_case')
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated, require_permission('nav.scouting')]
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
            return [permissions.IsAuthenticated(), require_permission('nav.scouting')(), CanManageScoutingReview()]
        return [permissions.IsAuthenticated(), require_permission('nav.scouting')()]

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
        # Preserve DRF response payload/status for frontend create flows.
        return super().create(request, *args, **kwargs)

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


class ProductionVolumeSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ProductionVolumeSubmission.objects.all().select_related('source_entity', 'submitted_by')
    serializer_class = ProductionVolumeSubmissionSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        rn = role_name(u)
        if rn == 'Exporter':
            return qs.filter(source_type=ProductionVolumeSubmission.SourceType.EXPORTER, source_entity_id=getattr(u, 'entity_id', None))
        if rn == ROLE_AGRONOMIST:
            return qs.none()
        # Regulators and admins can view all.
        if is_admin_like(u) or rn in ('KEPHIS', 'HCDA'):
            return qs
        return qs.filter(submitted_by=u)

    def perform_create(self, serializer):
        u = self.request.user
        rn = role_name(u)
        inferred = None
        entity = getattr(u, 'entity', None)
        if rn == 'Exporter':
            inferred = ProductionVolumeSubmission.SourceType.EXPORTER
        elif rn in ('KEPHIS', 'HCDA'):
            inferred = ProductionVolumeSubmission.SourceType.REGULATOR
        elif entity and (entity.entity_type or '').lower().startswith('partner'):
            inferred = ProductionVolumeSubmission.SourceType.COOPERATIVE
        else:
            inferred = ProductionVolumeSubmission.SourceType.REGULATOR if is_admin_like(u) else ProductionVolumeSubmission.SourceType.COOPERATIVE

        serializer.save(
            submitted_by=u,
            source_type=inferred,
            source_entity=entity if inferred in (ProductionVolumeSubmission.SourceType.EXPORTER, ProductionVolumeSubmission.SourceType.COOPERATIVE) else None,
        )

    @action(detail=False, methods=['get'])
    def resolved(self, request):
        """
        Aggregate tonnage by county/ward/village with a simple precedence:
          approved regulator > approved exporter > approved cooperative > submitted latest.
        """
        year = int(request.query_params.get('year') or timezone.now().year)
        month = int(request.query_params.get('month') or timezone.now().month)
        group_by = (request.query_params.get('group_by') or 'ward').strip().lower()
        group_field = 'ward' if group_by not in ('county', 'ward', 'village') else group_by

        qs = ProductionVolumeSubmission.objects.filter(year=year, month=month)
        if group_field == 'county':
            keys = ['county']
        elif group_field == 'village':
            keys = ['county', 'ward', 'village']
        else:
            keys = ['county', 'ward']

        def k(obj):
            return tuple((getattr(obj, f) or '').strip() for f in keys)

        buckets = {}
        for row in qs.select_related('source_entity', 'submitted_by').order_by('-updated_at'):
            kk = k(row)
            buckets.setdefault(kk, []).append(row)

        def rank(row: ProductionVolumeSubmission) -> int:
            # Higher is better.
            if row.status == ProductionVolumeSubmission.Status.APPROVED:
                if row.source_type == ProductionVolumeSubmission.SourceType.REGULATOR:
                    return 400
                if row.source_type == ProductionVolumeSubmission.SourceType.EXPORTER:
                    return 300
                if row.source_type == ProductionVolumeSubmission.SourceType.COOPERATIVE:
                    return 200
                return 100
            if row.status == ProductionVolumeSubmission.Status.SUBMITTED:
                return 50
            if row.status == ProductionVolumeSubmission.Status.DRAFT:
                return 10
            return 0

        out = []
        for kk, rows in buckets.items():
            best = sorted(rows, key=lambda r: (rank(r), r.updated_at), reverse=True)[0]
            out.append(
                {
                    'key': kk,
                    'year': year,
                    'month': month,
                    'resolved_tonnage_mt': float(best.tonnage_mt),
                    'resolved_from': best.source_type,
                    'status': best.status,
                    'inputs': ProductionVolumeSubmissionSerializer(rows[:10], many=True, context={'request': request}).data,
                }
            )
        return Response({'results': out})


class BroadcastCampaignViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BroadcastCampaign.objects.all().select_related('created_by')
    serializer_class = BroadcastCampaignSerializer
    permission_classes = [permissions.IsAuthenticated, require_permission('nav.kephis')]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # KEPHIS-only view for now.
        if role_name(self.request.user) not in ('KEPHIS',) and not is_admin_like(self.request.user):
            return BroadcastCampaign.objects.none()
        return super().get_queryset()

    @action(detail=False, methods=['post'])
    def send(self, request):
        if role_name(request.user) not in ('KEPHIS',) and not is_admin_like(request.user):
            return Response({'detail': 'Only KEPHIS can send broadcasts.'}, status=status.HTTP_403_FORBIDDEN)

        county = (request.data.get('county') or '').strip()
        ward = (request.data.get('ward') or '').strip()
        village = (request.data.get('village') or '').strip()
        message = (request.data.get('message') or '').strip()
        dry_run = bool(request.data.get('dry_run') or False)

        if not message:
            return Response({'detail': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        farmers = FarmerProfile.objects.select_related('user').all()
        if county:
            farmers = farmers.filter(county__iexact=county)
        if ward:
            farmers = farmers.filter(ward__iexact=ward)
        if village:
            # Village is optional in the system; if empty, it will never match.
            farmers = farmers.filter(location__icontains=village) | farmers.filter(ward__iexact=village)

        farmers = farmers.distinct()
        total = farmers.count()
        if dry_run:
            return Response({'detail': 'ok', 'total_recipients': total})

        # Guardrails for synchronous sending.
        if total > 500:
            return Response(
                {'detail': f'Too many recipients ({total}). Narrow down to county/ward/village.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        campaign = BroadcastCampaign.objects.create(
            county=county,
            ward=ward,
            village=village,
            message=message,
            status=BroadcastCampaign.Status.SENDING,
            created_by=request.user,
            total_recipients=total,
        )

        sent = 0
        failed = 0
        for fp in farmers:
            phone = getattr(getattr(fp, 'user', None), 'phone_number', None) or ''
            rec = BroadcastRecipient.objects.create(
                campaign=campaign,
                farmer=fp,
                phone_number=str(phone),
                status='queued',
            )
            try:
                resp = send_advanta_sms(str(phone), message)
                rec.status = 'sent'
                rec.provider_response = resp or {}
                rec.sent_at = timezone.now()
                rec.save(update_fields=['status', 'provider_response', 'sent_at'])
                sent += 1
            except Exception as e:
                rec.status = 'failed'
                rec.error = str(e)
                rec.sent_at = timezone.now()
                rec.save(update_fields=['status', 'error', 'sent_at'])
                failed += 1
                logger.exception('Broadcast SMS failed for phone=%s', phone)

        campaign.sent_count = sent
        campaign.failed_count = failed
        campaign.status = BroadcastCampaign.Status.COMPLETED if failed == 0 else BroadcastCampaign.Status.COMPLETED
        campaign.save(update_fields=['sent_count', 'failed_count', 'status', 'updated_at'])

        return Response(BroadcastCampaignSerializer(campaign, context={'request': request}).data, status=status.HTTP_201_CREATED)


class AdminSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, require_permission('nav.admin'), IsAdminLikeUser]

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
