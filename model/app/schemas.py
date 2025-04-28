from pydantic import BaseModel
from typing import Dict, List

class MCQ(BaseModel):
    question: str
    options: Dict[str, str]
    answer: str

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
    difficulty: str
    mcq_count: int = 10
