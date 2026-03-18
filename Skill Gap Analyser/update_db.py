import json
import uuid

# Load existing DB
with open('database.json', 'r') as f:
    db = json.load(f)

raw_roles = {
    "Data Scientist": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "NumPy", "Data Visualization", "Deep Learning", "TensorFlow", "PyTorch"],
    "Machine Learning Engineer": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Model Deployment", "Data Engineering", "Scikit-learn", "Git"],
    "Data Analyst": ["SQL", "Excel", "Python", "Data Visualization", "Power BI", "Tableau", "Statistics", "Data Cleaning", "Pandas"],
    "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "Git", "REST API"],
    "Backend Developer": ["Python", "Java", "Node.js", "REST APIs", "Databases", "SQL", "Authentication", "Microservices", "Git"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Responsive Design", "UI Frameworks", "Git"],
    "Software Engineer": ["Data Structures", "Algorithms", "Java", "Python", "C++", "Object Oriented Programming", "Git", "System Design", "Databases"],
    "Cloud Solutions Architect": ["AWS", "Azure", "Google Cloud", "Cloud Architecture", "Networking", "Docker", "Kubernetes", "Infrastructure as Code", "Security"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", "Cloud Platforms", "Infrastructure Automation"],
    "Cybersecurity Analyst": ["Networking", "Linux", "Security Tools", "Penetration Testing", "Cryptography", "Risk Assessment", "Incident Response"],
    "Ethical Hacker": ["Networking", "Linux", "Penetration Testing", "Vulnerability Assessment", "Burp Suite", "Metasploit", "Python", "Cybersecurity Fundamentals"],
    "UI/UX Designer": ["UI Design", "UX Research", "Wireframing", "Figma", "Adobe XD", "Prototyping", "User Testing", "Design Systems"]
}

# Standard recommendation mappings to append based on missing skills (approximated based on role)
role_recs = {
    "Data Scientist": {
        "certifications": ["IBM Data Science Professional Certificate", "Google Data Analytics Certificate"],
        "projects": ["House Price Prediction Model", "Customer Segmentation using K-Means"],
        "internships": ["Data Science Intern at TechCorp", "Machine Learning Intern at AI Startup"]
    },
    "Machine Learning Engineer": {
        "certifications": ["AWS Certified Machine Learning", "DeepLearning.AI TensorFlow Developer"],
        "projects": ["Deploy an Image Classifier on AWS", "Real-time Fraud Detection Pipeline"],
        "internships": ["ML Engineering Intern", "AI Engineer Intern"]
    },
    "Data Analyst": {
        "certifications": ["Google Data Analytics Professional", "Microsoft Certified: Power BI Data Analyst"],
        "projects": ["Sales Dashboard in Power BI", "A/B Testing Analysis"],
        "internships": ["Data Analyst Intern", "Business Intelligence Intern"]
    },
    "Full Stack Developer": {
        "certifications": ["Meta Front-End Developer", "IBM Full Stack Software Developer"],
        "projects": ["E-commerce MERN App", "Task Management REST API"],
        "internships": ["Full Stack Web Developer Intern", "Software Developer Intern"]
    },
    "Backend Developer": {
        "certifications": ["AWS Certified Developer", "Node.js Application Developer"],
        "projects": ["Microservices URL Shortener", "JWT Authentication Service"],
        "internships": ["Backend Engineer Intern", "API Developer Intern"]
    },
    "Frontend Developer": {
        "certifications": ["Meta Front-End Developer", "FreeCodeCamp Responsive Web Design"],
        "projects": ["React Portfolio Website", "Weather App with API Integration"],
        "internships": ["Frontend Developer Intern", "UI Developer Intern"]
    },
    "Software Engineer": {
        "certifications": ["Google IT Automation with Python", "Oracle Certified Professional Java SE"],
        "projects": ["Inventory Management System", "Custom CLI tool in C++"],
        "internships": ["Software Engineering Intern", "SDE Intern"]
    },
    "Cloud Solutions Architect": {
        "certifications": ["AWS Certified Solutions Architect", "Microsoft Certified: Azure Solutions Architect"],
        "projects": ["Serverless Web Application", "Automated Infrastructure with Terraform"],
        "internships": ["Cloud Architect Intern", "Cloud Engineering Intern"]
    },
    "DevOps Engineer": {
        "certifications": ["Certified Kubernetes Administrator", "AWS Certified DevOps Engineer"],
        "projects": ["CI/CD Pipeline with Jenkins & Docker", "Automated Server Provisioning"],
        "internships": ["DevOps Intern", "Site Reliability Engineer Intern"]
    },
    "Cybersecurity Analyst": {
        "certifications": ["CompTIA Security+", "Certified Ethical Hacker (CEH)"],
        "projects": ["Network Traffic Analyzer", "Simulated Vulnerability Scan"],
        "internships": ["Cybersecurity Intern", "Information Security Intern"]
    },
    "Ethical Hacker": {
        "certifications": ["Offensive Security Certified Professional (OSCP)", "CompTIA PenTest+"],
        "projects": ["Web App Penetration Test Report", "Custom Buffer Overflow Exploit"],
        "internships": ["Penetration Testing Intern", "Security Researcher Intern"]
    },
    "UI/UX Designer": {
        "certifications": ["Google UX Design Professional Certificate", "CalArts UI/UX Design Specialization"],
        "projects": ["Mobile App Wireframes & Prototype", "Website Redesign & User Testing"],
        "internships": ["UI/UX Design Intern", "Product Design Intern"]
    }
}


existing_skills_dict = {s['name'].lower(): s for s in db['skills']}
new_job_roles = []
skill_id_counter = int(len(db['skills']) + 1)
role_id_counter = int(1)
for role_name, skills in raw_roles.items():
    required_skills = []
    
    for skill_name in skills:
        key = skill_name.lower()
        if key not in existing_skills_dict:
            new_skill = {
                "id": f"sk{skill_id_counter:03d}",
                "name": skill_name,
                "category": "technical",
                "description": f"Proficiency in {skill_name}",
                "related_skills": [],
                "difficulty_levels": { "beginner": "0-30", "intermediate": "31-70", "advanced": "71-100" }
            }
            db.setdefault('skills', []).append(new_skill)
            existing_skills_dict[key] = new_skill
            skill_id_counter = skill_id_counter + 1  # type: ignore
            
        target_skill = existing_skills_dict.get(key)
        if target_skill:
            skill_id = target_skill['id']
            required_skills.append({
                "skill_id": skill_id,
                "min_level": 70, # default
                "weight": 1.0 # default
            })
        
    new_job_roles.append({
        "id": f"jr{role_id_counter:03d}",
        "title": role_name,
        "industry": "Technology",
        "description": f"Professional role specializing in {role_name}.",
        "required_skills": required_skills,
        "avg_salary_inr": 1000000,
        "growth_rate": "20% by 2030",
        "trending": True,
        # Append extra standard recommendations as requested
        "certifications": role_recs.get(role_name, {}).get("certifications", []),
        "projects": role_recs.get(role_name, {}).get("projects", []),
        "internships": role_recs.get(role_name, {}).get("internships", [])
    })
    role_id_counter = role_id_counter + 1  # type: ignore
    
db['job_roles'] = new_job_roles

with open('database.json', 'w') as f:
    json.dump(db, f, indent=4)
    
print("Updated database.json successfully with 12 roles and all required skills!")
