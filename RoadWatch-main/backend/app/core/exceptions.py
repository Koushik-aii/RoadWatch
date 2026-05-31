"""Custom API exceptions and handlers."""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 400, code: str = "app_error"):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            f"{resource} '{identifier}' not found.",
            status_code=404,
            code="not_found",
        )


class ValidationError(AppException):
    def __init__(self, message: str):
        super().__init__(message, status_code=422, code="validation_error")


async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code},
    )


async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, list):
        message = detail
    else:
        message = detail
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": message, "code": "http_error"},
    )
