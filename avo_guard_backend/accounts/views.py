import logging

from rest_framework import viewsets, status, permissions, serializers, filters, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, OTP, Entity, Role, AppPermission
from .permissions import IsAdminLikeUser
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .serializers import (
    UserSerializer,
    OTPSerializer,
    VerifyOTPSerializer,
    RegisterSerializer,
    LoginPasswordSerializer,
    normalize_phone_number,
    EntitySerializer,
    RoleSerializer,
    AppPermissionSerializer,
    RequestPasswordResetSerializer,
    ConfirmPasswordResetSerializer,
)
from django.conf import settings
import random
from rest_framework_simplejwt.tokens import RefreshToken
from .sms_utils import send_advanta_sms
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer

logger = logging.getLogger(__name__)


def _user_for_login_identifier(identifier: str):
    """
    Resolve a user by email (case-insensitive) or normalized phone number.
    """
    if '@' in identifier:
        return User.objects.filter(email__iexact=identifier.strip().lower()).first()
    try:
        phone = normalize_phone_number(identifier)
    except serializers.ValidationError:
        return None
    return User.objects.filter(phone_number=phone).first()


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@extend_schema(tags=['User Management'])
class AppPermissionViewSet(viewsets.ModelViewSet):
    queryset = AppPermission.objects.all()
    serializer_class = AppPermissionSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdminLikeUser]

@extend_schema(tags=['User Management'])
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['role_name', 'description']
    permission_classes = [permissions.IsAuthenticated, IsAdminLikeUser]

@extend_schema(tags=['User Management'])
class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['company_name', 'HCDA_license', 'primary_county', 'company_email', 'phone_number']
    permission_classes = [permissions.IsAuthenticated, IsAdminLikeUser]

@extend_schema(tags=['User Management'])
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['phone_number', 'email', 'first_name', 'last_name']

    def get_permissions(self):
        if self.action in ('register', 'request_otp', 'verify_otp', 'login_password', 'request_password_reset', 'confirm_password_reset'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminLikeUser()]

    @extend_schema(
        request=RequestPasswordResetSerializer,
        summary='Request password reset code',
        description='Sends a verification code to the user\'s phone and email to reset their password.',
        responses={200: inline_serializer(name='MsgResponse', fields={'message': serializers.CharField()})}
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_password_reset(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            email = serializer.validated_data['email']
            user = User.objects.filter(phone_number=phone_number, email__iexact=email).first()
            if not user:
                return Response({'error': 'User not found with provided phone and email.'}, status=status.HTTP_404_NOT_FOUND)
            
            code = str(random.randint(100000, 999999))
            OTP.objects.create(phone_number=phone_number, code=code)

            # Send SMS
            if not getattr(settings, 'OTP_SKIP_SMS', False):
                try:
                    send_advanta_sms(phone_number, f"Your AvoGuard password reset code is: {code}")
                except Exception:
                    logger.exception('[Reset] SMS failed for %s', phone_number)

            # Send Email
            try:
                html_message = render_to_string('password_reset_email.html', {'user': user, 'otp_code': code})
                plain_message = strip_tags(html_message)
                send_mail(
                    subject='AvoGuard Password Reset',
                    message=plain_message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@avoguard.com'),
                    recipient_list=[user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception:
                logger.exception('[Reset] Email failed for %s', user.email)

            return Response({'message': 'Reset code sent to your phone and email.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=ConfirmPasswordResetSerializer,
        summary='Confirm password reset',
        description='Resets the password using the code sent to the phone/email.',
        responses={200: inline_serializer(name='MsgResponse', fields={'message': serializers.CharField()})}
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def confirm_password_reset(self, request):
        serializer = ConfirmPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']

            otp = OTP.objects.filter(phone_number=phone_number, code=code, is_used=False).order_by('-created_at').first()
            if not otp:
                return Response({'error': 'Invalid or expired reset code.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.filter(phone_number=phone_number).first()
            if not user:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            user.set_password(new_password)
            user.save()
            otp.is_used = True
            otp.save()

            return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(
                response=inline_serializer(
                    name='RegisterResponse',
                    fields={
                        'detail': serializers.CharField(),
                        'status': serializers.CharField(),
                    },
                ),
            ),
        },
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                        'detail': (
                        'Application received. No verification code is sent for this step. '
                        'After an administrator activates your account, sign in with your email or phone and password, '
                        'or use a one-time code sent to your phone.'
                    ),
                    'status': 'pending_approval',
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=LoginPasswordSerializer,
        summary='Sign in with email or phone and password',
        description=(
            'Returns JWT tokens for an **admin-approved** user. '
            'Use an email or phone that matches the account; phone should match registration format (e.g. +254…).'
        ),
        responses={
            200: inline_serializer(
                name='LoginPasswordResponse',
                fields={
                    'refresh': serializers.CharField(),
                    'access': serializers.CharField(),
                    'user': UserSerializer(),
                    'is_new_user': serializers.BooleanField(),
                },
            ),
        },
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login_password(self, request):
        serializer = LoginPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['identifier']
        password = serializer.validated_data['password']
        user = _user_for_login_identifier(identifier)

        if not user or not user.check_password(password):
            return Response(
                {'detail': 'Invalid email, phone, or password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.is_active:
            return Response(
                {
                    'error': 'pending_approval',
                    'detail': 'Your account is pending administrator approval.',
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
                'is_new_user': False,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        request=OTPSerializer,
        summary='Request account verification code',
        description=(
            'Sends an SMS code to verify an **existing, admin-approved** account. '
            'Not used for registration; use register first, then sign in here after approval.'
        ),
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_otp(self, request):
        serializer = OTPSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            user = User.objects.filter(phone_number=phone_number).first()
            if not user:
                return Response(
                    {
                        'error': 'not_registered',
                        'detail': 'No account found for this phone number. Submit an access request first.',
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not user.is_active:
                return Response(
                    {
                        'error': 'pending_approval',
                        'detail': 'Your account is pending administrator approval. You will be able to sign in after approval.',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            code = str(random.randint(100000, 999999))
            OTP.objects.create(phone_number=phone_number, code=code)

            # Send SMS via Advanta (optional)
            if getattr(settings, 'OTP_SKIP_SMS', False):
                logger.info('[OTP] OTP_SKIP_SMS=1; stored OTP for phone=%s', phone_number)
            else:
                try:
                    send_advanta_sms(
                        phone_number=phone_number,
                        message=f"Your Avo Guard account verification code is: {code}",
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
        summary='Verify account with SMS code',
        description=(
            'Completes sign-in for an approved user by checking the one-time code. '
            'Does not create or register users.'
        ),
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

            user = User.objects.filter(phone_number=phone_number).first()
            if not user:
                return Response(
                    {
                        'error': 'not_registered',
                        'detail': 'No account found for this phone number.',
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not user.is_active:
                return Response(
                    {
                        'error': 'pending_approval',
                        'detail': 'Your account is pending administrator approval.',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            otp = OTP.objects.filter(phone_number=phone_number, code=code, is_used=False).order_by('-created_at').first()

            if otp:
                otp.is_used = True
                otp.save()

                refresh = RefreshToken.for_user(user)

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                    'is_new_user': False,
                }, status=status.HTTP_200_OK)

            return Response({"error": "invalid_otp", "detail": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
