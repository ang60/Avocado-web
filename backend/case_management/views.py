from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Case
from .serializers import CaseSerializer, CaseAssignmentSerializer, CaseCloseSerializer
from accounts.sms_utils import send_advanta_sms
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from api.rbac import is_admin_like
from api.rbac import ROLE_FARMER, role_name


@extend_schema(tags=['Case Management'])
class CaseViewSet(viewsets.ModelViewSet):
    queryset = (
        Case.objects.all()
        .select_related(
            'assigned_agronomist',
            'pest_scouting_record',
            'pest_scouting_record__farmer',
            'pest_scouting_record__block',
        )
        .order_by('-created_at')
    )
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['case_title', 'notes']

    def perform_create(self, serializer):
        user = self.request.user
        assigned_agronomist = serializer.validated_data.get('assigned_agronomist', 'not_provided')

        if assigned_agronomist == 'not_provided':
            if user.role and user.role.role_name == 'Agronomist':
                serializer.save(assigned_agronomist=user)
            else:
                serializer.save()
        else:
            serializer.save()

    def get_queryset(self):
        qs = self.queryset
        # Farmer accounts should only see cases created from their own scouting records.
        if role_name(self.request.user) == ROLE_FARMER:
            qs = qs.filter(pest_scouting_record__farmer=self.request.user)
        return qs

    @extend_schema(request=CaseAssignmentSerializer)
    @action(detail=True, methods=['post'])
    def assign_agronomist(self, request, pk=None):
        if not is_admin_like(request.user):
            return Response(
                {'error': 'Only administrators can assign or reassign agronomists.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        case = self.get_object()
        serializer = CaseAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            agronomist = serializer.validated_data['agronomist']
            notes = serializer.validated_data.get('notes', '')
            notify = serializer.validated_data.get('notify', True)

            with transaction.atomic():
                case.assigned_agronomist = agronomist
                if case.status == 'new':
                    case.status = 'under_review'
                if notes:
                    case.notes += f"\n\nAssignment notes: {notes}"
                case.save()

                farmer_name = "N/A"
                block_name = "N/A"
                location = "N/A"

                if case.pest_scouting_record:
                    record = case.pest_scouting_record
                    if record.farmer:
                        first = record.farmer.first_name or ""
                        last = record.farmer.last_name or ""
                        farmer_name = f"{first} {last}".strip() or record.farmer.phone_number

                    if record.block:
                        block_name = record.block.block_name

                    location = record.location

                message = (
                    f"You have been assigned to case: {case.case_title}. "
                    f"Severity: {case.severity}. "
                    f"Farmer: {farmer_name}. "
                    f"Block: {block_name}. "
                    f"Location: {location}."
                )
                if notify:
                    try:
                        send_advanta_sms(agronomist.phone_number, message)
                    except Exception:
                        pass

            return Response({'status': 'agronomist assigned and notified'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=CaseCloseSerializer)
    @action(detail=True, methods=['post'])
    def verify_and_close(self, request, pk=None):
        case = self.get_object()
        serializer = CaseCloseSerializer(data=request.data)
        if serializer.is_valid():
            diagnosis = serializer.validated_data['diagnosis']
            recommended_actions = serializer.validated_data['recommended_actions']

            actions_text = " ".join([f"{i+1}. {action}" for i, action in enumerate(recommended_actions)])

            farmer_name = "N/A"
            block_name = "N/A"
            location = "N/A"
            farmer_phone = None
            if case.pest_scouting_record:
                record = case.pest_scouting_record
                if record.farmer:
                    first = record.farmer.first_name or ""
                    last = record.farmer.last_name or ""
                    farmer_name = f"{first} {last}".strip() or record.farmer.phone_number
                    farmer_phone = record.farmer.phone_number
                if record.block:
                    block_name = record.block.block_name
                location = getattr(record, 'location', None) or "—"

            farmer_phone = farmer_phone or None
            if not farmer_phone:
                return Response(
                    {'error': 'Farmer phone number not found for this case.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            message = (
                f"Case ID: {case.case_code or case.id}\n"
                f"Severity: {case.severity}\n"
                f"Farmer: {farmer_name}\n"
                f"Block: {block_name}\n"
                f"Location: {location}\n\n"
                f"Diagnosis: {diagnosis}\n\n"
                f"Recommended Actions:\n"
                f"{actions_text}\n"
                f"Questions? Call AvoGuard Hotline: 1234\n"
                f"- SAFIC Team"
            )

            try:
                send_advanta_sms(farmer_phone, message)
            except Exception:
                pass

            case.status = 'closed'
            case.diagnosis = diagnosis
            case.recommended_actions = recommended_actions
            case.closed_at = timezone.now()
            case.save(update_fields=['status', 'diagnosis', 'recommended_actions', 'closed_at', 'updated_at'])

            return Response(
                {
                    'status': 'case verified and farmer notified',
                    'case': CaseSerializer(case, context={'request': request}).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

