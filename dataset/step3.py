import os
import yaml
import json
import sqlalchemy as sa

# --- Load config.yaml ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(SCRIPT_DIR, "config.yaml"), "r") as f:
    config = yaml.safe_load(f)

# --- Read config entries ---
DB_URL = config["database"]["url"]
JSONL_PATH = os.path.join(SCRIPT_DIR, config["export"]["jsonl_path"])

# --- Connect to SQLite database ---
engine = sa.create_engine(DB_URL, echo=False)
with engine.connect() as conn:
    result = conn.execute(sa.text(
        "SELECT class, subject, chapter, content FROM pdf_content ORDER BY class, subject, chapter"
    ))
    rows = result.fetchall()

print(f"\n[·] Total records to export: {len(rows)}\n")

# --- Write JSONL output ---
with open(JSONL_PATH, "w", encoding="utf-8") as f_jsonl:
    for row in rows:
        obj = {
            "class":   row["class"],
            "subject": row["subject"],
            "chapter": row["chapter"],
            "content": row["content"]
        }
        f_jsonl.write(json.dumps(obj, ensure_ascii=False) + "\n")

print(f"✅ Exported JSONL: {JSONL_PATH}")
print("✅ Dataset export complete!")
