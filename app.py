import os
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from api.resume_generator import generate_resume
from api.pdf_parser import parse_resume_pdf
from api.pdf_export import create_pdf
from api.scoring import score_resume, compare_vacancy, generate_walkthrough, optimize_section
from api.payment import create_checkout_session, verify_webhook
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

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


@app.route('/api/upload-pdf', methods=['POST'])
def api_upload_pdf():
    """Upload and parse a PDF resume."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported'}), 400
    
    file_bytes = file.read()
    if len(file_bytes) == 0:
        return jsonify({'error': 'Empty file'}), 400
    
    result = parse_resume_pdf(file_bytes)
    if not result.get('success'):
        return jsonify(result), 500
    
    return jsonify(result)


@app.route('/api/score-resume', methods=['POST'])
def api_score_resume():
    """Score a resume (ATS compatibility, completeness, etc.)."""
    data = request.json
    resume_text = data.get('resume_text', '')
    
    if not resume_text.strip():
        return jsonify({'error': 'Resume text is required'}), 400
    
    result = score_resume(resume_text)
    if not result.get('success'):
        return jsonify(result), 500
    
    return jsonify(result)


@app.route('/api/compare-vacancy', methods=['POST'])
def api_compare_vacancy():
    """Compare resume against a job vacancy."""
    data = request.json
    resume_text = data.get('resume_text', '')
    vacancy_text = data.get('vacancy_text', '')
    
    if not resume_text.strip():
        return jsonify({'error': 'Resume text is required'}), 400
    if not vacancy_text.strip():
        return jsonify({'error': 'Vacancy text is required'}), 400
    
    result = compare_vacancy(resume_text, vacancy_text)
    if not result.get('success'):
        return jsonify(result), 500
    
    return jsonify(result)


@app.route('/api/generate-walkthrough', methods=['POST'])
def api_generate_walkthrough():
    """Generate step-by-step walkthrough to optimize resume for a vacancy."""
    data = request.json
    resume_text = data.get('resume_text', '')
    vacancy_text = data.get('vacancy_text', '')
    
    if not resume_text.strip():
        return jsonify({'error': 'Resume text is required'}), 400
    if not vacancy_text.strip():
        return jsonify({'error': 'Vacancy text is required'}), 400
    
    result = generate_walkthrough(resume_text, vacancy_text)
    if not result.get('success'):
        return jsonify(result), 500
    
    return jsonify(result)


@app.route('/api/optimize-section', methods=['POST'])
def api_optimize_section():
    """Optimize a specific section of the resume based on instruction."""
    data = request.json
    current_content = data.get('current_content', '')
    instruction = data.get('instruction', '')
    vacancy_context = data.get('vacancy_context', '')
    
    if not current_content.strip() or not instruction.strip():
        return jsonify({'error': 'Content and instruction are required'}), 400
    
    result = optimize_section(current_content, instruction, vacancy_context)
    if not result.get('success'):
        return jsonify(result), 500
    
    return jsonify(result)


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
