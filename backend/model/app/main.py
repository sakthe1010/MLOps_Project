from fastapi import FastAPI, HTTPException, Depends, Header, Form, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import MCQSet, MCQRequest, ReportSchema, ReportResponse
from app.generator import generate_raw_mcqs_from_corpus, parse_mcqs
from app import auth, models, database
from starlette_exporter import PrometheusMiddleware, handle_metrics
from sqlalchemy import engine_from_config
from app.database import Base, engine, get_db
import json
import uuid
from typing import List, Dict

app = FastAPI()

# automatically instruments all routes under /,
# grouping by path and method
app.add_middleware(
    PrometheusMiddleware,
    app_name="ncert_mcq_api",
    group_paths=True,
)

# Expose /metrics for Prometheus to scrape
app.add_route("/metrics", handle_metrics)

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

@app.post(
    "/api/user/report",
    response_model=ReportResponse,
    summary="Save a test/practice report"
)
def save_report(
    report: ReportSchema,
    db: Session = Depends(get_db)
):
    new = models.ReportModel(**report.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.get(
    "/api/user/reports",
    response_model=List[ReportResponse],
    summary="Fetch last 10 reports for a user"
)
def get_reports(
    username: str = Query(..., description="Username to fetch reports for"),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.ReportModel)
          .filter(models.ReportModel.username == username)
          .order_by(models.ReportModel.date.desc())
          .limit(10)
          .all()
    )

@app.get(
    "/api/user/reports/{report_id}",
    response_model=ReportResponse,
    summary="Fetch a single report by ID"
)
def get_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    rpt = db.query(models.ReportModel).get(report_id)
    if not rpt:
        raise HTTPException(404, "Report not found")
    return rpt

@app.get(
    "/api/user/wrong-questions",
    response_model=List[Dict],
    summary="Aggregate all wrong questions for a user"
)
def get_wrong_questions(
    username: str = Query(..., description="Username to fetch wrong questions for"),
    db: Session = Depends(get_db)
):
    reports = (
        db.query(models.ReportModel)
          .filter(models.ReportModel.username == username)
          .order_by(models.ReportModel.date.desc())
          .all()
    )
    out = []
    for r in reports:
        out.extend(r.wrong_questions)
    return out
