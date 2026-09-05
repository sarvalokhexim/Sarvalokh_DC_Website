import os
import unittest
import csv
import json
from app import app, LEADS_FILE

class SarvalokhAppTestCase(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        self.client = app.test_client()
        # Backup existing leads file if it exists
        self.leads_existed = os.path.exists(LEADS_FILE)
        if self.leads_existed:
            os.rename(LEADS_FILE, LEADS_FILE + '.backup')

    def tearDown(self):
        # Remove test leads file
        if os.path.exists(LEADS_FILE):
            os.remove(LEADS_FILE)
        # Restore backup
        if self.leads_existed:
            os.rename(LEADS_FILE + '.backup', LEADS_FILE)

    def test_home_route(self):
        """Test that the homepage loads successfully."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Sarvalokh', response.data)
        self.assertIn(b'Desiccated Coconut', response.data)

    def test_submit_quote_incomplete(self):
        """Test submission with missing fields returns 400."""
        payload = {
            'name': 'John Doe',
            'email': 'john@example.com'
            # Missing variety, country, quantity
        }
        response = self.client.post(
            '/submit_quote',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        res_data = json.loads(response.data.decode('utf-8'))
        self.assertFalse(res_data['success'])

    def test_submit_quote_success(self):
        """Test that valid quote request saves to CSV and returns 200."""
        payload = {
            'name': 'Global Buyer Ltd',
            'company': 'Global Foods Co',
            'email': 'buyer@globalfoods.com',
            'phone': '+1234567890',
            'country': 'Germany',
            'port': 'Port of Hamburg',
            'variety': 'Flakes',
            'quantity': '25',
            'packaging': 'Standard 25kg PP/HDPE bag',
            'message': 'We require moisture below 3.5% and COA with shipment.'
        }
        response = self.client.post(
            '/submit_quote',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        res_data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(res_data['success'])
        self.assertIn('recorded', res_data['message'])

        # Verify entry was written to CSV
        self.assertTrue(os.path.exists(LEADS_FILE))
        with open(LEADS_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            # Row 0: Headers
            self.assertEqual(rows[0][1], 'Name')
            # Row 1: Data
            self.assertEqual(rows[1][1], 'Global Buyer Ltd')
            self.assertEqual(rows[1][2], 'Global Foods Co')
            self.assertEqual(rows[1][5], 'Germany')
            self.assertEqual(rows[1][7], 'Flakes')
            self.assertEqual(rows[1][8], '25')

if __name__ == '__main__':
    unittest.main()
