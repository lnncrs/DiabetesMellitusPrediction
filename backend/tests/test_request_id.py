from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_valid_request_id_is_propagated() -> None:
    request_id = str(uuid4())
    client = TestClient(create_app(Settings(environment="test")))

    response = client.get(
        "/api/health/live",
        headers={"X-Request-ID": request_id},
    )

    assert response.headers["X-Request-ID"] == request_id


def test_missing_request_id_is_generated() -> None:
    client = TestClient(create_app(Settings(environment="test")))

    response = client.get("/api/health/live")

    assert UUID(response.headers["X-Request-ID"])


def test_invalid_request_id_is_replaced() -> None:
    client = TestClient(create_app(Settings(environment="test")))

    response = client.get(
        "/api/health/live",
        headers={"X-Request-ID": "not-a-valid-request-id"},
    )

    assert response.headers["X-Request-ID"] != "not-a-valid-request-id"
    assert UUID(response.headers["X-Request-ID"])
