import csv
import random
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import QuarantineManagement, KephisThresholdSetting, QuarantineActionLog
from .serializers import (
    QuarantineManagementSerializer,
    KephisThresholdSettingSerializer,
    QuarantineActionLogSerializer,
)
from accounts.models import User, Entity
from pest_scouting.models import WeeklyRecord
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema
from api.rbac import ROLE_ADMIN, ROLE_KEPHIS, role_name, is_admin_like


@extend_schema(tags=['KEPHIS Quarantine'])
class QuarantineManagementViewSet(viewsets.ModelViewSet):
    def _can_edit_thresholds(self, user) -> bool:
        if not user or not getattr(user, 'is_authenticated', False):
            return False
        if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
            return True
        return role_name(user) in {ROLE_ADMIN, 'System Administrator', ROLE_KEPHIS}

    queryset = QuarantineManagement.objects.all().order_by('-updated_at', '-created_at')
    serializer_class = QuarantineManagementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['blockId', 'farmName', 'county', 'pestType', 'inspector']

    def list(self, request, *args, **kwargs):
        self._auto_enforce_threshold_restrictions(request.user)
        return super().list(request, *args, **kwargs)

    def _log_action(self, quarantine, actor, action_type, from_status, to_status, notes=''):
        QuarantineActionLog.objects.create(
            quarantine=quarantine,
            action_type=action_type,
            from_status=from_status or '',
            to_status=to_status or '',
            actor=actor if getattr(actor, 'is_authenticated', False) else None,
            notes=notes or '',
        )

    def _is_kephis_or_admin(self, user) -> bool:
        return self._can_edit_thresholds(user)

    def _is_senior_approver(self, user) -> bool:
        return bool(user and getattr(user, 'is_authenticated', False) and is_admin_like(user))

    def _pest_limit(self, pest_type: str) -> int:
        setting, _ = KephisThresholdSetting.objects.get_or_create(
            pk=1,
            defaults={'fruit_fly_limit': 5, 'fcm_limit': 2, 'thrips_limit': 10},
        )
        pest = (pest_type or '').lower()
        if 'fcm' in pest or 'false codling moth' in pest:
            return setting.fcm_limit
        if 'thrip' in pest:
            return setting.thrips_limit
        return setting.fruit_fly_limit

    def _count_latest_clean_reports(self, quarantine: QuarantineManagement) -> int:
        block_qs = WeeklyRecord.objects.filter(
            Q(block__block_name__iexact=quarantine.blockId)
            | Q(location__iexact=quarantine.county)
        ).order_by('-end_date', '-timestamp')
        latest_three = list(block_qs[:3])
        if len(latest_three) < 3:
            return 0

        pest_limit = self._pest_limit(quarantine.pestType)
        clean_count = 0
        for row in latest_three:
            try:
                density = float(row.pests_per_trap or 0)
            except (TypeError, ValueError):
                density = 0.0
            if density <= 0 or density < pest_limit:
                clean_count += 1
        return clean_count

    def _auto_enforce_threshold_restrictions(self, actor):
        rows = QuarantineManagement.objects.all()
        for row in rows:
            try:
                capture_rate = float(row.captureRate or 0)
            except (TypeError, ValueError):
                capture_rate = 0.0
            limit = float(self._pest_limit(row.pestType))
            if capture_rate <= limit or row.kephisStatus == 'gated':
                continue

            previous_status = row.kephisStatus
            row.kephisStatus = 'gated'
            row.selected = True
            row.save(update_fields=['kephisStatus', 'selected', 'updated_at'])
            self._log_action(
                quarantine=row,
                actor=actor,
                action_type='issue_restriction',
                from_status=previous_status,
                to_status='gated',
                notes=f'Auto-restriction: capture rate {capture_rate:.2f} exceeded threshold {limit:.2f}.',
            )

    def _build_alerts_payload(self):
        rows = list(QuarantineManagement.objects.all())
        alerts = []
        for row in rows:
            try:
                capture_rate = float(row.captureRate or 0)
            except (TypeError, ValueError):
                capture_rate = 0.0
            limit = float(self._pest_limit(row.pestType))
            if capture_rate <= limit:
                continue

            severity = 'critical' if 'fcm' in (row.pestType or '').lower() or capture_rate >= (limit * 1.5) else 'warning'
            alerts.append(
                {
                    'id': str(row.id),
                    'blockId': row.blockId,
                    'farmName': row.farmName,
                    'county': row.county,
                    'pestType': row.pestType,
                    'captureRate': capture_rate,
                    'threshold': limit,
                    'kephisStatus': row.kephisStatus,
                    'severity': severity,
                    'lastInspection': row.lastInspection,
                    'inspector': row.inspector,
                }
            )
        alerts.sort(key=lambda a: (0 if a['severity'] == 'critical' else 1, -(a['captureRate'] - a['threshold'])))
        return {'results': alerts[:100]}

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="quarantine_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Block ID', 'Farm Name', 'County', 'Pest Type', 'Capture Rate', 'Last Inspection', 'Status', 'Inspector'])

        for q in QuarantineManagement.objects.all():
            writer.writerow([q.id, q.blockId, q.farmName, q.county, q.pestType, q.captureRate, q.lastInspection, q.kephisStatus, q.inspector])

        return response

    @action(detail=False, methods=['get', 'patch'])
    def thresholds(self, request):
        setting, _ = KephisThresholdSetting.objects.get_or_create(
            pk=1,
            defaults={
                'fruit_fly_limit': 5,
                'fcm_limit': 2,
                'thrips_limit': 10,
            },
        )

        if request.method.lower() == 'get':
            return Response(KephisThresholdSettingSerializer(setting).data)

        if not self._can_edit_thresholds(request.user):
            raise PermissionDenied('Only KEPHIS/Admin users can update national thresholds.')

        serializer = KephisThresholdSettingSerializer(setting, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def risk_intelligence(self, request):
        exporters = Entity.objects.filter(entity_type='Exporter')
        compliance_data = []
        for exp in exporters:
            farmer_count = User.objects.filter(entity=exp, role__role_name='Farmer').count()
            restricted = random.randint(0, 15)
            risk_score = random.randint(0, 100)
            compliance_data.append({
                'id': exp.id,
                'exporterName': exp.company_name,
                'farmerCount': farmer_count,
                'restrictedBlocks': restricted,
                'riskScore': risk_score,
                'county': exp.primary_county
            })

        clusters = WeeklyRecord.objects.values('location').annotate(
            farmerCount=Count('farmer', distinct=True),
            pestCount=Count('pests_observed', filter=Q(any_pests_observed='Yes'))
        )

        cluster_data = []
        for c in clusters:
            intensity = 'low'
            if c['pestCount'] > 20:
                intensity = 'high'
            elif c['pestCount'] > 5:
                intensity = 'medium'

            cluster_data.append({
                'county': c['location'],
                'intensity': intensity,
                'farmerCount': c['farmerCount'],
                'pestCount': c['pestCount']
            })

        total_pest_detections = WeeklyRecord.objects.filter(any_pests_observed='Yes').count()
        active_quarantine_zones = QuarantineManagement.objects.filter(kephisStatus='gated').count()
        affected_farmers = WeeklyRecord.objects.filter(any_pests_observed='Yes').values('farmer').distinct().count()

        avg_risk = (sum([d['riskScore'] for d in compliance_data]) / len(compliance_data)) if compliance_data else 0
        compliance_rate = 100 - avg_risk

        summary = {
            'total_pest_detections': total_pest_detections,
            'active_quarantine_zones': active_quarantine_zones,
            'affected_farmers': affected_farmers,
            'compliance_rate': compliance_rate
        }

        return Response({
            'exporterCompliance': compliance_data,
            'infectionClusters': cluster_data,
            'summary': summary
        })

    @action(detail=True, methods=['post'])
    def issue_restriction(self, request, pk=None):
        row = self.get_object()
        if not self._is_kephis_or_admin(request.user):
            raise PermissionDenied('Only KEPHIS/Admin users can issue restrictions.')
        if row.kephisStatus == 'gated':
            raise PermissionDenied('Block is already under movement restriction.')
        previous_status = row.kephisStatus
        row.kephisStatus = 'gated'
        row.selected = True
        row.save(update_fields=['kephisStatus', 'selected', 'updated_at'])
        self._log_action(
            quarantine=row,
            actor=request.user,
            action_type='issue_restriction',
            from_status=previous_status,
            to_status='gated',
            notes=request.data.get('notes', ''),
        )
        return Response(QuarantineManagementSerializer(row).data)

    @action(detail=True, methods=['post'])
    def request_lift(self, request, pk=None):
        row = self.get_object()
        if not self._is_kephis_or_admin(request.user):
            raise PermissionDenied('Only KEPHIS/Admin users can submit lift requests.')
        if row.kephisStatus != 'gated':
            raise PermissionDenied('Lift requests can only be submitted for restricted blocks.')
        previous_status = row.kephisStatus
        row.kephisStatus = 'pending'
        row.lift_requested_at = timezone.now()
        row.save(update_fields=['kephisStatus', 'lift_requested_at', 'updated_at'])
        self._log_action(
            quarantine=row,
            actor=request.user,
            action_type='request_lift',
            from_status=previous_status,
            to_status='pending',
            notes=request.data.get('notes', ''),
        )
        return Response(QuarantineManagementSerializer(row).data)

    @action(detail=True, methods=['post'])
    def recommend_lift(self, request, pk=None):
        row = self.get_object()
        if not self._is_kephis_or_admin(request.user):
            raise PermissionDenied('Only KEPHIS/Admin field officers can recommend lift.')
        if row.kephisStatus != 'pending':
            raise PermissionDenied('Lift recommendation requires an active lift request.')
        clean_reports = self._count_latest_clean_reports(row)
        if clean_reports < 3:
            raise PermissionDenied('Cannot recommend lift until the latest 3 reports are clean.')
        previous_status = row.kephisStatus
        row.kephisStatus = 'pending'
        row.lift_recommended_at = timezone.now()
        row.lift_recommended_by = request.user
        row.save(
            update_fields=[
                'kephisStatus',
                'lift_recommended_at',
                'lift_recommended_by',
                'updated_at',
            ]
        )
        self._log_action(
            quarantine=row,
            actor=request.user,
            action_type='recommend_lift',
            from_status=previous_status,
            to_status='pending',
            notes=request.data.get('notes', ''),
        )
        return Response(QuarantineManagementSerializer(row).data)

    @action(detail=True, methods=['post'])
    def approve_lift(self, request, pk=None):
        row = self.get_object()
        if not self._is_senior_approver(request.user):
            raise PermissionDenied('Senior KEPHIS Admin approval is required.')
        if row.kephisStatus != 'pending':
            raise PermissionDenied('Only pending lift requests can be approved.')
        if not row.lift_recommended_by_id:
            raise PermissionDenied('Lift must be recommended by a field officer before approval.')
        clean_reports = self._count_latest_clean_reports(row)
        if clean_reports < 3:
            raise PermissionDenied('Cannot approve lift until latest 3 reports are clean.')
        previous_status = row.kephisStatus
        row.kephisStatus = 'cleared'
        row.selected = False
        row.lift_approved_at = timezone.now()
        row.lift_approved_by = request.user
        row.save(
            update_fields=[
                'kephisStatus',
                'selected',
                'lift_approved_at',
                'lift_approved_by',
                'updated_at',
            ]
        )
        self._log_action(
            quarantine=row,
            actor=request.user,
            action_type='approve_lift',
            from_status=previous_status,
            to_status='cleared',
            notes=request.data.get('notes', ''),
        )
        return Response(QuarantineManagementSerializer(row).data)

    @action(detail=False, methods=['get'])
    def chain_of_custody(self, request):
        block_id = request.query_params.get('blockId')
        logs = QuarantineActionLog.objects.select_related('actor', 'quarantine')
        if block_id:
            logs = logs.filter(quarantine__blockId__iexact=block_id)
        logs = logs[:200]
        data = QuarantineActionLogSerializer(logs, many=True).data
        return Response({'results': data})

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        self._auto_enforce_threshold_restrictions(request.user)
        return Response(self._build_alerts_payload())

