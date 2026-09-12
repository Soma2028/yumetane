from fastapi.testclient import TestClient

from app.data import load_jobs
from app.main import app
from app.scoring import MAX_CARDS

client = TestClient(app)

JOBS = load_jobs()
JOB_A = int(JOBS.iloc[0].job_id)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_next_card_with_empty_history():
    r = client.post("/cards/next", json={"history": []})
    assert r.status_code == 200
    body = r.json()
    assert body["done"] is False
    assert body["card"]["job_id"]


def test_next_card_excludes_shown_and_eventually_stops():
    history = []
    seen = set()
    for _ in range(MAX_CARDS + 5):
        r = client.post("/cards/next", json={"history": history})
        body = r.json()
        if body["done"]:
            break
        job_id = body["card"]["job_id"]
        assert job_id not in seen
        seen.add(job_id)
        history.append({"job_id": job_id, "direction": "right"})
    assert len(history) <= MAX_CARDS


def test_next_card_rejects_invalid_direction():
    r = client.post("/cards/next", json={"history": [{"job_id": JOB_A, "direction": "up"}]})
    assert r.status_code == 422


def test_result_returns_jobs_and_explanation():
    history = [{"job_id": JOB_A, "direction": "right"}]
    r = client.post("/result", json={"history": history})
    assert r.status_code == 200
    body = r.json()
    assert body["explanation"]
    assert len(body["jobs"]) > 0
    assert "現実的" in body["riasec"]


def test_result_with_empty_history_does_not_error():
    r = client.post("/result", json={"history": []})
    assert r.status_code == 200


def test_get_job_detail():
    r = client.get(f"/jobs/{JOB_A}")
    assert r.status_code == 200
    assert r.json()["job_id"] == JOB_A


def test_get_job_not_found():
    r = client.get("/jobs/999999")
    assert r.status_code == 404


def test_old_quiz_endpoints_are_gone():
    assert client.get("/questions").status_code == 404
    assert client.post("/answers", json={}).status_code == 404
