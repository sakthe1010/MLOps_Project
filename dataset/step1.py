import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor

# ————— CONFIG —————
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR    = os.path.join(SCRIPT_DIR, "ncert_pdfs")
WORKERS   = 6
INDEX_URL = "https://byjus.com/ncert-books"
# ————— /CONFIG —————

def slugify(text: str) -> str:
    return re.sub(r"[^\w\-]+", "_", text.strip()).strip("_")

def get_html(url: str) -> str:
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.text

def list_subject_pages():
    """Return { '6': [('maths', url), …], '7': … } by matching link text."""
    html = get_html(INDEX_URL)
    soup = BeautifulSoup(html, "html.parser")
    link_re = re.compile(r"NCERT Books for Class\s+(\d+)\s+(.+)", re.I)
    pages = {}
    for a in soup.find_all("a", string=link_re):
        cls, subj = link_re.match(a.get_text(strip=True)).groups()
        subj = subj.lower().replace(" ", "-")
        pages.setdefault(cls, []).append((subj, urljoin(INDEX_URL, a["href"])))
        print(f"[·] Class {cls} / {subj} → {pages[cls][-1][1]}")
    return pages

def list_chapter_pdfs(class_no: str, subject: str, page_url: str):
    """
    Scrape page_url for ANY <a href> matching chapter-*.pdf,
    skip if URL contains 'hindi' or 'solution'.
    """
    html = get_html(page_url)
    soup = BeautifulSoup(html, "html.parser")
    links = soup.find_all("a", href=re.compile(r"chapter-.*\.pdf$", re.I))

    chapters = []
    for a in links:
        href = a["href"]
        if re.search(r"hindi|solution", href, re.I):
            continue
        full = urljoin(page_url, href)
        title = a.get_text(strip=True) or os.path.basename(href)
        chapters.append((title, full))
        print(f"    → {title}  →  {full}")

    if not chapters:
        print(f"    (!) No chapter-*.pdf links found for Class {class_no}, Subject {subject}")
    return chapters

def download_pdf(task):
    cls, subj, title, pdf_url = task
    save_dir = os.path.join(OUT_DIR, f"class_{cls}", subj)
    os.makedirs(save_dir, exist_ok=True)
    fname    = slugify(title) + ".pdf"
    out_path = os.path.join(save_dir, fname)
    try:
        r = requests.get(pdf_url)
        r.raise_for_status()
        with open(out_path, "wb") as f:
            f.write(r.content)
        print(f"[✓] Saved {cls}/{subj}/{title}")
    except Exception as e:
        print(f"[✗] Failed {title}: {e}")

def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print("\n[·] Gathering Class/Subject pages…")
    subject_pages = list_subject_pages()

    tasks = []
    for cls in sorted(subject_pages, key=lambda x: int(x)):
        for subj, url in subject_pages[cls]:
            print(f"\n[·] Class {cls}, Subject {subj}")
            for title, pdf in list_chapter_pdfs(cls, subj, url):
                tasks.append((cls, subj, title, pdf))

    print(f"\n[·] Downloading {len(tasks)} PDFs with {WORKERS} threads…\n")
    with ThreadPoolExecutor(max_workers=WORKERS) as exe:
        exe.map(download_pdf, tasks)

    print("\n✅ Done! Textbook PDFs are in", OUT_DIR)

if __name__ == "__main__":
    main()
