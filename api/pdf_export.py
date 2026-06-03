import os
import json
import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER


# Color palettes per template
TEMPLATES = {
    'modern': {
        'primary': HexColor('#6c5ce7'),
        'secondary': HexColor('#a29bfe'),
        'text': HexColor('#2d3436'),
        'light': HexColor('#636e72'),
        'bg_accent': HexColor('#f8f9fa'),
    },
    'classic': {
        'primary': HexColor('#2d3436'),
        'secondary': HexColor('#636e72'),
        'text': HexColor('#2d3436'),
        'light': HexColor('#636e72'),
        'bg_accent': HexColor('#f5f5f5'),
    },
    'minimal': {
        'primary': HexColor('#333333'),
        'secondary': HexColor('#666666'),
        'text': HexColor('#333333'),
        'light': HexColor('#999999'),
        'bg_accent': HexColor('#fafafa'),
    },
}


def create_pdf(resume_data):
    """Generate a professional PDF resume. Returns path to the file."""
    
    template_name = resume_data.get('template', 'modern')
    colors = TEMPLATES.get(template_name, TEMPLATES['modern'])
    
    # Create temp file
    tmp = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
    tmp_path = tmp.name
    tmp.close()
    
    doc = SimpleDocTemplate(
        tmp_path,
        pagesize=letter,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    name_style = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontSize=24,
        leading=28,
        textColor=colors['primary'],
        spaceAfter=2,
        fontName='Helvetica-Bold',
    )
    
    contact_style = ParagraphStyle(
        'ContactInfo',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors['light'],
        spaceAfter=12,
    )
    
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontSize=13,
        leading=16,
        textColor=colors['primary'],
        spaceBefore=14,
        spaceAfter=6,
        fontName='Helvetica-Bold',
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        textColor=colors['text'],
        spaceAfter=2,
        fontName='Helvetica-Bold',
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        leading=13,
        textColor=colors['light'],
        spaceAfter=1,
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontSize=10,
        leading=13,
        textColor=colors['light'],
        leftIndent=15,
        bulletIndent=0,
        spaceAfter=2,
    )
    
    skill_style = ParagraphStyle(
        'Skill',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors['text'],
    )
    
    story = []
    
    # ── Name ──
    full_name = resume_data.get('full_name', 'Your Name')
    story.append(Paragraph(full_name, name_style))
    
    # ── Contact Info ──
    contact_parts = []
    if resume_data.get('email'):
        contact_parts.append(resume_data['email'])
    if resume_data.get('phone'):
        contact_parts.append(resume_data['phone'])
    if resume_data.get('location'):
        contact_parts.append(resume_data['location'])
    if resume_data.get('linkedin'):
        contact_parts.append(resume_data['linkedin'])
    story.append(Paragraph('  •  '.join(contact_parts), contact_style))
    
    # ── Professional Summary ──
    summary = resume_data.get('professional_summary', '')
    if summary:
        story.append(Paragraph('PROFESSIONAL SUMMARY', section_title_style))
        story.append(Paragraph(summary, body_style))
    
    # ── Experience ──
    experience = resume_data.get('experience', [])
    if experience:
        story.append(Paragraph('EXPERIENCE', section_title_style))
        for exp in experience:
            header_text = f"<b>{exp.get('title', '')}</b>"
            if exp.get('company'):
                header_text += f" — {exp.get('company', '')}"
            story.append(Paragraph(header_text, heading_style))
            if exp.get('dates'):
                story.append(Paragraph(exp['dates'], ParagraphStyle(
                    'Date', parent=body_style, fontSize=9, textColor=colors['light']
                )))
            bullets = exp.get('bullets', [])
            for bullet in bullets:
                story.append(Paragraph(f"• {bullet}", bullet_style))
    
    # ── Education ──
    education = resume_data.get('education', [])
    if education:
        story.append(Paragraph('EDUCATION', section_title_style))
        for edu in education:
            header_text = f"<b>{edu.get('degree', '')}</b>"
            if edu.get('school'):
                header_text += f" — {edu.get('school', '')}"
            story.append(Paragraph(header_text, heading_style))
            parts = []
            if edu.get('dates'):
                parts.append(edu['dates'])
            if edu.get('gpa'):
                parts.append(f"GPA: {edu['gpa']}")
            if parts:
                story.append(Paragraph(' | '.join(parts), ParagraphStyle(
                    'EduDetail', parent=body_style, fontSize=9, textColor=colors['light']
                )))
    
    # ── Skills ──
    skills = resume_data.get('skills', [])
    if skills:
        story.append(Paragraph('SKILLS', section_title_style))
        story.append(Paragraph('  •  '.join(skills), skill_style))
    
    doc.build(story)
    return tmp_path
