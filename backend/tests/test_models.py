import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.consultation import Consultation, ConsultationAddOn, ConsultationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.audit_log import AuditLog, AuditEvent, AuditActorType


@pytest.mark.asyncio
async def test_consultation_creation_and_relations(db_session: AsyncSession):
    consultation = Consultation(
        consultation_code="STC-2026-000101",
        customer_name="Seraphina Vance",
        email="seraphina@example.com",
        phone="+919876543210",
        address="12 Rue de la Paix, Paris",
        package_id="styleora_signature_blueprint",
        package_price_inr=2799,
        total_price_inr=2799,
        status=ConsultationStatus.CREATED,
    )
    db_session.add(consultation)
    await db_session.commit()
    await db_session.refresh(consultation)

    assert consultation.id is not None
    assert len(str(consultation.id)) == 36
    assert isinstance(consultation.id, uuid.UUID)
    assert consultation.consultation_code == "STC-2026-000101"
    assert consultation.status == ConsultationStatus.CREATED
    assert consultation.created_at is not None

    # Test add-on relation
    addon = ConsultationAddOn(
        consultation=consultation,
        add_on_id="wardrobe_edit",
        price_inr=1499,
    )
    db_session.add(addon)
    await db_session.commit()

    # Test payment relation
    payment = Payment(
        consultation_id=consultation.id,
        provider="razorpay",
        provider_order_id="order_test_999",
        amount=429800,
        currency="INR",
        status=PaymentStatus.CREATED,
    )
    db_session.add(payment)
    await db_session.commit()

    # Test audit log relation
    audit = AuditLog(
        consultation_id=consultation.id,
        event=AuditEvent.CONSULTATION_CREATED,
        actor_type=AuditActorType.CUSTOMER,
        log_metadata={"ip": "127.0.0.1", "channel": "web"},
    )
    db_session.add(audit)
    await db_session.commit()

    # Verify query with add-on eagerly loaded
    stmt = (
        select(Consultation)
        .options(selectinload(Consultation.add_ons))
        .where(Consultation.consultation_code == "STC-2026-000101")
    )
    result = await db_session.execute(stmt)
    retrieved = result.scalar_one_or_none()
    assert retrieved is not None
    assert retrieved.email == "seraphina@example.com"
    assert retrieved.package_price_inr == 2799
    assert retrieved.total_price_inr == 2799
    assert len(retrieved.add_ons) == 1
    assert retrieved.add_ons[0].add_on_id == "wardrobe_edit"
    assert retrieved.add_ons[0].price_inr == 1499
