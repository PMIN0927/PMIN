from __future__ import annotations

import logging
import time
from typing import Any

import requests


LOGGER = logging.getLogger(__name__)


class NaverLocalClient:
    URL = "https://openapi.naver.com/v1/search/local.json"

    def __init__(self, client_id: str, client_secret: str, timeout: int = 10, max_retries: int = 3) -> None:
        if not client_id or not client_secret:
            raise ValueError("NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 비어 있습니다.")
        self.session = requests.Session()
        self.session.headers.update({"X-Naver-Client-Id": client_id, "X-Naver-Client-Secret": client_secret})
        self.timeout = timeout
        self.max_retries = max_retries

    def search_local(self, query: str, display: int = 5) -> list[dict[str, Any]]:
        params = {"query": query, "display": display, "start": 1, "sort": "random"}
        last_error: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                response = self.session.get(self.URL, params=params, timeout=self.timeout)
                if response.status_code == 429:
                    LOGGER.warning("Naver API 요청 제한 가능성: 대기 후 재시도")
                    time.sleep(2 * attempt)
                    continue
                if response.status_code >= 500:
                    LOGGER.warning("Naver API 서버 오류 %s", response.status_code)
                    time.sleep(1.5 * attempt)
                    continue
                response.raise_for_status()
                return response.json().get("items", [])
            except requests.exceptions.RequestException as exc:
                last_error = exc
                LOGGER.warning("Naver API 호출 실패 %s/%s query=%s error=%s", attempt, self.max_retries, query, exc)
                time.sleep(1.5 * attempt)
        raise RuntimeError(f"Naver API 호출 최종 실패: {query}") from last_error
