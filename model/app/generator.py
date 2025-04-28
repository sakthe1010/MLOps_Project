import json
import random
import time
import os
import re
from datetime import datetime
from app.config import config
from google import generativeai as genai
from google.api_core import exceptions as google_exceptions

# Global corpus cache
corpus_cache = None

# Initialize Gemini
genai.configure(api_key=config.api_key)

# Load corpus once into memory
def load_corpus_once():
    global corpus_cache
    if corpus_cache is None:
        corpus_cache = []
        input_file = config.get("input_file")
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                for line in f:
                    corpus_cache.append(json.loads(line))
            print(f"✅ Corpus loaded into memory: {len(corpus_cache)} entries.")
        except Exception as e:
            print(f"❌ Error loading corpus: {e}")

# Get chapter content from corpus
def get_chapter_content(class_, subject, chapter):
    if corpus_cache is None:
        load_corpus_once()

    for item in corpus_cache:
        if (item.get("class") == class_ and 
            item.get("subject").lower() == subject.lower() and 
            item.get("chapter").lower() == chapter.lower()):
            return item.get("content")
    return None

# Save raw Gemini response for auditing/debugging
def save_raw_response(class_, subject, chapter, difficulty, mcq_count, raw_text):
    output_dir = "raw_responses"
    os.makedirs(output_dir, exist_ok=True)

    data = {
        "timestamp": datetime.now().isoformat(),
        "class": class_,
        "subject": subject,
        "chapter": chapter,
        "difficulty": difficulty,
        "mcq_count": mcq_count,
        "raw_text": raw_text
    }

    output_path = os.path.join(output_dir, "generated_raw_mcqs.jsonl")

    with open(output_path, 'a', encoding='utf-8') as f:
        f.write(json.dumps(data, ensure_ascii=False))
        f.write("\n")
    
    print(f"✅ Saved raw Gemini response at {output_path}")

# Auto fallback between Pro ➔ Flash models
def generate_content_with_fallback(prompt, stream=False):
    pro_model = config.get("pro_model")
    flash_model = config.get("flash_model")
    max_retries = config.get("max_retries")

    for attempt in range(1, max_retries + 1):
        try:
            print(f"🌟 Trying Pro model attempt {attempt}")
            model = genai.GenerativeModel(pro_model)
            response = model.generate_content(prompt, stream=stream)
            return response, pro_model
        except google_exceptions.ResourceExhausted:
            print(f"⚠️ Pro model rate limited. Falling back to Flash model...")
            try:
                model = genai.GenerativeModel(flash_model)
                response = model.generate_content(prompt, stream=stream)
                return response, flash_model
            except Exception as e:
                print(f"❌ Flash model also failed: {e}")
                time.sleep(2)
        except Exception as e:
            print(f"⚠️ Pro model error: {e}. Retrying...")
            time.sleep(2)
    return None, None

# Generate raw MCQs from corpus (normal way)
def generate_raw_mcqs_from_corpus(class_, subject, chapter, difficulty, mcq_count):
    content = get_chapter_content(class_, subject, chapter)
    if not content:
        return None, None

    prompt = f"""
You are an AI that generates MCQs strictly based on provided educational content.

Generate {mcq_count} MCQs for:
- Class: {class_}
- Subject: {subject}
- Chapter: {chapter}
- Difficulty Level: {difficulty}

Use the following chapter content:
\"\"\"
{content}
\"\"\"

Each MCQ must have:
- Question
- Four options (A–D)
- Answer line (correct option letter only, like A, B, C, D)

Clearly format like:
**MCQ 1:**
Question text

(A) Option A
(B) Option B
(C) Option C
(D) Option D

Answer: B
    """

    response, model_used = generate_content_with_fallback(prompt, stream=False)
    if response and hasattr(response, 'text'):
        save_raw_response(class_, subject, chapter, difficulty, mcq_count, response.text)
        return response.text, model_used
    return None, None

# Streaming version (stream MCQs live)
def stream_raw_mcqs_from_corpus(class_, subject, chapter, difficulty, mcq_count):
    content = get_chapter_content(class_, subject, chapter)
    if not content:
        yield None

    prompt = f"""
You are an AI that generates MCQs strictly based on provided educational content.

Generate {mcq_count} MCQs for:
- Class: {class_}
- Subject: {subject}
- Chapter: {chapter}
- Difficulty Level: {difficulty}

Use the following chapter content:
\"\"\"
{content}
\"\"\"

Each MCQ must have:
- Question
- Four options (A–D)
- Answer line

Clearly format like:
**MCQ 1:**
Question

(A) Option A
(B) Option B
(C) Option C
(D) Option D

Answer: B
    """

    response, model_used = generate_content_with_fallback(prompt, stream=True)
    if response:
        try:
            for chunk in response:
                yield chunk.text
        except Exception as e:
            print(f"⚠️ Streaming error: {e}")
            yield None

# Parse raw Gemini MCQs into structured JSON
def parse_mcqs(raw_text):
    mcqs = []
    blocks = re.split(r'\*\*MCQ \d+:\*\*', raw_text)
    
    for block in blocks:
        block = block.strip()
        if not block:
            continue

        try:
            # Extract Question
            question_match = re.search(r'^(.*?)\n\n', block, re.DOTALL)
            question = question_match.group(1).strip() if question_match else None

            # Extract Options
            options_matches = re.findall(r'\((A|B|C|D)\)\s*(.+)', block)
            options = {opt: text.strip() for opt, text in options_matches}

            # Extract Answer
            answer_match = re.search(r'Answer:\s+_*([A-D])_*', block)
            answer = answer_match.group(1) if answer_match else None

            if question and len(options) == 4 and answer:
                mcqs.append({
                    "question": question,
                    "options": options,
                    "answer": answer
                })
            else:
                print(f"⚠️ Skipping invalid MCQ block due to missing fields.")

        except Exception as e:
            print(f"⚠️ Failed to parse block: {e}")
            continue

    return mcqs
