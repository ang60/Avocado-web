import csv
import io
import random
from django.http import HttpResponse
from rest_framework import viewsets, status, permissions, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import QuarantineManagement
from .serializers import (
    QuarantineManagementSerializer, RiskIntelligenceSummarySerializer,
    ExporterComplianceSerializer, InfectionClusterSerializer,
    RiskIntelligenceResponseSerializer
)
from accounts.models import User, OTP, Entity
from pest_scouting.models import WeeklyRecord
from django.db.models import Count, Sum, Q, Avg
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from accounts.sms_utils import send_advanta_sms

@extend_schema(tags=['KEPHIS Quarantine'])
class QuarantineManagementViewSet(viewsets.ModelViewSet):
    queryset = QuarantineManagement.objects.all()
    serializer_class = QuarantineManagementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['blockId', 'farmName', 'county', 'pestType', 'inspector']

    @extend_schema(
        summary="List Quarantine Records",
        description="Get a list of all quarantine management records.",
        responses={200: QuarantineManagementSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Quarantine Record",
        description="Create a new quarantine management record.",
        request=QuarantineManagementSerializer,
        responses={201: QuarantineManagementSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Quarantine Record",
        description="Get details of a specific quarantine management record.",
        responses={200: QuarantineManagementSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Quarantine Record",
        description="Update an existing quarantine management record.",
        request=QuarantineManagementSerializer,
        responses={200: QuarantineManagementSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Quarantine Record",
        description="Partially update an existing quarantine management record.",
        request=QuarantineManagementSerializer,
        responses={200: QuarantineManagementSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Quarantine Record",
        description="Delete a quarantine management record.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="Export Quarantine Report",
        description="Download a CSV report of all quarantine management records.",
        responses={
            200: OpenApiResponse(response=bytes, description="CSV file")
        }
    )
    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        # Using CSV for simplicity as "Excel" often refers to CSV in this context, 
        # or I'd need openpyxl/pandas which might not be installed.
        # Given requirements.txt doesn't have them, I'll provide a CSV with .xls extension or just .csv
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="quarantine_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Block ID', 'Farm Name', 'County', 'Pest Type', 'Capture Rate', 'Last Inspection', 'Status', 'Inspector'])
        
        for q in QuarantineManagement.objects.all():
            writer.writerow([q.id, q.blockId, q.farmName, q.county, q.pestType, q.captureRate, q.lastInspection, q.kephisStatus, q.inspector])
        
        return response

    @extend_schema(
        summary="Risk Intelligence",
        description="Comprehensive summaries of exporter compliance and infection clusters.",
        responses={200: RiskIntelligenceResponseSerializer}
    )
    @action(detail=False, methods=['get'])
    def risk_intelligence(self, request):
        # 1. Exporter Compliance (Mocked logic based on Entities and Users)
        exporters = Entity.objects.filter(entity_type='Exporter')
        compliance_data = []
        for exp in exporters:
            farmer_count = User.objects.filter(entity=exp, role__role_name='Farmer').count()
            # Logic for restricted blocks and risk score (randomized for demo/mock as per requirement)
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

        # 2. Infection Clusters (Aggregated from WeeklyRecords)
        clusters = WeeklyRecord.objects.values('location').annotate(
            farmerCount=Count('farmer', distinct=True),
            pestCount=Count('pests_observed', filter=Q(any_pests_observed='Yes'))
        )
        # Map location to county for mock purposes if county not in WeeklyRecord directly 
        # (It is in User model, but WeeklyRecord has location string)
        cluster_data = []
        for c in clusters:
            intensity = 'low'
            if c['pestCount'] > 20: intensity = 'high'
            elif c['pestCount'] > 5: intensity = 'medium'
            
            cluster_data.append({
                'county': c['location'], # Assuming location is used as county here
                'intensity': intensity,
                'farmerCount': c['farmerCount'],
                'pestCount': c['pestCount']
            })

        # 3. Summary Stats
        total_pest_detections = WeeklyRecord.objects.filter(any_pests_observed='Yes').count()
        active_quarantine_zones = QuarantineManagement.objects.filter(kephisStatus='gated').count()
        affected_farmers = WeeklyRecord.objects.filter(any_pests_observed='Yes').values('farmer').distinct().count()
        
        # Compliance rate calculation (mocked based on risk scores)
        avg_risk = sum([d['riskScore'] for d in compliance_data]) / len(compliance_data) if compliance_data else 0
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
