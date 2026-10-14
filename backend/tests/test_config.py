import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_settings_uses_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("APP_SERVICE_NAME", raising=False)
    monkeypatch.delenv("APP_ENVIRONMENT", raising=False)

    settings = Settings()

    assert settings.service_name == "Diabetes Mellitus Prediction"
    assert settings.environment == "local"


def test_settings_reads_environment_variables(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_SERVICE_NAME", "Test Service")
    monkeypatch.setenv("APP_ENVIRONMENT", "test")

    settings = Settings()

    assert settings.service_name == "Test Service"
    assert settings.environment == "test"


def test_settings_validates_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENVIRONMENT", "invalid")

    with pytest.raises(ValidationError):
        Settings()
