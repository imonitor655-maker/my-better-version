import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))

SYSTEM_PROMPT = """You are an expert resume writer and career coach. You craft compelling, ATS-optimized resumes that highlight a candidate's strengths and achievements. 

Rules:
- Use strong action verbs (Led, Developed, Implemented, Achieved)
- Quantify achievements where possible (numbers, percentages, dollar amounts)
- Keep bullet points concise (1-2 lines max)
- Tailor content to the target job title/industry
- Include relevant keywords for ATS systems
- Format output as structured JSON
- Do NOT invent fake experiences, skills, or education — only use what the user provided"""

PLAN_LIMITS = {
    'free': {'max_resumes': 1, 'templates': ['modern'], 'cover_letter': False},
    'pro': {'max_resumes': 999, 'templates': ['modern', 'classic', 'minimal'], 'cover_letter': True},
    'lifetime': {'max_resumes': 999, 'templates': ['modern', 'classic', 'minimal'], 'cover_letter': True},
}

USER_PROMPT = """Create a professional resume based on the following information. Return ONLY valid JSON with this exact structure:

{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "professional_summary": "string - 3-4 powerful sentences",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "dates": "string",
      "bullets": ["string - achievement-focused bullet points"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "dates": "string",
      "gpa": "string or null"
    }
  ],
  "skills": ["string - relevant technical and soft skills"],
  "template": "modern|classic|minimal"
}

Target Job: {target_title}
Target Industry: {target_industry}
Years of Experience: {years_experience}

User's Information:
{user_data}"""


def generate_resume(user_data):
    """Generate an AI-optimized resume from user input."""
    
    plan = user_data.get('plan', 'free')
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    template = user_data.get('template', 'modern')
    
    if template not in limits['templates']:
        template = limits['templates'][0]
    
    # Build the user data string from the form input
    data_str = json.dumps(user_data, indent=2)
    
    prompt = USER_PROMPT.format(
        target_title=user_data.get('target_title', 'Not specified'),
        target_industry=user_data.get('target_industry', 'Not specified'),
        years_experience=user_data.get('years_experience', 'Not specified'),
        user_data=data_str
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Clean up potential markdown code block wrappers
        if content.startswith('```'):
            content = content.split('\n', 1)[1] if '\n' in content else content[3:]
        if content.endswith('```'):
            content = content[:-3]
        if content.startswith('json'):
            content = content[4:]
        content = content.strip()
        
        result = json.loads(content)
        result['template'] = template
        
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
            return {'success': False, 'error': f'Failed to parse AI response: {str(e)}'}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}


def generate_cover_letter(user_data):
    """Generate an AI cover letter based on resume data."""
    
    prompt = f"""Write a compelling cover letter for a {user_data.get('target_title', 'position')} role in {user_data.get('target_industry', 'the industry')}.

The applicant's key experience includes:
{json.dumps(user_data.get('experience', []), indent=2)}

Key skills: {', '.join(user_data.get('skills', []))}

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
