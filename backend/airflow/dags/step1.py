import os, re, yaml, requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor

# — load config —
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
cfg = yaml.safe_load(open(os.path.join(SCRIPT_DIR, "config.yaml")))
dl_cfg = cfg["download"]

BASE_URL   = dl_cfg["base_url"].rstrip("/")
OUT_DIR    = os.path.join(SCRIPT_DIR, dl_cfg["output_dir"])
CONCURRENCY= dl_cfg.get("concurrency", 4)

def slugify(text): return re.sub(r"[^\w\-]+", "_", text).strip("_")

def get_html(u):
    r = requests.get(u); r.raise_for_status(); return r.text

def list_subject_pages():
    html = get_html(BASE_URL)
    soup = BeautifulSoup(html, "html.parser")
    link_re = re.compile(r"NCERT Books for Class\s+(\d+)\s+(.+)", re.I)
    pages = {}
    for a in soup.find_all("a", string=link_re):
        cls, subj = link_re.match(a.get_text(strip=True)).groups()
        subj = subj.lower().replace(" ", "-")
        pages.setdefault(cls,[]).append((subj, urljoin(BASE_URL,a["href"])))
        print(f"[·] Class {cls}/{subj} → {pages[cls][-1][1]}")
    return pages

def list_chapter_pdfs(cls, subj, page_url):
    html = get_html(page_url)
    soup = BeautifulSoup(html, "html.parser")
    links = soup.find_all("a", href=re.compile(r"chapter-.*\.pdf$", re.I))
    out = []
    for a in links:
        href = a["href"]
        if re.search(r"hindi|solution", href, re.I): continue
        title = a.get_text(strip=True) or os.path.basename(href)
        full  = urljoin(page_url, href)
        out.append((title, full))
        print(f"    → {title} → {full}")
    if not out:
        print(f"    (!) No PDFs for C{cls}/{subj}")
    return out

def download(task):
    cls, subj, title, url = task
    d = os.path.join(OUT_DIR, f"class_{cls}", subj); os.makedirs(d, exist_ok=True)
    fn = slugify(title)+".pdf"; path = os.path.join(d, fn)
    try:
        r = requests.get(url); r.raise_for_status()
        open(path,"wb").write(r.content)
        print(f"[✓] {cls}/{subj}/{title}")
    except Exception as e:
        print(f"[✗] {title}: {e}")

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    pages = list_subject_pages()
    tasks=[]
    for cls in sorted(pages, key=int):
        for subj, url in pages[cls]:
            print(f"\n[·] C{cls}, S={subj}")
            for title, pdf in list_chapter_pdfs(cls, subj, url):
                tasks.append((cls, subj, title, pdf))

    print(f"\n[·] Downloading {len(tasks)} PDFs with {CONCURRENCY} workers…\n")
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
        ex.map(download, tasks)
    print("\n✅ step1 complete!")

if __name__=="__main__":
    main()
