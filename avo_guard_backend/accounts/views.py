from rest_framework import viewsets, status, permissions, serializers, filters, pagination, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, OTP, Entity, Role, AppPermission, FCMDevice
from .serializers import (
    UserSerializer, OTPSerializer, VerifyOTPSerializer, RegisterSerializer, 
    EntitySerializer, RoleSerializer, AppPermissionSerializer, LoginSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    LinkAgronomistSerializer, VerifyLinkSerializer, FarmerLinkAgronomistSerializer,
    UserManagementStatsSerializer, UserProfilePictureSerializer, FCMDeviceSerializer
)
from django.conf import settings
import random
from rest_framework_simplejwt.tokens import RefreshToken
from .sms_utils import send_advanta_sms
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer, OpenApiParameter, OpenApiTypes
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from avo_guard.pagination import StandardResultsSetPagination

@extend_schema(tags=['User Management'])
class AppPermissionViewSet(viewsets.ModelViewSet):
    queryset = AppPermission.objects.all()
    serializer_class = AppPermissionSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    @extend_schema(
        summary="List App Permissions",
        description="Get a list of all application permissions.",
        responses={200: AppPermissionSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create App Permission",
        description="Create a new application permission.",
        request=AppPermissionSerializer,
        responses={201: AppPermissionSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve App Permission",
        description="Get details of a specific application permission.",
        responses={200: AppPermissionSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update App Permission",
        description="Update an existing application permission.",
        request=AppPermissionSerializer,
        responses={200: AppPermissionSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update App Permission",
        description="Partially update an existing application permission.",
        request=AppPermissionSerializer,
        responses={200: AppPermissionSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete App Permission",
        description="Delete an application permission.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

@extend_schema(tags=['User Management'])
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['role_name', 'description']

    @extend_schema(
        summary="List Roles",
        description="Get a list of all user roles.",
        responses={200: RoleSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Role",
        description="Create a new user role.",
        request=RoleSerializer,
        responses={201: RoleSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Role",
        description="Get details of a specific user role.",
        responses={200: RoleSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Role",
        description="Update an existing user role.",
        request=RoleSerializer,
        responses={200: RoleSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Role",
        description="Partially update an existing user role.",
        request=RoleSerializer,
        responses={200: RoleSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Role",
        description="Delete a user role.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

@extend_schema(tags=['User Management'])
class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['company_name', 'HCDA_license', 'primary_county', 'company_email', 'phone_number']

    @extend_schema(
        summary="List Entities",
        description="Get a list of all entities (Exporters, Input Providers, etc.).",
        responses={200: EntitySerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Entity",
        description="Create a new entity.",
        request=EntitySerializer,
        responses={201: EntitySerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve Entity",
        description="Get details of a specific entity.",
        responses={200: EntitySerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Entity",
        description="Update an existing entity.",
        request=EntitySerializer,
        responses={200: EntitySerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update Entity",
        description="Partially update an existing entity.",
        request=EntitySerializer,
        responses={200: EntitySerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete Entity",
        description="Delete an entity.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

class UserFilter(django_filters.FilterSet):
    role_name = django_filters.CharFilter(field_name='role__role_name', lookup_expr='iexact')

    class Meta:
        model = User
        fields = ['role_name']

@extend_schema(tags=['User Management'])
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = UserFilter
    search_fields = ['phone_number', 'email', 'first_name', 'last_name', 'county']

    @extend_schema(
        summary="List Users",
        description="Get a list of all users.",
        parameters=[
            OpenApiParameter("role_name", OpenApiTypes.STR, OpenApiParameter.QUERY, description="Filter by role name"),
        ],
        responses={200: UserSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve User",
        description="Get details of a specific user.",
        responses={200: UserSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update User",
        description="Update an existing user.",
        request={
            'application/json': UserSerializer,
            'multipart/form-data': UserSerializer,
        },
        responses={200: UserSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partial Update User",
        description="Partially update an existing user.",
        request={
            'application/json': UserSerializer,
            'multipart/form-data': UserSerializer,
        },
        responses={200: UserSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete User",
        description="Delete a user.",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        summary="Upload Profile Picture",
        description="Upload a profile picture for the authenticated user.",
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'profile_picture': {
                        'type': 'string',
                        'format': 'binary'
                    }
                }
            }
        },
        responses={200: UserSerializer}
    )
    @action(detail=False, methods=['post'], parser_classes=[parsers.MultiPartParser, parsers.FormParser], permission_classes=[permissions.IsAuthenticated])
    def upload_profile_picture(self, request):
        user = request.user
        serializer = UserProfilePictureSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Register User",
        description="Register a new user with phone number, email, and other details.",
        request=RegisterSerializer,
        responses={201: UserSerializer}
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: inline_serializer(
                name='LoginResponse',
                fields={
                    'refresh': serializers.CharField(),
                    'access': serializers.CharField(),
                    'user': UserSerializer(),
                }
            ),
            400: inline_serializer(
                name='LoginError',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            password = serializer.validated_data['password']
            
            user = User.objects.filter(phone_number=phone_number).first()
            
            if user and user.check_password(password):
                if not user.is_active:
                    return Response({"error": "This account is inactive."}, status=status.HTTP_400_BAD_REQUEST)
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid phone number or password"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=OTPSerializer,
        responses={
            200: inline_serializer(
                name='OTPResponse',
                fields={
                    'message': serializers.CharField(),
                    'code': serializers.CharField(required=False),
                    'errors': serializers.ListField(child=serializers.CharField(), required=False)
                }
            ),
            400: inline_serializer(
                name='OTPError',
                fields={'error': serializers.CharField()}
            ),
            404: inline_serializer(
                name='OTPNotFoundError',
                fields={'error': serializers.CharField()}
            ),
            500: inline_serializer(
                name='OTPInternalError',
                fields={
                    'error': serializers.CharField(),
                    'details': serializers.ListField(child=serializers.CharField())
                }
            )
        }
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def request_otp(self, request):
        serializer = OTPSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data.get('phone_number')
            email = serializer.validated_data.get('email')
            
            # Treat empty email string as None
            if email == '':
                email = None
            
            # Find user if email is provided but not phone
            if email and not phone_number:
                user = User.objects.filter(email=email).first()
                if user:
                    phone_number = user.phone_number
                else:
                    return Response({"error": "User with this email not found"}, status=status.HTTP_404_NOT_FOUND)
            
            code = str(random.randint(100000, 999999))
            OTP.objects.create(phone_number=phone_number, code=code)

            delivery_method = getattr(settings, 'OTP_DELIVERY_METHOD', 'SMS')
            errors = []

            # Send SMS if configured
            if delivery_method in ['SMS', 'BOTH']:
                try:
                    send_advanta_sms(
                        phone_number=phone_number,
                        message=f"Your Avo Guard verification code is: {code}"
                    )
                except Exception as e:
                    errors.append(f"SMS error: {str(e)}")

            # Send Email if configured
            if delivery_method in ['EMAIL', 'BOTH']:
                user = User.objects.filter(phone_number=phone_number).first()
                target_email = email or (user.email if user else None)
                
                if target_email:
                    try:
                        context = {
                            'otp_code': code,
                            'user': user,
                            'expiry_minutes': 10
                        }
                        html_message = render_to_string('emails/otp_email.html', context)
                        plain_message = strip_tags(html_message)
                        
                        send_mail(
                            subject='Your AvoGuard Verification Code',
                            message=plain_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[target_email],
                            html_message=html_message
                        )
                    except Exception as e:
                        errors.append(f"Email error: {str(e)}")
                elif delivery_method == 'EMAIL':
                    return Response({"error": "User has no email address for delivery"}, status=status.HTTP_400_BAD_REQUEST)

            if errors and not settings.DEBUG:
                return Response({"error": "Failed to send OTP", "details": errors}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            if settings.DEBUG:
                return Response({
                    "message": "OTP processing completed (Dev mode)", 
                    "code": code,
                    "errors": errors
                }, status=status.HTTP_200_OK)
                
            return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={
            200: inline_serializer(
                name='PasswordResetRequestResponse',
                fields={'message': serializers.CharField()}
            ),
            400: inline_serializer(
                name='PasswordResetRequestError',
                fields={'error': serializers.CharField()}
            ),
            404: inline_serializer(
                name='PasswordResetNotFoundError',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def request_password_reset(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data.get('phone_number')
            email = serializer.validated_data.get('email')
            
            # Treat empty email string as None
            if email == '':
                email = None
            
            user = None
            if phone_number:
                user = User.objects.filter(phone_number=phone_number).first()
            elif email:
                user = User.objects.filter(email=email).first()
                if user:
                    phone_number = user.phone_number
            
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            code = str(random.randint(100000, 999999))
            OTP.objects.create(phone_number=phone_number, code=code)
            
            # Use same delivery logic as request_otp or trigger delivery
            delivery_method = getattr(settings, 'OTP_DELIVERY_METHOD', 'SMS')
            
            if delivery_method in ['SMS', 'BOTH']:
                try:
                    send_advanta_sms(phone_number=phone_number, message=f"Your Avo Guard password reset code is: {code}")
                except: pass
                
            if delivery_method in ['EMAIL', 'BOTH'] and user.email:
                try:
                    context = {'otp_code': code, 'user': user}
                    html_message = render_to_string('emails/password_reset.html', context)
                    send_mail(
                        'Password Reset - AvoGuard',
                        strip_tags(html_message),
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        html_message=html_message
                    )
                except: pass
            
            return Response({"message": "Password reset code sent"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={
            200: inline_serializer(
                name='PasswordResetConfirmResponse',
                fields={'message': serializers.CharField()}
            ),
            400: inline_serializer(
                name='PasswordResetConfirmError',
                fields={'error': serializers.CharField()}
            ),
            404: inline_serializer(
                name='PasswordResetConfirmNotFoundError',
                fields={'error': serializers.CharField()}
            )
        }
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def confirm_password_reset(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']
            
            otp = OTP.objects.filter(phone_number=phone_number, code=code, is_used=False).order_by('-created_at').first()
            
            if otp:
                otp.is_used = True
                otp.save()
                
                user = User.objects.filter(phone_number=phone_number).first()
                if user:
                    user.set_password(new_password)
                    user.save()
                    
                    # Optional: send success email
                    if user.email:
                        try:
                            html_message = render_to_string('emails/password_reset_success.html', {'user': user})
                            send_mail('Password Reset Successful', strip_tags(html_message), settings.DEFAULT_FROM_EMAIL, [user.email], html_message=html_message)
                        except: pass
                        
                    return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            return Response({"error": "Invalid or expired code"}, status=status.HTTP_400_BAD_REQUEST)
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
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
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
                if created:
                    farmer_role, _ = Role.objects.get_or_create(role_name='Farmer')
                    user.role = farmer_role
                    user.save()
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                    'is_new_user': created
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Initiate Farmer-Agronomist Link (Agronomist action)",
        description="Allows an agronomist to initiate linking to a farmer. An OTP will be sent to the farmer's phone number.",
        request=LinkAgronomistSerializer,
        responses={
            200: inline_serializer(
                name='LinkAgronomistResponse',
                fields={'status': serializers.CharField()}
            ),
            400: inline_serializer(
                name='LinkAgronomistError',
                fields={'error': serializers.CharField()}
            ),
            403: inline_serializer(
                name='LinkAgronomistForbiddenError',
                fields={'error': serializers.CharField()}
            ),
            404: inline_serializer(
                name='LinkAgronomistNotFoundError',
                fields={'error': serializers.CharField()}
            ),
            500: inline_serializer(
                name='LinkAgronomistInternalError',
                fields={'error': serializers.CharField()}
            )
        },
        tags=['User Management']
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def link_agronomist(self, request):
        serializer = LinkAgronomistSerializer(data=request.data)
        if serializer.is_valid():
            farmer_id = serializer.validated_data['farmer_id']
            try:
                farmer = User.objects.get(id=farmer_id, role__role_name='Farmer')
            except User.DoesNotExist:
                return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Current user must be agronomist
            if not request.user.role or request.user.role.role_name != 'Agronomist':
                return Response({'error': 'Only agronomists can initiate linking'}, status=status.HTTP_403_FORBIDDEN)

            # Generate OTP
            code = str(random.randint(100000, 999999))
            OTP.objects.create(phone_number=farmer.phone_number, code=code)
            
            # Send SMS to farmer
            message = f"Agronomist {request.user.first_name} {request.user.last_name} wants to link to your account. Use code {code} to authorize."
            try:
                send_advanta_sms(farmer.phone_number, message)
            except Exception as e:
                return Response({'error': f'Failed to send SMS: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'status': 'OTP sent to farmer'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Verify Farmer-Agronomist Link (Farmer action)",
        description="Allows a farmer to verify the linking request initiated by an agronomist using the OTP received.",
        request=VerifyLinkSerializer,
        responses={
            200: inline_serializer(
                name='VerifyLinkResponse',
                fields={'status': serializers.CharField()}
            ),
            400: inline_serializer(
                name='VerifyLinkError',
                fields={'error': serializers.CharField()}
            ),
            404: inline_serializer(
                name='VerifyLinkNotFoundError',
                fields={'error': serializers.CharField()}
            )
        },
        tags=['User Management']
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify_link(self, request):
        serializer = VerifyLinkSerializer(data=request.data)
        if serializer.is_valid():
            farmer_id = serializer.validated_data['farmer_id']
            otp_code = serializer.validated_data['otp_code']
            
            try:
                farmer = User.objects.get(id=farmer_id, role__role_name='Farmer')
            except User.DoesNotExist:
                return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
            
            otp = OTP.objects.filter(phone_number=farmer.phone_number, code=otp_code, is_used=False).last()
            if not otp:
                return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Link agronomist
            farmer.managed_by = request.user
            farmer.save()
            
            otp.is_used = True
            otp.save()
            
            return Response({'status': 'Agronomist linked successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Link Farmer and Agronomist",
        description="Allows a farmer to link themselves to an agronomist using an OTP code, or an agronomist to link a farmer using an OTP code sent to the farmer.",
        request=FarmerLinkAgronomistSerializer,
        responses={
            200: inline_serializer(
                name='FarmerLinkAgronomistResponse',
                fields={'status': serializers.CharField()}
            ),
            400: inline_serializer(
                name='FarmerLinkAgronomistError',
                fields={'error': serializers.CharField()}
            ),
            404: inline_serializer(
                name='FarmerLinkAgronomistNotFoundError',
                fields={'error': serializers.CharField()}
            ),
            403: inline_serializer(
                name='FarmerLinkAgronomistForbiddenError',
                fields={'error': serializers.CharField()}
            )
        },
        tags=['User Management'],
        examples=[
            OpenApiExample(
                'Farmer Linking to Agronomist',
                value={
                    'agronomist_id': '00000000-0000-0000-0000-000000000000',
                    'otp_code': '123456'
                },
                request_only=True,
            ),
            OpenApiExample(
                'Agronomist Linking to Farmer',
                value={
                    'farmer_id': '00000000-0000-0000-0000-000000000000',
                    'otp_code': '123456'
                },
                request_only=True,
            )
        ]
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def link_to_agronomist(self, request):
        serializer = FarmerLinkAgronomistSerializer(data=request.data)
        if serializer.is_valid():
            agronomist_id = serializer.validated_data.get('agronomist_id')
            farmer_id = serializer.validated_data.get('farmer_id')
            otp_code = serializer.validated_data['otp_code']
            
            user_role = getattr(request.user.role, 'role_name', None)
            
            if user_role == 'Farmer':
                if not agronomist_id:
                    return Response({'error': 'agronomist_id is required for farmers'}, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    agronomist = User.objects.get(id=agronomist_id, role__role_name='Agronomist')
                except User.DoesNotExist:
                    return Response({'error': 'Agronomist not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Verify OTP for the farmer (current user)
                otp = OTP.objects.filter(phone_number=request.user.phone_number, code=otp_code, is_used=False).last()
                if not otp:
                    return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Link agronomist to farmer
                request.user.managed_by = agronomist
                request.user.save()
                
                otp.is_used = True
                otp.save()
                
                return Response({'status': f'Successfully linked to agronomist {agronomist.get_full_name() or agronomist.phone_number}'}, status=status.HTTP_200_OK)
            
            elif user_role == 'Agronomist':
                if not farmer_id:
                    return Response({'error': 'farmer_id is required for agronomists'}, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    farmer = User.objects.get(id=farmer_id, role__role_name='Farmer')
                except User.DoesNotExist:
                    return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Verify OTP for the farmer
                otp = OTP.objects.filter(phone_number=farmer.phone_number, code=otp_code, is_used=False).last()
                if not otp:
                    return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Link agronomist (current user) to farmer
                farmer.managed_by = request.user
                farmer.save()
                
                otp.is_used = True
                otp.save()
                
                return Response({'status': f'Successfully linked to farmer {farmer.get_full_name() or farmer.phone_number}'}, status=status.HTTP_200_OK)
            
            return Response({'error': 'Only farmers and agronomists can use this endpoint'}, status=status.HTTP_403_FORBIDDEN)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="List Linked Farmers",
        description="Lists all farmers linked to an agronomist. If agronomist_id is not provided, it defaults to the current logged-in user (if they are an agronomist).",
        parameters=[
            OpenApiParameter(name='agronomist_id', type=OpenApiTypes.UUID, location=OpenApiParameter.QUERY, description='ID of the agronomist to get linked farmers for')
        ],
        responses={200: UserSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def linked_farmers(self, request):
        agronomist_id = request.query_params.get('agronomist_id')
        
        if agronomist_id:
            try:
                agronomist = User.objects.get(id=agronomist_id, role__role_name='Agronomist')
            except User.DoesNotExist:
                return Response({'error': 'Agronomist not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            agronomist = request.user
            if not agronomist.role or agronomist.role.role_name != 'Agronomist':
                return Response({'error': 'You must be an agronomist or provide an agronomist_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        farmers = agronomist.managed_farmers.all()
        serializer = UserSerializer(farmers, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="User Management Statistics",
        description="Get counts of active users, roles, entities, and permissions.",
        responses={200: UserManagementStatsSerializer}
    )
    @action(detail=False, methods=['get'], url_path='management-stats')
    def management_stats(self, request):
        data = {
            'active_users_count': User.objects.filter(is_active=True).count(),
            'roles_count': Role.objects.count(),
            'entities_count': Entity.objects.count(),
            'permissions_count': AppPermission.objects.count(),
        }
        serializer = UserManagementStatsSerializer(data)
        return Response(serializer.data)

    @extend_schema(
        summary="Register FCM Device",
        description="Register or update an FCM registration token for the current user.",
        request=FCMDeviceSerializer,
        responses={200: FCMDeviceSerializer, 201: FCMDeviceSerializer}
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='register-fcm-device')
    def register_fcm_device(self, request):
        serializer = FCMDeviceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
