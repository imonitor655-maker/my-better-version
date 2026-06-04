import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))

SYSTEM_PROMPT = """You are an expert resume writer and career coach with 15+ years of experience. You craft compelling, ATS-optimized resumes that highlight a candidate's strengths and achievements.

Rules:
- Use strong action verbs (Led, Developed, Implemented, Achieved, Orchestrated, Transformed)
- Quantify achievements where possible (numbers, percentages, dollar amounts)
- Keep bullet points concise (1-2 lines max)
- Tailor content to the target job title/industry
- Include relevant keywords for ATS systems
- Do NOT invent fake experiences, skills, or education — only use what the user provided
- Professional summary must be 3-4 powerful sentences
- Return ONLY valid JSON, no markdown, no extra text"""

PLAN_LIMITS = {
    'free': {'max_resumes': 1, 'templates': ['modern'], 'cover_letter': False},
    'pro': {'max_resumes': 999, 'templates': ['modern', 'classic', 'minimal'], 'cover_letter': True},
    'lifetime': {'max_resumes': 999, 'templates': ['modern', 'classic', 'minimal'], 'cover_letter': True},
}


def generate_resume(user_data):
    """Generate an AI-optimized resume from user input."""
    
    plan = user_data.get('plan', 'free')
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    template = user_data.get('template', 'modern')
    
    if template not in limits['templates']:
        template = limits['templates'][0]
    
    # Extract fields from nested form data (frontend sends nested structure)
    personal = user_data.get('personal_info', {})
    full_name = personal.get('full_name', '')
    email = personal.get('email', '')
    phone = personal.get('phone', '')
    location = personal.get('location', '')
    linkedin = personal.get('linkedin', '')
    
    target = user_data.get('target', {})
    target_title = target.get('job_title', 'Not specified')
    target_industry = target.get('industry', 'Not specified')
    years_experience = target.get('years_experience', 'Not specified')
    job_description = target.get('job_description', '')
    
    experience = user_data.get('experience', [])
    education = user_data.get('education', [])
    skills = user_data.get('skills', [])
    
    # Check if score suggestions were provided (from a previous scoring run)
    score_suggestions = user_data.get('score_suggestions', {})
    
    # Build a clean, readable summary of user data for the AI
    user_summary = f"""
NAME: {full_name or 'Not provided'}
EMAIL: {email or 'Not provided'}
PHONE: {phone or 'Not provided'}
LOCATION: {location or 'Not provided'}
LINKEDIN: {linkedin or 'Not provided'}

TARGET JOB TITLE: {target_title}
TARGET INDUSTRY: {target_industry}
YEARS OF EXPERIENCE: {years_experience}
TARGET JOB DESCRIPTION: {job_description or 'Not provided'}

WORK EXPERIENCE:
"""
    for i, exp in enumerate(experience):
        user_summary += f"\nExperience {i+1}:\n"
        user_summary += f"  Company: {exp.get('company', '')}\n"
        user_summary += f"  Title: {exp.get('title', '')}\n"
        user_summary += f"  Dates: {exp.get('startDate', '')} to {exp.get('endDate', '')}\n"
        user_summary += f"  Description: {exp.get('description', '')}\n"
    
    user_summary += "\nEDUCATION:\n"
    for i, edu in enumerate(education):
        user_summary += f"\nEducation {i+1}:\n"
        user_summary += f"  School: {edu.get('school', '')}\n"
        user_summary += f"  Degree: {edu.get('degree', '')}\n"
        user_summary += f"  Dates: {edu.get('startDate', '')} to {edu.get('endDate', '')}\n"
        user_summary += f"  GPA: {edu.get('gpa', '')}\n"
    
    user_summary += f"\nSKILLS: {', '.join(skills) if skills else 'None listed'}"
    
    prompt = f"""Create a professional, ATS-optimized resume based on the following information.

Target Job: {target_title}
Target Industry: {target_industry}
Years of Experience: {years_experience}

User's Information:
{user_summary}

Return ONLY valid JSON with this exact structure:
{{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "professional_summary": "string - 3-4 powerful sentences summarizing the candidate",
  "experience": [
    {{
      "company": "string",
      "title": "string",
      "dates": "string - e.g. Jan 2020 - Present",
      "bullets": ["string - achievement-focused bullet point with action verbs and numbers"]
    }}
  ],
  "education": [
    {{
      "school": "string",
      "degree": "string",
      "dates": "string",
      "gpa": "string or null"
    }}
  ],
  "skills": ["string - relevant technical and soft skills"],
  "template": "modern"
}}

IMPORTANT:
- Enhance bullet points with strong action verbs and quantify achievements
- Reorder experience by relevance to target job (most recent/relevant first)
- Add a compelling professional summary that bridges their experience to the target role
- If the user's original descriptions are weak, improve them while keeping facts truthful
- Skills should include both what the user listed and relevant skills implied by their experience
- Return ONLY the JSON, nothing else"""

    # If we have score suggestions from a previous scoring run, inject them
    if score_suggestions:
        prompt += "\n\nIMPORTANT — The user has already run a resume score analysis. Apply ALL of these suggestions when generating the resume:\n\n"
        
        # Quick wins
        if score_suggestions.get('quick_wins'):
            prompt += "QUICK WINS TO APPLY:\n"
            for win in score_suggestions['quick_wins']:
                prompt += f"  • {win}\n"
        
        # Suggested keywords
        if score_suggestions.get('keyword_power', {}).get('suggested_keywords'):
            prompt += "\nKEYWORDS TO INCLUDE (from scoring): " + ", ".join(score_suggestions['keyword_power']['suggested_keywords']) + "\n"
        
        # Weaknesses to fix
        if score_suggestions.get('content_quality', {}).get('weaknesses'):
            prompt += "\nCONTENT QUALITY FIXES:\n"
            for w in score_suggestions['content_quality']['weaknesses']:
                prompt += f"  • {w}\n"
        
        # Missing sections
        if score_suggestions.get('completeness', {}).get('missing_sections'):
            prompt += "\nMISSING SECTIONS TO ADD/IMPROVE:\n"
            for m in score_suggestions['completeness']['missing_sections']:
                prompt += f"  • {m}\n"
        
        # Needs quantification
        if score_suggestions.get('impact_score', {}).get('needs_quantification'):
            prompt += "\nCLAIMS THAT NEED NUMBERS/METRICS:\n"
            for n in score_suggestions['impact_score']['needs_quantification']:
                prompt += f"  • {n}\n"
        
        prompt += "\nDo NOT mention the scoring analysis in the resume output. Just silently apply all improvements.\n"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Clean up potential markdown code block wrappers
        if content.startswith('```'):
            lines = content.split('\n')
            # Remove first line (```json or ```)
            lines = lines[1:]
            # Remove last line if it's ```
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]
            content = '\n'.join(lines)
        content = content.strip()
        
        result = json.loads(content)
        result['template'] = template
        
        # Ensure all expected fields exist
        result.setdefault('full_name', full_name)
        result.setdefault('email', email)
        result.setdefault('phone', phone)
        result.setdefault('location', location)
        result.setdefault('linkedin', linkedin)
        result.setdefault('professional_summary', '')
        result.setdefault('experience', [])
        result.setdefault('education', [])
        result.setdefault('skills', [])
        
        return {
            'success': True,
            'resume': result,
            'usage': {
                'prompt_tokens': response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens': response.usage.total_tokens
            }
        }
        
    except json.JSONDecodeError as e:
        # Try to extract JSON from the response
        try:
            start = content.index('{')
            end = content.rindex('}') + 1
            result = json.loads(content[start:end])
            result['template'] = template
            return {'success': True, 'resume': result}
        except (ValueError, json.JSONDecodeError):
            return {'success': False, 'error': f'Failed to parse AI response: {str(e)}', 'raw': content[:500]}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}


def generate_cover_letter(user_data):
    """Generate an AI cover letter based on resume data."""
    
    personal = user_data.get('personal_info', {})
    target = user_data.get('target', {})
    experience = user_data.get('experience', [])
    skills = user_data.get('skills', [])
    
    prompt = f"""Write a compelling cover letter for a {target.get('job_title', 'position')} role in {target.get('industry', 'the industry')}.

The applicant's key experience includes:
{json.dumps(experience, indent=2)}

Key skills: {', '.join(skills)}

Write a professional, engaging cover letter that connects their experience to the target role. Keep it under 300 words. Return ONLY the cover letter text, no JSON formatting."""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert cover letter writer. Write professional, engaging cover letters."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        return {
            'success': True,
            'cover_letter': response.choices[0].message.content.strip()
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
