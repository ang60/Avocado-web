from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, Role
from .models import Case

class CaseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(role_name='Agronomist')
        self.user = User.objects.create_user(
            phone_number='0712345679',
            first_name='Jane',
            last_name='Agronomist',
            role=self.role
        )
        self.client.force_authenticate(user=self.user)

    def test_case_create_with_initial_notes(self):
        url = reverse('case-list')
        data = {
            'case_title': 'Pest Infestation',
            'severity': 'high',
            'initial_notes': 'Observed high pest population',
            'notes': 'Follow up required'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['initial_notes'], 'Observed high pest population')
        
        case = Case.objects.get(id=response.data['id'])
        self.assertEqual(case.initial_notes, 'Observed high pest population')
