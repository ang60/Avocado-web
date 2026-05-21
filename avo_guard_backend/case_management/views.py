from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Case
from .serializers import CaseSerializer, CaseAssignmentSerializer, CaseCloseSerializer
from accounts.sms_utils import send_advanta_sms
from django.db import transaction
from drf_spectacular.utils import extend_schema, inline_serializer

@extend_schema(tags=['Case Management'])
class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['case_title', 'notes']

    @extend_schema(
        summary="List Cases",
        description="Get a list of all cases.",
        responses={200: CaseSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Case",
        description="Create a new case. Agronomists will be automatically assigned if they create the case.",
        request=CaseSerializer,
        responses={201: CaseSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Case",
        description="Get details of a specific case.",
        responses={200: CaseSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Case",
        description="Update an existing case.",
        request=CaseSerializer,
        responses={200: CaseSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Case",
        description="Partially update an existing case.",
        request=CaseSerializer,
        responses={200: CaseSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Case",
        description="Delete a case.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        assigned_agronomist = serializer.validated_data.get('assigned_agronomist', 'not_provided')
        
        if assigned_agronomist == 'not_provided':
            if user.role and user.role.role_name == 'Agronomist':
                serializer.save(assigned_agronomist=user)
            else:
                serializer.save()
        else:
            serializer.save()

    @extend_schema(
        request=CaseAssignmentSerializer,
        responses={
            200: inline_serializer(
                name='CaseAssignmentResponse',
                fields={'status': serializers.CharField()}
            ),
            400: inline_serializer(
                name='CaseAssignmentError',
                fields={'error': serializers.JSONField()}
            )
        }
    )
    @action(detail=True, methods=['post'])
    def assign_agronomist(self, request, pk=None):
        case = self.get_object()
        serializer = CaseAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            agronomist = serializer.validated_data['agronomist']
            notes = serializer.validated_data.get('notes', '')

            with transaction.atomic():
                case.assigned_agronomist = agronomist
                if notes:
                    case.notes += f"\n\nAssignment notes: {notes}"
                case.save()

                # Send SMS
                # message = f"You have been assigned to case: {case.case_title}. Severity: {case.severity}."
                
                # Fetch details for SMS
                farmer_name = "N/A"
                farmer_phone = None
                block_name = "N/A"
                location = "N/A"
                
                if case.pest_scouting_record:
                    record = case.pest_scouting_record
                    if record.farmer:
                        first = record.farmer.first_name or ""
                        last = record.farmer.last_name or ""
                        farmer_name = f"{first} {last}".strip() or record.farmer.phone_number
                        farmer_phone = record.farmer.phone_number
                    
                    if record.block:
                        block_name = record.block.block_name
                    
                    location = record.location

                message = (
                    f"You have been assigned to case: {case.case_title}. "
                    f"Severity: {case.severity}. "
                    f"Farmer: {farmer_name}. "
                    f"Block: {block_name}. "
                    f"Location: {location}."
                )
                try:
                    send_advanta_sms(agronomist.phone_number, message)
                except Exception as e:
                    # In a production app, we might want to log this but still return success for the assignment
                    pass

                # Notify farmer
                if farmer_phone:
                    # Remove farmer name from case title if it's in there
                    clean_title = case.case_title
                    if farmer_name != "N/A" and farmer_name in clean_title:
                        clean_title = clean_title.replace(farmer_name, "").replace("  ", " ").strip()
                        # Also handle case where it might be "FarmerName's"
                        clean_title = clean_title.replace(f"{farmer_name}'s", "").replace("  ", " ").strip()
                    
                    farmer_message = f"An agronomist ({agronomist.get_full_name() or agronomist.phone_number}) has been assigned to your case: {clean_title}."
                    try:
                        send_advanta_sms(farmer_phone, farmer_message)
                    except Exception:
                        pass

            return Response({'status': 'agronomist assigned and notified'}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=CaseCloseSerializer,
        responses={
            200: inline_serializer(
                name='CaseCloseResponse',
                fields={'status': serializers.CharField()}
            ),
            400: inline_serializer(
                name='CaseCloseError',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=True, methods=['post'])
    def verify_and_close(self, request, pk=None):
        case = self.get_object()
        serializer = CaseCloseSerializer(data=request.data)
        if serializer.is_valid():
            diagnosis = serializer.validated_data['diagnosis']
            recommended_actions = serializer.validated_data['recommended_actions']
            recommended_chemical = serializer.validated_data['recommended_chemical']
            application_rate = serializer.validated_data['application_rate']
            pre_harvest_interval = serializer.validated_data['pre_harvest_interval']
            
            # Format actions
            actions_text = "\n".join([f"{i+1}. {action}" for i, action in enumerate(recommended_actions)])
            
            # Update Case record
            case.diagnosis = diagnosis
            case.recommended_actions = actions_text
            case.recommended_chemical = recommended_chemical
            case.application_rate = application_rate
            case.pre_harvest_interval = pre_harvest_interval
            case.status = 'Closed'
            case.save()

            message = (
                f"Diagnosis: {diagnosis}\n\n"
                f"Recommended Actions:\n"
                f"{actions_text}\n\n"
                f"Recommended Chemical: {recommended_chemical}\n"
                f"Application Rate: {application_rate}\n"
                f"Pre-Harvest Interval: {pre_harvest_interval}\n\n"
                f"Questions? Call AvoGuard Hotline: 1234\n"
                f"- SAFIC Team"
            )

            # Find farmer phone number
            farmer_phone = None
            if case.pest_scouting_record and case.pest_scouting_record.farmer:
                farmer_phone = case.pest_scouting_record.farmer.phone_number
            
            if not farmer_phone:
                return Response({'error': 'Farmer phone number not found for this case.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                send_advanta_sms(farmer_phone, message)
            except Exception as e:
                # Still proceed if SMS fails but maybe log it
                pass

            return Response({'status': 'case verified and farmer notified'}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
