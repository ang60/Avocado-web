from rest_framework import viewsets, permissions, filters
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

