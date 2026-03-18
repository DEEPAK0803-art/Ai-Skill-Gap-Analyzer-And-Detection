import os
import google.generativeai as genai  # pyre-ignore
from dotenv import load_dotenv  # pyre-ignore

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Try GOOGLE_API_KEY as fallback
    api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env or environment.")
    exit(1)

genai.configure(api_key=api_key)

print("Listing models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {str(e)}")
