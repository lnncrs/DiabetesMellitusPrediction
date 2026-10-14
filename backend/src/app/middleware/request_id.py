from contextvars import ContextVar
from uuid import UUID, uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-ID"

request_id_context: ContextVar[str | None] = ContextVar(
    "request_id",
    default=None,
)


def get_request_id() -> str | None:
    return request_id_context.get()


def is_valid_request_id(value: str) -> bool:
    try:
        UUID(value)
    except ValueError:
        return False
    return True


def resolve_request_id(value: str | None) -> str:
    if value and is_valid_request_id(value):
        return value
    return str(uuid4())


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[no-untyped-def]
        request_id = resolve_request_id(request.headers.get(REQUEST_ID_HEADER))
        token = request_id_context.set(request_id)
        try:
            response = await call_next(request)
            response.headers[REQUEST_ID_HEADER] = request_id
            return response
        finally:
            request_id_context.reset(token)
