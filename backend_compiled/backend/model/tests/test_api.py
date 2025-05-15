import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import create_access_token
from app import auth as auth_module

client = TestClient(app)

@pytest.fixture(autouse=True)
def stub_auth(monkeypatch):
    # bypass real DB/auth for register & login
    monkeypatch.setattr(auth_module, "register_user", lambda u,p: True)
    monkeypatch.setattr(auth_module, "authenticate_user", lambda u,p: True)

@pytest.fixture
def token():
    return create_access_token({"sub":"test_user"})

def test_register_and_login():
    r = client.post("/api/register", data={"username":"x","password":"y"})
    assert r.status_code == 200

    r = client.post("/api/login", data={"username":"x","password":"y"})
    assert r.status_code == 200
    assert "access_token" in r.json()  

def test_generate_mcqs_happy_path(monkeypatch, token):
    # stub the generator functions
    monkeypatch.setattr("app.generator.generate_raw_mcqs_from_corpus",
        lambda **kwargs: ("**MCQ 1 (Mixed):** Q\n\n(A) A\n(B) B\n(C) C\n(D) D\n\nAnswer: A","modelX"))
    monkeypatch.setattr("app.generator.parse_mcqs",
        lambda raw: [{"question":"Q","options":{"A":"A","B":"B","C":"C","D":"D"},"answer":"A","difficulty":"mixed"}])

    headers = {"Authorization": f"Bearer {token}"}
    payload = {"class_":"10","subject":"english","chapter":"Chapter 1: A Letter to God","difficulty_counts":{"easy":1,"medium":0,"hard":0}}
    r = client.post("/api/generate-mcqs", json=payload, headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["model_used"] == "gemini-1.5-flash-latest" or data["model_used"] == "gemini-1.5-pro-latest"
