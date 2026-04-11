import csv
import random
from django.http import HttpResponse
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import QuarantineManagement
from .serializers import QuarantineManagementSerializer
from accounts.models import User, Entity
from pest_scouting.models import WeeklyRecord
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema


@extend_schema(tags=['KEPHIS Quarantine'])
class QuarantineManagementViewSet(viewsets.ModelViewSet):
    queryset = QuarantineManagement.objects.all()
    serializer_class = QuarantineManagementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['blockId', 'farmName', 'county', 'pestType', 'inspector']

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="quarantine_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Block ID', 'Farm Name', 'County', 'Pest Type', 'Capture Rate', 'Last Inspection', 'Status', 'Inspector'])

        for q in QuarantineManagement.objects.all():
            writer.writerow([q.id, q.blockId, q.farmName, q.county, q.pestType, q.captureRate, q.lastInspection, q.kephisStatus, q.inspector])

        return response

    @action(detail=False, methods=['get'])
    def risk_intelligence(self, request):
        exporters = Entity.objects.filter(entity_type='Exporter')
        compliance_data = []
        for exp in exporters:
            farmer_count = User.objects.filter(entity=exp, role__role_name='Farmer').count()
            restricted = random.randint(0, 15)
            risk_score = random.randint(0, 100)
            compliance_data.append({
                'id': exp.id,
                'exporterName': exp.company_name,
                'farmerCount': farmer_count,
                'restrictedBlocks': restricted,
                'riskScore': risk_score,
                'county': exp.primary_county
            })

        clusters = WeeklyRecord.objects.values('location').annotate(
            farmerCount=Count('farmer', distinct=True),
            pestCount=Count('pests_observed', filter=Q(any_pests_observed='Yes'))
        )

        cluster_data = []
        for c in clusters:
            intensity = 'low'
            if c['pestCount'] > 20:
                intensity = 'high'
            elif c['pestCount'] > 5:
                intensity = 'medium'

            cluster_data.append({
                'county': c['location'],
                'intensity': intensity,
                'farmerCount': c['farmerCount'],
                'pestCount': c['pestCount']
            })

        total_pest_detections = WeeklyRecord.objects.filter(any_pests_observed='Yes').count()
        active_quarantine_zones = QuarantineManagement.objects.filter(kephisStatus='gated').count()
        affected_farmers = WeeklyRecord.objects.filter(any_pests_observed='Yes').values('farmer').distinct().count()

        avg_risk = (sum([d['riskScore'] for d in compliance_data]) / len(compliance_data)) if compliance_data else 0
        compliance_rate = 100 - avg_risk

        summary = {
            'total_pest_detections': total_pest_detections,
            'active_quarantine_zones': active_quarantine_zones,
            'affected_farmers': affected_farmers,
            'compliance_rate': compliance_rate
        }

        return Response({
            'exporterCompliance': compliance_data,
            'infectionClusters': cluster_data,
            'summary': summary
        })

