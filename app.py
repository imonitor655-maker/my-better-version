import os
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from api.resume_generator import generate_resume
from api.pdf_export import create_pdf
from api.payment import create_checkout_session, verify_webhook
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/builder')
def builder():
    return render_template('builder.html')


@app.route('/pricing')
def pricing():
    return render_template('pricing.html')


@app.route('/success')
def success():
    return render_template('success.html')


# ─── API Routes ───────────────────────────────────────────────

@app.route('/api/generate-resume', methods=['POST'])
def api_generate_resume():
    data = request.json
    try:
        result = generate_resume(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-resume-free', methods=['POST'])
def api_generate_free():
    data = request.json
    data['plan'] = 'free'
    try:
        result = generate_resume(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/export-pdf', methods=['POST'])
def api_export_pdf():
    data = request.json
    try:
        pdf_path = create_pdf(data)
        return send_file(pdf_path, as_attachment=True, download_name='my-better-version-resume.pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/create-checkout', methods=['POST'])
def api_checkout():
    data = request.json
    plan = data.get('plan', 'pro')
    try:
        session = create_checkout_session(plan)
        return jsonify(session)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/webhook', methods=['POST'])
def api_webhook():
    payload = request.data
    sig = request.headers.get('Stripe-Signature', '')
    try:
        event = verify_webhook(payload, sig)
        return jsonify({'received': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
