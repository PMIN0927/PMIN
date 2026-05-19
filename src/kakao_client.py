from __future__ import annotations

import logging
import time
from typing import Any

import requests


LOGGER = logging.getLogger(__name__)


class KakaoLocalClient:
    BASE_URL = "https://dapi.kakao.com/v2/local"

    def __init__(self, rest_api_key: str, timeout: int = 10, max_retries: int = 3) -> None:
        if not rest_api_key:
            raise ValueError("KAKAO_REST_API_KEY가 비어 있습니다.")
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"KakaoAK {rest_api_key}"})
        self.timeout = timeout
        self.max_retries = max_retries

    def search_address(self, query: str) -> list[dict[str, Any]]:
        data = self._get("/search/address.json", {"query": query, "size": 10})
        return data.get("documents", [])

    def search_keyword(self, query: str) -> list[dict[str, Any]]:
        data = self._get("/search/keyword.json", {"query": query, "size": 10})
        return data.get("documents", [])

    def _get(self, path: str, params: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.BASE_URL}{path}"
        last_error: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                if response.status_code in [401, 403]:
                    raise RuntimeError(f"Kakao 인증/권한 오류 {response.status_code}: {response.text[:200]}")
                if response.status_code == 429:
                    LOGGER.warning("Kakao API 요청 제한(429): %s초 대기 후 재시도", 2 * attempt)
                    time.sleep(2 * attempt)
                    continue
                if response.status_code >= 500:
                    LOGGER.warning("Kakao API 서버 오류 %s: 재시도", response.status_code)
                    time.sleep(1.5 * attempt)
                    continue
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as exc:
                last_error = exc
                LOGGER.warning("Kakao API 호출 실패 %s/%s: %s", attempt, self.max_retries, exc)
                time.sleep(1.5 * attempt)
        raise RuntimeError(f"Kakao API 호출 최종 실패: {params}") from last_error
