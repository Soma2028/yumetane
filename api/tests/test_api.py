from fastapi.testclient import TestClient

from app.data import load_jobs
from app.discovery import STUDIABLE_SUBJECTS, TOP_N_PER_SUBJECT
from app.main import app

client = TestClient(app)

JOBS = load_jobs()
JOB_A = int(JOBS.iloc[0].job_id)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_subjects_matches_studiable_subjects():
    r = client.get("/subjects")
    assert r.status_code == 200
    assert r.json() == STUDIABLE_SUBJECTS
    # 保健体育は対応する知識項目が無いため含まれないはず
    assert "保健体育" not in r.json()


def test_discover_returns_a_job():
    r = client.post("/discover", json={"subject": "数学", "known_job_ids": []})
    assert r.status_code == 200
    body = r.json()
    assert body["exhausted"] is False
    assert body["job"]["job_id"]
    assert body["job"]["tags"]


def test_discover_excludes_known_jobs_until_pool_exhausted():
    subject = "国語"
    known: list[int] = []
    seen = set()
    for _ in range(TOP_N_PER_SUBJECT + 3):
        r = client.post("/discover", json={"subject": subject, "known_job_ids": known})
        body = r.json()
        if body["exhausted"]:
            break
        job_id = body["job"]["job_id"]
        assert job_id not in seen
        seen.add(job_id)
        known.append(job_id)
    assert len(seen) <= TOP_N_PER_SUBJECT


def test_discover_unknown_subject_returns_422():
    r = client.post("/discover", json={"subject": "保健体育", "known_job_ids": []})
    assert r.status_code == 422


def test_areas_endpoint():
    r = client.get("/areas")
    assert r.status_code == 200
    body = r.json()
    assert sum(body.values()) == len(JOBS)


def test_get_job_detail():
    r = client.get(f"/jobs/{JOB_A}")
    assert r.status_code == 200
    assert r.json()["job_id"] == JOB_A
    assert r.json()["area"]


def test_get_job_not_found():
    r = client.get("/jobs/999999")
    assert r.status_code == 404


def test_old_endpoints_are_gone():
    assert client.get("/questions").status_code == 404
    assert client.post("/answers", json={}).status_code == 404
    assert client.post("/cards/next", json={}).status_code == 404
    assert client.post("/result", json={}).status_code == 404
