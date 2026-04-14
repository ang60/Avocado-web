from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FarmBlock, WeeklyRecord
from .serializers import FarmBlockSerializer, WeeklyRecordSerializer, ScoutingReportSerializer
from drf_spectacular.utils import extend_schema

from avo_guard.pagination import LargeResultsSetPagination


@extend_schema(tags=['Pest Scouting'])
class FarmBlockViewSet(viewsets.ModelViewSet):
    queryset = FarmBlock.objects.all()
    serializer_class = FarmBlockSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['block_name']

    def get_queryset(self):
        # Return only blocks belonging to the authenticated farmer
        return self.queryset.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


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
        serializer.save(farmer=self.request.user)


@extend_schema(tags=['Pest Scouting'])
class ScoutingReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeeklyRecord.objects.all().select_related('farmer', 'block', 'farmer__entity')
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

        case = Case.objects.create(
            case_title=title,
            severity=severity,
            pest_scouting_record=record,
            notes=notes,
        )

        return Response(
            {
                'status': 'reinspection_requested',
                'message': 'Re-inspection request submitted successfully.',
                'case_id': str(case.id),
            },
            status=status.HTTP_201_CREATED,
        )

