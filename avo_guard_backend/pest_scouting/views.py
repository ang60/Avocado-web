import json

from django.db import transaction
from django.db.models import Avg, Count, Q
from rest_framework import viewsets, permissions, pagination, filters, status, serializers, parsers
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Farm, FarmBlock, WeeklyRecord, Trap, ProblemReport, ScoutingReview, TrapLog
from .serializers import (
    FarmSerializer, FarmBlockSerializer, WeeklyRecordSerializer,
    ScoutingReportSerializer, TrapSerializer, ProblemReportSerializer, ScoutingReviewSerializer,
)
from api.drf_permissions import CanManageScoutingReview
from .weekly_helpers import actions_taken_list, disease_list, outcome_list, pests_observed_list
from drf_spectacular.utils import extend_schema, inline_serializer

from avo_guard.pagination import LargeResultsSetPagination

@extend_schema(tags=['Pest Scouting'])
class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['farm_name', 'location']

    @extend_schema(
        summary="List Farms",
        description="Get a list of all farms for the authenticated farmer.",
        responses={200: FarmSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Farm",
        description="Create a new farm for the authenticated farmer.",
        request=FarmSerializer,
        responses={201: FarmSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Farm",
        description="Get details of a specific farm.",
        responses={200: FarmSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Farm",
        description="Update an existing farm.",
        request=FarmSerializer,
        responses={200: FarmSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Farm",
        description="Partially update an existing farm.",
        request=FarmSerializer,
        responses={200: FarmSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Farm",
        description="Delete a farm.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        # Return only farms belonging to the authenticated farmer
        return self.queryset.filter(farmer_name=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer_name=self.request.user)

@extend_schema(tags=['Pest Scouting'])
class FarmBlockViewSet(viewsets.ModelViewSet):
    queryset = FarmBlock.objects.all()
    serializer_class = FarmBlockSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['block_name']

    @extend_schema(
        summary="List Farm Blocks",
        description="Get a list of all farm blocks for the authenticated farmer.",
        responses={200: FarmBlockSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Farm Block",
        description="Create a new farm block for the authenticated farmer.",
        request=FarmBlockSerializer,
        responses={201: FarmBlockSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Farm Block",
        description="Get details of a specific farm block.",
        responses={200: FarmBlockSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Farm Block",
        description="Update an existing farm block.",
        request=FarmBlockSerializer,
        responses={200: FarmBlockSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Farm Block",
        description="Partially update an existing farm block.",
        request=FarmBlockSerializer,
        responses={200: FarmBlockSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Farm Block",
        description="Delete a farm block.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        # Return only blocks belonging to the authenticated farmer
        return self.queryset.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    @action(detail=False, methods=['get'], url_path='scouting-stats')
    @extend_schema(
        summary="Get Scouting Statistics",
        description="Returns the number of blocks updated (data collected within the last week) vs total blocks for the user.",
        responses={200: inline_serializer(
            name='ScoutingStatsResponse',
            fields={
                'message': serializers.CharField(),
                'percentage': serializers.CharField(),
                'updated_blocks': serializers.IntegerField(),
                'total_blocks': serializers.IntegerField(),
            }
        )}
    )
    def scouting_stats(self, request):
        user = request.user
        total_blocks = FarmBlock.objects.filter(farmer=user).count()
        
        if total_blocks == 0:
            return Response({
                "message": "0 blocks out of 0 updated",
                "percentage": "0% out of total",
                "updated_blocks": 0,
                "total_blocks": 0
            })

        one_week_ago = timezone.now() - timedelta(days=7)
        
        # Count unique blocks that have a weekly record in the last 7 days
        updated_blocks_count = WeeklyRecord.objects.filter(
            farmer=user,
            timestamp__gte=one_week_ago
        ).values('block').distinct().count()

        percentage = (updated_blocks_count / total_blocks) * 100
        
        return Response({
            "message": f"{updated_blocks_count} block{'s' if updated_blocks_count != 1 else ''} out of {total_blocks} updated",
            "percentage": f"{percentage:.0f}% out of total",
            "updated_blocks": updated_blocks_count,
            "total_blocks": total_blocks
        })
@extend_schema(tags=['Pest Scouting'])
class TrapViewSet(viewsets.ModelViewSet):
    queryset = Trap.objects.all()
    serializer_class = TrapSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

@extend_schema(
    tags=['Pest Scouting'],
    summary="Manage Problem Reports",
    description="Allows creating and viewing problem reports. Reports can be submitted via the mobile app (with images) or via the USSD callback service (emergency reports)."
)
class ProblemReportViewSet(viewsets.ModelViewSet):
    queryset = ProblemReport.objects.all()
    serializer_class = ProblemReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

@extend_schema(tags=['Pest Scouting'])
class WeeklyRecordViewSet(viewsets.ModelViewSet):
    queryset = WeeklyRecord.objects.all()
    serializer_class = WeeklyRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['variety', 'location', 'pests_observed', 'disease']

    @extend_schema(
        summary="List Weekly Records",
        description="Get a list of all weekly records for the authenticated farmer.",
        responses={200: WeeklyRecordSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Weekly Record",
        description="Create a new weekly record for the authenticated farmer.",
        request=WeeklyRecordSerializer,
        responses={201: WeeklyRecordSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Weekly Record",
        description="Get details of a specific weekly record.",
        responses={200: WeeklyRecordSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Weekly Record",
        description="Update an existing weekly record.",
        request=WeeklyRecordSerializer,
        responses={200: WeeklyRecordSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Weekly Record",
        description="Partially update an existing weekly record.",
        request=WeeklyRecordSerializer,
        responses={200: WeeklyRecordSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Weekly Record",
        description="Delete a weekly record.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        return self.queryset.filter(farmer=self.request.user)

    def _snapshot_multipart_raw_payload(self, instance: WeeklyRecord) -> None:
        """Keep JSON scouting fields + resolved media URLs on the row for dashboards."""
        data = self.request.data
        raw = dict(instance.raw_payload or {}) if isinstance(instance.raw_payload, dict) else {}
        json_keys = (
            'trap_use',
            'pests_observed',
            'beneficial_insects_observed',
            'other_production_challenges',
            'disease',
            'disease_plant_part',
            'actions_taken',
        )
        for key in json_keys:
            val = data.get(key)
            if val is None or val == '':
                continue
            if isinstance(val, str) and val.strip().startswith(('[', '{')):
                try:
                    raw[key] = json.loads(val)
                except json.JSONDecodeError:
                    raw[key] = val
            else:
                raw[key] = val
        for key in (
            'variety',
            'location',
            'any_pests_observed',
            'any_diseases_observed',
            'outcome',
            'remarks',
            'additional_notes',
            'start_date',
            'end_date',
            'gps_latitude',
            'gps_longitude',
        ):
            val = data.get(key)
            if val not in (None, ''):
                raw[key] = val
        from .media_urls import weekly_record_image_urls
        from .record_payload import weekly_record_display_payload

        urls = weekly_record_image_urls(instance, self.request)
        merged = weekly_record_display_payload(instance)
        if urls:
            merged['uploaded_media_urls'] = urls
        if merged != (instance.raw_payload or {}):
            instance.raw_payload = merged
            instance.save(update_fields=['raw_payload'])

    def perform_create(self, serializer):
        block = serializer.validated_data['block']
        if block.farmer_id != self.request.user.id:
            raise ValidationError({'block': 'You can only submit scouting records for your own farm blocks.'})
        instance = serializer.save(farmer=self.request.user)
        if getattr(self.request, 'content_type', '') and 'multipart' in self.request.content_type:
            self._snapshot_multipart_raw_payload(instance)

    @action(detail=False, methods=['post'], url_path='import_android')
    def import_android(self, request):
        from .android_import import build_weekly_record_kwargs, maybe_create_pending_review

        body = request.data
        if not isinstance(body, dict):
            raise ValidationError({'detail': 'Expected a JSON object body.'})
        try:
            kwargs = build_weekly_record_kwargs(request.user, body)
        except ValueError as e:
            raise ValidationError({'block': str(e)})
        with transaction.atomic():
            record = WeeklyRecord.objects.create(**kwargs)
            maybe_create_pending_review(record, body)
        return Response(WeeklyRecordSerializer(record, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def create(self, request, *args, **kwargs):
        from .android_import import is_android_scouting_payload

        if is_android_scouting_payload(request.data):
            return self.import_android(request)
        return super().create(request, *args, **kwargs)

@extend_schema(tags=['Pest Scouting'])
class ScoutingReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeeklyRecord.objects.all().select_related('farmer', 'block', 'farmer__entity', 'triage_review')
    serializer_class = ScoutingReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = LargeResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'variety', 'location', 'pests_observed', 'disease', 
        'farmer__phone_number', 'farmer__first_name', 'farmer__last_name',
        'block__block_name', 'block__farm_name__farm_name'
    ]

    @extend_schema(
        summary="List Scouting Reports",
        description="Get a list of scouting reports with detailed information. Agronomists can see all reports.",
        responses={200: ScoutingReportSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Scouting Report",
        description="Get details of a specific scouting report.",
        responses={200: ScoutingReportSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_object(self):
        lookup = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)
        if isinstance(lookup, str):
            key = lookup.strip()
            if key.startswith('app-weekly-'):
                self.kwargs[self.lookup_url_kwarg or self.lookup_field] = key[len('app-weekly-') :]
        return super().get_object()

    def get_queryset(self):
        # Allow users to see their own reports. 
        # If they are agronomists or staff, they can see all.
        user = self.request.user
        if not user.is_authenticated:
            return WeeklyRecord.objects.none()
            
        # Check if user has agronomist role or is staff
        is_agronomist = False
        if user.role and user.role.role_name == 'Agronomist':
            is_agronomist = True
        
        if user.is_staff or is_agronomist:
            return self.queryset
        return self.queryset.filter(farmer=user)

    @action(detail=False, methods=['get'])
    def audit_log(self, request):
        rows = self.get_queryset()[:200]
        payload = []
        for r in rows:
            flags = []
            if not r.voice_note:
                flags.append('missing_media')
            if r.end_date < r.start_date:
                flags.append('invalid_window')
            if r.gps_latitude is None or r.gps_longitude is None:
                flags.append('missing_gps')
            payload.append(
                {
                    'id': str(r.id),
                    'scout': f"{r.farmer.first_name} {r.farmer.last_name}".strip() or r.farmer.phone_number,
                    'block': r.block.block_name,
                    'county': r.farmer.county,
                    'timestamp': r.timestamp.isoformat(),
                    'flags': flags,
                    'status': 'review_needed' if flags else 'ok',
                }
            )
        return Response(payload)

    @action(detail=False, methods=['get'])
    def agronomist_analytics(self, request):
        qs = self.get_queryset()
        county_rollup = (
            qs.values('farmer__county')
            .annotate(
                detections=Count('id', filter=Q(any_pests_observed='Yes') | Q(any_diseases_observed='Yes')),
                reports=Count('id'),
            )
            .order_by('-detections')[:20]
        )
        protocol_rollup = (
            qs.values('actions_taken', 'outcome')
            .annotate(count=Count('id'))
            .order_by('-count')[:50]
        )
        payload = {
            'county_pressure': [
                {
                    'county': row['farmer__county'] or 'Unknown',
                    'detections': row['detections'],
                    'reports': row['reports'],
                    'avg_pests_per_trap': 0,
                }
                for row in county_rollup
            ],
            'protocol_performance': [
                {
                    'action': row['actions_taken'],
                    'outcome': row['outcome'],
                    'count': row['count'],
                }
                for row in protocol_rollup
            ],
        }
        return Response(payload)

    @action(detail=False, methods=['get'])
    def block_overview(self, request):
        rows = self.get_queryset().select_related('farmer', 'block')
        grouped = {}
        for record in rows:
            key = f'{record.farmer_id}:{record.block_id}'
            item = grouped.get(key)
            finding = ScoutingReportSerializer(record, context={'request': request}).data.get('finding', 'No Pests Found')
            payload = {
                'farmer_id': str(record.farmer_id),
                'farmer_name': f'{record.farmer.first_name} {record.farmer.last_name}'.strip() or record.farmer.phone_number,
                'county': record.farmer.county,
                'block_id': str(record.block_id),
                'block_name': record.block.block_name,
                'last_scouted_at': record.timestamp.isoformat(),
                'latest_finding': finding,
                'status': 'detected' if (record.any_pests_observed == 'Yes' or record.any_diseases_observed == 'Yes') else 'clean',
                'severity': 'high' if (record.any_pests_observed == 'Yes' or record.any_diseases_observed == 'Yes') else 'low',
                'pests': pests_observed_list(record),
                'diseases': disease_list(record),
                'actions_taken': actions_taken_list(record),
                'outcomes': outcome_list(record),
                'history_count': 1,
                '_latest_ts': record.timestamp,
            }
            if item is None or record.timestamp > item['_latest_ts']:
                grouped[key] = payload
            else:
                item['history_count'] += 1
        results = []
        for item in grouped.values():
            item.pop('_latest_ts', None)
            results.append(item)
        return Response(results)

    @action(detail=True, methods=['post'])
    def request_reinspection(self, request, pk=None):
        record = self.get_object()
        title = (request.data.get('case_title') or '').strip() or f"Re-inspection request: {record.block.block_name}"
        severity = (request.data.get('severity') or 'medium').strip().lower()
        if severity not in {'high', 'medium', 'low', 'unknown'}:
            severity = 'medium'
        notes = (request.data.get('notes') or '').strip() or f"Farmer requested re-inspection for block {record.block.block_name}."
        from case_management.models import Case

        assigned_agronomist = getattr(getattr(record, 'farmer', None), 'managed_by', None)
        case = Case.objects.create(
            case_title=title,
            severity=severity,
            pest_scouting_record=record,
            notes=notes,
            assigned_agronomist=assigned_agronomist,
        )
        return Response(
            {
                'status': 'reinspection_requested',
                'message': 'Re-inspection request submitted successfully.',
                'case_id': str(case.id),
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'])
    def confirm_identification(self, request, pk=None):
        if not CanManageScoutingReview().has_permission(request, self):
            raise PermissionDenied('You do not have permission to confirm identifications.')
        record = self.get_object()
        serializer = ScoutingReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review, _created = ScoutingReview.objects.update_or_create(
            record=record,
            defaults={
                'reviewed_by': request.user,
                'identified_label': serializer.validated_data['identified_label'],
                'management_protocol': serializer.validated_data.get('management_protocol'),
                'review_status': serializer.validated_data.get('review_status', 'confirmed'),
                'training_tagged': serializer.validated_data.get('training_tagged', True),
                'review_notes': serializer.validated_data.get('review_notes'),
                'pushed_to_farmer': serializer.validated_data.get('pushed_to_farmer', False),
            },
        )
        case = None
        try:
            from case_management.models import Case

            case = Case.objects.filter(pest_scouting_record=record).order_by('-created_at').first()
            if case:
                case.status = 'verified'
                case.diagnosis = review.identified_label
                actions = case.recommended_actions or []
                if review.management_protocol:
                    actions = [*actions, review.management_protocol]
                case.recommended_actions = actions
                case.save(update_fields=['status', 'diagnosis', 'recommended_actions', 'updated_at'])
        except Exception:
            pass
        if review.pushed_to_farmer:
            _push_triage_outcome_to_farmer(record, review)
        return Response(
            {
                'status': 'confirmed',
                'message': 'Identification confirmed and tagged for AI training.',
                'review': ScoutingReviewSerializer(review).data,
                'linked_case_id': str(case.id) if case else None,
            },
            status=status.HTTP_200_OK,
        )


def _push_triage_outcome_to_farmer(record: WeeklyRecord, review: ScoutingReview) -> None:
    from advisory_services.models import Advisory
    from alerts.utils import create_alert

    label = (review.identified_label or 'Field review').strip()
    protocol = (review.management_protocol or '').strip()
    block_name = getattr(getattr(record, 'block', None), 'block_name', None) or 'your block'
    body = f"Agronomist review for {block_name}: {label}"
    if protocol:
        body = f"{body}\n\nRecommended actions:\n{protocol}"
    if review.review_notes:
        body = f"{body}\n\nNotes: {review.review_notes.strip()}"
    create_alert(record.farmer, 'Scouting review ready', body[:2000], send_sms=True)
    Advisory.objects.create(
        weekly_record=record,
        farmer=record.farmer,
        advisory_message=body[:4000],
        category='agronomist_review',
    )
