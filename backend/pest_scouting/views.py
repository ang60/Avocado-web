from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Farm, FarmBlock, ProblemReport, TrapLog, WeeklyRecord, ScoutingReview, ScoutingSession
from .serializers import (
    FarmBlockSerializer,
    FarmSerializer,
    ProblemReportSerializer,
    ScoutingSessionSerializer,
    TrapLogSerializer,
    WeeklyRecordSerializer,
    ScoutingReportSerializer,
    ScoutingReviewSerializer,
)
from drf_spectacular.utils import extend_schema
from django.db.models import Avg, Count, Q

from avo_guard.pagination import LargeResultsSetPagination
from api.drf_permissions import CanManageScoutingReview


class PestScoutingPage(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


def _payload_value(payload, key, default=''):
    value = payload.get(key, default)
    return default if value is None else value


def _payload_list(payload, key):
    value = payload.get(key, [])
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, tuple):
        return [str(v).strip() for v in value if str(v).strip()]
    text = str(value).strip()
    return [text] if text else []


def _clean_choice(value, valid_choices):
    text = str(value or '').strip()
    if not text:
        return None
    valid = {choice for choice, _label in valid_choices}
    if text in valid:
        return text
    lowered = {choice.lower(): choice for choice, _label in valid_choices}
    return lowered.get(text.lower())


def _parse_decimal(value, default='0'):
    text = str(value if value not in (None, '') else default).strip()
    return Decimal(text or default)


def _parse_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalize_mobile_payload(payload, farmer, block):
    pests = [_clean_choice(v, WeeklyRecord.PEST_CHOICES) for v in _payload_list(payload, '3_select_pests_observed')]
    pests = [v for v in pests if v]
    beneficials = [_clean_choice(v, WeeklyRecord.BENEFICIAL_INSECT_CHOICES) for v in _payload_list(payload, '3_beneficial_insects_observed')]
    beneficials = [v for v in beneficials if v]
    pest_parts = [_clean_choice(v, WeeklyRecord.PLANT_PART_CHOICES) for v in _payload_list(payload, '3_plant_part_affected')]
    pest_parts = [v for v in pest_parts if v]
    diseases = [_clean_choice(v, WeeklyRecord.DISEASE_CHOICES) for v in _payload_list(payload, '4_select_diseases')]
    diseases = [v for v in diseases if v]
    disease_parts = [_clean_choice(v, WeeklyRecord.PLANT_PART_CHOICES) for v in _payload_list(payload, '4_plant_part')]
    disease_parts = [v for v in disease_parts if v]
    actions = [_clean_choice(v, WeeklyRecord.ACTION_TAKEN_CHOICES) for v in _payload_list(payload, '6_action_taken')]
    actions = [v for v in actions if v]
    outcomes = [_clean_choice(v, WeeklyRecord.OUTCOME_CHOICES) for v in _payload_list(payload, '6_outcome')]
    outcomes = [v for v in outcomes if v]

    return {
        'farmer': farmer,
        'block': block,
        'variety': str(_payload_value(payload, '1_avocado_variety', 'Avocado')).strip() or 'Avocado',
        'type_of_trap': str(_payload_value(payload, '2_what_type_of_trap', 'Unknown trap')).strip() or 'Unknown trap',
        'number_of_trap': _parse_int(_payload_value(payload, '2_number_of_traps', 0), 0),
        'traps_replaced': _parse_int(_payload_value(payload, '2_traps_replaced', 0), 0),
        'any_pests_observed': 'Yes' if str(_payload_value(payload, '3_were_any_pests_observed', 'No')).strip().lower() == 'yes' else 'No',
        'pests_observed': pests[0] if pests else None,
        'pests_observed_list': pests,
        'beneficial_insects_observed': beneficials[0] if beneficials else None,
        'beneficial_insects_observed_list': beneficials,
        'number_of_trees_affected': _parse_int(_payload_value(payload, '3_number_of_trees_affected', 0), 0),
        'pest_plant_part_affected': pest_parts[0] if pest_parts else None,
        'pest_plant_parts_affected_list': pest_parts,
        'pest_crop_stage': _clean_choice(_payload_value(payload, '3_crop_stage', ''), WeeklyRecord.CROP_STAGE_CHOICES),
        'pest_detection_method': _clean_choice(_payload_value(payload, '3_detection_method', ''), WeeklyRecord.DETECTION_METHOD_CHOICES),
        'pests_per_trap': _parse_decimal(_payload_value(payload, '3_pests_per_trap', '0')),
        'any_diseases_observed': 'Yes' if str(_payload_value(payload, '4_were_any_diseases_observed', 'No')).strip().lower() == 'yes' else 'No',
        'disease': diseases[0] if diseases else None,
        'disease_list': diseases,
        'disease_plant_part': disease_parts[0] if disease_parts else None,
        'disease_plant_parts_list': disease_parts,
        'disease_crop_stage': _clean_choice(_payload_value(payload, '4_crop_stage', ''), WeeklyRecord.CROP_STAGE_CHOICES),
        'disease_detection_method': _clean_choice(_payload_value(payload, '4_detection_method', ''), WeeklyRecord.DETECTION_METHOD_CHOICES),
        'number_of_photos_taken': _parse_int(_payload_value(payload, '5_number_of_photos_taken', 0), 0),
        'additional_notes': str(_payload_value(payload, '5_additional_notes', '')).strip() or None,
        'actions_taken': actions[0] if actions else '❌ No action taken',
        'actions_taken_list': actions or ['❌ No action taken'],
        'outcome': outcomes[0] if outcomes else '🔄 Follow-up needed',
        'outcome_list': outcomes or ['🔄 Follow-up needed'],
        'remarks': str(_payload_value(payload, '6_remarks', '')).strip() or None,
        'start_date': str(_payload_value(payload, '0_start_timestamp', '')).strip()[:10] or timezone.localdate().isoformat(),
        'end_date': str(_payload_value(payload, '0_end_timestamp', '')).strip()[:10] or timezone.localdate().isoformat(),
        'location': str(_payload_value(payload, '0_location', '')).strip() or farmer.county or block.block_name,
        'gps_latitude': _payload_value(payload, '0_start_gps_latitude', None) or None,
        'gps_longitude': _payload_value(payload, '0_start_gps_longitude', None) or None,
        'raw_payload': payload,
    }


@extend_schema(tags=['Pest Scouting'])
class FarmBlockViewSet(viewsets.ModelViewSet):
    queryset = FarmBlock.objects.all().order_by('-timestamp')
    serializer_class = FarmBlockSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['block_name']

    def get_queryset(self):
        # Return only blocks belonging to the authenticated farmer
        return self.queryset.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        farm_id = self.request.data.get('farm_name_id')
        farm = None
        if farm_id:
            farm = Farm.objects.filter(id=farm_id, farmer=self.request.user).first()
            if not farm:
                raise ValidationError({'farm_name_id': 'Unknown farm id for this user.'})
        serializer.save(farmer=self.request.user, farm=farm)


@extend_schema(tags=['Pest Scouting'])
class WeeklyRecordViewSet(viewsets.ModelViewSet):
    queryset = WeeklyRecord.objects.all()
    serializer_class = WeeklyRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['variety', 'location', 'pests_observed', 'disease']

    def get_queryset(self):
        # Return only records belonging to the authenticated farmer
        return self.queryset.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        block = serializer.validated_data['block']
        if block.farmer_id != self.request.user.id:
            raise ValidationError({'block': 'You can only submit scouting records for your own farm blocks.'})

        scouting_session = serializer.validated_data.get('scouting_session')
        if scouting_session:
            if scouting_session.farmer_id != self.request.user.id:
                raise ValidationError({'scouting_session': 'This scouting session does not belong to you.'})
            if scouting_session.status == 'completed':
                raise ValidationError({'scouting_session': 'This scouting session has already been completed.'})
            if scouting_session.status == 'draft':
                scouting_session.status = 'in_progress'
                scouting_session.save(update_fields=['status', 'updated_at'])

        serializer.save(farmer=self.request.user)

    @action(detail=False, methods=['post'])
    def import_mobile_payload(self, request):
        payload = request.data.get('payload')
        if not isinstance(payload, dict):
            raise ValidationError({'payload': 'Expected a JSON object payload.'})

        block_name = str(_payload_value(payload, '1_block', '')).strip()
        if not block_name:
            raise ValidationError({'payload': 'The mobile payload must include `1_block`.'})

        block = FarmBlock.objects.filter(farmer=request.user, block_name__iexact=block_name).first()
        if not block:
            raise ValidationError({'block': f'No farm block named "{block_name}" was found for the current farmer.'})

        with transaction.atomic():
            normalized = _normalize_mobile_payload(payload, request.user, block)
            record = WeeklyRecord.objects.create(**normalized)

        return Response(WeeklyRecordSerializer(record, context={'request': request}).data, status=status.HTTP_201_CREATED)

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
class ScoutingSessionViewSet(viewsets.ModelViewSet):
    queryset = ScoutingSession.objects.all().select_related('farmer')
    serializer_class = ScoutingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        block_ids = serializer.validated_data.pop('block_ids', [])
        owned_blocks = set(
            FarmBlock.objects.filter(farmer=self.request.user, id__in=block_ids).values_list('id', flat=True)
        )
        if len(owned_blocks) != len(set(block_ids)):
            raise ValidationError({'block_ids': 'One or more selected blocks do not belong to you.'})

        status_value = serializer.validated_data.get('status') or 'draft'
        if status_value == 'completed':
            serializer.save(farmer=self.request.user, completed_at=timezone.now())
            return
        serializer.save(farmer=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        if session.status != 'completed':
            session.status = 'completed'
            session.completed_at = timezone.now()
            session.save(update_fields=['status', 'completed_at', 'updated_at'])
        return Response(ScoutingSessionSerializer(session).data, status=status.HTTP_200_OK)


@extend_schema(tags=['Pest Scouting'])
class ScoutingReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeeklyRecord.objects.all().select_related('farmer', 'block', 'farmer__entity', 'triage_review')
    serializer_class = ScoutingReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = LargeResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['variety', 'location', 'pests_observed', 'disease', 'farmer__phone_number', 'block__block_name']

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
                avg_pests_per_trap=Avg('pests_per_trap'),
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
                    'avg_pests_per_trap': float(row['avg_pests_per_trap'] or 0),
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
                'pests': record.pests_observed_list or ([record.pests_observed] if record.pests_observed else []),
                'diseases': record.disease_list or ([record.disease] if record.disease else []),
                'actions_taken': record.actions_taken_list or ([record.actions_taken] if record.actions_taken else []),
                'outcomes': record.outcome_list or ([record.outcome] if record.outcome else []),
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
        """
        Create a case-management ticket from a scouting record to request
        agronomist re-inspection.
        """
        record = self.get_object()
        title = (request.data.get('case_title') or '').strip()
        if not title:
            title = f"Re-inspection request: {record.block.block_name}"

        severity = (request.data.get('severity') or 'medium').strip().lower()
        if severity not in {'high', 'medium', 'low', 'unknown'}:
            severity = 'medium'

        notes = (request.data.get('notes') or '').strip()
        if not notes:
            notes = f"Farmer requested re-inspection for block {record.block.block_name}."

        from case_management.models import Case

        assigned_agronomist = None
        try:
            # If the farmer account is linked to an agronomist, assign the reinspection case to them.
            farmer_user = getattr(record, 'farmer', None)
            assigned_agronomist = getattr(farmer_user, 'managed_by', None)
        except Exception:
            assigned_agronomist = None

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
    """Alert + advisory when agronomist confirms and opts to notify the farmer app."""
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

    create_alert(
        record.farmer,
        'Scouting review ready',
        body[:2000],
        send_sms=True,
    )
    Advisory.objects.create(
        weekly_record=record,
        farmer=record.farmer,
        advisory_message=body[:4000],
        category='agronomist_review',
    )


@extend_schema(tags=['Pest Scouting'])
class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PestScoutingPage

    def get_queryset(self):
        return Farm.objects.filter(farmer=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


@extend_schema(tags=['Pest Scouting'])
class TrapLogViewSet(viewsets.ModelViewSet):
    queryset = TrapLog.objects.all()
    serializer_class = TrapLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PestScoutingPage
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return TrapLog.objects.filter(farmer=self.request.user).select_related('farm').order_by('-timestamp')

    def perform_create(self, serializer):
        farm = serializer.validated_data.get('farm')
        if farm and farm.farmer_id != self.request.user.id:
            raise ValidationError({'farm': 'Farm does not belong to you.'})
        serializer.save(farmer=self.request.user)


@extend_schema(tags=['Pest Scouting'])
class ProblemReportViewSet(viewsets.ModelViewSet):
    queryset = ProblemReport.objects.all()
    serializer_class = ProblemReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PestScoutingPage
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return ProblemReport.objects.filter(farmer=self.request.user).order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
