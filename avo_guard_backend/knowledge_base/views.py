from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, KnowledgeEntry
from .serializers import CategorySerializer, KnowledgeEntrySerializer
from drf_spectacular.utils import extend_schema
from .ai_agent import call_ai_agent
from django.db.models import Count, Q


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
    queryset = KnowledgeEntry.objects.all()
    serializer_class = KnowledgeEntrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'active_use_cases']
    filterset_fields = ['category']

    @action(detail=False, methods=['post'])
    def query(self, request):
        query_text = request.data.get('query')
        if not query_text:
            return Response({'error': 'Query is required.'}, status=status.HTTP_400_BAD_REQUEST)

        response = call_ai_agent(query_text)
        return Response({'query': query_text, 'response': response}, status=status.HTTP_200_OK)

