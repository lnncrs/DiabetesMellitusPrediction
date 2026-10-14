from fastapi import status
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_liveness_health_response() -> None:
    app = create_app(Settings(service_name="Test Service", environment="test"))
    client = TestClient(app)

    response = client.get("/api/health/live")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "status": "ok",
        "serviceName": "Test Service",
        "version": "0.1.0",
        "environment": "test",
        "checks": {},
    }


def test_readiness_health_response() -> None:
    app = create_app(Settings(service_name="Test Service", environment="test"))
    client = TestClient(app)

    response = client.get("/api/health/ready")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "ok"
    assert response.json()["checks"] == {}
