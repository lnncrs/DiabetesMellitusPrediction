import pytest

from app.core.config import Settings


@pytest.fixture(autouse=True)
def isolate_local_settings(monkeypatch: pytest.MonkeyPatch) -> None:
    """Testes não dependem do .env local nem consultam o MLflow do desenvolvedor."""
    monkeypatch.setitem(Settings.model_config, "env_file", None)
    for name in (
        "APP_MLFLOW_TRACKING_URI",
        "APP_MLFLOW_MODEL_NAME",
        "APP_MLFLOW_MODEL_VERSION",
    ):
        monkeypatch.delenv(name, raising=False)
