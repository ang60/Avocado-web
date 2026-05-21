from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, KnowledgeEntry
from .serializers import CategorySerializer, KnowledgeEntrySerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
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

    @extend_schema(
        summary="List Categories",
        description="Get a list of all knowledge base categories.",
        responses={200: CategorySerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Category",
        description="Create a new knowledge base category.",
        request=CategorySerializer,
        responses={201: CategorySerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Category",
        description="Get details of a specific knowledge base category.",
        responses={200: CategorySerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Category",
        description="Update an existing knowledge base category.",
        request=CategorySerializer,
        responses={200: CategorySerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Category",
        description="Partially update an existing knowledge base category.",
        request=CategorySerializer,
        responses={200: CategorySerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Category",
        description="Delete a knowledge base category.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

@extend_schema(tags=['Knowledge Base'])
class KnowledgeEntryViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeEntry.objects.all()
    serializer_class = KnowledgeEntrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'active_use_cases']
    filterset_fields = ['category']

    @extend_schema(
        summary="List Knowledge Entries",
        description="Get a list of all knowledge base entries.",
        responses={200: KnowledgeEntrySerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Knowledge Entry",
        description="Create a new knowledge base entry.",
        request=KnowledgeEntrySerializer,
        responses={201: KnowledgeEntrySerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Knowledge Entry",
        description="Get details of a specific knowledge base entry.",
        responses={200: KnowledgeEntrySerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Knowledge Entry",
        description="Update an existing knowledge base entry.",
        request=KnowledgeEntrySerializer,
        responses={200: KnowledgeEntrySerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Knowledge Entry",
        description="Partially update an existing knowledge base entry.",
        request=KnowledgeEntrySerializer,
        responses={200: KnowledgeEntrySerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Knowledge Entry",
        description="Delete a knowledge base entry.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="AI Agent Query",
        description="Query the AI agent for pest and disease management advice.",
        request=inline_serializer(
            name='AIQueryRequest',
            fields={'query': serializers.CharField()}
        ),
        responses={
            200: inline_serializer(
                name='AIQueryResponse',
                fields={
                    'query': serializers.CharField(),
                    'response': serializers.CharField()
                }
            ),
            400: inline_serializer(
                name='AIQueryError',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=False, methods=['post'])
    def query(self, request):
        query_text = request.data.get('query')
        if not query_text:
            return Response({'error': 'Query is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        response = call_ai_agent(query_text)
        return Response({'query': query_text, 'response': response}, status=status.HTTP_200_OK)
