import os
import json
import time
import requests

# Configuration
INPUT_FILE = "ncert_dataset.jsonl"
OUTPUT_FILE = "mcq_finetune.jsonl"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL = "google/flan-t5-small"  # Using a freely accessible model
MAX_EXCERPT_CHARS = 1024
PAUSE_SECONDS = 1  # avoid rate limits

if not HF_API_TOKEN:
    raise ValueError("Please set your HF_API_TOKEN environment variable.")

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json"
}

def build_prompt(entry):
    cls     = entry["class"]
    subj    = entry["subject"]
    chapter = entry["chapter"]
    content = entry["content"].replace("\n", " ")
    if len(content) > MAX_EXCERPT_CHARS:
        content = content[:MAX_EXCERPT_CHARS] + " ..."
    return (
        f"Class:{cls}; Subject:{subj}; Chapter:{chapter}\n"
        f"Content: {content}\n\n"
        "Generate 10 MCQs (each with 4 options and the correct answer key):"
    )

def generate_mcqs(prompt):
    api_url = f"https://api-inference.huggingface.co/models/{MODEL}"
    payload = json.dumps({
        "inputs": prompt,
        "parameters": {"max_new_tokens": 512, "do_sample": False}
    })
    response = requests.post(api_url, headers=headers, data=payload)
    response.raise_for_status()
    result = response.json()
    # Hugging Face returns a list of dicts with 'generated_text'
    return result[0]["generated_text"].strip()

def main():
    outputs = []
    with open(INPUT_FILE, "r", encoding="utf-8") as fin:
        for line in fin:
            entry = json.loads(line)
            prompt = build_prompt(entry)
            try:
                mcq_text = generate_mcqs(prompt)
            except Exception as e:
                print(f"Error generating for chapter {entry['chapter']}: {e}")
                mcq_text = ""
            outputs.append({
                "prompt": prompt,
                "completion": mcq_text
            })
            time.sleep(PAUSE_SECONDS)
    # Write as JSONL
    with open(OUTPUT_FILE, "w", encoding="utf-8") as fout:
        for item in outputs:
            fout.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"Generated MCQ fine-tune file with {len(outputs)} entries at {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
