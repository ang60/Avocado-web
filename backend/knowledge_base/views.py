from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Category, KnowledgeEntry
from .serializers import CategorySerializer, KnowledgeEntrySerializer
from drf_spectacular.utils import extend_schema
from .ai_agent import call_ai_agent
from django.db.models import Count, Q
from api.drf_permissions import require_permission


@extend_schema(tags=['Knowledge Base'])
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().annotate(
        material_count=Count('entries'),
        active_use_cases_count=Count('entries', filter=~Q(entries__active_use_cases=''))
    )
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


@extend_schema(tags=['Knowledge Base'])
class KnowledgeEntryViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeEntry.objects.all().order_by('-updated_at', '-created_at')
    serializer_class = KnowledgeEntrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'active_use_cases']
    filterset_fields = ['category']

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy', 'add_regional_alert'}:
            return [permissions.IsAuthenticated(), require_permission('nav.knowledge')()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def query(self, request):
        query_text = request.data.get('query')
        if not query_text:
            return Response({'error': 'Query is required.'}, status=status.HTTP_400_BAD_REQUEST)

        response = call_ai_agent(query_text)
        return Response({'query': query_text, 'response': response}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='contextual-links')
    def contextual_links(self, request):
        finding = (request.query_params.get('finding') or '').strip()
        county = (request.query_params.get('county') or '').strip()
        if not finding:
            return Response({'results': []}, status=status.HTTP_200_OK)

        qs = self.queryset.filter(
            Q(title__icontains=finding) | Q(content__icontains=finding) | Q(tags__icontains=finding)
        )[:20]
        results = KnowledgeEntrySerializer(qs, many=True, context={'request': request}).data

        # Promote records with matching regional alerts.
        if county:
            county_l = county.lower()
            results.sort(
                key=lambda item: 0
                if any((a.get('county') or '').lower() == county_l and a.get('active', True) for a in item.get('regional_alerts', []))
                else 1
            )
        return Response({'results': results}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def add_regional_alert(self, request, pk=None):
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied('Authentication required.')
        entry = self.get_object()
        county = (request.data.get('county') or '').strip()
        alert = (request.data.get('alert') or '').strip()
        if not county or not alert:
            return Response({'error': 'county and alert are required.'}, status=status.HTTP_400_BAD_REQUEST)

        alerts = list(entry.regional_alerts or [])
        alerts.append(
            {
                'county': county,
                'alert': alert,
                'active': bool(request.data.get('active', True)),
                'created_by': str(request.user.id),
                'created_at': entry.updated_at.isoformat() if entry.updated_at else None,
            }
        )
        entry.regional_alerts = alerts
        entry.save(update_fields=['regional_alerts', 'updated_at'])
        return Response(KnowledgeEntrySerializer(entry, context={'request': request}).data, status=status.HTTP_200_OK)

