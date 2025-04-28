import os
import re
from glob import glob

import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from PyPDF2 import PdfReader
import pdfplumber

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
    r".*/class_(?P<class>\d+)/(?P<subject>[^/]+)/chapter_(?P<chapter_num>\d+)_(?P<chapter>.+)\.pdf$",
    re.I
)

def parse_metadata(pdf_path):
    m = pattern.match(pdf_path.replace("\\", "/"))
    if not m:
        return None
    data = m.groupdict()
    title = data.pop("chapter").replace("_", " ").strip()
    num   = data.pop("chapter_num")
    data["chapter"] = f"Chapter {num}: {title}"
    return data

# --- 3) Locate your PDFs directory alongside this script ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR   = os.path.join(SCRIPT_DIR, "ncert_pdfs")

# --- 4) Collect all chapter PDFs ---
all_pdfs = glob(os.path.join(BASE_DIR, "class_*", "*", "chapter_*.pdf"))
print(f"\n[·] Total PDFs found: {len(all_pdfs)}\n")

for pdf_path in all_pdfs:
    meta = parse_metadata(pdf_path)
    if not meta:
        print(f"Skipping unrecognized path: {pdf_path}")
        continue

    print(f"Reading: {pdf_path}")

    # --- 5) Extract text (PyPDF2 first, then pdfplumber fallback) ---
    full_text = ""
    try:
        reader = PdfReader(pdf_path)
        pages = [page.extract_text() or "" for page in reader.pages]
        full_text = "\n".join(pages).strip()
    except Exception as e:
        print(f"  PyPDF2 failed: {e}\n  Falling back to pdfplumber…")
        try:
            with pdfplumber.open(pdf_path) as pdf:
                pages = [p.extract_text() or "" for p in pdf.pages]
            full_text = "\n".join(pages).strip()
        except Exception as e2:
            print(f"  pdfplumber also failed: {e2}\n  Skipping file.")
            continue

    if not full_text:
        print(f"🚫 Skipped empty content: {pdf_path}")
        continue

    # --- 6) Insert into database ---
    ins = pdf_content.insert().values({
        "class":   meta["class"],
        "subject": meta["subject"],
        "chapter": meta["chapter"],
        "path":    pdf_path,
        "content": full_text
    })
    session.execute(ins)
    print(f"✅ Inserted: Class {meta['class']} / {meta['subject']} / {meta['chapter']}")

# --- 7) Finalize ---
session.commit()
session.close()
print("\n✅ All PDFs ingestion complete!")
