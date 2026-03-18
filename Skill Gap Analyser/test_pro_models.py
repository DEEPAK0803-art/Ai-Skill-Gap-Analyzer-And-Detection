import os
import google.generativeai as genai  # pyre-ignore

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    model = genai.GenerativeModel("gemini-pro-latest")
    response = model.generate_content("Hello")
    print(f"Success with pro-latest: {response.text}")
except Exception as e:
    print(f"Error with pro-latest: {e}")

try:
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content("Hello")
    print(f"Success with 1.5-pro: {response.text}")
except Exception as e:
    print(f"Error with 1.5-pro: {e}")
