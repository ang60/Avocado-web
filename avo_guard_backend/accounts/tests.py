from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from accounts.models import User, Role, OTP
import uuid

class LinkingTests(APITestCase):
    def setUp(self):
        self.farmer_role, _ = Role.objects.get_or_create(role_name='Farmer')
        self.agronomist_role, _ = Role.objects.get_or_create(role_name='Agronomist')
        
        self.farmer = User.objects.create_user(
            phone_number='+254700000001',
            password='password123',
            role=self.farmer_role,
            first_name='Farmer',
            last_name='One'
        )
        
        self.agronomist = User.objects.create_user(
            phone_number='+254700000002',
            password='password123',
            role=self.agronomist_role,
            first_name='Agronomist',
            last_name='One'
        )
        
        self.url = '/api/users/link_to_agronomist/'

    def test_farmer_link_to_agronomist_success(self):
        # Create OTP for farmer
        otp_code = '123456'
        OTP.objects.create(phone_number=self.farmer.phone_number, code=otp_code)
        
        self.client.force_authenticate(user=self.farmer)
        data = {
            'agronomist_id': str(self.agronomist.id),
            'otp_code': otp_code
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farmer.refresh_from_db()
        self.assertEqual(self.farmer.managed_by, self.agronomist)

    def test_agronomist_link_to_farmer_success(self):
        # Create OTP for farmer
        otp_code = '654321'
        OTP.objects.create(phone_number=self.farmer.phone_number, code=otp_code)
        
        self.client.force_authenticate(user=self.agronomist)
        data = {
            'farmer_id': str(self.farmer.id),
            'otp_code': otp_code
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farmer.refresh_from_db()
        self.assertEqual(self.farmer.managed_by, self.agronomist)
