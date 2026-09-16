from fastapi import APIRouter
from app.api.v1.endpoints import health, consultations, payments

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(consultations.router)
api_router.include_router(payments.router)
