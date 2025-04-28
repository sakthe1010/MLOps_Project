import os
import re
from glob import glob

import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from PyPDF2 import PdfReader

# --- 1) DB setup ---
engine = sa.create_engine("sqlite:///ncert_content.db", echo=False)
metadata = sa.MetaData()

pdf_content = sa.Table(
    "pdf_content", metadata,
    sa.Column("id",      sa.Integer, primary_key=True),
    sa.Column("class",   sa.String,  nullable=False),
    sa.Column("subject", sa.String,  nullable=False),
    sa.Column("chapter", sa.String,  nullable=False),
    sa.Column("path",    sa.String,  nullable=False),
    sa.Column("content", sa.Text,    nullable=False),
)

metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

# --- 2) Helpers to parse metadata from filename/path ---
pattern = re.compile(
    r".*/class_(?P<class>\d+)/(?P<subject>[^/]+)/chapter-(?P<chapter_num>\d+)-(?P<chapter>.+)\.pdf$",
    re.I
)

def parse_metadata(pdf_path):
    m = pattern.match(pdf_path.replace("\\", "/"))  # Windows paths to Unix
    if not m:
        return None
    data = m.groupdict()
    title = data.pop('chapter').replace('-', ' ').strip()
    data['chapter'] = f"Chapter {data.pop('chapter_num')}: {title}"
    return data

# --- 3) Walk & ingest ---
BASE_DIR = "./ncert_pdfs"

# FIXED glob pattern: find PDFs inside class_X/subject/ folders
all_pdfs = glob(os.path.join(BASE_DIR, "class_*", "*", "chapter-*.pdf"), recursive=True)

print(f"\n[·] Total PDFs found: {len(all_pdfs)}\n")

for pdf_path in all_pdfs:
    meta = parse_metadata(pdf_path)
    if not meta:
        print(f"Skipping unrecognized path: {pdf_path}")
        continue

    print(f"Reading: {pdf_path}")

    try:
        reader = PdfReader(pdf_path)
        text_chunks = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_chunks.append(text)
            else:
                print(f"⚠️ Empty page in {pdf_path}")
        full_text = "\n".join(text_chunks)
    except Exception as e:
        print(f"❌ Failed to read {pdf_path}: {e}")
        continue

    if full_text.strip():
        ins = pdf_content.insert().values({
            "class": meta["class"],
            "subject": meta["subject"],
            "chapter": meta["chapter"],
            "path": pdf_path,
            "content": full_text
        })
        session.execute(ins)
        print(f"✅ Inserted: Class {meta['class']} / {meta['subject']} / {meta['chapter']}")
    else:
        print(f"🚫 Skipped empty content: {pdf_path}")

session.commit()
session.close()

print("\n✅ All PDFs ingestion complete!")
