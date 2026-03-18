import requests  # pyre-ignore
import json

url = 'http://127.0.0.1:5000/analyze'

# Test Weak Resume
files_weak = {'resume': open('weak_resume.docx', 'rb')}
data_weak = {'role': 'jr001'} # Data Scientist
response_weak = requests.post(url, files=files_weak, data=data_weak)
print("=== Weak Resume (Data Scientist) ===")
print(json.dumps(response_weak.json(), indent=2))

# Test Strong Resume
files_strong = {'resume': open('strong_resume.docx', 'rb')}
data_strong = {'role': 'jr003'} # Machine Learning Engineer
response_strong = requests.post(url, files=files_strong, data=data_strong)
print("\n=== Strong Resume (AI Engineer) ===")
print(json.dumps(response_strong.json(), indent=2))
