import requests
import os
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Endpoint to list available models
url = "https://generativelanguage.googleapis.com/v1beta/models"
headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": api_key
}

response = requests.get(url, headers=headers)

print(response.status_code)
print(response.json())
