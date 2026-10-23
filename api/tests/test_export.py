import json
from pathlib import Path

from app.data import load_jobs
from app.discovery import STUDIABLE_SUBJECTS, TOP_N_PER_SUBJECT, score_column
from app.export import build_web_data

WEB_DATA_PATH = Path(__file__).resolve().parents[2] / "web" / "src" / "data" / "jobs.json"
JOBS = load_jobs()


def test_web_data_is_up_to_date():
    """jobs.csvやapi/app/のロジックを変えたのにJSONを書き出し直していないと失敗する。
    直し方: api/.venv/bin/python3 scripts/export_web_data.py"""
    committed = json.loads(WEB_DATA_PATH.read_text(encoding="utf-8"))
    assert committed == build_web_data()


def test_pools_match_discover_candidates():
    data = build_web_data()
    for subject in STUDIABLE_SUBJECTS:
        expected = list(JOBS.nlargest(TOP_N_PER_SUBJECT, score_column(subject))["job_id"])
        assert [p["job_id"] for p in data["pools"][subject]] == expected


def test_every_pool_job_has_details():
    data = build_web_data()
    job_ids = {j["job_id"] for j in data["jobs"]}
    for pool in data["pools"].values():
        assert {p["job_id"] for p in pool} <= job_ids


def test_jobtag_url_uses_record_number_not_job_id():
    """job_id（通し番号）ではなくjob tagの収録番号でURLを作っていること。
    ブラウザで確認済み: Detail/3 が「洋菓子製造、パティシエ」のページ。"""
    jobs = {j["job_name"]: j for j in build_web_data()["jobs"]}
    patissier = jobs["洋菓子製造、パティシエ"]
    assert patissier["job_id"] == 2
    assert patissier["jobtag_url"] == "https://shigoto.mhlw.go.jp/User/Occupation/Detail/3"
