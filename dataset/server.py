from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Allow frontend to connect (important for localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset once
with open("ncert_dataset.jsonl", "r", encoding="utf-8") as f:
    dataset = [json.loads(line) for line in f]

@app.get("/api/chapters")
def get_chapters(
    class_no: str = Query(..., alias="class"), 
    subject: str = Query(...)
):
    # class_no should be string like "6"
    # subject should be "math" or "science"

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
