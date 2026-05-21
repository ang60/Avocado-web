from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, Role, Entity
from .models import FarmBlock, WeeklyRecord
import uuid

class ScoutingReportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role = Role.objects.create(role_name='Farmer')
        self.entity = Entity.objects.create(
            company_name='Test Farm',
            HCDA_license='TEST-123',
            license_expiry_date='2025-12-31',
            head_agronomist='Dr. Test',
            primary_county='Kiambu',
            company_email='test@farm.com',
            phone_number='0712345678'
        )
        self.user = User.objects.create_user(
            phone_number='0712345678',
            first_name='John',
            last_name='Doe',
            role=self.role,
            entity=self.entity,
            county='Kiambu'
        )
        self.block = FarmBlock.objects.create(
            farmer=self.user,
            block_name='Block A',
            number_of_trees=100
        )
        self.record = WeeklyRecord.objects.create(
            farmer=self.user,
            block=self.block,
            variety='Hass',
            trap_use=[
                {
                    'type_of_trap': 'Yellow Sticky',
                    'number_of_trap': 5,
                    'traps_replaced': 1,
                    'total_no_of_pests': 2.5,
                }
            ],
            any_pests_observed='Yes',
            pests_observed='False codling moth',
            any_diseases_observed='No',
            actions_taken='Farm sanitation',
            outcome='Controlled',
            start_date='2024-03-01',
            end_date='2024-03-07',
            location='Test Location'
        )
        self.client.force_authenticate(user=self.user)

    def test_scouting_report_list(self):
        url = reverse('scouting-reports-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify response structure (ignoring pagination for simplicity in basic check)
        data = response.data
        if 'results' in data: # DRF uses pagination
            item = data['results'][0]
        else:
            item = data[0]
            
        expected_fields = [
            'id', 'farmName', 'blockId', 'farmerName', 'severity', 'source',
            'finding', 'observation_status', 'status', 'mediaPreview', 'timestamp', 'reviewed',
            'reviewNotes', 'county', 'assignedTo'
        ]
        for field in expected_fields:
            self.assertIn(field, item)
            
        self.assertEqual(item['farmName'], 'Test Farm')
        self.assertEqual(item['farmerName'], 'John Doe')
        self.assertEqual(item['severity'], 'high')
        self.assertEqual(item['observation_status'], 'detected')
        self.assertEqual(item['status'], 'New')
        self.assertEqual(item['finding'], 'False codling moth')
        
        # New checks for reviewed (boolean) and timestamp
        self.assertIsInstance(item['reviewed'], bool)
        self.assertEqual(item['reviewed'], False)
        
        # Check timestamp format (e.g., "01 Mar, 00:00")
        # Since we just created the record, it should be today/now in Nairobi time
        from django.utils.timezone import localtime
        expected_ts = localtime(self.record.timestamp).strftime('%d %b, %H:%M')
        self.assertEqual(item['timestamp'], expected_ts)

    def test_formatted_findings_with_list(self):
        # Create a record with lists for pests and diseases
        record = WeeklyRecord.objects.create(
            farmer=self.user,
            block=self.block,
            variety='Hass',
            any_pests_observed='Yes',
            pests_observed=[{"name": "Fruit Fly"}, "Thrips"],
            any_diseases_observed='Yes',
            disease=["Anthracnose", "Black spot"],
            outcome='Still present',
            start_date='2024-03-08',
            end_date='2024-03-14',
            location='Test Location'
        )
        
        url = reverse('scouting-reports-detail', args=[record.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that findings are properly comma-separated without brackets
        finding = response.data['finding']
        self.assertEqual(finding, "Fruit Fly, Thrips, Anthracnose, Black spot")
        self.assertNotIn("[", finding)
        self.assertNotIn("]", finding)
        self.assertNotIn("'", finding)
