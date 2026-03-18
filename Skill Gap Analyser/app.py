from flask import Flask, render_template, request, jsonify, session, redirect, url_for  # pyre-ignore
from dotenv import load_dotenv  # pyre-ignore
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename  # pyre-ignore
from analyzer import analyze_resume, load_skill_database, save_database, detect_careers  # pyre-ignore
from groq import Groq  # pyre-ignore

load_dotenv()

app = Flask(__name__)
app.secret_key = 'super_secret_skill_analyzer_key'

# Configure Groq
_groq_key = os.getenv("GROQ_API_KEY")
if not _groq_key:
    raise ValueError("Groq API key is missing. Please set GROQ_API_KEY in the .env file.")
client = Groq(api_key=_groq_key)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ─────────────────────────────────────────────
# Home
# ─────────────────────────────────────────────
@app.route('/', methods=['GET'])
def index():
    db = load_skill_database()
    roles = db.get("job_roles", [])
    return render_template('index.html', roles=roles)

# ─────────────────────────────────────────────
# Skill Gap Analysis (existing)
# ─────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['resume']
    target_role_id = request.form.get('role')
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not target_role_id:
        return jsonify({"error": "Target role not provided"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            results = analyze_resume(filepath, target_role_id)
            os.remove(filepath)
            
            if "error" in results:
                return jsonify(results), 400
                
            db = load_skill_database()
            role = next((r for r in db.get("job_roles", []) if r["id"] == target_role_id), None)
            target_role_title = role["title"] if role else target_role_id
            
            # Save the report if logged in
            if 'user_id' in session:
                user_id = session['user_id']
                
                new_report_id = "sgr_" + uuid.uuid4().hex[:8]
                gap_analysis = []
                for gap in results.get("skill_gaps", []):
                    gap_analysis.append({
                        "skill_name": gap.get("skill_name"),
                        "priority": gap.get("priority"),
                        "weeks_to_master": gap.get("weeks_to_master")
                    })
                    
                new_report = {
                    "id": new_report_id,
                    "user_id": user_id,
                    "target_role_id": target_role_id,
                    "generated_at": datetime.utcnow().isoformat() + "Z",
                    "overall_readiness_score": results.get("readiness_score"),
                    "estimated_time_to_ready_weeks": results.get("estimated_time_to_ready_weeks"),
                    "gap_analysis": gap_analysis
                }
                
                if "skill_gap_reports" not in db:
                    db["skill_gap_reports"] = []
                db["skill_gap_reports"].append(new_report)
                
                if "recommendations" not in db:
                    db["recommendations"] = []
                    
                for course in results.get("recommendations", {}).get("courses", []):
                    db["recommendations"].append({
                        "id": "rec_" + uuid.uuid4().hex[:8],
                        "user_id": user_id,
                        "type": "course",
                        "reference_id": course,
                        "reason": "Recommended based on skill gap analysis.",
                        "score": 0.9,
                        "created_at": datetime.utcnow().isoformat() + "Z"
                    })
                    
                save_database(db)
                
            return jsonify({
                "target_role": target_role_title,
                "data": results
            })
            
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"error": "Invalid file format. Only PDF and DOCX are allowed."}), 400

# ─────────────────────────────────────────────
# Results page (Skill Gap Analysis)
# ─────────────────────────────────────────────
@app.route('/results', methods=['GET'])
def results():
    return render_template('results.html', session=session)

# ─────────────────────────────────────────────
# Career Detection — API endpoint
# ─────────────────────────────────────────────
@app.route('/detect_career', methods=['POST'])
def detect_career():
    if 'resume' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not (file and allowed_file(file.filename)):
        return jsonify({"error": "Invalid file format. Only PDF and DOCX are allowed."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        result = detect_careers(filepath)
    except Exception as e:
        result = {"error": str(e)}
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)

# ─────────────────────────────────────────────
# Career Detection — Results page
# ─────────────────────────────────────────────
@app.route('/career-detection', methods=['GET'])
def career_detection():
    return render_template('career_detection.html', session=session)

# ─────────────────────────────────────────────
# AI Chatbot endpoint
# ─────────────────────────────────────────────
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    user_message = data.get("user_message", "").strip()
    target_role = data.get("target_role", "Unknown")
    detected_skills = data.get("detected_skills", [])
    missing_skills = data.get("missing_skills", [])

    if not user_message:
        return jsonify({"error": "user_message is required"}), 400

    detected_str = ", ".join(detected_skills) if detected_skills else "None detected"
    missing_str = ", ".join(missing_skills) if missing_skills else "None"

    system_prompt = f"""You are an AI Career Mentor helping a student improve their career readiness.

Target Career Role:
{target_role}

Detected Skills from Resume:
{detected_str}

Missing Skills:
{missing_str}

Answer the user's question with clear and personalized career advice, learning resources, project ideas, and guidance based on this analysis. Keep responses concise (3-5 sentences max) and actionable."""

    full_prompt = f"{system_prompt}\n\nUser: {user_message}\nMentor:"

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
        )
        reply = completion.choices[0].message.content.strip()
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": f"Groq API error: {str(e)}"}), 500

from werkzeug.security import generate_password_hash, check_password_hash  # pyre-ignore

# ─────────────────────────────────────────────
# Auth + Dashboard
# ─────────────────────────────────────────────
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        db = load_skill_database()
        users = db.get("users", [])
        
        user = next((u for u in users if u.get("email") == email), None)
        if user and check_password_hash(user.get("password_hash", ""), password):
            session['user_id'] = user["id"]
            session['user_name'] = user["name"]
            session['user_role'] = user["role"]
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error="Invalid email or password", session=session)
            
    return render_template('login.html', session=session)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role', 'student')
        
        if not name or not email or not password:
            return render_template('register.html', error="All fields are required", session=session)
            
        db = load_skill_database()
        if "users" not in db:
            db["users"] = []
            
        if any(u.get("email") == email for u in db["users"]):
            return render_template('register.html', error="Email already registered", session=session)
            
        user_id = "usr_" + uuid.uuid4().hex[:8]
        new_user = {
            "id": user_id,
            "name": name,
            "email": email,
            "password_hash": generate_password_hash(password),
            "role": role,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "skill_scores": []
        }
        
        db["users"].append(new_user)
        save_database(db)
        
        session['user_id'] = user_id
        session['user_name'] = name
        session['user_role'] = role
        return redirect(url_for('dashboard'))
        
    return render_template('register.html', session=session)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    db = load_skill_database()
    user_id = session['user_id']
    
    reports = [r for r in db.get("skill_gap_reports", []) if r["user_id"] == user_id]
    reports.sort(key=lambda x: x.get("generated_at", ""), reverse=True)
    
    for r in reports:
        role = next((jr for jr in db.get("job_roles", []) if jr["id"] == r["target_role_id"]), None)
        r["target_role_title"] = role["title"] if role else r["target_role_id"]
        
    return render_template('dashboard.html', reports=reports, session=session)

#if __name__ == '__main__':
#    app.run(debug=True)

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
