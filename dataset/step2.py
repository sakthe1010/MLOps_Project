import os
import re
from glob import glob

import yaml
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from PyPDF2 import PdfReader
import pdfplumber

# — 1) Load config —
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(SCRIPT_DIR, "config.yaml"), "r") as f:
    cfg = yaml.safe_load(f)

PDF_BASE = os.path.join(SCRIPT_DIR, cfg["pdf"]["base_dir"])
GLOB_PT = cfg["pdf"]["glob_pattern"]
DB_URL = cfg["database"]["url"]
DB_ECHO = cfg["database"].get("echo", False)
FALLBACK = cfg["pdf"].get("fallback_to_pdfplumber", True)

# — 2) Database setup —
engine = sa.create_engine(DB_URL, echo=DB_ECHO)
metadata = sa.MetaData()

pdf_content = sa.Table(
    "pdf_content", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("class", sa.String, nullable=False),
    sa.Column("subject", sa.String, nullable=False),
    sa.Column("chapter", sa.String, nullable=False),
    sa.Column("path", sa.String, nullable=False),
    sa.Column("content", sa.Text, nullable=False),
    sa.UniqueConstraint("class", "subject", "chapter", name="uix_csc")
)

metadata.create_all(engine)
Session = sessionmaker(bind=engine)

# — 3) Metadata parsing — (final)
CHAPTER_UNIT_RE = re.compile(
    r".*/class_(?P<class>\d+)/(?P<subject>[^/]+)/(?:chapter|unit)_(?P<chapter_num>\d+)_(?P<chapter>.+)\.pdf$",
    re.I
)

TITLE_ONLY_RE = re.compile(
    r".*/class_(?P<class>\d+)/(?P<subject>[^/]+)/(?P<title>[^/]+)\.pdf$",
    re.I
)

def parse_metadata(pdf_path: str):
    path_normalized = pdf_path.replace("\\", "/")

    # 1. Match chapter_ or unit_
    m = CHAPTER_UNIT_RE.match(path_normalized)
    if m:
        d = m.groupdict()
        title = d.pop("chapter").replace("_", " ").strip()
        num = d.pop("chapter_num")
        d["chapter"] = f"Chapter {num}: {title}"
        return d

    # 2. Match title-only pattern
    m2 = TITLE_ONLY_RE.match(path_normalized)
    if m2:
        d = m2.groupdict()
        title = d.pop("title").replace("_", " ").strip()
        d["chapter"] = title
        return d

    return None

# — 4) Text extraction —
def extract_text(pdf_path: str) -> str:
    try:
        reader = PdfReader(pdf_path)
        pages = [p.extract_text() or "" for p in reader.pages]
        text = "\n".join(pages).strip()
        if text:
            return text
        else:
            print(f"  ❌ PyPDF2 extracted EMPTY text for {os.path.basename(pdf_path)}")
    except Exception as e:
        print(f"  ⚠️ PyPDF2 failed on {os.path.basename(pdf_path)}: {e}")

    if FALLBACK:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                pages = [p.extract_text() or "" for p in pdf.pages]
            text = "\n".join(pages).strip()
            if text:
                return text
            else:
                print(f"  ❌ pdfplumber extracted EMPTY text for {os.path.basename(pdf_path)}")
        except Exception as e2:
            print(f"  ⚠️ pdfplumber failed on {os.path.basename(pdf_path)}: {e2}")

    return ""

# — 5) Main ingestion logic —
def main():
    os.makedirs(PDF_BASE, exist_ok=True)

    pdf_files = glob(os.path.join(PDF_BASE, GLOB_PT))
    print(f"\n[·] Found {len(pdf_files)} PDF files to process\n")

    session = Session()

    success_count = 0
    skipped_count = 0
    skipped_files = []

    for pdf_path in pdf_files:
        meta = parse_metadata(pdf_path)
        if not meta:
            print(f"🚫 Skipping (unrecognized filename): {pdf_path}")
            skipped_count += 1
            skipped_files.append((pdf_path, "Filename unrecognized"))
            continue

        print(f"📄 Reading: {pdf_path}")

        content = extract_text(pdf_path)
        if not content:
            print(f"🚫 No text extracted, skipping: {pdf_path}")
            skipped_count += 1
            skipped_files.append((pdf_path, "Empty text extracted"))
            continue

        # Check if entry exists
        existing = session.execute(
            sa.select(pdf_content).where(
                (pdf_content.c["class"] == meta["class"]) &
                (pdf_content.c.subject == meta["subject"]) &
                (pdf_content.c.chapter == meta["chapter"])
            )
        ).fetchone()

        stmt = sa.insert(pdf_content).prefix_with("OR REPLACE").values(
            **meta,
            path=pdf_path,
            content=content
        )
        session.execute(stmt)

        if existing:
            print(f"♻️  Updated: Class {meta['class']} / {meta['subject']} / {meta['chapter']}")
        else:
            print(f"➕ Inserted: Class {meta['class']} / {meta['subject']} / {meta['chapter']}")

        success_count += 1

    session.commit()
    session.close()

    print("\n✅ Ingestion Summary:")
    print(f"   ➕ Successfully processed: {success_count}")
    print(f"   🚫 Skipped: {skipped_count}")

    if skipped_files:
        print("\n🚫 Skipped Files Details:")
        for file, reason in skipped_files:
            print(f"   - {file} [{reason}]")

    print("\n✅ All PDFs ingestion complete!\n")

if __name__ == "__main__":
    main()
