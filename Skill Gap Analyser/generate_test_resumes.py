import docx  # pyre-ignore

def create_resume(filename, text):
    doc = docx.Document()
    doc.add_paragraph(text)
    doc.save(filename)

# Weak Resume for Data Scientist (Only knows Python, completely missing ML, Stats, SQL, Deep Learning, Pandas, NumPy)
weak_text = "Experienced professional. I know some basic Python. I am a team player and have good communication skills."
create_resume('weak_resume.docx', weak_text)

# Strong Resume for AI Engineer
strong_text = "AI Engineer with 5 years of experience. Expert in Python, Machine Learning, Deep Learning, TensorFlow, and PyTorch. Built advanced Computer Vision and NLP models using Neural Networks."
create_resume('strong_resume.docx', strong_text)

print("Test resumes generated.")
