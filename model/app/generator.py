import json
import os
import re
import time
from datetime import datetime
from app.config import config
from google import generativeai as genai
from google.api_core import exceptions as google_exceptions

# Global corpus cache
corpus_cache = None

genai.configure(api_key=config.api_key)

def load_corpus_once():
    global corpus_cache
    if corpus_cache is None:
        corpus_cache = []
        input_file = config.get("input_file")
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                for line in f:
                    corpus_cache.append(json.loads(line))
            print(f"✅ Corpus loaded: {len(corpus_cache)} entries.")
        except Exception as e:
            print(f"❌ Corpus load error: {e}")

def normalize(text):
    return text.strip().lower().replace(" ", "")

def get_chapter_content(class_, subject, chapter):
    if corpus_cache is None:
        load_corpus_once()
    chapter_norm = normalize(chapter)
    for item in corpus_cache:
        if (item.get("class") == class_ and
            item.get("subject").lower() == subject.lower() and
            normalize(item.get("chapter")) == chapter_norm):
            return item.get("content")
    return None

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
    path = os.path.join(output_dir, "generated_raw_mcqs.jsonl")
    with open(path, 'a', encoding='utf-8') as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")
    print(f"✅ Saved raw Gemini response for audit.")

def generate_content_with_fallback(prompt, stream=False):
    pro_model   = config.get("pro_model")
    flash_model = config.get("flash_model")
    retries     = config.get("max_retries")

    for attempt in range(1, retries + 1):
        try:
            print(f"🌟 Pro model attempt {attempt}")
            mdl = genai.GenerativeModel(pro_model)
            resp = mdl.generate_content(prompt, stream=stream)
            print("✅ Pro model response received.")
            return resp, pro_model
        except google_exceptions.ResourceExhausted:
            print("⚠️ Pro rate-limited, switching to Flash.")
            try:
                mdl = genai.GenerativeModel(flash_model)
                resp = mdl.generate_content(prompt, stream=stream)
                print("✅ Flash model response received.")
                return resp, flash_model
            except Exception as e:
                print(f"❌ Flash failed: {e}")
                time.sleep(2)
        except Exception as e:
            print(f"⚠️ Pro model error: {e}")
            time.sleep(2)
    return None, None

def generate_raw_mcqs_from_corpus(class_, subject, chapter, difficulty_counts):
    print(f"⚡ Prompt build for Class={class_}, Chapter={chapter}, counts={difficulty_counts}")
    content = get_chapter_content(class_, subject, chapter)
    if not content:
        raise ValueError(f"Chapter content not found: {class_} / {subject} / {chapter}")

    easy   = difficulty_counts.get("easy",   0)
    medium = difficulty_counts.get("medium", 0)
    hard   = difficulty_counts.get("hard",   0)

    prompt = f"""
You are an AI trained to generate CBSE Board standard MCQs for academic year 2025-26,
based strictly on the NCERT content provided below.

Chapter Content:
\"\"\"
{content}
\"\"\"

Generate:
- {easy} Easy MCQs
- {medium} Medium MCQs
- {hard} Hard MCQs

Format exactly as:

**MCQ 1 (Easy):**
Question text

(A) Option A
(B) Option B
(C) Option C
(D) Option D

Answer: B

**MCQ 2 (Medium):** … etc.

Only output MCQs in that style. No extra text.
"""

    response, model_used = generate_content_with_fallback(prompt, stream=False)
    if response and hasattr(response, 'text'):
        save_raw_response(class_, subject, chapter, "mixed", easy+medium+hard, response.text)
        return response.text, model_used

    print("❌ Gemini generation failed.")
    return None, None

def parse_mcqs(raw_text: str):
    # convert <sup>…</sup> to ^… and strip any other HTML
    t = re.sub(r'(\S+?)<sup>(.*?)</sup>', r'\1^\2', raw_text)
    t = re.sub(r'<[^>]+>', '', t)

    pattern = re.compile(
        r'\*\*MCQ\s+\d+(?:\s*\((Easy|Medium|Hard)\))?:\*\*(.*?)(?=(?:\*\*MCQ|\Z))',
        re.DOTALL | re.IGNORECASE
    )
    mcqs = []
    for m in pattern.finditer(t):
        diff = (m.group(1) or "Mixed").lower()
        block = m.group(2).strip()

        q_part, sep, rest = block.partition('\n\n')
        question = q_part.strip()
        rest = rest.strip()

        opts = dict(re.findall(r'\((A|B|C|D)\)\s*(.+)', rest))
        ans_m = re.search(r'Answer:\s*_*\s*([A-D])\s*_*\s*', rest, re.IGNORECASE)
        answer = ans_m.group(1).upper() if ans_m else None

        if question and len(opts) == 4 and answer:
            mcqs.append({
                "question": question,
                "options": {k: v.strip() for k, v in opts.items()},
                "answer": answer,
                "difficulty": diff
            })
        else:
            print(f"⚠️ Skipped block:\n{block[:80]}…")
    return mcqs
