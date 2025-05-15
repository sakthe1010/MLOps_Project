import pytest
from datetime import datetime
from pydantic import ValidationError
from app.schemas import ReportSchema, ReportResponse

def test_report_schema_success():
    payload = {
        "username": "alice",
        "mode": "test",
        "score": 8,
        "total": 10,
        "date": "2025-04-30T12:34:56Z",
        "context_json": {"foo": "bar"},
        "wrong_questions": [{"question": "Q1", "selected": "A", "correct": "B"}]
    }
    report = ReportSchema(**payload)
    # round-trip through ReportResponse
    saved = ReportResponse(id="3fa85f64-5717-4562-b3fc-2c963f66afa6", **report.dict())
    assert saved.username == "alice"
    assert saved.id.hex == "3fa85f6457174562b3fc2c963f66afa6"

def test_report_schema_missing_field():
    incomplete = {
        "username": "bob",
        "mode": "practice",
        # missing score/total/date
        "context_json": {},
        "wrong_questions": []
    }
    with pytest.raises(ValidationError) as exc:
        ReportSchema(**incomplete)
    # should mention the missing fields
    errors = exc.value.errors()
    missing = {e["loc"][0] for e in errors}
    assert "score" in missing and "total" in missing and "date" in missing
