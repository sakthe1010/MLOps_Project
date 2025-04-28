import json
import re
from huggingface_hub import InferenceClient

# --- HuggingFace API Setup ---
HF_TOKEN = "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"

client = InferenceClient(token=HF_TOKEN)

MODEL_ID = "HuggingFaceH4/zephyr-7b-beta"

# --- Load your dataset ---
with open("ncert_dataset.jsonl", "r", encoding="utf-8") as f:
    dataset = [json.loads(line) for line in f]

print(f"[·] Loaded {len(dataset)} chapters.")

# --- Function to generate MCQs ---
def generate_mcqs(class_no, subject, chapter_title, difficulty="Medium", n_questions=5):
    # Find matching chapter
    chapter = next(
        (c for c in dataset if c["class"] == class_no and c["subject"].lower() == subject.lower() and c["chapter"].lower() == chapter_title.lower()),
        None
    )
    if not chapter:
        print(f"❌ Chapter not found for Class {class_no} / {subject} / {chapter_title}")
        return None

    chapter_text = chapter["content"]

    # Build strict prompt
    prompt = f"""
    You are an expert exam setter.

    Generate {n_questions} MCQs based only on the following chapter content.
    - All questions must be of {difficulty} difficulty ONLY.
    - Each MCQ should have 4 options labeled (A), (B), (C), (D).
    - Mention the correct answer clearly (A/B/C/D).

    Chapter Content:
    \"\"\"
    {chapter_text}
    \"\"\"

    Return ONLY a valid JSON list like:

    [
    {{
        "question": "....",
        "options": ["A", "B", "C", "D"],
        "answer": "B",
        "difficulty": "{difficulty}"
    }},
    ...
    ]
    """

    print(f"\n[·] Generating {n_questions} {difficulty} MCQs for Class {class_no}, Subject {subject}, Chapter {chapter_title}...")

    try:
        output = client.text_generation(
            model=MODEL_ID,
            prompt=prompt,
            max_new_tokens=1500,
            temperature=0.7,
            repetition_penalty=1.1
        )

        # ✨ NEW: Extract JSON from the model output
        match = re.search(r"\[\s*{.*?}\s*\]", output, re.DOTALL)
        if not match:
            print(f"❌ Could not find JSON in the output:\n{output}")
            return None

        json_text = match.group(0)
        mcqs = json.loads(json_text)
        return mcqs

    except Exception as e:
        print(f"❌ Error during MCQ generation: {e}")
        return None

# --- Test it ---
if __name__ == "__main__":
    mcqs = generate_mcqs(
        class_no="6",
        subject="science",
        chapter_title="chapter 1: the wonderful world of science",
        difficulty="Medium",
        n_questions=5
    )
    if mcqs:
        print(json.dumps(mcqs, indent=2, ensure_ascii=False))
