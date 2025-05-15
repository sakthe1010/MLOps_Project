import pytest
from app.generator import parse_mcqs

@pytest.fixture
def sample_raw_mcqs():
    return """
**MCQ 1 (Easy):**
What is the capital of France?

(A) London
(B) Berlin
(C) Paris
(D) Rome

Answer: C

**MCQ 2 (Medium):**
Which planet is known as the Red Planet?

(A) Earth
(B) Mars
(C) Jupiter
(D) Saturn

Answer: B

**MCQ 3:**
What color do you get when you mix red and white?

(A) Pink
(B) Purple
(C) Orange
(D) Brown

Answer: A
"""

def test_parse_mcqs_counts(sample_raw_mcqs):
    mcqs = parse_mcqs(sample_raw_mcqs)
    # should parse all 3 valid MCQs
    assert len(mcqs) == 3

def test_first_mcq_content(sample_raw_mcqs):
    mcqs = parse_mcqs(sample_raw_mcqs)
    first = mcqs[0]
    assert first["difficulty"] == "easy"
    assert first["question"].startswith("What is the capital of France")
    assert first["options"] == {
        "A": "London",
        "B": "Berlin",
        "C": "Paris",
        "D": "Rome",
    }
    assert first["answer"] == "C"

def test_unlabeled_difficulty_defaults_to_mixed(sample_raw_mcqs):
    mcqs = parse_mcqs(sample_raw_mcqs)
    third = mcqs[2]
    # third MCQ had no (Easy/Medium/Hard) tag
    assert third["difficulty"] == "mixed"
    assert third["answer"] == "A"

def test_malformed_block_skipped():
    bad_raw = """
**MCQ 1 (Easy):**
Incomplete question

(A) Only one option

Answer: A
"""
    mcqs = parse_mcqs(bad_raw)
    assert mcqs == []  # skip blocks without 4 options + answer
