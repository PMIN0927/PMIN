from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"

INPUT_XLSX_PATH = DATA_DIR / "final_db_weekly_hours.xlsx"
OUTPUT_XLSX_PATH = OUTPUT_DIR / "final_db_with_coordinates.xlsx"
OUTPUT_CSV_PATH = OUTPUT_DIR / "final_db_with_coordinates.csv"
FAILED_CSV_PATH = OUTPUT_DIR / "coordinate_failed.csv"
REVIEW_CSV_PATH = OUTPUT_DIR / "coordinate_review_needed.csv"
SUMMARY_TXT_PATH = OUTPUT_DIR / "coordinate_summary.txt"

SHEET_PRIORITY = ["통합DB_검수본", "요일별_영업시간", "통합_DB", "전체"]

NAME_COLUMNS = ["가게 이름", "장소명", "네이버_결과명", "원본_장소명", "kakao_place_name", "name"]
ADDRESS_COLUMNS = ["네이버 주소", "도로명주소", "지번주소", "주소", "address", "road_address_name", "address_name"]
CATEGORY_COLUMNS = ["카테고리", "세부카테고리", "naver_category", "category", "category_name"]
ROLE_COLUMNS = ["장소역할", "place_role", "역할"]

ADDED_COLUMNS = [
    "kakao_place_name",
    "kakao_place_id",
    "kakao_category_name",
    "kakao_road_address",
    "kakao_address",
    "longitude",
    "latitude",
    "kakao_place_url",
    "coordinate_source",
    "coordinate_match_score",
    "coordinate_review_status",
    "coordinate_memo",
]


def load_settings() -> dict:
    load_dotenv(BASE_DIR / ".env")
    return {"kakao_rest_api_key": os.getenv("KAKAO_REST_API_KEY", "").strip()}
