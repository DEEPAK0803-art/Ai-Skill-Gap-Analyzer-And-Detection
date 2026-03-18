import os
import google.generativeai as genai  # pyre-ignore
import time

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

working_models = []
models_to_test = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro",
    "gemini-pro-latest",
    "gemini-2.0-flash-lite-preview",
    "gemma-3-27b-it"
]

for m_name in models_to_test:
    print(f"Testing {m_name}...")
    try:
        model = genai.GenerativeModel(m_name)
        response = model.generate_content("Hi", generation_config={"max_output_tokens": 10})
        print(f"  - SUCCESS: {response.text}")
        working_models.append(m_name)
        break # Found one!
    except Exception as e:
        print(f"  - FAILED: {str(e)[:100]}")  # type: ignore
    time.sleep(1)

if working_models:
    print(f"\nFinal Working Model: {working_models[0]}")
else:
    print("\nNo working models found in the test list.")
