import datetime
import json
import uuid
from typing import Any, Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.config.settings import settings
from app.core.logging import logger
from app.exceptions.handlers import ConflictException, NotFoundException, StyleoraException, ValidationException
from app.models.audit_log import AuditActorType, AuditEvent, AuditLog
from app.models.consultation import Consultation, ConsultationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.webhook_event import WebhookEvent
from app.schemas.payment import (
    PaymentOrderResponseData,
    PaymentVerifyRequest,
    PaymentVerifyResponseData,
)
from app.services.consultation_service import resolve_package_metadata
from app.services.razorpay_client import razorpay_client


async def create_payment_order(
    db: AsyncSession,
    consultation_code: str,
    client_ip: Optional[str] = None,
) -> PaymentOrderResponseData:
    """
    Creates or reuses a Razorpay order for a styling consultation.
    The order amount is AUTHORITATIVELY derived from the consultation's frozen quote:
    consultation.total_price_inr * 100 (in paise).
    Zero trust in client-supplied amounts.
    """
    cleaned_code = consultation_code.strip().upper()

    stmt = (
        select(Consultation)
        .options(selectinload(Consultation.payments), selectinload(Consultation.add_ons))
        .where(Consultation.consultation_code == cleaned_code)
    )
    result = await db.execute(stmt)
    consultation = result.scalar_one_or_none()

    if not consultation:
        raise NotFoundException(
            message=f"Consultation with reference '{cleaned_code}' was not found in the atelier ledger.",
            code="CONSULTATION_NOT_FOUND",
        )

    # 1. Eligibility Validations
    if consultation.status in [ConsultationStatus.CLIENT_CANCELLED]:
        raise ConflictException(
            message="This consultation has been cancelled and cannot accept payment.",
            code="CONSULTATION_CANCELLED",
        )

    if consultation.status in [
        ConsultationStatus.PAYMENT_SUCCESS,
        ConsultationStatus.ADMIN_CONTACT_PENDING,
        ConsultationStatus.SLOTS_SHARED,
        ConsultationStatus.SLOT_SELECTED,
        ConsultationStatus.CALENDAR_BOOKED,
        ConsultationStatus.MEET_LINK_CREATED,
        ConsultationStatus.CONSULTATION_SCHEDULED,
        ConsultationStatus.CONSULTATION_COMPLETED,
    ]:
        raise ConflictException(
            message="Payment for this consultation has already been completed.",
            code="PAYMENT_ALREADY_COMPLETED",
        )

    # Check if any payment associated with this consultation already succeeded
    for p in consultation.payments:
        if p.status == PaymentStatus.SUCCESS:
            raise ConflictException(
                message="Payment for this consultation has already been completed.",
                code="PAYMENT_ALREADY_COMPLETED",
            )

    # 2. Authoritative Frozen Amount Resolution (in paise)
    total_price_inr = consultation.total_price_inr
    if not total_price_inr or total_price_inr <= 0:
        raise StyleoraException(
            message="Consultation has an invalid quoted price and cannot be processed.",
            code="INVALID_CONSULTATION_PRICE",
            status_code=400,
        )

    amount_paise = int(total_price_inr * 100)

    # 3. Payment Order Idempotency / Order Reuse
    # If a valid active payment attempt exists for this consultation with the exact same amount, reuse it.
    for existing_payment in consultation.payments:
        if (
            existing_payment.status in [PaymentStatus.CREATED, PaymentStatus.PAYMENT_PENDING]
            and existing_payment.amount == amount_paise
            and existing_payment.provider == "razorpay"
            and existing_payment.provider_order_id
        ):
            logger.info(
                f"Reusing active Razorpay order {existing_payment.provider_order_id} for consultation {cleaned_code}"
            )
            pkg_meta = resolve_package_metadata(consultation.package_id)
            return PaymentOrderResponseData(
                order_id=existing_payment.provider_order_id,
                amount=amount_paise,
                amount_inr=total_price_inr,
                currency="INR",
                key_id=razorpay_client.key_id,
                consultation_code=consultation.consultation_code,
                package_name=pkg_meta["name"],
                customer_name=consultation.customer_name,
                email=consultation.email,
                phone=consultation.phone,
            )

    # 4. Create New Razorpay Order
    # Receipt max 40 chars: e.g. rcpt_{suffix}_{8-hex}
    receipt = f"rcpt_{consultation.consultation_code[-6:]}_{uuid.uuid4().hex[:8]}"
    notes = {
        "consultation_code": consultation.consultation_code,
        "package_id": consultation.package_id,
    }

    order_data = await razorpay_client.create_order(
        amount=amount_paise,
        currency="INR",
        receipt=receipt,
        notes=notes,
    )
    provider_order_id = order_data["id"]

    # 5. Persist Payment Record in Local Database
    payment = Payment(
        consultation_id=consultation.id,
        provider="razorpay",
        provider_order_id=provider_order_id,
        amount=amount_paise,
        currency="INR",
        status=PaymentStatus.PAYMENT_PENDING,
    )
    db.add(payment)

    # Transition consultation to PAYMENT_PENDING if currently in CREATED
    if consultation.status == ConsultationStatus.CREATED:
        consultation.status = ConsultationStatus.PAYMENT_PENDING

    # 6. Audit Trail
    audit_log = AuditLog(
        consultation_id=consultation.id,
        event=AuditEvent.PAYMENT_ORDER_CREATED,
        actor_type=AuditActorType.CUSTOMER,
        actor_id=consultation.email,
        log_metadata={
            "consultation_code": consultation.consultation_code,
            "provider_order_id": provider_order_id,
            "amount_paise": amount_paise,
            "amount_inr": total_price_inr,
            "currency": "INR",
            "receipt": receipt,
            "client_ip": client_ip or "unknown",
        },
    )
    db.add(audit_log)
    await db.commit()

    pkg_meta = resolve_package_metadata(consultation.package_id)

    return PaymentOrderResponseData(
        order_id=provider_order_id,
        amount=amount_paise,
        amount_inr=total_price_inr,
        currency="INR",
        key_id=razorpay_client.key_id,
        consultation_code=consultation.consultation_code,
        package_name=pkg_meta["name"],
        customer_name=consultation.customer_name,
        email=consultation.email,
        phone=consultation.phone,
    )


async def verify_payment(
    db: AsyncSession,
    data: PaymentVerifyRequest,
    client_ip: Optional[str] = None,
) -> PaymentVerifyResponseData:
    """
    Verifies Razorpay Standard Checkout payment response via cryptographic HMAC-SHA256 signature
    against the server-stored order ID, reconciles amounts, and atomically updates payment and consultation states.
    """
    cleaned_code = data.consultation_code.strip().upper()

    stmt = (
        select(Consultation)
        .options(selectinload(Consultation.payments))
        .where(Consultation.consultation_code == cleaned_code)
    )
    res = await db.execute(stmt)
    consultation = res.scalar_one_or_none()

    if not consultation:
        raise NotFoundException(
            message=f"Consultation with reference '{cleaned_code}' was not found.",
            code="CONSULTATION_NOT_FOUND",
        )

    # Find the local payment matching the submitted order ID
    payment = next((p for p in consultation.payments if p.provider_order_id == data.razorpay_order_id), None)
    if not payment:
        raise ConflictException(
            message="Payment order mismatch. Specified order does not correspond to this consultation.",
            code="PAYMENT_ORDER_MISMATCH",
        )

    # Idempotent replay: if already successfully verified, return current state
    if payment.status == PaymentStatus.SUCCESS and consultation.status == ConsultationStatus.PAYMENT_SUCCESS:
        logger.info(f"Idempotent verification replay for consultation {cleaned_code}")
        return PaymentVerifyResponseData(
            consultation_code=consultation.consultation_code,
            payment_id=payment.provider_payment_id or data.razorpay_payment_id,
            order_id=payment.provider_order_id,
            amount=payment.amount,
            amount_inr=int(payment.amount // 100),
            currency=payment.currency,
            status=ConsultationStatus.PAYMENT_SUCCESS.value,
            paid_at=payment.paid_at or datetime.datetime.now(datetime.timezone.utc),
        )

    # Amount Reconciliation
    expected_amount_paise = int(consultation.total_price_inr * 100)
    if payment.amount != expected_amount_paise:
        raise ConflictException(
            message="Payment amount discrepancy detected against authoritative consultation quote.",
            code="PAYMENT_AMOUNT_MISMATCH",
        )

    # Cryptographic Signature Verification using SERVER-STORED order ID
    is_valid = razorpay_client.verify_payment_signature(
        order_id=payment.provider_order_id,
        payment_id=data.razorpay_payment_id,
        signature=data.razorpay_signature,
    )

    if not is_valid:
        payment.status = PaymentStatus.FAILED
        audit_failed = AuditLog(
            consultation_id=consultation.id,
            event=AuditEvent.PAYMENT_FAILED,
            actor_type=AuditActorType.CUSTOMER,
            actor_id=consultation.email,
            log_metadata={
                "consultation_code": consultation.consultation_code,
                "provider_order_id": payment.provider_order_id,
                "provider_payment_id": data.razorpay_payment_id,
                "reason": "HMAC_SIGNATURE_MISMATCH",
                "client_ip": client_ip or "unknown",
            },
        )
        db.add(audit_failed)
        await db.commit()
        raise StyleoraException(
            message="Payment signature verification failed. Authentication mismatch.",
            code="PAYMENT_SIGNATURE_INVALID",
            status_code=400,
        )

    # Atomic State Update: Success Transitions
    now = datetime.datetime.now(datetime.timezone.utc)
    payment.status = PaymentStatus.SUCCESS
    payment.provider_payment_id = data.razorpay_payment_id
    payment.paid_at = now

    consultation.status = ConsultationStatus.PAYMENT_SUCCESS

    audit_verified = AuditLog(
        consultation_id=consultation.id,
        event=AuditEvent.PAYMENT_VERIFIED,
        actor_type=AuditActorType.CUSTOMER,
        actor_id=consultation.email,
        log_metadata={
            "consultation_code": consultation.consultation_code,
            "provider_order_id": payment.provider_order_id,
            "provider_payment_id": data.razorpay_payment_id,
            "amount_paise": payment.amount,
            "client_ip": client_ip or "unknown",
        },
    )
    audit_success = AuditLog(
        consultation_id=consultation.id,
        event=AuditEvent.PAYMENT_SUCCESS,
        actor_type=AuditActorType.SYSTEM,
        actor_id="system",
        log_metadata={
            "consultation_code": consultation.consultation_code,
            "provider_order_id": payment.provider_order_id,
            "provider_payment_id": data.razorpay_payment_id,
            "amount_paise": payment.amount,
            "amount_inr": consultation.total_price_inr,
        },
    )
    db.add(audit_verified)
    db.add(audit_success)
    await db.commit()

    logger.info(
        f"Payment {data.razorpay_payment_id} successfully verified for consultation {cleaned_code}",
        extra={"extra_data": {"consultation_code": cleaned_code, "order_id": payment.provider_order_id}},
    )

    return PaymentVerifyResponseData(
        consultation_code=consultation.consultation_code,
        payment_id=data.razorpay_payment_id,
        order_id=payment.provider_order_id,
        amount=payment.amount,
        amount_inr=consultation.total_price_inr,
        currency=payment.currency,
        status=ConsultationStatus.PAYMENT_SUCCESS.value,
        paid_at=now,
    )


async def process_webhook(
    db: AsyncSession,
    raw_body: bytes,
    signature: Optional[str],
    event_id_header: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Processes inbound Razorpay webhooks:
    1. Validates HMAC-SHA256 signature using RAW request bytes.
    2. Persists event ID in webhook_events for database-level idempotency.
    3. Monotonically transitions payment and consultation status without downgrading.
    """
    if not signature:
        raise ValidationException(
            message="Missing required Razorpay signature header.",
            details={"header": "X-Razorpay-Signature"},
        )

    # 1. Cryptographic Signature Validation on RAW request body
    is_valid = razorpay_client.verify_webhook_signature(raw_body, signature)
    if not is_valid:
        logger.warning("Rejected webhook submission: invalid signature")
        raise StyleoraException(
            message="Webhook signature verification failed.",
            code="WEBHOOK_SIGNATURE_INVALID",
            status_code=400,
        )

    # 2. Parse Payload JSON
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as exc:
        logger.error(f"Malformed webhook JSON body: {str(exc)}")
        raise StyleoraException(
            message="Malformed webhook JSON payload.",
            code="WEBHOOK_PAYLOAD_INVALID",
            status_code=400,
        )

    event_type = payload.get("event", "unknown")
    event_id = event_id_header or payload.get("id") or f"evt_fallback_{uuid.uuid4().hex}"

    # 3. Webhook Event Idempotency Check
    stmt_event = select(WebhookEvent).where(WebhookEvent.event_id == event_id)
    existing_event = (await db.execute(stmt_event)).scalar_one_or_none()

    if existing_event:
        logger.info(f"Duplicate webhook event ignored: {event_id} ({event_type})")
        return {"status": "duplicate_ignored", "event_id": event_id, "event_type": event_type}

    # Record webhook event for persistent deduplication
    webhook_rec = WebhookEvent(
        event_id=event_id,
        event_type=event_type,
        payload=payload,
    )
    db.add(webhook_rec)

    # 4. Handle Subscribed Lifecycle Events
    if event_type in ["payment.captured", "order.paid"]:
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_entity = payload.get("payload", {}).get("order", {}).get("entity", {})

        provider_order_id = payment_entity.get("order_id") or order_entity.get("id")
        provider_payment_id = payment_entity.get("id")

        if provider_order_id:
            stmt_payment = (
                select(Payment)
                .options(selectinload(Payment.consultation))
                .where(Payment.provider_order_id == provider_order_id)
            )
            payment = (await db.execute(stmt_payment)).scalar_one_or_none()

            if payment:
                consultation = payment.consultation
                # Check that amount matches consultation frozen quote
                expected_amount = int(consultation.total_price_inr * 100)
                event_amount = payment_entity.get("amount") or order_entity.get("amount")

                if event_amount and int(event_amount) != expected_amount:
                    logger.warning(
                        f"Webhook amount mismatch for order {provider_order_id}: expected {expected_amount}, got {event_amount}"
                    )
                else:
                    # Monotonic state transition: never downgrade if already SUCCESS
                    if payment.status != PaymentStatus.SUCCESS:
                        payment.status = PaymentStatus.SUCCESS
                        if provider_payment_id:
                            payment.provider_payment_id = provider_payment_id
                        payment.paid_at = datetime.datetime.now(datetime.timezone.utc)

                        consultation.status = ConsultationStatus.PAYMENT_SUCCESS

                        audit_webhook = AuditLog(
                            consultation_id=consultation.id,
                            event=AuditEvent.PAYMENT_WEBHOOK_RECEIVED,
                            actor_type=AuditActorType.WEBHOOK,
                            actor_id=event_id,
                            log_metadata={
                                "event_id": event_id,
                                "event_type": event_type,
                                "provider_order_id": provider_order_id,
                                "provider_payment_id": provider_payment_id,
                                "amount": event_amount,
                            },
                        )
                        db.add(audit_webhook)
                        logger.info(
                            f"Webhook {event_id} successfully marked consultation {consultation.consultation_code} as paid"
                        )

    elif event_type == "payment.failed":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        provider_order_id = payment_entity.get("order_id")

        if provider_order_id:
            stmt_payment = (
                select(Payment)
                .options(selectinload(Payment.consultation))
                .where(Payment.provider_order_id == provider_order_id)
            )
            payment = (await db.execute(stmt_payment)).scalar_one_or_none()

            # Only mark payment as failed if not already SUCCESS
            if payment and payment.status != PaymentStatus.SUCCESS:
                payment.status = PaymentStatus.FAILED
                audit_fail = AuditLog(
                    consultation_id=payment.consultation.id,
                    event=AuditEvent.PAYMENT_FAILED,
                    actor_type=AuditActorType.WEBHOOK,
                    actor_id=event_id,
                    log_metadata={
                        "event_id": event_id,
                        "event_type": event_type,
                        "provider_order_id": provider_order_id,
                        "error_code": payment_entity.get("error_code"),
                        "error_description": payment_entity.get("error_description"),
                    },
                )
                db.add(audit_fail)

    await db.commit()

    return {
        "status": "processed",
        "event_id": event_id,
        "event_type": event_type,
    }
