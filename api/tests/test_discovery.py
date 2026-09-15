import pytest

from app.data import load_jobs
from app.discovery import STUDIABLE_SUBJECTS, TOP_N_PER_SUBJECT, discover_job

JOBS = load_jobs()


def test_discover_job_returns_from_subject_pool():
    subject = "数学"
    pool_ids = set(JOBS.nlargest(TOP_N_PER_SUBJECT, f"subject_{subject}_z")["job_id"])
    job = discover_job(subject, known_job_ids=[])
    assert job is not None
    assert job["job_id"] in pool_ids


def test_discover_job_excludes_known():
    subject = "理科"
    pool_ids = list(JOBS.nlargest(TOP_N_PER_SUBJECT, f"subject_{subject}_z")["job_id"])
    job = discover_job(subject, known_job_ids=pool_ids[:-1])
    assert job is not None
    assert job["job_id"] == pool_ids[-1]


def test_discover_job_exhausted_returns_none():
    subject = "英語"
    pool_ids = list(JOBS.nlargest(TOP_N_PER_SUBJECT, f"subject_{subject}_z")["job_id"])
    assert discover_job(subject, known_job_ids=pool_ids) is None


def test_discover_job_invalid_subject_raises():
    with pytest.raises(ValueError):
        discover_job("保健体育", known_job_ids=[])


def test_all_studiable_subjects_have_a_score_column():
    for subject in STUDIABLE_SUBJECTS:
        assert f"subject_{subject}_z" in JOBS.columns


def test_discover_job_has_tags():
    job = discover_job("社会", known_job_ids=[])
    assert job is not None
    assert 1 <= len(job["tags"]) <= 3
