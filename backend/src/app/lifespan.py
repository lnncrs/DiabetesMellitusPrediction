from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.concurrency import run_in_threadpool


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    service = app.state.model_service
    try:
        await run_in_threadpool(service.load)
    except Exception:
        app.state.logger.exception("Não foi possível carregar o modelo configurado.")
    try:
        yield
    finally:
        service.model = None
