from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.prediction import router as prediction_router

router = APIRouter()
router.include_router(health_router, prefix="/health")
router.include_router(prediction_router)
