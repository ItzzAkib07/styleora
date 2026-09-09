import datetime
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.settings import Settings, get_settings
from app.core.logging import logger, request_id_ctx
from app.db.session import get_db
from app.schemas.response import APIErrorDetails, APIResponse, HealthStatusData

router = APIRouter()


@router.get(
    "/health",
    response_model=APIResponse[HealthStatusData],
    summary="Service Liveness Probe",
    description="Returns the current operational status and version of STYLEORA API.",
)
async def health_check(settings: Settings = Depends(get_settings)):
    return APIResponse(
        success=True,
        data=HealthStatusData(
            status="healthy",
            environment=settings.ENVIRONMENT,
            version=settings.APP_VERSION,
            database="configured",
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        ),
        message="STYLEORA service is operational.",
    )


@router.get(
    "/health/ready",
    response_model=APIResponse[HealthStatusData],
    summary="Service Readiness Probe",
    description="Verifies database connectivity against PostgreSQL (Supabase).",
)
async def readiness_check(
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    req_id = request_id_ctx.get()
    try:
        await db.execute(text("SELECT 1"))
        return APIResponse(
            success=True,
            data=HealthStatusData(
                status="ready",
                environment=settings.ENVIRONMENT,
                version=settings.APP_VERSION,
                database="connected",
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            ),
            message="STYLEORA service and Supabase PostgreSQL database are fully operational.",
        )
    except Exception as exc:
        logger.error(
            f"Database readiness probe failed [Ref: {req_id}]: {str(exc)}",
            extra={"extra_data": {"error_type": type(exc).__name__}}
        )
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=APIResponse(
                success=False,
                data=HealthStatusData(
                    status="degraded",
                    environment=settings.ENVIRONMENT,
                    version=settings.APP_VERSION,
                    database="disconnected",
                    timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                ),
                error=APIErrorDetails(
                    code="DATABASE_UNAVAILABLE",
                    message="Database service is currently unavailable. Please try again shortly.",
                    reference_id=req_id,
                ),
                message="Service readiness check failed.",
            ).model_dump(exclude_none=True),
        )
