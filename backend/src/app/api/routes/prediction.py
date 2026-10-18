from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_model_service
from app.inference import ModelService, ModelUnavailableError
from app.schemas.prediction import PredictionInput, PredictionOutput

router = APIRouter(tags=["prediction"])


@router.post(
    "/predict",
    response_model=PredictionOutput,
    summary="Predição didática com a versão configurada no MLflow",
    responses={503: {"description": "Modelo indisponível"}},
)
def predict(
    inputs: PredictionInput,
    service: Annotated[ModelService, Depends(get_model_service)],
) -> PredictionOutput:
    try:
        predicted_class, probability = service.predict(inputs.model_dump())
    except ModelUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail="Modelo indisponível. Confira a configuração e reinicie a API.",
        ) from exc
    assert service.settings.mlflow_model_name is not None
    assert service.settings.mlflow_model_version is not None
    return PredictionOutput(
        predicted_class=predicted_class,
        probability_diabetes=probability,
        model_name=service.settings.mlflow_model_name,
        model_version=service.settings.mlflow_model_version,
    )
