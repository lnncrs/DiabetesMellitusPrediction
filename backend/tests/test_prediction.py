from pathlib import Path
from unittest.mock import Mock

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import Settings
from app.inference import FEATURE_COLUMNS, ModelService
from app.main import create_app

SAMPLE = {
    "gestacoes": 0,
    "glicose_plasmatica": 171,
    "pressao_arterial_diastolica": 80,
    "espessura_triceps": 34,
    "insulina_serica": 23,
    "imc": 43.50972593,
    "indice_hereditariedade_diabetes": 1.213191354,
    "idade": 21,
}


def configured_settings() -> Settings:
    return Settings(mlflow_model_name="niddk-diabetes-xgboost", mlflow_model_version=4)


def fake_model() -> Mock:
    model = Mock()
    model.feature_names_in_ = np.array(FEATURE_COLUMNS)
    model.classes_ = np.array([0, 1])
    model.predict.return_value = np.array([1])
    model.predict_proba.return_value = np.array([[0.2, 0.8]])
    return model


def test_prediction_loads_once_and_preserves_named_features(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    download = Mock(return_value="local-model")
    model = fake_model()
    load = Mock(return_value=model)
    monkeypatch.setattr("app.inference.mlflow.artifacts.download_artifacts", download)
    set_tracking = Mock()
    set_registry = Mock()
    monkeypatch.setattr("app.inference.mlflow.set_tracking_uri", set_tracking)
    monkeypatch.setattr("app.inference.mlflow.set_registry_uri", set_registry)
    monkeypatch.setattr("app.inference.mlflow_sklearn.load_model", load)
    with TestClient(create_app(configured_settings())) as client:
        assert client.get("/api/health/ready").status_code == 200
        for _ in range(2):
            response = client.post("/api/predict", json=SAMPLE)
            assert response.status_code == 200
            assert response.json() == {
                "predicted_class": 1,
                "probability_diabetes": 0.8,
                "model_name": "niddk-diabetes-xgboost",
                "model_version": 4,
            }
    download.assert_called_once_with(
        artifact_uri="models:/niddk-diabetes-xgboost/4",
        tracking_uri="http://127.0.0.1:5000/",
        registry_uri="http://127.0.0.1:5000/",
    )
    load.assert_called_once_with("local-model")
    set_tracking.assert_called_once_with("http://127.0.0.1:5000/")
    set_registry.assert_called_once_with("http://127.0.0.1:5000/")
    frame = model.predict.call_args.args[0]
    pd.testing.assert_frame_equal(
        frame, pd.DataFrame([SAMPLE], columns=list(FEATURE_COLUMNS))
    )


def test_load_failure_keeps_liveness_and_disables_prediction(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        ModelService, "load", Mock(side_effect=RuntimeError("secret-host"))
    )
    with TestClient(create_app(configured_settings())) as client:
        assert client.get("/api/health/live").status_code == 200
        assert client.get("/api/health/ready").status_code == 503
        response = client.post("/api/predict", json=SAMPLE)
        assert response.status_code == 503
        assert "secret-host" not in response.text


def test_unconfigured_model_returns_503() -> None:
    with TestClient(create_app(Settings())) as client:
        assert client.post("/api/predict", json=SAMPLE).status_code == 503


@pytest.mark.parametrize(
    "change",
    [
        {"idade": -1},
        {"idade": 21.5},
        {"imc": "NaN"},
        {"id_paciente": 123},
        {"diabetes": 1},
    ],
)
def test_invalid_features_return_422(change: dict[str, object]) -> None:
    with TestClient(create_app(Settings())) as client:
        assert client.post("/api/predict", json={**SAMPLE, **change}).status_code == 422


def test_missing_feature_returns_422() -> None:
    with TestClient(create_app(Settings())) as client:
        assert client.post("/api/predict", json={}).status_code == 422


@pytest.mark.parametrize(
    "wrong_attribute,value",
    [
        ("feature_names_in_", ["wrong"]),
        ("classes_", [1, 0]),
    ],
)
def test_incompatible_model_is_rejected(
    monkeypatch: pytest.MonkeyPatch, wrong_attribute: str, value: list[object]
) -> None:
    model = fake_model()
    setattr(model, wrong_attribute, value)
    monkeypatch.setattr(
        "app.inference.mlflow.artifacts.download_artifacts", Mock(return_value="local")
    )
    monkeypatch.setattr(
        "app.inference.mlflow_sklearn.load_model", Mock(return_value=model)
    )
    service = ModelService(configured_settings())
    with pytest.raises(ValueError):
        service.load()
    assert not service.is_ready


def test_invalid_model_output_does_not_reach_client(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    model = fake_model()
    model.predict_proba.return_value = np.array([[np.nan, np.nan]])
    monkeypatch.setattr(
        "app.inference.mlflow.artifacts.download_artifacts", Mock(return_value="local")
    )
    monkeypatch.setattr(
        "app.inference.mlflow_sklearn.load_model", Mock(return_value=model)
    )
    with TestClient(
        create_app(configured_settings()), raise_server_exceptions=False
    ) as client:
        response = client.post("/api/predict", json=SAMPLE)
        assert response.status_code == 500
        assert "traceback" not in response.text.lower()


def test_dotenv_configures_mlflow(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text(
        "APP_MLFLOW_TRACKING_URI=http://localhost:5001\n"
        "APP_MLFLOW_MODEL_NAME=other-model\nAPP_MLFLOW_MODEL_VERSION=7\n"
    )
    monkeypatch.setitem(Settings.model_config, "env_file", env_file)
    settings = Settings()
    assert str(settings.mlflow_tracking_uri) == "http://localhost:5001/"
    assert settings.mlflow_model_name == "other-model"
    assert settings.mlflow_model_version == 7


@pytest.mark.parametrize(
    "fields",
    [
        {"mlflow_model_name": "model"},
        {"mlflow_model_version": 1},
        {"mlflow_model_name": "model", "mlflow_model_version": 0},
        {"mlflow_model_name": "model/alias", "mlflow_model_version": 1},
        {"mlflow_tracking_uri": "not-a-url"},
    ],
)
def test_invalid_model_settings(fields: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate(fields)
