from fastapi import FastAPI, HTTPException, Depends, Header, Form, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import MCQSet, MCQRequest
from app.generator import generate_raw_mcqs_from_corpus, parse_mcqs
from app import auth, models
from app.database import Base, engine, get_db
import json

app = FastAPI()

# 🌟 Create database tables
models.Base.metadata.create_all(bind=engine)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load NCERT dataset at startup
with open("../airflow/dags/ncert_dataset.jsonl", "r", encoding="utf-8") as f:
    dataset = [json.loads(line) for line in f]

# ✅ Register user
@app.post("/api/register")
def register(username: str = Form(...), password: str = Form(...)):
    try:
        auth.register_user(username, password)
        return {"msg": "User registered successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ✅ Login user
@app.post("/api/login")
def login(username: str = Form(...), password: str = Form(...)):
    user = auth.authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token(data={"sub": username})
    return {"access_token": token, "token_type": "bearer"}

# ✅ Auth dependency
def get_current_user(authorization: str = Header(...)):
    try:
        token_type, token = authorization.split()
        if token_type.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    username = auth.decode_access_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

# ✅ Generate MCQs (Protected)
@app.post("/api/generate-mcqs", response_model=MCQSet)
def generate_mcqs_endpoint(request: MCQRequest, current_user: str = Depends(get_current_user)):
    counts = {
        "easy": request.difficulty_counts.easy,
        "medium": request.difficulty_counts.medium,
        "hard": request.difficulty_counts.hard
    }

    raw_text, model_used = generate_raw_mcqs_from_corpus(
        class_=request.class_,
        subject=request.subject,
        chapter=request.chapter,
        difficulty_counts=counts
    )

    if not raw_text:
        raise HTTPException(500, "No MCQs generated.")

    parsed = parse_mcqs(raw_text)

    if not parsed:
        raise HTTPException(500, "Parsed MCQ list empty")

    return MCQSet(
        class_=request.class_,
        subject=request.subject,
        chapter=request.chapter,
        difficulty="mixed",
        model_used=model_used,
        mcqs=parsed
    )

# ✅ Class metadata API
@app.get("/api/classes")
def get_classes():
    classes = sorted(set(entry["class"] for entry in dataset), key=lambda x: int(x))
    if not classes:
        raise HTTPException(status_code=404, detail="No classes found.")
    return {"classes": classes}

# ✅ Subject metadata API
@app.get("/api/subjects")
def get_subjects(class_no: str = Query(..., alias="class")):
    subjects = sorted(
        set(entry["subject"].capitalize() for entry in dataset if entry["class"] == class_no)
    )
    if not subjects:
        raise HTTPException(status_code=404, detail="No subjects found for this class.")
    return {"subjects": subjects}

# ✅ Chapter metadata API
@app.get("/api/chapters")
def get_chapters(class_no: str = Query(..., alias="class"), subject: str = Query(...)):
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
