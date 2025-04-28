from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas import MCQSet, MCQRequest
from app.generator import generate_raw_mcqs_from_corpus, parse_mcqs, stream_raw_mcqs_from_corpus

app = FastAPI()

@app.post("/api/generate-mcqs", response_model=MCQSet)
def generate_mcqs_endpoint(request: MCQRequest):
    raw_mcqs, model_used = generate_raw_mcqs_from_corpus(
        class_=request.class_,
        subject=request.subject,
        chapter=request.chapter,
        difficulty=request.difficulty,
        mcq_count=request.mcq_count
    )

    # ❗ New Important Check
    if not raw_mcqs:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate MCQs for Class {request.class_}, Subject {request.subject}. Please try again later."
        )

    parsed_mcqs = parse_mcqs(raw_mcqs)

    return MCQSet(
        class_=request.class_,
        subject=request.subject,
        chapter=request.chapter,
        difficulty=request.difficulty,
        model_used=model_used,
        mcqs=parsed_mcqs[:request.mcq_count]
    )

@app.post("/api/stream-mcqs")
def stream_mcqs_endpoint(request: MCQRequest):
    streamer = stream_raw_mcqs_from_corpus(
        class_=request.class_,
        subject=request.subject,
        chapter=request.chapter,
        difficulty=request.difficulty,
        mcq_count=request.mcq_count
    )

    return StreamingResponse(streamer, media_type="text/plain")
