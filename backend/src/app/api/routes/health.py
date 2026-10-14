from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.config import Settings
from app.dependencies import get_settings
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


@router.get("/ready", response_model=HealthResponse)
def ready(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return build_health_response(settings)
