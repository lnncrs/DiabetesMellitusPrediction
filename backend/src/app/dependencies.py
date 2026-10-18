from typing import cast

from fastapi import Request

from app.core.config import Settings
from app.inference import ModelService


def get_settings() -> Settings:
    return Settings()


def get_model_service(request: Request) -> ModelService:
    return cast(ModelService, request.app.state.model_service)
