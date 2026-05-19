from __future__ import annotations

import html
import re

try:
    from rapidfuzz import fuzz
except Exception:  # pragma: no cover
    fuzz = None


def clean_text(value) -> str:
    return html.unescape(str(value or "")).strip()


def normalize_text(value) -> str:
    text = clean_text(value)
    text = re.sub(r"\([^)]*\)", "", text)
    text = re.sub(r"\[[^]]*\]", "", text)
    text = re.sub(r"[^0-9a-zA-Z가-힣]", "", text)
    for word in ["부산광역시", "부산진구", "부산", "서면", "전포", "부전", "본점", "직영점", "점"]:
        text = text.replace(word, "")
    return text.lower()


def similarity(left: str, right: str) -> int:
    a = normalize_text(left)
    b = normalize_text(right)
    if not a or not b:
        return 0
    if a == b:
        return 100
    if len(a) >= 3 and len(b) >= 3 and (a in b or b in a):
        return 92
    if fuzz:
        return int(fuzz.ratio(a, b))
    from difflib import SequenceMatcher

    return int(SequenceMatcher(None, a, b).ratio() * 100)


def is_busanjingu(*values: str) -> bool:
    text = " ".join(clean_text(value) for value in values)
    return "부산광역시 부산진구" in text or "부산 부산진구" in text or "부산진구" in text


def has_forbidden_keyword(*values: str) -> bool:
    text = " ".join(clean_text(value).lower() for value in values)
    return any(word in text for word in ["홀덤", "포커", "poker", "카지노"])


def category_similarity(left: str, right: str) -> bool:
    left_norm = normalize_text(left)
    right_norm = normalize_text(right)
    if not left_norm or not right_norm:
        return False
    return left_norm in right_norm or right_norm in left_norm or similarity(left, right) >= 55


def infer_role(row: dict) -> str:
    text = " ".join(clean_text(v) for v in row.values())
    if any(word in text for word in ["방탈출", "보드게임카페", "보드게임", "사주카페", "타로", "포토", "사진관", "스튜디오", "오락실", "인형뽑기", "가챠", "소품샵"]):
        return "중간경유지"
    if any(word in text for word in ["이자카야", "술집", "와인", "하이볼", "포차", "맥주", "야키토리", "오뎅바", "바"]):
        return "술"
    if any(word in text for word in ["카페", "커피", "디저트", "베이커리"]):
        return "카페"
    if any(word in text for word in ["식사", "맛집", "국밥", "라멘", "초밥", "돈까스", "고기", "파스타", "쌀국수", "샤브", "중식", "피자"]):
        return "식사"
    return ""
