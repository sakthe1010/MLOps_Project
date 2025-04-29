from pydantic import BaseModel
from typing import Dict, List

class DifficultyRequest(BaseModel):
    easy: int = 0
    medium: int = 0
    hard: int = 0

class MCQ(BaseModel):
    question: str
    options: Dict[str, str]
    answer: str
    difficulty: str  # ✅ Added difficulty to each MCQ

class MCQSet(BaseModel):
    class_: str
    subject: str
    chapter: str
    difficulty: str
    model_used: str
    mcqs: List[MCQ]

class MCQRequest(BaseModel):
    class_: str
    subject: str
    chapter: str
    difficulty_counts: DifficultyRequest
