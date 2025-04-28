import sqlalchemy as sa
import json
import csv
import os

# --- Connect to your database ---
engine = sa.create_engine("sqlite:///ncert_content.db", echo=False)
conn = engine.connect()

# --- Fetch all records ---
result = conn.execute(sa.text("SELECT class, subject, chapter, content FROM pdf_content ORDER BY class, subject, chapter"))

records = result.fetchall()

print(f"\n[·] Total records to export: {len(records)}\n")

# --- 1. Export to JSONL format ---
jsonl_path = "ncert_dataset.jsonl"
with open(jsonl_path, "w", encoding="utf-8") as f_jsonl:
    for row in records:
        entry = {
            "class": row["class"],
            "subject": row["subject"],
            "chapter": row["chapter"],
            "content": row["content"]
        }
        f_jsonl.write(json.dumps(entry, ensure_ascii=False) + "\n")

print(f"✅ Exported JSONL: {jsonl_path}")

conn.close()
print("\n✅ Dataset export complete!")
