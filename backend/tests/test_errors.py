from collections.abc import Iterator
from uuid import uuid4

import pytest
from fastapi import APIRouter
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


@pytest.fixture
def client() -> Iterator[TestClient]:
    router = APIRouter()

    @router.get("/boom")
    def boom() -> None:
        raise RuntimeError("sensitive internal detail")

    app = create_app(Settings(environment="test"))
    app.include_router(router, prefix="/api")

    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client


def test_unexpected_error_response_includes_request_id(
    client: TestClient,
) -> None:
    request_id = str(uuid4())

    response = client.get("/api/boom", headers={"X-Request-ID": request_id})

    assert response.status_code == 500
    assert response.headers["X-Request-ID"] == request_id
    assert response.json() == {
        "type": "https://example.com/problems/internal-server-error",
        "title": "Internal Server Error",
        "status": 500,
        "detail": "An unexpected error occurred.",
        "requestId": request_id,
    }
    assert "sensitive internal detail" not in response.text
