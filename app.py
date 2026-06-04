import os
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from api.resume_generator import generate_resume
from api.pdf_parser import parse_resume_pdf
from api.pdf_export import create_pdf
from api.scoring import score_resume, compare_vacancy, generate_walkthrough, optimize_section, optimize_resume_fields
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


@app.route('/api/optimize-fields', methods=['POST'])
def api_optimize_fields():
    """Apply AI optimizations to all resume form fields based on scoring suggestions."""
    data = request.json
    form_data = data.get('form_data', {})
    score_suggestions = data.get('score_suggestions', {})
    vacancy_text = data.get('vacancy_text', '')

    if not form_data:
        return jsonify({'error': 'Form data is required'}), 400

    result = optimize_resume_fields(form_data, score_suggestions, vacancy_text)
    if not result.get('success'):
        return jsonify(result), 500

    return jsonify(result)


@app.route('/api/suggest-content', methods=['POST'])
def api_suggest_content():
    """Generate AI-powered suggestions for resume fields based on job title."""
    data = request.json
    job_title = data.get('job_title', '').strip()
    field = data.get('field', 'all')  # 'skills', 'summary', 'bullets', 'all'

    if not job_title:
        return jsonify({'error': 'Job title is required'}), 400

    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))

        if field == 'skills':
            prompt = f"""You are a career expert. Suggest the 15 most relevant and in-demand skills for a "{job_title}" role.
Return ONLY a JSON array of skill strings, e.g. ["Python", "Project Management", ...]. No explanation."""

        elif field == 'summary':
            prompt = f"""You are a professional resume writer. Write a compelling, ATS-optimized professional summary for a "{job_title}" role.
The summary should be 2-3 sentences, highlight key strengths, and use strong action verbs.
Return ONLY the summary text, no quotes, no labels."""

        elif field == 'bullets':
            prompt = f"""You are a professional resume writer. Suggest 6-8 achievement-oriented bullet points for a "{job_title}" role.
Each bullet should start with a strong action verb and include quantifiable metrics where possible.
Use the STAR method implicitly. Return ONLY a JSON array of strings, e.g. ["Led team of 5 to deliver...", ...]."""

        else:  # 'all'
            prompt = f"""You are a professional resume writer and career expert helping build a resume for a "{job_title}" role.
Return a JSON object with exactly these keys:
- "skills": array of 12-15 most relevant skills (e.g. ["Python", "Leadership"])
- "summary": 2-3 sentence professional summary string
- "bullets": array of 6-8 achievement-oriented bullet point strings, each starting with an action verb
No explanation, just the JSON object."""

        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'system', 'content': 'You are an expert career coach and resume writer. Always respond with valid JSON when asked, or plain text for summaries. Never add markdown formatting or code blocks.'},
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.5,
            max_tokens=1000
        )

        import json
        content = response.choices[0].message.content.strip()
        # Remove markdown code block if present
        if content.startswith('```'):
            content = content.split('\n', 1)[1].rsplit('```', 1)[0].strip()

        if field == 'summary':
            return jsonify({'success': True, 'summary': content})
        else:
            result = json.loads(content)
            return jsonify({'success': True, **result})

    except json.JSONDecodeError:
        return jsonify({'success': True, 'summary': content if field != 'summary' else content})
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
