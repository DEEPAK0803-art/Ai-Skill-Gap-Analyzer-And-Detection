import os
import google.generativeai as genai  # pyre-ignore

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Hello")
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Error with 1.5-flash: {e}")

try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Hello")
    print(f"Success with 2.0-flash: {response.text}")
except Exception as e:
    print(f"Error with 2.0-flash: {e}")
