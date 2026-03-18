import json
import re
import os
from pdfminer.high_level import extract_text  # pyre-ignore
import docx  # pyre-ignore
from groq import Groq  # pyre-ignore

def load_skill_database():
    with open('database.json', 'r') as f:
        return json.load(f)

def save_database(db):
    with open('database.json', 'w') as f:
        json.dump(db, f, indent=4)

def extract_text_from_file(filepath):
    if filepath.endswith('.pdf'):
        return extract_text(filepath)
    elif filepath.endswith('.docx'):
        doc = docx.Document(filepath)
        return '\n'.join([para.text for para in doc.paragraphs])
    return ""

def extract_skills(text, target_role_id):
    """Extract skills from resume text that match a specific role's required skills."""
    db = load_skill_database()
    role_data = next((r for r in db.get("job_roles", []) if r["id"] == target_role_id), None)
    if not role_data:
        return []
        
    required_skills = role_data.get('required_skills', [])
    found_skills = []
    
    text_lower = text.lower()
    
    for req in required_skills:
        skill_id = req.get('skill_id')
        skill_obj = next((s for s in db.get("skills", []) if s["id"] == skill_id), None)
        if not skill_obj: continue
        skill_name = skill_obj.get("name")
        
        pattern = r'\b' + re.escape(skill_name.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill_name)
            
    return found_skills

def extract_all_skills(text):
    """Extract ALL known skills from resume text across every role in the DB."""
    db = load_skill_database()
    all_skills = db.get("skills", [])
    found_skills = []
    text_lower = text.lower()

    for skill_obj in all_skills:
        skill_name = skill_obj.get("name", "")
        pattern = r'\b' + re.escape(skill_name.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill_name)

    return list(set(found_skills))

def detect_careers(filepath):
    """
    1. Extract all skills from the resume.
    2. Ask Gemini to suggest the top 3 career roles.
    3. Run full analyze_resume() for each detected role.
    4. Return enriched list of career matches.
    """
    text = extract_text_from_file(filepath)
    extracted_skills = extract_all_skills(text)

    if not extracted_skills:
        return {"error": "No recognizable technical skills found in the resume."}

    skills_str = ", ".join(extracted_skills)

    prompt = f"""You are a career advisor AI.

Based on the following resume skills, suggest the top 3 most suitable tech career roles.

Resume Skills:
{skills_str}

Choose ONLY from these roles (use the exact names):
Data Scientist
Machine Learning Engineer
Data Analyst
Full Stack Developer
Backend Developer
Frontend Developer
Software Engineer
Cloud Solutions Architect
DevOps Engineer
Cybersecurity Analyst
Ethical Hacker
UI/UX Designer

Return the result in EXACTLY this format (no extra text before or after):

1. Career Role
Reason: <one sentence reason>
Missing: <comma-separated key missing skills>

2. Career Role
Reason: <one sentence reason>
Missing: <comma-separated key missing skills>

3. Career Role
Reason: <one sentence reason>
Missing: <comma-separated key missing skills>"""

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
        )
        raw = completion.choices[0].message.content.strip()
    except Exception as e:
        return {"error": f"Groq API error: {str(e)}"}

    # Parse Gemini response
    db = load_skill_database()
    role_title_map = {r["title"].lower(): r for r in db.get("job_roles", [])}

    career_matches = []
    # Split on numbered lines
    blocks = re.split(r'\n(?=\d+\.)', raw.strip())

    for block in blocks:
        lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
        if not lines:
            continue

        # First line: "1. Role Name"
        first_line = lines[0]
        title_match = re.match(r'^\d+\.\s*(.+)$', first_line)
        if not title_match:
            continue
        role_type_title = title_match.group(1).strip()

        reason = ""
        missing_hint = ""
        other_lines = lines[1:]  # type: ignore
        for line in other_lines:
            line_lower = line.lower()
            if line_lower.startswith("reason:"):
                reason = line[len("reason:"):].strip()
            elif line_lower.startswith("missing:"):
                missing_hint = line[len("missing:"):].strip()

        # Match to DB role
        role_data = role_title_map.get(role_type_title.lower())  # type: ignore
        if not role_data:
            # Fuzzy search
            for key, val in role_title_map.items():
                if role_type_title.lower() in key or key in role_type_title.lower():  # type: ignore
                    role_data = val
                    role_type_title = val["title"]
                    break

        if not role_data:
            continue

        role_id = role_data["id"]

        # Run full gap analysis
        gap_result = analyze_resume(filepath, role_id)

        career_matches.append({
            "role_title": role_type_title,
            "role_id": role_id,
            "ai_reason": reason,
            "ai_missing_hint": missing_hint,
            "readiness_score": gap_result.get("readiness_score", 0),
            "extracted_skills": gap_result.get("extracted_skills", []),
            "skill_gaps": gap_result.get("skill_gaps", []),
            "estimated_time_to_ready_weeks": gap_result.get("estimated_time_to_ready_weeks", 0),
            "recommendations": gap_result.get("recommendations", {}),
        })

    if not career_matches:
        return {"error": "Could not parse career suggestions from Gemini response."}

    return {
        "extracted_skills": extracted_skills,
        "career_matches": career_matches
    }

def analyze_resume(filepath, target_role_id):
    db = load_skill_database()
    role_data = next((r for r in db.get("job_roles", []) if r["id"] == target_role_id), None)
    if not role_data:
        return {"error": "Invalid target role"}
        
    required_skills = role_data.get('required_skills', [])
    
    text = extract_text_from_file(filepath)
    user_skills = extract_skills(text, target_role_id)
    
    # Calculate Gaps and Readiness Score
    user_skills_lower = [s.lower() for s in user_skills]
    skill_gaps = []
    missing_skill_ids = []
    total_weight = 0
    earned_weight = 0
    estimated_weeks = 0
    
    for req in required_skills:
        skill_id = req.get('skill_id')
        skill_obj = next((s for s in db.get("skills", []) if s["id"] == skill_id), None)
        if not skill_obj: continue
        skill_name = skill_obj.get("name")
        
        weight = req.get('weight', 1.0)
        total_weight += weight
        
        if skill_name.lower() not in user_skills_lower:
            missing_skill_ids.append(skill_id)
            
            # Determine priority and weeks based on weight
            if weight >= 0.85:
                priority = "high"
                weeks = 6
            elif weight >= 0.65:
                priority = "medium"
                weeks = 4
            else:
                priority = "low"
                weeks = 2
                
            estimated_weeks += weeks
                
            skill_gaps.append({
                "skill_name": skill_name,
                "priority": priority,
                "weeks_to_master": weeks
            })
        else:
            earned_weight += weight
            
    readiness_score = int((earned_weight / total_weight) * 100) if total_weight > 0 else 0
    
    # Generate content-based recommendations from courses and assessments covering missing skills
    rec_courses = []
    for course in db.get('courses', []):
        if any(sid in missing_skill_ids for sid in course.get('skills_covered', [])):
            rec_courses.append(course.get('title'))
            
    rec_assessments = []
    for assessment in db.get('assessments', []):
        if assessment.get('skill_id') in missing_skill_ids:
            rec_assessments.append(assessment.get('title'))
            
    # Deduplicate
    rec_courses = list(set(rec_courses))
    rec_assessments = list(set(rec_assessments))
    
    # Grab role-specific static recommendations if there are missing skills
    rec_certs = role_data.get('certifications', []) if missing_skill_ids else []
    rec_projects = role_data.get('projects', []) if missing_skill_ids else []
    rec_internships = role_data.get('internships', []) if missing_skill_ids else []
    
    return {
        "extracted_skills": user_skills,
        "skill_gaps": skill_gaps,
        "readiness_score": readiness_score,
        "total_required": len(required_skills),
        "estimated_time_to_ready_weeks": estimated_weeks,
        "recommendations": {
            "courses": rec_courses,
            "assessments": rec_assessments,
            "certifications": rec_certs,
            "projects": rec_projects,
            "internships": rec_internships
        }
    }
