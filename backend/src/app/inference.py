"""Carregamento de uma versão fixa e inferência fora da camada HTTP."""

from typing import Any, Literal

import mlflow.artifacts
import mlflow.sklearn as mlflow_sklearn
import numpy as np
import pandas as pd

from app.core.config import Settings

FEATURE_COLUMNS = (
    "gestacoes",
    "glicose_plasmatica",
    "pressao_arterial_diastolica",
    "espessura_triceps",
    "insulina_serica",
    "imc",
    "indice_hereditariedade_diabetes",
    "idade",
)


class ModelUnavailableError(Exception):
    pass


class ModelService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.model: Any = None

    @property
    def is_ready(self) -> bool:
        return self.model is not None

    def load(self) -> None:
        self.model = None
        if self.settings.mlflow_model_name is None:
            return
        model_uri = (
            f"models:/{self.settings.mlflow_model_name}/"
            f"{self.settings.mlflow_model_version}"
        )
        # O servidor usa um único registro por processo. A versão atual do MLflow
        # também consulta a configuração global ao resolver URIs models:/.
        mlflow.set_tracking_uri(str(self.settings.mlflow_tracking_uri))
        mlflow.set_registry_uri(str(self.settings.mlflow_tracking_uri))
        local_path = mlflow.artifacts.download_artifacts(
            artifact_uri=model_uri,
            tracking_uri=str(self.settings.mlflow_tracking_uri),
            registry_uri=str(self.settings.mlflow_tracking_uri),
        )
        model: Any = mlflow_sklearn.load_model(local_path)
        if tuple(model.feature_names_in_) != FEATURE_COLUMNS:
            raise ValueError("O modelo não possui o contrato de entradas esperado.")
        if list(model.classes_) != [0, 1]:
            raise ValueError("O modelo não possui as classes esperadas: 0 e 1.")
        self.model = model

    def predict(self, features: dict[str, int | float]) -> tuple[Literal[0, 1], float]:
        if self.model is None:
            raise ModelUnavailableError
        frame = pd.DataFrame([features], columns=list(FEATURE_COLUMNS))
        predictions = np.asarray(self.model.predict(frame))
        probabilities = np.asarray(self.model.predict_proba(frame), dtype=float)
        if (
            predictions.shape != (1,)
            or predictions[0] not in (0, 1)
            or probabilities.shape != (1, 2)
            or not np.isfinite(probabilities).all()
            or not ((probabilities >= 0) & (probabilities <= 1)).all()
            or not np.isclose(probabilities.sum(), 1)
        ):
            raise ValueError("O modelo retornou uma saída incompatível.")
        predicted_class: Literal[0, 1] = 1 if predictions[0] == 1 else 0
        return predicted_class, float(probabilities[0, 1])
