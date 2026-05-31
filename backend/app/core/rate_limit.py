"""In-memory rate limiting for auth and complaint spam prevention."""
from __future__ import annotations

import time
from collections import defaultdict
from threading import Lock

from fastapi import HTTPException, Request, status

from ..config import get_settings

settings = get_settings()
_lock = Lock()
# key -> list of timestamps
_buckets: dict[str, list[float]] = defaultdict(list)


def _prune(key: str, window_seconds: int) -> None:
    now = time.time()
    cutoff = now - window_seconds
    _buckets[key] = [t for t in _buckets[key] if t > cutoff]


def check_rate_limit(key: str, max_requests: int, window_seconds: int) -> None:
    """Raise HTTP 429 if limit exceeded."""
    with _lock:
        _prune(key, window_seconds)
        if len(_buckets[key]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        _buckets[key].append(time.time())


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def rate_limit_auth(request: Request) -> None:
    check_rate_limit(
        f"auth:{client_ip(request)}",
        settings.rate_limit_auth_per_minute,
        60,
    )


def rate_limit_register(request: Request) -> None:
    check_rate_limit(
        f"register:{client_ip(request)}",
        settings.rate_limit_register_per_hour,
        3600,
    )


def rate_limit_complaint_create(user_id: str | None, request: Request) -> None:
    """Per-user and per-IP limits for complaint submissions."""
    window = settings.complaint_rate_limit_window_seconds
    max_user = settings.complaint_rate_limit_per_user
    max_ip = settings.complaint_rate_limit_per_ip

    if user_id:
        check_rate_limit(f"complaint:user:{user_id}", max_user, window)
    check_rate_limit(f"complaint:ip:{client_ip(request)}", max_ip, window)
