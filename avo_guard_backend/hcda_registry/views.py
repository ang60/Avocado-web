import io

from django.db.models import Q, Sum
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FarmerRegistration
from .serializers import FarmerRegistrationSerializer, FarmerStatisticsSerializer


class FarmerRegistrationViewSet(viewsets.ModelViewSet):
    queryset = FarmerRegistration.objects.all()
    serializer_class = FarmerRegistrationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['globalGAPStatus', 'primaryExporter']
    search_fields = ['hcdaRegNumber', 'ward', 'county']
    ordering_fields = '__all__'

    @extend_schema(
        summary="Export Farmer Registration",
        description="Export farmer registration data in Excel or PDF format.",
        parameters=[
            OpenApiParameter(name='format', description='Export format: excel or pdf', required=True, type=str),
        ],
        responses={
            200: OpenApiResponse(response=bytes, description="Excel or PDF file"),
            400: inline_serializer(
                name='ExportError',
                fields={'detail': serializers.CharField()},
            ),
        },
    )
    @action(detail=False, methods=['get'])
    def export(self, request):
        export_format = request.query_params.get('format', 'excel').lower()
        queryset = self.filter_queryset(self.get_queryset())

        rows = list(
            queryset.values(
                'farmerName',
                'hcdaRegNumber',
                'ward',
                'county',
                'acreage',
                'globalGAPStatus',
                'globalGAPExpiry',
                'primaryExporter',
                'lat',
                'lng',
            )
        )
        if export_format == 'excel':
            import pandas as pd

            df = pd.DataFrame(rows)
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Farmers')
            output.seek(0)
            response = HttpResponse(
                output.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            response['Content-Disposition'] = 'attachment; filename=farmer_registration.xlsx'
            return response

        if export_format == 'pdf':
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import landscape, letter
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

            output = io.BytesIO()
            data = []
            if rows:
                headers = list(rows[0].keys())
                data = [headers] + [[r.get(k, '') for k in headers] for r in rows]
            else:
                data = [['No data']]

            doc = SimpleDocTemplate(output, pagesize=landscape(letter))
            table = Table(data)
            table.setStyle(
                TableStyle(
                    [
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 8),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            doc.build([table])
            output.seek(0)
            response = HttpResponse(output.read(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename=farmer_registration.pdf'
            return response

        return Response({"detail": "Invalid format. Use 'excel' or 'pdf'."}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Farmer Statistics",
        description="Statistics of total farmers, compliant vs non-compliant, and total acreage.",
        responses={200: FarmerStatisticsSerializer},
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total_farmers = self.get_queryset().count()
        compliant_count = self.get_queryset().filter(globalGAPStatus__iexact='compliant').count()
        compliant_percent = (compliant_count / total_farmers * 100) if total_farmers > 0 else 0
        non_compliant_count = self.get_queryset().filter(
            Q(globalGAPStatus__iexact='expired') | Q(globalGAPStatus__iexact='non-compliant')
        ).count()
        total_acreage = self.get_queryset().aggregate(Sum('acreage'))['acreage__sum'] or 0
        return Response(
            {
                'total_registered_active_hcda_farmers': total_farmers,
                'globalgap_compliant': {
                    'total_number': compliant_count,
                    'percentage': round(compliant_percent, 2),
                },
                'expired_non_compliant': non_compliant_count,
                'total_acreage': round(total_acreage, 2),
            }
        )

