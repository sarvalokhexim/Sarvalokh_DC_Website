import os
import csv
from datetime import datetime
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# File path for storing leads
LEADS_FILE = 'leads.csv'

# Ensure the leads file exists with a header
def init_leads_file():
    if not os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'Timestamp', 'Name', 'Company', 'Email', 'Phone',
                'Country', 'Destination_Port', 'Variety', 'Quantity_MT',
                'Packaging', 'Message'
            ])

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

        # Append to CSV
        init_leads_file()
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with open(LEADS_FILE, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                timestamp, name, company, email, phone,
                country, port, variety, quantity, packaging, message
            ])

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
