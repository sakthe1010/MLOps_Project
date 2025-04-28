import json
import os
import time
import random
import yaml
from dotenv import load_dotenv
from google import generativeai as genai
from google.api_core import exceptions as google_exceptions

# --- Load Config from YAML ---
with open('config.yml', 'r') as f:
    config = yaml.safe_load(f)

# --- Load API Key from .env file ---
load_dotenv()
api_key = os.getenv(config["api_key_env_var"])

# --- Initialize Gemini Client ---
genai.configure(api_key=api_key)

# --- Extract settings from config ---
model_name = config["model"]
target_class = config["target_class"]
target_subject = config["target_subject"]
target_chapter = config["target_chapter"]
generate_mcqs_count = config["generate_mcqs_count"]
select_mcqs_count = config["select_mcqs_count"]
sleep_between_calls = config["sleep_between_calls"]
max_retries = config["max_retries"]
input_file = config["input_file"]
output_file = config["output_file"]

# --- Model Setup with sampling (to make different MCQs) ---
model = genai.GenerativeModel(
    model_name,
    generation_config=genai.types.GenerationConfig(
        temperature=1.0,
        top_p=0.95,
        top_k=40
    )
)

def generate_mcqs(content):
    # Prompt to generate 20 MCQs
    prompt = f"""
You are an AI that generates multiple choice questions (MCQs).
Based on the following content, create exactly {generate_mcqs_count} DIFFERENT MCQs for:

- Class: {target_class}
- Subject: {target_subject}
- Chapter: {target_chapter}

Each MCQ must have:
- A question
- Four options (A–D)
- An "Answer:" line after the options

Format:
Question: <question text>
Options:
A) <option A>
B) <option B>
C) <option C>
D) <option D>
Answer: <correct option letter>

Content:
\"\"\"
{content}
\"\"\"
    """

    for attempt in range(1, max_retries + 1):
        try:
            response = model.generate_content(prompt)
            return response.text
        
        except google_exceptions.ResourceExhausted as e:
            print(f"⚠️ Rate limit hit (attempt {attempt}) — sleeping 5 seconds...")
            time.sleep(5)
        
        except google_exceptions.GoogleAPIError as e:
            print(f"⚠️ Google API error: {e} (attempt {attempt}) — sleeping 5 seconds...")
            time.sleep(5)
        
        except Exception as e:
            print(f"❌ Unknown error: {e} (attempt {attempt}) — sleeping 5 seconds...")
            time.sleep(5)
    
    print("❌ All retries failed for this item.")
    return None

def parse_mcqs(raw_text):
    mcqs = []
    blocks = raw_text.strip().split("\n\n")
    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) < 6:
            continue  # invalid block, skip
        try:
            question = lines[0].replace("Question:", "").strip()
            options = {
                "A": lines[2][2:].strip(),
                "B": lines[3][2:].strip(),
                "C": lines[4][2:].strip(),
                "D": lines[5][2:].strip()
            }
            answer = lines[6].replace("Answer:", "").strip()
            mcqs.append({
                "question": question,
                "options": options,
                "answer": answer
            })
        except Exception as e:
            print(f"⚠️ Failed to parse block: {e}")
            continue
    return mcqs

# --- Processing ---
all_mcqs_output = []

with open(input_file, 'r', encoding='utf-8') as f_in:
    for idx, line in enumerate(f_in, 1):
        item = json.loads(line)
        
        if (item.get("class") == target_class and 
            item.get("subject") == target_subject and 
            item.get("chapter") == target_chapter):
            
            print(f"🔵 Processing entry {idx}: {target_chapter}...")
            raw_mcqs_text = generate_mcqs(item["content"])
            
            if raw_mcqs_text:
                parsed_mcqs = parse_mcqs(raw_mcqs_text)
                if len(parsed_mcqs) < select_mcqs_count:
                    print(f"⚠️ Warning: Less than {select_mcqs_count} MCQs parsed, returning all parsed MCQs.")
                    selected_mcqs = parsed_mcqs
                else:
                    selected_mcqs = random.sample(parsed_mcqs, select_mcqs_count)

                all_mcqs_output.append({
                    "class": target_class,
                    "subject": target_subject,
                    "chapter": target_chapter,
                    "mcqs": selected_mcqs
                })

                print(f"✅ Successfully generated MCQs for: {target_chapter}")
            else:
                print(f"❌ Failed to generate MCQs after retries for: {target_chapter}")

            time.sleep(sleep_between_calls)

# --- Save as frontend-ready JSON ---
with open(output_file, 'w', encoding='utf-8') as f_out:
    json.dump(all_mcqs_output, f_out, ensure_ascii=False, indent=2)

print("🎯 All Done! Output written to", output_file)
