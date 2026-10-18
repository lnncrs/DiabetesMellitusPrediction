from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.core.config import Settings
from app.dependencies import get_model_service, get_settings
from app.inference import ModelService
from app.schemas.health import HealthResponse
from app.version import get_version

router = APIRouter(tags=["health"])


def build_health_response(settings: Settings) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service_name=settings.service_name,
        version=get_version(),
        environment=settings.environment,
        checks={},
    )


@router.get("/live", response_model=HealthResponse)
def live(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return build_health_response(settings)


@router.get(
    "/ready", response_model=HealthResponse, responses={503: {"model": HealthResponse}}
)
def ready(
    settings: Annotated[Settings, Depends(get_settings)],
    service: Annotated[ModelService, Depends(get_model_service)],
) -> JSONResponse:
    response = build_health_response(settings)
    response.status = "ok" if service.is_ready else "not_ready"
    response.checks = {"model": "ready" if service.is_ready else "unavailable"}
    return JSONResponse(
        response.model_dump(by_alias=True), status_code=200 if service.is_ready else 503
    )
