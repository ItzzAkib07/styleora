from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.limiter import limiter
from app.db.session import get_db
from app.schemas.payment import (
    PaymentFailRequest,
    PaymentOrderCreate,
    PaymentOrderResponseData,
    PaymentVerifyRequest,
    PaymentVerifyResponseData,
)
from app.schemas.response import APIResponse
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post(
    "/orders",
    response_model=APIResponse[PaymentOrderResponseData],
    status_code=status.HTTP_201_CREATED,
    summary="Create or retrieve Razorpay checkout order for consultation",
    description=(
        "Initializes a secure Razorpay order for an active styling consultation. "
        "The order amount is strictly derived from the consultation's frozen quote. "
        "Client-supplied pricing fields are ignored. Returns safe checkout parameters."
    ),
)
@limiter.limit("10/minute")
async def create_order(
    request: Request,
    data: PaymentOrderCreate,
    db: AsyncSession = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    order_data = await payment_service.create_payment_order(
        db=db,
        consultation_code=data.consultation_code,
        client_ip=client_ip,
    )
    return APIResponse(
        success=True,
        data=order_data,
        message="Payment checkout order successfully prepared.",
    )


@router.post(
    "/verify",
    response_model=APIResponse[PaymentVerifyResponseData],
    status_code=status.HTTP_200_OK,
    summary="Cryptographically verify Razorpay Standard Checkout payment",
    description=(
        "Performs server-side HMAC-SHA256 signature verification using the server-stored "
        "Razorpay order ID, reconciles amounts against the authoritative frozen quote, "
        "and atomically transitions the consultation to PAYMENT_SUCCESS."
    ),
)
@limiter.limit("15/minute")
async def verify_payment(
    request: Request,
    data: PaymentVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    verification_data = await payment_service.verify_payment(
        db=db,
        data=data,
        client_ip=client_ip,
    )
    return APIResponse(
        success=True,
        data=verification_data,
        message="Payment verified successfully. Atelier reservation confirmed.",
    )


@router.post(
    "/fail",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Record client-side payment failure reported by checkout",
    description=(
        "Receives checkout failure feedback from the client, logs failure telemetry, "
        "and transitions consultation to PAYMENT_FAILED if not already confirmed."
    ),
)
@limiter.limit("15/minute")
async def report_payment_failure(
    request: Request,
    data: PaymentFailRequest,
    db: AsyncSession = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    result = await payment_service.record_payment_failure(
        db=db,
        data=data,
        client_ip=client_ip,
    )
    return APIResponse(
        success=True,
        data=result,
        message="Payment failure recorded in ledger.",
    )


@router.post(
    "/razorpay/webhook",
    status_code=status.HTTP_200_OK,
    summary="Receive and process authoritative Razorpay webhook events",
    description=(
        "Authenticates inbound webhook events using HMAC-SHA256 on the RAW request body bytes. "
        "Protects against duplicates using database-backed event ID persistence, "
        "and monotonically transitions payment states."
    ),
)
@limiter.limit("120/minute")
async def handle_razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
    x_razorpay_event_id: Optional[str] = Header(None, alias="X-Razorpay-Event-Id"),
) -> Dict[str, Any]:
    raw_body = await request.body()
    result = await payment_service.process_webhook(
        db=db,
        raw_body=raw_body,
        signature=x_razorpay_signature,
        event_id_header=x_razorpay_event_id,
    )
    return result
