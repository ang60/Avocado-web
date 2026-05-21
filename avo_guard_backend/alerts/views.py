from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Alert
from .serializers import AlertSerializer
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['Alerts'])
class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response({'status': 'alert marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all alerts marked as read'})
