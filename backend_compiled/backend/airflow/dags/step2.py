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

# ensure the SQLite file lives under the DAGs folder
raw_url = cfg["database"]["url"]
if raw_url.startswith("sqlite:///"):
    rel_path = raw_url.replace("sqlite:///", "")
    abs_path = os.path.join(SCRIPT_DIR, rel_path)
    DB_URL = f"sqlite:///{abs_path}"
else:
    DB_URL = raw_url

DB_ECHO  = cfg["database"].get("echo", False)
PDF_BASE = os.path.join(SCRIPT_DIR, cfg["pdf"]["base_dir"])
FALLBACK = cfg["pdf"].get("fallback_to_pdfplumber", True)

# — 2) Database setup —
engine   = sa.create_engine(DB_URL, echo=DB_ECHO)
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

# — 3) Metadata parsing —
CHAPTER_UNIT_RE = re.compile(
    r".*/class_(?P<class>\d+)/(?P<subject>[^/]+)/(?:chapter|unit)_(?P<chapter_num>\d+)_(?P<chapter>.+)\.pdf$",
    re.I
)
TITLE_ONLY_RE = re.compile(
    r".*/class_(?P<class>\d+)/(?P<subject>[^/]+)/(?P<title>[^/]+)\.pdf$",
    re.I
)

def parse_metadata(pdf_path: str):
    p = pdf_path.replace("\\", "/")
    m = CHAPTER_UNIT_RE.match(p)
    if m:
        d = m.groupdict()
        title = d.pop("chapter").replace("_", " ").strip()
        num   = d.pop("chapter_num")
        d["chapter"] = f"Chapter {num}: {title}"
        return d
    m2 = TITLE_ONLY_RE.match(p)
    if m2:
        d = m2.groupdict()
        d["chapter"] = d.pop("title").replace("_", " ").strip()
        return d
    return None

# — 4) Text extraction —
def extract_text(pdf_path: str) -> str:
    try:
        reader = PdfReader(pdf_path)
        pages  = [p.extract_text() or "" for p in reader.pages]
        text   = "\n".join(pages).strip()
        if text:
            return text
    except Exception as e:
        print(f"  ⚠️ PyPDF2 error on {os.path.basename(pdf_path)}: {e}")

    if FALLBACK:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                pages = [p.extract_text() or "" for p in pdf.pages]
            text = "\n".join(pages).strip()
            if text:
                return text
        except Exception as e2:
            print(f"  ⚠️ pdfplumber error on {os.path.basename(pdf_path)}: {e2}")
    return ""

# — 5) Main ingestion logic —
def main():
    os.makedirs(PDF_BASE, exist_ok=True)

    # find all PDFs, recursively
    pdf_files = glob(os.path.join(PDF_BASE, "**", "*.pdf"), recursive=True)
    print(f"\n[·] Found {len(pdf_files)} PDF files to process\n")

    session = Session()
    success = skipped = 0
    skipped_files = []

    for path in pdf_files:
        meta = parse_metadata(path)
        if not meta:
            skipped += 1
            skipped_files.append((path, "Filename unrecognized"))
            print(f"🚫 Skipping (unrecognized): {path}")
            continue

        print(f"📄 Reading: {path}")
        content = extract_text(path)
        if not content:
            skipped += 1
            skipped_files.append((path, "Empty text"))
            print(f"🚫 No text, skipping: {path}")
            continue

        existing = session.execute(
            sa.select(pdf_content).where(
                (pdf_content.c["class"] == meta["class"]) &
                (pdf_content.c.subject     == meta["subject"]) &
                (pdf_content.c.chapter     == meta["chapter"])
            )
        ).fetchone()

        stmt = sa.insert(pdf_content).prefix_with("OR REPLACE").values(
            **meta, path=path, content=content
        )
        session.execute(stmt)

        print("♻️ Updated:" if existing else "➕ Inserted:",
              f"Class {meta['class']} / {meta['subject']} / {meta['chapter']}")
        success += 1

    session.commit()
    session.close()

    print("\n✅ Ingestion Summary:")
    print(f"   ➕ Processed: {success}")
    print(f"   🚫 Skipped : {skipped}")
    if skipped_files:
        print("\n🚫 Details:")
        for f, reason in skipped_files:
            print(f"   - {f} [{reason}]")
    print("\n✅ All done!\n")

if __name__ == "__main__":
    main()
