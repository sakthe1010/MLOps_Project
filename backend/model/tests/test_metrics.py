from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_metrics_endpoint():
    r = client.get("/metrics")
    assert r.status_code == 200
    assert "# HELP starlette_requests_total" in r.text
