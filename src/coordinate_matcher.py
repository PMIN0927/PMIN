from __future__ import annotations

import logging
from typing import Any

from .config import ADDRESS_COLUMNS, CATEGORY_COLUMNS, NAME_COLUMNS, ROLE_COLUMNS
from .kakao_client import KakaoLocalClient
from .text_utils import category_similarity, clean_text, has_forbidden_keyword, infer_role, is_busanjingu, similarity


LOGGER = logging.getLogger(__name__)


def extract_first(row: dict, candidates: list[str]) -> str:
    for column in candidates:
        value = clean_text(row.get(column, ""))
        if value:
            return value
    return ""


def match_coordinates(rows: list[dict], client: KakaoLocalClient) -> list[dict]:
    matched = []
    total = len(rows)
    for idx, row in enumerate(rows, start=1):
        name = extract_first(row, NAME_COLUMNS)
        address = extract_first(row, ADDRESS_COLUMNS)
        category = extract_first(row, CATEGORY_COLUMNS)
        LOGGER.info("좌표 검색 중 %s/%s: %s", idx, total, name or address or "(이름 없음)")
        try:
            matched.append(match_one(row, client, name, address, category))
        except Exception as exc:
            LOGGER.exception("좌표 검색 실패: %s", name)
            failed = dict(row)
            failed.update(_empty_coordinate_fields())
            failed["coordinate_source"] = "failed"
            failed["coordinate_review_status"] = "검색실패"
            failed["coordinate_memo"] = f"API 오류: {exc}"
            matched.append(failed)
    return matched


def match_one(row: dict, client: KakaoLocalClient, name: str, address: str, category: str) -> dict:
    candidates = []
    if address:
        for doc in client.search_address(address):
            candidates.append(_candidate_from_address(doc, name, address, category))
    if not candidates:
        for query in _keyword_queries(name):
            for doc in client.search_keyword(query):
                candidates.append(_candidate_from_keyword(doc, name, address, category, query))
            if any(candidate["score"] >= 80 for candidate in candidates):
                break

    result = dict(row)
    if not candidates:
        result.update(_empty_coordinate_fields())
        result["coordinate_source"] = "failed"
        result["coordinate_review_status"] = "검색실패"
        result["coordinate_memo"] = _memo(row, "검색 결과 없음")
        return result

    candidates.sort(key=lambda item: item["score"], reverse=True)
    best = candidates[0]
    result.update(
        {
            "kakao_place_name": best["place_name"],
            "kakao_place_id": best["place_id"],
            "kakao_category_name": best["category_name"],
            "kakao_road_address": best["road_address"],
            "kakao_address": best["address"],
            "longitude": best["x"],
            "latitude": best["y"],
            "kakao_place_url": best["place_url"],
            "coordinate_source": best["source"],
            "coordinate_match_score": best["score"],
            "coordinate_review_status": _status(best["score"]),
            "coordinate_memo": _memo(row, best["memo"]),
        }
    )
    return result


def _keyword_queries(name: str) -> list[str]:
    if not name:
        return []
    queries = [name]
    if "서면" not in name:
        queries.append(f"{name} 서면")
    if "전포" not in name:
        queries.append(f"{name} 전포")
    return list(dict.fromkeys(queries))


def _candidate_from_address(doc: dict[str, Any], name: str, address: str, category: str) -> dict:
    road = clean_text(doc.get("road_address", {}).get("address_name", ""))
    addr = clean_text(doc.get("address", {}).get("address_name", doc.get("address_name", "")))
    score = 0
    if is_busanjingu(road, addr):
        score += 30
    if address and (similarity(address, road) >= 70 or similarity(address, addr) >= 70):
        score += 20
    memo = "주소 검색 결과"
    return {
        "place_name": "",
        "place_id": "",
        "category_name": "",
        "road_address": road,
        "address": addr,
        "x": doc.get("x", ""),
        "y": doc.get("y", ""),
        "place_url": "",
        "source": "address_search",
        "score": min(score, 100),
        "memo": memo,
    }


def _candidate_from_keyword(doc: dict[str, Any], name: str, address: str, category: str, query: str) -> dict:
    place_name = clean_text(doc.get("place_name", ""))
    road = clean_text(doc.get("road_address_name", ""))
    addr = clean_text(doc.get("address_name", ""))
    kakao_category = clean_text(doc.get("category_name", ""))
    name_score = similarity(name, place_name)
    score = 0
    if is_busanjingu(road, addr):
        score += 30
    if name_score >= 82:
        score += 40
    elif name_score >= 65:
        score += 28
    elif name_score >= 45:
        score += 15
    if address and (similarity(address, road) >= 70 or similarity(address, addr) >= 70):
        score += 20
    if category_similarity(category, kakao_category):
        score += 10
    return {
        "place_name": place_name,
        "place_id": doc.get("id", ""),
        "category_name": kakao_category,
        "road_address": road,
        "address": addr,
        "x": doc.get("x", ""),
        "y": doc.get("y", ""),
        "place_url": doc.get("place_url", ""),
        "source": "keyword_search",
        "score": min(score, 100),
        "memo": f"키워드 검색어: {query}",
    }


def _status(score: int) -> str:
    if score >= 80:
        return "확인완료"
    if score >= 60:
        return "후보확인"
    return "검수필요"


def _empty_coordinate_fields() -> dict:
    return {
        "kakao_place_name": "",
        "kakao_place_id": "",
        "kakao_category_name": "",
        "kakao_road_address": "",
        "kakao_address": "",
        "longitude": "",
        "latitude": "",
        "kakao_place_url": "",
        "coordinate_source": "",
        "coordinate_match_score": 0,
        "coordinate_review_status": "",
        "coordinate_memo": "",
    }


def _memo(row: dict, base: str) -> str:
    parts = [base] if base else []
    text = " ".join(clean_text(value) for value in row.values())
    if has_forbidden_keyword(text):
        parts.append("제외검토")
    role = extract_first(row, ROLE_COLUMNS) or infer_role(row)
    if role == "카페" and any(word in text for word in ["방탈출카페", "보드게임카페", "사주카페"]):
        parts.append("활동형 카페이므로 중간경유지 유지")
    return "; ".join(parts)
