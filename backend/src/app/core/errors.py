from collections.abc import Awaitable, Callable
from typing import cast

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.responses import Response

from app.middleware.request_id import (
    REQUEST_ID_HEADER,
    get_request_id,
    resolve_request_id,
)
from app.schemas.errors import ErrorResponse

VALIDATION_ERROR_TYPE = "https://example.com/problems/validation-error"
UNEXPECTED_ERROR_TYPE = "https://example.com/problems/internal-server-error"
ExceptionHandler = Callable[[Request, Exception], Awaitable[Response]]


def add_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(
        RequestValidationError,
        cast(ExceptionHandler, validation_error_handler),
    )
    app.add_exception_handler(Exception, unexpected_error_handler)


def get_error_request_id(request: Request) -> str:
    return get_request_id() or resolve_request_id(
        request.headers.get(REQUEST_ID_HEADER)
    )


async def validation_error_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    request_id = get_error_request_id(request)
    content = ErrorResponse(
        type=VALIDATION_ERROR_TYPE,
        title="Validation Error",
        status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="The request is invalid.",
        request_id=request_id,
    ).model_dump(by_alias=True)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=content,
        headers={REQUEST_ID_HEADER: request_id},
    )


async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = get_error_request_id(request)
    request.app.state.logger.exception(
        "Unhandled exception",
        extra={"request_id": request_id},
    )
    content = ErrorResponse(
        type=UNEXPECTED_ERROR_TYPE,
        title="Internal Server Error",
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred.",
        request_id=request_id,
    ).model_dump(by_alias=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=content,
        headers={REQUEST_ID_HEADER: request_id},
    )
