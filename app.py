import os
import csv
from datetime import datetime
from flask import Flask, render_template, request, jsonify

import json
import urllib.request

app = Flask(__name__)

# File path for storing leads
LEADS_FILE = 'leads.csv'
FIREBASE_PROJECT_ID = 'sarvalokhdcwebsite'
FIREBASE_FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/quotes"

def save_to_firebase(data, timestamp):
    """Save quote payload to Firebase Firestore database via REST API."""
    try:
        payload = {
            "fields": {
                "name": {"stringValue": str(data.get('name', '')).strip()},
                "company": {"stringValue": str(data.get('company', '')).strip()},
                "email": {"stringValue": str(data.get('email', '')).strip()},
                "phone": {"stringValue": str(data.get('phone', '')).strip()},
                "country": {"stringValue": str(data.get('country', '')).strip()},
                "destination_port": {"stringValue": str(data.get('port', '')).strip()},
                "variety": {"stringValue": str(data.get('variety', '')).strip()},
                "quantity_MT": {"stringValue": str(data.get('quantity', '')).strip()},
                "packaging": {"stringValue": str(data.get('packaging', '')).strip()},
                "message": {"stringValue": str(data.get('message', '')).strip()},
                "created_at": {"stringValue": timestamp}
            }
        }
        req = urllib.request.Request(
            FIREBASE_FIRESTORE_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass
    except Exception as e:
        print(f"Warning: Firebase sync failed: {e}")

# Ensure the leads file exists with a header
def init_leads_file():
    try:
        if not os.path.exists(LEADS_FILE):
            with open(LEADS_FILE, mode='w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'Timestamp', 'Name', 'Company', 'Email', 'Phone',
                    'Country', 'Destination_Port', 'Variety', 'Quantity_MT',
                    'Packaging', 'Message'
                ])
    except (OSError, PermissionError) as e:
        print(f"Notice: Cannot initialize local leads file ({e}). Firebase Firestore database will be used.")

def append_to_csv_safe(row):
    """Safely append row to local LEADS_FILE or /tmp/leads.csv without raising Errno 30 on read-only file systems."""
    for filepath in [LEADS_FILE, os.path.join('/tmp', 'leads.csv')]:
        try:
            file_exists = os.path.exists(filepath)
            with open(filepath, mode='a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                if not file_exists:
                    writer.writerow([
                        'Timestamp', 'Name', 'Company', 'Email', 'Phone',
                        'Country', 'Destination_Port', 'Variety', 'Quantity_MT',
                        'Packaging', 'Message'
                    ])
                writer.writerow(row)
            return
        except (OSError, PermissionError) as e:
            print(f"Notice: Could not write lead to {filepath}: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit_quote', methods=['POST'])
def submit_quote():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data received.'}), 400

        # Extract parameters
        name = data.get('name', '').strip()
        company = data.get('company', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        country = data.get('country', '').strip()
        port = data.get('port', '').strip()
        variety = data.get('variety', '').strip()
        quantity = data.get('quantity', '').strip()
        packaging = data.get('packaging', '').strip()
        message = data.get('message', '').strip()

        # Simple validation
        if not name or not email or not country or not variety or not quantity:
            return jsonify({'success': False, 'message': 'Please fill out all required fields.'}), 400

        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Safely attempt CSV append (bypasses Errno 30 on read-only serverless/cloud environments)
        append_to_csv_safe([
            timestamp, name, company, email, phone,
            country, port, variety, quantity, packaging, message
        ])

        # Sync to Firebase Firestore
        save_to_firebase(data, timestamp)

        return jsonify({
            'success': True,
            'message': 'Thank you! Your quote request has been recorded. Our export specialist will contact you shortly.'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    init_leads_file()
    print("Sarvalokh Exports server starting on http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
