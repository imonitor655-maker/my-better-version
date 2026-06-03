"""
Resume Scoring & Vacancy Comparison Engine.

Features:
1. Resume Score — ATS compatibility, completeness, keyword density, formatting
2. Vacancy Match — Compare resume against job description, match score
3. Optimization Walkthrough — Step-by-step suggestions to tailor CV to a vacancy
"""

import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))


SCORE_PROMPT = """You are an expert ATS (Applicant Tracking System) analyst and career coach with 15 years of experience reviewing resumes for Fortune 500 companies.

Score this resume on a 0-100 scale across these dimensions:

Return ONLY valid JSON:
{{
  "overall_score": number (0-100),
  "ats_compatibility": {{
    "score": number (0-100),
    "issues": ["specific ATS issues found"],
    "passes": ["what passed ATS checks"]
  }},
  "content_quality": {{
    "score": number (0-100),
    "strengths": ["what's strong"],
    "weaknesses": ["what needs improvement"]
  }},
  "completeness": {{
    "score": number (0-100),
    "missing_sections": ["sections that are missing or weak"],
    "present_sections": ["sections found and adequate"]
  }},
  "keyword_power": {{
    "score": number (0-100),
    "strong_keywords": ["powerful action verbs and industry terms found"],
    "suggested_keywords": ["keywords that should be added"]
  }},
  "impact_score": {{
    "score": number (0-100),
    "quantified": ["achievements with numbers/metrics"],
    "needs_quantification": ["claims that should have numbers"]
  }},
  "quick_wins": [
    "List 3-5 quick improvements the user can make RIGHT NOW",
    "Be specific — tell them exactly what to change",
    "Example: 'Add a professional summary at the top'",
    "Example: 'Replace passive phrases like \"responsible for\" with action verbs'"
  ]
}}

Resume text:
{resume_text}

Be thorough but constructive. Score honestly — a 90+ is rare. Most resumes score 50-70."""

VACANCY_MATCH_PROMPT = """You are an expert ATS analyst and career coach. Compare this resume against the job vacancy and provide a detailed match analysis.

Return ONLY valid JSON:
{{
  "match_score": number (0-100),
  "ats_pass_probability": number (0-100) — likelihood this resume passes ATS for THIS job,

  "keyword_analysis": {{
    "matching_keywords": ["keywords from vacancy found in resume"],
    "missing_keywords": ["keywords from vacancy NOT in resume — these are critical"],
    "optional_keywords": ["nice-to-have keywords not present"]
  }},

  "experience_match": {{
    "score": number (0-100),
    "aligned_experience": ["experience that matches the role requirements"],
    "gap_analysis": ["requirements where experience is lacking or unclear"]
  }},

  "skills_match": {{
    "score": number (0-100),
    "matched_skills": ["required skills you have"],
    "missing_skills": ["required skills you don't have"],
    "transferable_skills": ["your skills that could cover missing requirements"]
  }},

  "improvement_priority": [
    {{
      "priority": "HIGH|MEDIUM|LOW",
      "category": "keyword|experience|skills|formatting|education",
      "issue": "specific description of what's missing or weak",
      "suggestion": "exact suggestion of what to add/change",
      "example": "concrete example text to add to resume"
    }}
  ],

  "summary": "2-3 sentence overview of how well this resume matches the vacancy"
}}

RESUME:
{resume_text}

JOB VACANCY:
{vacancy_text}

Be extremely thorough. Analyze every requirement in the vacancy against what's in the resume."""

WALKTHROUGH_PROMPT = """You are a senior career coach helping a candidate tailor their resume for a specific job posting. 

Given the resume and the vacancy, create a step-by-step walkthrough of exactly what to change, add, remove, or reorder in the resume to maximize the match score.

Return ONLY valid JSON:
{{
  "current_score": number (0-100) — estimated current match,
  "projected_score": number (0-100) — estimated score after all changes,
  "steps": [
    {{
      "step": 1,
      "title": "Short title for this change",
      "section": "summary|experience|skills|education|formatting",
      "action": "ADD|MODIFY|REMOVE|REORDER",
      "current_content": "current text in this section (or null if adding new)",
      "new_content": "exact replacement text to use — write the actual text",
      "reason": "why this change matters for this specific vacancy",
      "impact": "HIGH|MEDIUM|LOW — how much this improves the match"
    }}
  ],
  "final_summary": "1-2 sentence summary of the transformation",
  "key_phrases_to_use": [
    "Exact phrases from the vacancy that should appear in the resume",
    "These are the ATS trigger words"
  ],
  "power_words": [
    "Action verbs and power words to use throughout"
  ]
}}

RESUME:
{resume_text}

JOB VACANCY:
{vacancy_text}

Provide 5-8 specific, actionable steps. Each step must have EXACT replacement text — no vague suggestions. The user should be able to copy-paste the new_content directly into their resume."""

OPTIMIZE_RESUME_PROMPT = """You are an expert resume writer. Rewrite/optimize the following resume section based on the specific feedback.

Return the improved version as plain text — NOT JSON. Just the improved text.

Original content:
{current_content}

Instructions:
{instruction}

Job context (for keyword optimization):
{vacancy_context}

Rules:
- Keep it truthful — don't invent experience
- Use strong action verbs
- Quantify where possible
- Mirror language from the job posting
- Keep the same length or shorter"""


def score_resume(resume_text):
    """Score a resume across multiple dimensions."""
    
    prompt = SCORE_PROMPT.format(resume_text=resume_text)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert ATS analyst. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1]
        if content.endswith('```'):
            content = content[:-3]
        if content.startswith('json'):
            content = content[4:]
        content = content.strip()
        
        result = json.loads(content)
        return {'success': True, 'score': result}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def compare_vacancy(resume_text, vacancy_text):
    """Compare resume against a job vacancy and return match analysis."""
    
    prompt = VACANCY_MATCH_PROMPT.format(
        resume_text=resume_text,
        vacancy_text=vacancy_text
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert ATS analyst and career coach. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2500
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1]
        if content.endswith('```'):
            content = content[:-3]
        if content.startswith('json'):
            content = content[4:]
        content = content.strip()
        
        result = json.loads(content)
        return {'success': True, 'analysis': result}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def generate_walkthrough(resume_text, vacancy_text):
    """Generate a step-by-step walkthrough to optimize resume for a vacancy."""
    
    prompt = WALKTHROUGH_PROMPT.format(
        resume_text=resume_text,
        vacancy_text=vacancy_text
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior career coach. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=3000
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1]
        if content.endswith('```'):
            content = content[:-3]
        if content.startswith('json'):
            content = content[4:]
        content = content.strip()
        
        result = json.loads(content)
        return {'success': True, 'walkthrough': result}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def optimize_section(current_content, instruction, vacancy_context=""):
    """Optimize a specific resume section based on feedback."""
    
    prompt = OPTIMIZE_RESUME_PROMPT.format(
        current_content=current_content,
        instruction=instruction,
        vacancy_context=vacancy_context or "No specific vacancy context provided."
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume writer. Return plain text only, no JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        return {
            'success': True,
            'optimized': response.choices[0].message.content.strip()
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
