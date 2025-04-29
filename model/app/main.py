from fastapi import FastAPI, HTTPException, Depends, Header, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import MCQSet, MCQRequest
from app.generator import generate_raw_mcqs_from_corpus, parse_mcqs
from app import auth
from app.database import Base, engine
from app import models


app = FastAPI()

# 🌟 Create database tables
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/register")
def register(username: str = Form(...), password: str = Form(...)):
    try:
        auth.register_user(username, password)
        return {"msg": "User registered successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/login")
def login(username: str = Form(...), password: str = Form(...)):
    user = auth.authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token(data={"sub": username})
    return {"access_token": token, "token_type": "bearer"}

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
