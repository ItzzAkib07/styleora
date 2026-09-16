import asyncio
import datetime
from typing import Optional, Tuple
from sqlalchemy import desc, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.logging import logger
from app.exceptions.handlers import ConflictException, DuplicateException, NotFoundException
from app.models.audit_log import AuditActorType, AuditEvent, AuditLog
from app.models.consultation import Consultation, ConsultationAddOn, ConsultationStatus
from app.schemas.consultation import (
    HISTORICAL_PACKAGES,
    VALID_ADD_ONS,
    VALID_CORE_PACKAGES,
    AddOnResponseData,
    ConsultationCreate,
    ConsultationPublicLookupData,
    ConsultationResponseData,
)


async def generate_consultation_code(db: AsyncSession) -> str:
    """
    Generates a unique, authoritative human-readable consultation code.
    Format: STC-{YEAR}-{06d} (e.g. STC-2026-000101)
    """
    current_year = datetime.datetime.now(datetime.timezone.utc).year
    prefix = f"STC-{current_year}-"

    stmt = (
        select(Consultation.consultation_code)
        .where(Consultation.consultation_code.like(f"{prefix}%"))
        .order_by(desc(Consultation.consultation_code))
        .limit(1)
    )
    result = await db.execute(stmt)
    latest_code = result.scalar_one_or_none()

    if latest_code:
        try:
            latest_seq = int(latest_code.split("-")[-1])
            new_seq = latest_seq + 1
        except (ValueError, IndexError):
            new_seq = 101
    else:
        new_seq = 101

    return f"{prefix}{new_seq:06d}"


def resolve_package_metadata(package_id: str) -> dict:
    """Resolves package metadata from active core package or historical registry."""
    if package_id in VALID_CORE_PACKAGES:
        return VALID_CORE_PACKAGES[package_id]
    if package_id in HISTORICAL_PACKAGES:
        return HISTORICAL_PACKAGES[package_id]
    return {
        "id": package_id,
        "name": package_id,
        "price": "Custom Quoted",
        "amount_inr": 0,
    }


def is_idempotency_payload_matching(existing: Consultation, incoming: ConsultationCreate) -> bool:
    """
    Compares normalized values of all relevant client input parameters.
    Returns True if incoming request is identical to existing consultation.
    """
    if (existing.customer_name or "").strip().lower() != incoming.customer_name.strip().lower():
        return False
    if (existing.email or "").strip().lower() != incoming.email.strip().lower():
        return False
    if (existing.phone or "").strip() != incoming.phone.strip():
        return False
    if (existing.address or "").strip() != incoming.address.strip():
        return False
    if existing.package_id != incoming.package_id:
        return False
    existing_addons = sorted([a.add_on_id for a in (existing.add_ons or [])])
    incoming_addons = sorted(incoming.selected_add_on_ids or [])
    if existing_addons != incoming_addons:
        return False
    existing_notes = (existing.style_notes or "").strip()
    incoming_notes = (incoming.style_notes or "").strip()
    if existing_notes != incoming_notes:
        return False
    return True


def build_consultation_response_data(consultation: Consultation) -> ConsultationResponseData:
    """Builds response data enriched with frozen package details, authoritative add-ons, and frozen total."""
    pkg_info = resolve_package_metadata(consultation.package_id)
    package_price_inr = (
        consultation.package_price_inr
        if consultation.package_price_inr is not None
        else pkg_info.get("amount_inr", 0)
    )
    package_price_formatted = f"₹{package_price_inr:,}"

    selected_addons_data = []
    addons_total = 0
    if hasattr(consultation, "add_ons") and consultation.add_ons:
        for a in consultation.add_ons:
            meta = VALID_ADD_ONS.get(
                a.add_on_id,
                {"name": a.add_on_id, "price": f"₹{a.price_inr:,}", "amount_inr": a.price_inr},
            )
            addon_price_inr = a.price_inr if a.price_inr is not None else meta.get("amount_inr", 0)
            selected_addons_data.append(
                AddOnResponseData(
                    add_on_id=a.add_on_id,
                    name=meta["name"],
                    price=f"₹{addon_price_inr:,}",
                    amount_inr=addon_price_inr,
                )
            )
            addons_total += addon_price_inr

    total_price_inr = (
        consultation.total_price_inr
        if consultation.total_price_inr is not None
        else (package_price_inr + addons_total)
    )
    total_price_formatted = f"₹{total_price_inr:,}"

    return ConsultationResponseData(
        id=consultation.id,
        consultation_code=consultation.consultation_code,
        customer_name=consultation.customer_name,
        email=consultation.email,
        phone=consultation.phone,
        address=consultation.address,
        package_id=consultation.package_id,
        package_name=pkg_info["name"],
        package_price=package_price_formatted,
        package_price_inr=package_price_inr,
        selected_add_ons=selected_addons_data,
        total_price_inr=total_price_inr,
        total_price_formatted=total_price_formatted,
        style_notes=consultation.style_notes,
        status=consultation.status,
        scheduled_at=consultation.scheduled_at,
        completed_at=consultation.completed_at,
        created_at=consultation.created_at or datetime.datetime.now(datetime.timezone.utc),
    )


def build_consultation_public_lookup_data(consultation: Consultation) -> ConsultationPublicLookupData:
    """Builds public lookup response without exposing client PII, addresses, or internal UUIDs."""
    pkg_info = resolve_package_metadata(consultation.package_id)
    package_price_inr = (
        consultation.package_price_inr
        if consultation.package_price_inr is not None
        else pkg_info.get("amount_inr", 0)
    )
    package_price_formatted = f"₹{package_price_inr:,}"

    addon_names = []
    addons_total = 0
    if hasattr(consultation, "add_ons") and consultation.add_ons:
        for a in consultation.add_ons:
            meta = VALID_ADD_ONS.get(a.add_on_id, {"name": a.add_on_id, "amount_inr": a.price_inr})
            addon_names.append(meta.get("name", a.add_on_id))
            addons_total += (a.price_inr if a.price_inr is not None else meta.get("amount_inr", 0))

    total_price_inr = (
        consultation.total_price_inr
        if consultation.total_price_inr is not None
        else (package_price_inr + addons_total)
    )
    total_price_formatted = f"₹{total_price_inr:,}"

    return ConsultationPublicLookupData(
        consultation_code=consultation.consultation_code,
        package_id=consultation.package_id,
        package_name=pkg_info["name"],
        package_price=package_price_formatted,
        selected_add_ons=addon_names,
        total_price_formatted=total_price_formatted,
        status=consultation.status,
        created_at=consultation.created_at or datetime.datetime.now(datetime.timezone.utc),
    )


async def create_consultation(
    db: AsyncSession,
    data: ConsultationCreate,
    client_ip: Optional[str] = None,
    user_agent: Optional[str] = None,
    idempotency_key: Optional[str] = None,
) -> Tuple[ConsultationResponseData, bool]:
    """
    Creates a new consultation in CREATED status with authoritative code, persistent style notes,
    relational optional add-ons, frozen price snapshot, and database-backed idempotency protection.
    Returns: (ConsultationResponseData, is_duplicate)
    """
    raw_key = idempotency_key or data.idempotency_key
    effective_idempotency_key = raw_key.strip() if raw_key else None

    # 1. Database-backed Idempotency Check via indexed unique column
    if effective_idempotency_key:
        stmt_idem = (
            select(Consultation)
            .options(selectinload(Consultation.add_ons))
            .where(Consultation.idempotency_key == effective_idempotency_key)
        )
        res_idem = await db.execute(stmt_idem)
        existing_idem = res_idem.scalar_one_or_none()
        if existing_idem:
            if not is_idempotency_payload_matching(existing_idem, data):
                logger.warning(
                    f"Idempotency conflict for key {effective_idempotency_key}: payload mismatch submitted",
                    extra={"extra_data": {"consultation_code": existing_idem.consultation_code}},
                )
                raise ConflictException(
                    message="The provided idempotency key has already been used with different consultation details.",
                    code="IDEMPOTENCY_KEY_PAYLOAD_MISMATCH",
                )

            logger.info(
                f"Database-backed idempotency matched key: {effective_idempotency_key}",
                extra={"extra_data": {"consultation_code": existing_idem.consultation_code}},
            )
            return build_consultation_response_data(existing_idem), True

    # 2. Time-window duplicate submission check (last 5 minutes, same email, same package, status CREATED)
    cutoff_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=5)
    stmt_duplicate = (
        select(Consultation)
        .options(selectinload(Consultation.add_ons))
        .where(
            Consultation.email == data.email.lower().strip(),
            Consultation.package_id == data.package_id,
            Consultation.status == ConsultationStatus.CREATED,
            Consultation.created_at >= cutoff_time,
        )
        .order_by(desc(Consultation.created_at))
        .limit(1)
    )
    dup_result = await db.execute(stmt_duplicate)
    existing_recent = dup_result.scalar_one_or_none()

    if existing_recent:
        logger.warning(
            f"Rapid duplicate consultation submission detected for {data.email}",
            extra={"extra_data": {"existing_code": existing_recent.consultation_code}},
        )
        return build_consultation_response_data(existing_recent), True

    # 3. Resolve Authoritative Backend Prices and Snapshot Total
    pkg_info = resolve_package_metadata(data.package_id)
    package_price_inr = pkg_info.get("amount_inr", 0)

    addons_total_inr = 0
    addon_records = []
    for add_on_id in data.selected_add_on_ids or []:
        add_on_meta = VALID_ADD_ONS[add_on_id]
        add_on_price = add_on_meta["amount_inr"]
        addons_total_inr += add_on_price
        addon_records.append(
            ConsultationAddOn(
                add_on_id=add_on_id,
                price_inr=add_on_price,
            )
        )

    total_price_inr = package_price_inr + addons_total_inr

    # 4. Generate authoritative consultation code
    consultation_code = await generate_consultation_code(db)

    # 5. Create Consultation record with frozen prices, style_notes, and idempotency_key
    consultation = Consultation(
        consultation_code=consultation_code,
        customer_name=data.customer_name.strip(),
        email=data.email.lower().strip(),
        phone=data.phone.strip(),
        address=data.address.strip(),
        package_id=data.package_id,
        package_price_inr=package_price_inr,
        total_price_inr=total_price_inr,
        style_notes=data.style_notes.strip() if data.style_notes else None,
        idempotency_key=effective_idempotency_key,
        status=ConsultationStatus.CREATED,
    )
    for addon_rec in addon_records:
        addon_rec.consultation = consultation
        db.add(addon_rec)

    db.add(consultation)

    try:
        await db.flush()  # Populates consultation.id and validates database constraints
    except IntegrityError as ie:
        await db.rollback()
        # Concurrency safety: parallel transaction is committing with identical idempotency_key
        if effective_idempotency_key:
            for attempt in range(6):
                await asyncio.sleep(0.05)
                stmt_recheck = (
                    select(Consultation)
                    .options(selectinload(Consultation.add_ons))
                    .where(Consultation.idempotency_key == effective_idempotency_key)
                )
                res_recheck = await db.execute(stmt_recheck)
                existing_concurrent = res_recheck.scalar_one_or_none()
                if existing_concurrent:
                    if not is_idempotency_payload_matching(existing_concurrent, data):
                        raise ConflictException(
                            message="The provided idempotency key has already been used with different consultation details.",
                            code="IDEMPOTENCY_KEY_PAYLOAD_MISMATCH",
                        )
                    logger.info(
                        f"Concurrent idempotent duplicate resolved for key: {effective_idempotency_key} on attempt {attempt + 1}",
                        extra={"extra_data": {"consultation_code": existing_concurrent.consultation_code}},
                    )
                    return build_consultation_response_data(existing_concurrent), True
            raise ie
        raise

    # 6. Record Audit Log (safe metadata only, strictly NO secrets)
    safe_audit_metadata = {
        "consultation_code": consultation_code,
        "package_id": data.package_id,
        "package_price_inr": package_price_inr,
        "total_price_inr": total_price_inr,
        "selected_add_ons": data.selected_add_on_ids or [],
        "customer_name": data.customer_name,
        "email_domain": data.email.split("@")[-1] if "@" in data.email else "unknown",
        "has_style_notes": bool(data.style_notes),
        "client_ip": client_ip or "unknown",
        "user_agent": (user_agent[:128] if user_agent else "unknown"),
    }
    if effective_idempotency_key:
        safe_audit_metadata["idempotency_key"] = effective_idempotency_key

    audit_log = AuditLog(
        consultation_id=consultation.id,
        event=AuditEvent.CONSULTATION_CREATED,
        actor_type=AuditActorType.CUSTOMER,
        actor_id=data.email.lower().strip(),
        log_metadata=safe_audit_metadata,
    )
    db.add(audit_log)
    await db.commit()

    # Re-query with eager-loaded add_ons for response serialization
    stmt_final = (
        select(Consultation)
        .options(selectinload(Consultation.add_ons))
        .where(Consultation.id == consultation.id)
    )
    final_res = await db.execute(stmt_final)
    persisted_consultation = final_res.scalar_one()

    logger.info(
        f"Created consultation {consultation_code} for {data.customer_name}",
        extra={"extra_data": {"consultation_code": consultation_code, "package_id": data.package_id}},
    )

    return build_consultation_response_data(persisted_consultation), False


async def get_consultation_by_code(db: AsyncSession, code: str) -> ConsultationPublicLookupData:
    """Retrieves public consultation reservation details and status by code without exposing client PII."""
    cleaned_code = code.strip().upper()
    stmt = (
        select(Consultation)
        .options(selectinload(Consultation.add_ons))
        .where(Consultation.consultation_code == cleaned_code)
    )
    result = await db.execute(stmt)
    consultation = result.scalar_one_or_none()

    if not consultation:
        raise NotFoundException(
            message=f"Consultation with reference '{cleaned_code}' was not found in the atelier ledger.",
            code="CONSULTATION_NOT_FOUND",
        )

    return build_consultation_public_lookup_data(consultation)
