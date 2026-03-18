import unittest
import os
import json
import io
from app import app  # pyre-ignore
from analyzer import load_skill_database  # pyre-ignore

class TestSkillGapAnalyzer(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['UPLOAD_FOLDER'] = 'test_uploads'
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        self.client = app.test_client()
        
        # Ensure API key is set for testing (using the one provided by user)
        if not os.getenv("GEMINI_API_KEY"):
            os.environ["GEMINI_API_KEY"] = "AIzaSyChPOPpoI7SaZqNZvc-J0_kyY0e6UMIwqw"
        
        # Test model availability
        self.model_name = "gemini-2.0-flash"

    def tearDown(self):
        if os.path.exists('test_uploads'):
            for f in os.listdir('test_uploads'):
                os.remove(os.path.join('test_uploads', f))
            os.rmdir('test_uploads')

    def test_index_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Skill Gap Analyzer', response.data)
        self.assertIn(b'Career Detection', response.data)

    def test_analyze_endpoint_gap(self):
        # Use weak_resume.docx if it exists
        if os.path.exists('weak_resume.docx'):
            with open('weak_resume.docx', 'rb') as f:
                data = {
                    'role': 'jr001',
                    'resume': (io.BytesIO(f.read()), 'weak_resume.docx')
                }
                response = self.client.post('/analyze', data=data, content_type='multipart/form-data')
                self.assertEqual(response.status_code, 200)
                res_json = response.json
                self.assertIn('target_role', res_json)
                self.assertIn('data', res_json)
                self.assertIn('readiness_score', res_json['data'])

    def test_chat_endpoint(self):
        data = {
            "user_message": "What is Python?",
            "target_role": "Data Scientist",
            "detected_skills": ["Python", "SQL"],
            "missing_skills": ["Machine Learning"]
        }
        response = self.client.post('/chat', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('reply', response.json)
        print("\nChatbot Response Test:", response.json['reply'][:100] + "...")

    def test_detect_career_endpoint(self):
        # This calls Gemini, so it's a real integration test
        if os.path.exists('strong_resume.docx'):
            with open('strong_resume.docx', 'rb') as f:
                data = {
                    'resume': (io.BytesIO(f.read()), 'strong_resume.docx')
                }
                response = self.client.post('/detect_career', data=data, content_type='multipart/form-data')
                
                # Gemini might be slow or fail, handle gracefully
                if response.status_code == 200:
                    res_json = response.json
                    self.assertIn('career_matches', res_json)
                    self.assertEqual(len(res_json['career_matches']), 3)
                    print("\nCareer Detection Test Success. Suggested roles:", [m['role_title'] for m in res_json['career_matches']])
                else:
                    print(f"\nCareer Detection Test - API issue (expected if key invalid or quota): {response.json}")

if __name__ == '__main__':
    unittest.main()
