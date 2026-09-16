from typing import Optional
from fastapi import APIRouter, Depends, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.limiter import limiter
from app.db.session import get_db
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationPublicLookupData,
    ConsultationResponseData,
)
from app.schemas.response import APIResponse
from app.services import consultation_service

router = APIRouter(prefix="/consultations", tags=["Consultations"])


@router.post(
    "",
    response_model=APIResponse[ConsultationResponseData],
    status_code=status.HTTP_201_CREATED,
    summary="Create styling consultation reservation",
    description=(
        "Registers a new private styling consultation in CREATED status. "
        "Generates an authoritative consultation code (e.g. STC-2026-000101), "
        "persists client styling notes, and establishes an audit log record. "
        "Enforces database-backed idempotency protection via X-Idempotency-Key header."
    ),
)
@limiter.limit("10/minute")
async def create_consultation(
    request: Request,
    data: ConsultationCreate,
    db: AsyncSession = Depends(get_db),
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
):
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    consultation_data, is_duplicate = await consultation_service.create_consultation(
        db=db,
        data=data,
        client_ip=client_ip,
        user_agent=user_agent,
        idempotency_key=x_idempotency_key,
    )

    message = (
        "Consultation request retrieved (idempotent submission)."
        if is_duplicate
        else "Consultation request successfully registered in atelier ledger."
    )

    return APIResponse(
        success=True,
        data=consultation_data,
        message=message,
    )


@router.get(
    "/{code}",
    response_model=APIResponse[ConsultationPublicLookupData],
    status_code=status.HTTP_200_OK,
    summary="Retrieve public consultation status by reference code",
    description=(
        "Fetches non-sensitive public consultation reservation details and status by code "
        "(e.g. STC-2026-000101) without exposing client PII, residential addresses, or internal UUIDs."
    ),
)
@limiter.limit("30/minute")
async def get_consultation(
    request: Request,
    code: str,
    db: AsyncSession = Depends(get_db),
):
    consultation_data = await consultation_service.get_consultation_by_code(
        db=db,
        code=code,
    )
    return APIResponse(
        success=True,
        data=consultation_data,
        message="Consultation record retrieved successfully.",
    )
