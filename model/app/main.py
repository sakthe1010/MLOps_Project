from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from app.schemas import MCQSet, MCQRequest
from app.generator import generate_raw_mcqs_from_corpus, parse_mcqs

app = FastAPI()

@app.post("/api/generate-mcqs", response_model=MCQSet)
def generate_mcqs_endpoint(request: MCQRequest):
    print(f"🔔 Received: {request.dict()}")

    try:
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

        print(f"🔸 Raw Gemini text:\n{raw_text}\n---")

        if not raw_text:
            raise HTTPException(500, "No raw MCQs returned")

        parsed = parse_mcqs(raw_text)
        print(f"🔹 Parsed MCQs ({len(parsed)}):\n{parsed}")

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
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Endpoint error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
