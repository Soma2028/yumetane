import pytest

from app.data import load_jobs
from app.discovery import STUDIABLE_SUBJECTS, TOP_N_PER_SUBJECT, discover_job, score_column

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
        assert score_column(subject) in JOBS.columns


def test_art_and_music_share_the_same_score_column():
    # job tagは「芸術」1項目分のスコアしか持たないため、美術・音楽は同じ列を参照する
    assert score_column("美術") == score_column("音楽") == "subject_美術・音楽_z"


def test_art_and_music_have_the_same_candidate_pool():
    pool_art = set(JOBS.nlargest(TOP_N_PER_SUBJECT, score_column("美術"))["job_id"])
    pool_music = set(JOBS.nlargest(TOP_N_PER_SUBJECT, score_column("音楽"))["job_id"])
    assert pool_art == pool_music


def test_discover_job_has_tags():
    job = discover_job("社会", known_job_ids=[])
    assert job is not None
    assert 1 <= len(job["tags"]) <= 3
