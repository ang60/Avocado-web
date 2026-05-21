from rest_framework import viewsets, permissions, filters as drf_filters
from django_filters import rest_framework as filters
from .models import Advisory
from .serializers import AdvisorySerializer
from drf_spectacular.utils import extend_schema

class AdvisoryFilter(filters.FilterSet):
    action_taken = filters.CharFilter(method='filter_action_taken')

    class Meta:
        model = Advisory
        fields = ['outcome']

    def filter_action_taken(self, queryset, name, value):
        if value.lower() == 'complete':
            return queryset.filter(outcome='✅ Controlled')
        return queryset

@extend_schema(tags=['Advisory Services'])
class AdvisoryViewSet(viewsets.ModelViewSet):
    queryset = Advisory.objects.all()
    serializer_class = AdvisorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = AdvisoryFilter
    search_fields = ['advisory_message', 'remarks', 'farmer__phone_number']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (user.role and user.role.role_name == 'Agronomist'):
            return self.queryset
        return self.queryset.filter(farmer=user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
