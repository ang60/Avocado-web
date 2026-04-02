import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number field must be set')
        user = self.model(phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)

class Entity(models.Model):
    ENTITY_TYPE_CHOICES = (
        ('Exporter', 'Exporter'),
        ('Government - KEPHIS', 'Government - KEPHIS'),
        ('Government - HCDA', 'Government - HCDA'),
        ('Partner Organization', 'Partner Organization'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPE_CHOICES)
    company_name = models.CharField(max_length=255)
    HCDA_license = models.CharField(max_length=100, unique=True)
    license_expiry_date = models.DateField()
    head_agronomist = models.CharField(max_length=255)
    primary_county = models.CharField(max_length=100)
    company_email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        old_active = None
        if not is_new:
            old_instance = Entity.objects.get(pk=self.pk)
            old_active = old_instance.is_active

        super().save(*args, **kwargs)

        # If entity is suspended (is_active: True -> False), block all associated users
        if old_active is True and self.is_active is False:
            User.objects.filter(entity=self).update(is_active=False)
        # If entity is activated (is_active: False -> True), unblock all associated users
        elif old_active is False and self.is_active is True:
            User.objects.filter(entity=self).update(is_active=True)

class AppPermission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    role_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    permissions = models.ManyToManyField(AppPermission, related_name='roles', blank=True)

    class Meta:
        ordering = ['role_name']

    def __str__(self):
        return self.role_name

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    username = None
    email = models.EmailField(unique=True, null=True, blank=True)
    phone_number = models.CharField(unique=True, max_length=15)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    county = models.CharField(max_length=100, null=True, blank=True)
    entity = models.ForeignKey(Entity, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.phone_number

    def save(self, *args, **kwargs):
        # Handle migration from string roles to Role objects if necessary
        # However, for now we just want to allow the field to be a ForeignKey
        super().save(*args, **kwargs)

class OTP(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    phone_number = models.CharField(max_length=15)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.phone_number} - {self.code}"
