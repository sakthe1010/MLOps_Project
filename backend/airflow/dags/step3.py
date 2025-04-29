import sqlalchemy as sa
import json
import os

# ensure paths are relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Connect to your database ---
engine = sa.create_engine("sqlite:///ncert_content.db", echo=False)
with engine.connect() as conn:
    result = conn.execute(
        sa.text(
            "SELECT class, subject, chapter, content "
            "FROM pdf_content "
            "ORDER BY class, subject, chapter"
        )
    )
    records = result.mappings().all()

print(f"\n[·] Total records to export: {len(records)}\n")

# --- 1. Export to JSONL format ---
jsonl_path = os.path.join(SCRIPT_DIR, "ncert_dataset.jsonl")
with open(jsonl_path, "w", encoding="utf-8") as f_jsonl:
    for row in records:
        entry = {
            "class":   row["class"],
            "subject": row["subject"],
            "chapter": row["chapter"],
            "content": row["content"],
        }
        f_jsonl.write(json.dumps(entry, ensure_ascii=False) + "\n")

print(f"✅ Exported JSONL: {jsonl_path}\n")
print("✅ Dataset export complete!")
