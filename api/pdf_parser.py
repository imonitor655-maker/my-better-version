"""
PDF Resume Parser — Extract structured data from uploaded PDF resumes.

Uses PyMuPDF to extract text, then optionally AI to parse into structured data.
"""

import os
import json
import tempfile
import fitz  # PyMuPDF
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))


def extract_text_from_pdf(file_bytes):
    """Extract raw text from an uploaded PDF file."""
    text = ""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")
    
    if not text.strip():
        raise ValueError("Could not extract any text from this PDF. It may be image-based or corrupted.")
    
    return text.strip()


def parse_resume_pdf(file_bytes):
    """Parse a PDF resume and extract structured data using AI."""
    
    raw_text = extract_text_from_pdf(file_bytes)
    
    prompt = f"""Extract structured resume data from the following resume text. Return ONLY valid JSON.

Return this exact JSON structure:
{{
  "full_name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedin": "string or null",
  "professional_summary": "string or null - existing summary from the resume",
  "experience": [
    {{
      "company": "string",
      "title": "string",
      "dates": "string",
      "description": "string - full description text",
      "bullets": ["string - extracted bullet points"]
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
  "skills": ["string - extracted skills"],
  "raw_text": "the full original text from the PDF"
}}

Resume text:
{raw_text}

Be thorough — extract ALL information present. If a field is not found, use null. Keep raw_text as the complete original text."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a resume parsing expert. Extract structured data from resume text. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
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
        # Always preserve raw text
        result['raw_text'] = raw_text
        
        return {
            'success': True,
            'resume': result,
            'raw_text': raw_text,
        }
        
    except json.JSONDecodeError as e:
        # Return raw text at minimum
        return {
            'success': True,
            'resume': {
                'raw_text': raw_text,
                'skills': [],
                'experience': [],
                'education': [],
            },
            'raw_text': raw_text,
            'parse_warning': 'Could not fully parse resume structure. Text extracted — you can edit manually.'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
