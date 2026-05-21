from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiTypes, OpenApiExample
from .ussd_handler import handle_ussd
from .serializers import USSDRequestSerializer

@extend_schema(
    summary="Africa's Talking USSD Callback",
    description="""
    Callback endpoint for Africa's Talking USSD service.
    
    This endpoint handles stateless USSD navigation and emergency report creation. 
    It follows the Africa's Talking protocol where:
    - `CON` prefix in response keeps the USSD session active and shows a menu.
    - `END` prefix in response terminates the session and shows a final message.
    - `text` input is a concatenated string of all user inputs in the current session (e.g., '1*2*1').
    
    The service automatically creates `ProblemReport` entries when a user completes the reporting flow.
    
    **Note:** This endpoint is public and does not require authentication headers, as it is called directly by Africa's Talking servers.
    """,
    request={
        'application/x-www-form-urlencoded': USSDRequestSerializer,
        'application/json': USSDRequestSerializer,
    },
    responses={
        200: OpenApiTypes.STR,
    },
    auth=[],
    examples=[
        OpenApiExample(
            "Initial Session Request",
            description="The first request made by Africa's Talking when a user dials the USSD code.",
            value={
                "sessionId": "AT_Session_123456",
                "serviceCode": "*384*123#",
                "phoneNumber": "+254700000000",
                "text": ""
            },
            request_only=True
        ),
        OpenApiExample(
            "Main Menu Response",
            description="The menu displayed to the user at the start of the session.",
            value="CON Ripoti Tatizo la Dharura\n1. Wadudu\n2. Ugonjwa\n3. Hakuna tatizo\n0. Ondoka",
            response_only=True
        ),
        OpenApiExample(
            "Subsequent Input Request",
            description="Request after the user has selected option '1' (Wadudu).",
            value={
                "sessionId": "AT_Session_123456",
                "serviceCode": "*384*123#",
                "phoneNumber": "+254700000000",
                "text": "1"
            },
            request_only=True
        ),
        OpenApiExample(
            "Terminating Response",
            description="Final response sent to terminate the session after a successful report.",
            value="END ✓ Asante, kwa kuripoti.\nUtapewa ushauri kwa SMS ndani ya saa 24.",
            response_only=True
        )
    ],
    tags=['USSD']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def ussd_callback(request):
    session_id = request.data.get('sessionId')
    service_code = request.data.get('serviceCode')
    phone_number = request.data.get('phoneNumber')
    text = request.data.get('text', '')

    response_text = handle_ussd(phone_number, text)
    
    return HttpResponse(response_text, content_type='text/plain')
