from fastapi import FastAPI

from app.api.router import router as api_router
from app.core.config import Settings
from app.core.errors import add_exception_handlers
from app.core.logging import configure_logging
from app.dependencies import get_settings
from app.lifespan import lifespan
from app.middleware.request_id import RequestIdMiddleware


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or Settings()
    logger = configure_logging(app_settings)
    application = FastAPI(
        title=app_settings.service_name,
        version=app_settings.version,
        lifespan=lifespan,
    )
    application.state.logger = logger
    application.dependency_overrides[get_settings] = lambda: app_settings
    application.add_middleware(RequestIdMiddleware)
    add_exception_handlers(application)
    application.include_router(api_router, prefix="/api")
    return application


app = create_app()
