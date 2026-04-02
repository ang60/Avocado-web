import logging

from rest_framework import viewsets, status, permissions, serializers, filters, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, OTP, Entity, Role, AppPermission
from .serializers import UserSerializer, OTPSerializer, VerifyOTPSerializer, RegisterSerializer, EntitySerializer, RoleSerializer, AppPermissionSerializer
from django.conf import settings
import random
from rest_framework_simplejwt.tokens import RefreshToken
from .sms_utils import send_advanta_sms
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@extend_schema(tags=['User Management'])
class AppPermissionViewSet(viewsets.ModelViewSet):
    queryset = AppPermission.objects.all()
    serializer_class = AppPermissionSerializer
    pagination_class = StandardResultsSetPagination

@extend_schema(tags=['User Management'])
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['role_name', 'description']

@extend_schema(tags=['User Management'])
class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['company_name', 'HCDA_license', 'primary_county', 'company_email', 'phone_number']

@extend_schema(tags=['User Management'])
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['phone_number', 'email', 'first_name', 'last_name']

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            phone_number = serializer.validated_data['phone_number']

            code = str(random.randint(100000, 999999))
            OTP.objects.create(phone_number=phone_number, code=code)

            # Send OTP unless explicitly skipped.
            if getattr(settings, 'OTP_SKIP_SMS', False):
                logger.info('[OTP] OTP_SKIP_SMS=1; stored OTP for phone=%s', phone_number)
            else:
                try:
                    send_advanta_sms(
                        phone_number=phone_number,
                        message=f"Your Avo Guard verification code is: {code}",
                    )
                except Exception:
                    logger.exception('[OTP] SMS sending failed for phone=%s', phone_number)
                    if getattr(settings, 'DEBUG', False):
                        # Keep dev usability: OTP is still valid in DB even if SMS fails.
                        print(f'[OTP] {phone_number} -> {code}')

            # For integration/debug: optionally return code in JSON (do not enable on public production).
            if getattr(settings, 'OTP_ECHO_CODE', False):
                return Response({'detail': 'ok', 'code': code}, status=status.HTTP_200_OK)

            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=OTPSerializer)
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_otp(self, request):
        serializer = OTPSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            code = str(random.randint(100000, 999999))
            OTP.objects.create(phone_number=phone_number, code=code)

            # Send SMS via Advanta (optional)
            if getattr(settings, 'OTP_SKIP_SMS', False):
                logger.info('[OTP] OTP_SKIP_SMS=1; stored OTP for phone=%s', phone_number)
            else:
                try:
                    send_advanta_sms(
                        phone_number=phone_number,
                        message=f"Your Avo Guard verification code is: {code}",
                    )
                except Exception:
                    logger.exception('[OTP] SMS sending failed for phone=%s', phone_number)
                    if getattr(settings, 'DEBUG', False):
                        print(f'[OTP] {phone_number} -> {code}')

            if getattr(settings, 'OTP_ECHO_CODE', False):
                return Response({'detail': 'ok', 'code': code}, status=status.HTTP_200_OK)

            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=VerifyOTPSerializer,
        responses={
            200: inline_serializer(
                name='VerifyOTPResponse',
                fields={
                    'refresh': serializers.CharField(),
                    'access': serializers.CharField(),
                    'user': UserSerializer(),
                    'is_new_user': serializers.BooleanField(),
                }
            ),
            400: inline_serializer(
                name='VerifyOTPError',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_otp(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            code = serializer.validated_data['code']
            
            otp = OTP.objects.filter(phone_number=phone_number, code=code, is_used=False).order_by('-created_at').first()
            
            if otp:
                otp.is_used = True
                otp.save()
                
                user, created = User.objects.get_or_create(phone_number=phone_number)
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                    'is_new_user': created
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
