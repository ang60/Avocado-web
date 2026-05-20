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
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    LinkAgronomistSerializer,
    VerifyLinkSerializer,
    normalize_phone_number,
    EntitySerializer,
    RoleSerializer,
    AppPermissionSerializer,
    RequestPasswordResetSerializer,
    ConfirmPasswordResetSerializer,
)
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
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


def _record_user_login(user: User) -> None:
    """JWT sign-in does not call django.contrib.auth.login(); mirror last_login updates."""
    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])


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

    def get_permissions(self):
        # Anonymous users can list roles when building the public registration form.
        if self.action == 'list' and self.request.query_params.get('for_registration') == '1':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminLikeUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'list' and self.request.query_params.get('for_registration') == '1':
            return qs.exclude(role_name='Administrator')
        return qs

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
        if self.action in ('link_agronomist', 'verify_link', 'linked_farmers'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminLikeUser()]

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

        _record_user_login(user)
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
            otp_row = OTP.objects.create(phone_number=phone_number, code=code)

            # Send SMS via Advanta (optional)
            sms_sent: bool | None = None
            if getattr(settings, 'OTP_SKIP_SMS', False):
                logger.info('[OTP] OTP_SKIP_SMS=1; stored OTP for phone=%s', phone_number)
                sms_sent = None
            else:
                try:
                    send_advanta_sms(
                        phone_number=phone_number,
                        message=f"Your Avo Guard account verification code is: {code}",
                    )
                    sms_sent = True
                except Exception:
                    logger.exception('[OTP] SMS sending failed for phone=%s', phone_number)
                    sms_sent = False
                    if getattr(settings, 'DEBUG', False):
                        print(f'[OTP] {phone_number} -> {code}')

            if getattr(settings, 'OTP_ECHO_CODE', False):
                return Response(
                    {
                        'detail': 'ok',
                        'code': code,
                        'sms_sent': True if sms_sent is True else (False if sms_sent is False else None),
                    },
                    status=status.HTTP_200_OK,
                )

            if sms_sent is False:
                if getattr(settings, 'DEBUG', False):
                    return Response(
                        {
                            'detail': 'SMS could not be delivered; use the code below in development only.',
                            'sms_sent': False,
                            'code': code,
                        },
                        status=status.HTTP_200_OK,
                    )
                otp_row.delete()
                return Response(
                    {
                        'error': 'sms_unavailable',
                        'detail': (
                            'Could not send verification SMS (provider error). '
                            'Try again later, or sign in with password if your account has one.'
                        ),
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

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

                _record_user_login(user)
                refresh = RefreshToken.for_user(user)

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                    'is_new_user': False,
                }, status=status.HTTP_200_OK)

            return Response({"error": "invalid_otp", "detail": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=PasswordResetRequestSerializer)
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_password_reset(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['identifier']
        user = _user_for_login_identifier(identifier)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        code = str(random.randint(100000, 999999))
        OTP.objects.create(phone_number=user.phone_number, code=code)

        # SMS fallback/primary delivery
        if getattr(settings, 'OTP_SKIP_SMS', False):
            logger.info('[RESET OTP] OTP_SKIP_SMS=1; stored OTP for phone=%s', user.phone_number)
        else:
            try:
                send_advanta_sms(
                    phone_number=user.phone_number,
                    message=f"Your AvoGuard password reset code is: {code}",
                )
            except Exception:
                logger.exception('[RESET OTP] SMS sending failed for phone=%s', user.phone_number)

        # Optional email delivery if user has email configured.
        if user.email:
            try:
                html = render_to_string(
                    'emails/password_reset.html',
                    {'user': user, 'reset_code': code, 'expiry_minutes': 10},
                )
                send_mail(
                    'AvoGuard Password Reset Code',
                    strip_tags(html),
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    html_message=html,
                    fail_silently=True,
                )
            except Exception:
                logger.exception('[RESET OTP] Email sending failed for user=%s', user.id)

        if getattr(settings, 'OTP_ECHO_CODE', False):
            return Response({'detail': 'ok', 'code': code}, status=status.HTTP_200_OK)
        return Response({'detail': 'Password reset code sent.'}, status=status.HTTP_200_OK)

    @extend_schema(request=PasswordResetConfirmSerializer)
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def confirm_password_reset(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['identifier']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        user = _user_for_login_identifier(identifier)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        otp = (
            OTP.objects.filter(phone_number=user.phone_number, code=code, is_used=False)
            .order_by('-created_at')
            .first()
        )
        if not otp:
            return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save(update_fields=['is_used'])
        user.set_password(new_password)
        user.save(update_fields=['password'])

        if user.email:
            try:
                html = render_to_string('emails/password_reset_success.html', {'user': user})
                send_mail(
                    'AvoGuard Password Reset Successful',
                    strip_tags(html),
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    html_message=html,
                    fail_silently=True,
                )
            except Exception:
                logger.exception('[RESET OTP] Success email failed for user=%s', user.id)

        return Response({'detail': 'Password reset successful.'}, status=status.HTTP_200_OK)

    @extend_schema(request=LinkAgronomistSerializer)
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def link_agronomist(self, request):
        serializer = LinkAgronomistSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        farmer_id = serializer.validated_data['farmer_id']
        try:
            farmer = User.objects.get(id=farmer_id, role__role_name='Farmer')
        except User.DoesNotExist:
            return Response({'detail': 'Farmer not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.role or request.user.role.role_name != 'Agronomist':
            return Response({'detail': 'Only agronomists can initiate linking.'}, status=status.HTTP_403_FORBIDDEN)

        code = str(random.randint(100000, 999999))
        OTP.objects.create(phone_number=farmer.phone_number, code=code)

        if not getattr(settings, 'OTP_SKIP_SMS', False):
            try:
                send_advanta_sms(
                    phone_number=farmer.phone_number,
                    message=(
                        f"Agronomist {request.user.first_name} {request.user.last_name} "
                        f"wants to link to your account. Use code {code} to authorize."
                    ),
                )
            except Exception:
                logger.exception('[LINK OTP] SMS sending failed for phone=%s', farmer.phone_number)

        if getattr(settings, 'OTP_ECHO_CODE', False):
            return Response({'status': 'otp_sent', 'code': code}, status=status.HTTP_200_OK)
        return Response({'status': 'otp_sent'}, status=status.HTTP_200_OK)

    @extend_schema(request=VerifyLinkSerializer)
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify_link(self, request):
        serializer = VerifyLinkSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        farmer_id = serializer.validated_data['farmer_id']
        otp_code = serializer.validated_data['otp_code']

        try:
            farmer = User.objects.get(id=farmer_id, role__role_name='Farmer')
        except User.DoesNotExist:
            return Response({'detail': 'Farmer not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.role or request.user.role.role_name != 'Agronomist':
            return Response({'detail': 'Only agronomists can verify linking.'}, status=status.HTTP_403_FORBIDDEN)

        otp = (
            OTP.objects.filter(phone_number=farmer.phone_number, code=otp_code, is_used=False)
            .order_by('-created_at')
            .first()
        )
        if not otp:
            return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        farmer.managed_by = request.user
        farmer.save(update_fields=['managed_by'])
        otp.is_used = True
        otp.save(update_fields=['is_used'])
        return Response({'status': 'linked'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def linked_farmers(self, request):
        agronomist = request.user
        if not agronomist.role or agronomist.role.role_name != 'Agronomist':
            return Response({'detail': 'Only agronomists can view linked farmers.'}, status=status.HTTP_403_FORBIDDEN)

        qs = agronomist.managed_farmers.all().order_by('first_name', 'last_name')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = UserSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = UserSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
