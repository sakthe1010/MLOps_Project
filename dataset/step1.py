import os, re, yaml, requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor

# load config
with open("config.yaml") as f:
    cfg = yaml.safe_load(f)

BASE_URL   = cfg["base_url"].rstrip("/")
OUT_DIR    = cfg["download"]["output_dir"]
CONCURRENCY= cfg["download"].get("concurrency", 4)

def slugify(text):
    return re.sub(r"[^\w\-]+", "_", text).strip("_")

def list_chapters(class_no, subject):
    subject_url = f"{BASE_URL}/class-{class_no}/{subject}"
    print(f"\n[·] Fetching chapters from {subject_url}")
    resp = requests.get(subject_url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # look for any <a> whose href starts with /class-<N>/<subject>/chapter-
    href_re = re.compile(rf"^/class-{class_no}/{subject}/chapter-\d+", re.I)
    anchors = soup.find_all("a", href=href_re)

    chapters = []
    for a in anchors:
        href = a["href"]
        full_url = urljoin(BASE_URL, href)
        # try to pull out the <h2> text inside the link
        h2 = a.find("h2")
        title = h2.get_text(strip=True) if h2 else href.split("/")[-1]
        print(f"    → {title}  ->  {full_url}")
        chapters.append((title, full_url))

    if not chapters:
        print(f"    (!) No chapters found for Class {class_no}, Subject {subject}")
    return chapters

def download_chapter(class_no, subject, chap_title, chap_url):
    resp = requests.get(chap_url); resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # find the real Download PDF link
    dl = soup.find(
        lambda tag: tag.name=="a"
        and "href" in tag.attrs
        and re.search(r"download\s*pdf", tag.get_text(" ", True), re.I)
    )
    if not dl:
        print(f"[✗] No PDF link on {chap_url}")
        return

    pdf_url = urljoin(BASE_URL, dl["href"])
    safe_title = slugify(chap_title)
    save_dir   = os.path.join(OUT_DIR, f"class_{class_no}", subject)
    os.makedirs(save_dir, exist_ok=True)
    out_path   = os.path.join(save_dir, f"{safe_title}.pdf")

    pdf_data = requests.get(pdf_url); pdf_data.raise_for_status()
    with open(out_path, "wb") as f:
        f.write(pdf_data.content)
    print(f"[✓] Saved → {out_path}")

def main():
    tasks = []
    for class_no, opts in cfg["classes"].items():
        if opts.get("skip"): continue
        subjects = opts["subjects"]
        if subjects == "all":
            subjects = ["science","math","english","hindi","social-science"]  # or fetch dynamically
        for subj in subjects:
            for title, url in list_chapters(class_no, subj):
                tasks.append((class_no, subj, title, url))

    print(f"\n[·] Will download {len(tasks)} chapter PDFs with {CONCURRENCY} threads.\n")
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as exe:
        for c, s, t, u in tasks:
            exe.submit(download_chapter, c, s, t, u)

if __name__ == "__main__":
    main()
