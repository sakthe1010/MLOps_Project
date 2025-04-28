from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Allow frontend to connect (important for localhost development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset once at startup
with open("ncert_dataset.jsonl", "r", encoding="utf-8") as f:
    dataset = [json.loads(line) for line in f]

@app.get("/api/classes")
def get_classes():
    """
    Get all available classes, sorted numerically.
    """
    classes = sorted(set(entry["class"] for entry in dataset), key=lambda x: int(x))
    if not classes:
        raise HTTPException(status_code=404, detail="No classes found.")
    return {"classes": classes}

@app.get("/api/subjects")
def get_subjects(
    class_no: str = Query(..., alias="class")
):
    """
    Get all available subjects for a given class.
    """
    subjects = sorted(
        set(entry["subject"].capitalize() for entry in dataset if entry["class"] == class_no)
    )
    if not subjects:
        raise HTTPException(status_code=404, detail="No subjects found for this class.")
    return {"subjects": subjects}

@app.get("/api/chapters")
def get_chapters(
    class_no: str = Query(..., alias="class"), 
    subject: str = Query(...)
):
    """
    Get all available chapters for a given class and subject.
    """
    chapters = sorted(
        set(
            entry["chapter"]
            for entry in dataset
            if entry["class"] == class_no and entry["subject"].lower() == subject.lower()
        )
    )
    if not chapters:
        raise HTTPException(status_code=404, detail="No chapters found.")
    return {"chapters": chapters}
