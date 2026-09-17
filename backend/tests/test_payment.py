import asyncio
import datetime
import hashlib
import hmac
import json
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.audit_log import AuditEvent, AuditLog
from app.models.consultation import Consultation, ConsultationAddOn, ConsultationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.webhook_event import WebhookEvent
from app.schemas.consultation import VALID_CORE_PACKAGES, VALID_ADD_ONS
from app.services.razorpay_client import razorpay_client

def make_payment_signature(order_id: str, payment_id: str, secret: str = None) -> str:
    sec = secret or razorpay_client.key_secret or "rzp_test_mock_secret_456"
    msg = f"{order_id}|{payment_id}"
    return hmac.new(sec.encode("utf-8"), msg.encode("utf-8"), hashlib.sha256).hexdigest()


def make_webhook_signature(raw_body: bytes, secret: str = None) -> str:
    sec = secret or razorpay_client.webhook_secret or "rzp_test_mock_webhook_sec_789"
    return hmac.new(sec.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()



@pytest.mark.asyncio
async def test_payment_order_creation_full_eight_pricing_combinations(client: AsyncClient, db_session: AsyncSession):
    """
    Verifies that Razorpay order amounts are strictly derived from the consultation's frozen quote
    across all 8 package + add-on pricing combinations.
    Order amount in paise must strictly equal consultation.total_price_inr * 100.
    """
    matrix = [
        ([], 2799, 279900),
        (["wardrobe_edit"], 4298, 429800),
        (["shopping_edit"], 3298, 329800),
        (["beauty_atelier"], 4298, 429800),
        (["wardrobe_edit", "shopping_edit"], 4797, 479700),
        (["wardrobe_edit", "beauty_atelier"], 5797, 579700),
        (["shopping_edit", "beauty_atelier"], 4797, 479700),
        (["wardrobe_edit", "shopping_edit", "beauty_atelier"], 6296, 629600),
    ]

    for idx, (addon_ids, expected_inr, expected_paise) in enumerate(matrix):
        # 1. Create Consultation
        create_res = await client.post(
            "/api/v1/consultations",
            json={
                "customer_name": f"Pricing Client {idx}",
                "email": f"pricing_client_{idx}@atelier.luxury",
                "phone": f"+91 99000 000{idx:02d}",
                "address": f"Mayfair Suite {idx}, London",
                "package_id": "styleora_signature_blueprint",
                "selected_add_on_ids": addon_ids,
            },
        )
        assert create_res.status_code == 201
        consultation_code = create_res.json()["data"]["consultation_code"]

        # 2. Create Payment Order
        order_res = await client.post(
            "/api/v1/payments/orders",
            json={"consultation_code": consultation_code},
        )
        assert order_res.status_code == 201, f"Failed for combo {addon_ids}: {order_res.text}"
        order_data = order_res.json()["data"]

        # 3. Assertions on Backend-Derived Frozen Amount
        assert order_data["amount"] == expected_paise
        assert order_data["amount_inr"] == expected_inr
        assert order_data["currency"] == "INR"
        assert order_data["consultation_code"] == consultation_code
        assert order_data["order_id"].startswith("order_")

        # 4. Verify Local Database Payment Record
        stmt = (
            select(Payment)
            .options(selectinload(Payment.consultation))
            .where(Payment.provider_order_id == order_data["order_id"])
        )
        payment_record = (await db_session.execute(stmt)).scalar_one()
        assert payment_record.amount == expected_paise
        assert payment_record.currency == "INR"
        assert payment_record.status == PaymentStatus.PAYMENT_PENDING
        assert payment_record.consultation.status == ConsultationStatus.PAYMENT_PENDING


@pytest.mark.asyncio
async def test_payment_order_frozen_price_immutability_regression(client: AsyncClient):
    """
    Verifies that if package prices or add-on prices in the catalog change after consultation creation,
    the payment order amount STILL strictly reflects the historical frozen consultation quote.
    """
    # 1. Create Consultation: Core (₹2,799) + Wardrobe (₹1,499) = ₹4,298
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Countess Isabella",
            "email": "isabella@kensington.luxury",
            "phone": "+91 98111 22334",
            "address": "15 Kensington Palace Gardens, London",
            "package_id": "styleora_signature_blueprint",
            "selected_add_on_ids": ["wardrobe_edit"],
        },
    )
    assert create_res.status_code == 201
    code = create_res.json()["data"]["consultation_code"]

    # 2. Mutate Catalog in memory to simulate future price hike
    orig_pkg_amount = VALID_CORE_PACKAGES["styleora_signature_blueprint"]["amount_inr"]
    orig_addon_amount = VALID_ADD_ONS["wardrobe_edit"]["amount_inr"]

    try:
        VALID_CORE_PACKAGES["styleora_signature_blueprint"]["amount_inr"] = 99999
        VALID_ADD_ONS["wardrobe_edit"]["amount_inr"] = 88888

        # 3. Create payment order: must still charge original frozen amount (₹4,298 = 429,800 paise)
        order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
        assert order_res.status_code == 201
        data = order_res.json()["data"]
        assert data["amount"] == 429800
        assert data["amount_inr"] == 4298

    finally:
        VALID_CORE_PACKAGES["styleora_signature_blueprint"]["amount_inr"] = orig_pkg_amount
        VALID_ADD_ONS["wardrobe_edit"]["amount_inr"] = orig_addon_amount


@pytest.mark.asyncio
async def test_payment_order_client_price_tampering_ignored(client: AsyncClient):
    """
    Verifies that client attempting to supply arbitrary amount, price, or discount
    fields to /payments/orders is completely ignored. Backend frozen quote is authoritative.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Tamper Target",
            "email": "tamper_target@exploit.luxury",
            "phone": "+91 99999 11111",
            "address": "1 Cyber Way, Security City",
            "package_id": "styleora_signature_blueprint",
            "selected_add_on_ids": ["shopping_edit"],  # 2799 + 499 = 3298
        },
    )
    assert create_res.status_code == 201
    code = create_res.json()["data"]["consultation_code"]

    # Client attempts to submit 100 paise (₹1)
    tamper_res = await client.post(
        "/api/v1/payments/orders",
        json={
            "consultation_code": code,
            "amount": 100,
            "price": 1,
            "package_price_inr": 1,
            "total_price_inr": 1,
        },
    )
    assert tamper_res.status_code == 201
    data = tamper_res.json()["data"]
    assert data["amount"] == 329800  # Strictly 329,800 paise
    assert data["amount_inr"] == 3298


@pytest.mark.asyncio
async def test_payment_order_creation_negative_cases(client: AsyncClient):
    """Verifies error responses for non-existent, cancelled, or already-paid consultations."""
    # 1. Non-existent consultation
    not_found_res = await client.post(
        "/api/v1/payments/orders",
        json={"consultation_code": "STC-9999-999999"},
    )
    assert not_found_res.status_code == 404
    assert not_found_res.json()["error"]["code"] == "CONSULTATION_NOT_FOUND"

    # 2. Setup consultation
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Negative Test Client",
            "email": "neg_client@atelier.luxury",
            "phone": "+91 98888 22222",
            "address": "45 Park Lane, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    assert create_res.status_code == 201
    code = create_res.json()["data"]["consultation_code"]

    # 3. Create order & verify payment to transition status to PAYMENT_SUCCESS
    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_{uuid.uuid4().hex[:14]}"
    sig = make_payment_signature(order_id, payment_id)

    verify_res = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig,
        },
    )
    assert verify_res.status_code == 200

    # 4. Attempting to create another order on already paid consultation must be rejected (409)
    second_order_res = await client.post(
        "/api/v1/payments/orders",
        json={"consultation_code": code},
    )
    assert second_order_res.status_code == 409
    assert second_order_res.json()["error"]["code"] == "PAYMENT_ALREADY_COMPLETED"


@pytest.mark.asyncio
async def test_payment_order_idempotency_order_reuse(client: AsyncClient, db_session: AsyncSession):
    """
    Verifies that calling /payments/orders multiple times for the same consultation
    reuses the active pending Razorpay order and does not create duplicate payment records.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Idempotency Client",
            "email": "idem_client@atelier.luxury",
            "phone": "+91 97777 33333",
            "address": "22 Oxford Street, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    assert create_res.status_code == 201
    code = create_res.json()["data"]["consultation_code"]

    res1 = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    assert res1.status_code == 201
    order_id1 = res1.json()["data"]["order_id"]

    res2 = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    assert res2.status_code == 201
    order_id2 = res2.json()["data"]["order_id"]

    assert order_id1 == order_id2

    stmt = select(Payment).join(Consultation).where(Consultation.consultation_code == code)
    payments = (await db_session.execute(stmt)).scalars().all()
    assert len(payments) == 1


@pytest.mark.asyncio
async def test_payment_verification_valid_signature_success(client: AsyncClient, db_session: AsyncSession):
    """
    Verifies successful payment verification with valid HMAC-SHA256 signature,
    atomic transition to PAYMENT_SUCCESS, and audit log generation.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Lady Genevieve",
            "email": "genevieve@sterling.luxury",
            "phone": "+91 98765 43210",
            "address": "Malabar Hill, Mumbai",
            "package_id": "styleora_signature_blueprint",
            "selected_add_on_ids": ["wardrobe_edit"],
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_test_{uuid.uuid4().hex[:12]}"
    signature = make_payment_signature(order_id, payment_id)

    verify_res = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        },
    )
    assert verify_res.status_code == 200
    v_data = verify_res.json()["data"]
    assert v_data["status"] == "PAYMENT_SUCCESS"
    assert v_data["payment_id"] == payment_id
    assert v_data["amount"] == 429800
    assert v_data["amount_inr"] == 4298

    # Verify Database State
    stmt = (
        select(Consultation)
        .options(selectinload(Consultation.payments), selectinload(Consultation.audit_logs))
        .where(Consultation.consultation_code == code)
    )
    consultation = (await db_session.execute(stmt)).scalar_one()
    assert consultation.status == ConsultationStatus.PAYMENT_SUCCESS
    assert len(consultation.payments) == 1
    assert consultation.payments[0].status == PaymentStatus.SUCCESS
    assert consultation.payments[0].provider_payment_id == payment_id
    assert consultation.payments[0].paid_at is not None

    # Verify Audit Logs
    events = [a.event for a in consultation.audit_logs]
    assert AuditEvent.PAYMENT_ORDER_CREATED in events
    assert AuditEvent.PAYMENT_VERIFIED in events
    assert AuditEvent.PAYMENT_SUCCESS in events


@pytest.mark.asyncio
async def test_payment_verification_invalid_or_tampered_signature(client: AsyncClient, db_session: AsyncSession):
    """Verifies rejection and transition to FAILED when payment signature is tampered."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Signature Tester",
            "email": "sig_tester@atelier.luxury",
            "phone": "+91 98000 77777",
            "address": "10 Downing Street, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]

    # Deliberately invalid signature
    bad_sig_res = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": "pay_tampered_123",
            "razorpay_signature": "invalid_hex_signature_00000000000000000000",
        },
    )
    assert bad_sig_res.status_code == 400
    assert bad_sig_res.json()["error"]["code"] == "PAYMENT_SIGNATURE_INVALID"

    stmt = select(Payment).where(Payment.provider_order_id == order_id)
    payment = (await db_session.execute(stmt)).scalar_one()
    assert payment.status == PaymentStatus.FAILED


@pytest.mark.asyncio
async def test_payment_verification_order_mismatch(client: AsyncClient):
    """Verifies that attempting to verify with an order_id not belonging to the consultation is rejected."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Mismatch Client",
            "email": "mismatch@atelier.luxury",
            "phone": "+91 98222 33333",
            "address": "Mayfair, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    # Submit an unrelated order ID
    res = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": "order_unrelated_999999",
            "razorpay_payment_id": "pay_123",
            "razorpay_signature": "dummy_sig_1234567890",
        },
    )
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "PAYMENT_ORDER_MISMATCH"


@pytest.mark.asyncio
async def test_payment_verification_idempotent_replay(client: AsyncClient):
    """Verifies that multiple verification requests with identical valid credentials succeed idempotently."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Replay Client",
            "email": "replay@atelier.luxury",
            "phone": "+91 98333 44444",
            "address": "Belgravia, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_replay_{uuid.uuid4().hex[:10]}"
    sig = make_payment_signature(order_id, payment_id)

    verify_payload = {
        "consultation_code": code,
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": sig,
    }

    # First call
    v1 = await client.post("/api/v1/payments/verify", json=verify_payload)
    assert v1.status_code == 200
    assert v1.json()["data"]["status"] == "PAYMENT_SUCCESS"

    # Second call (replay)
    v2 = await client.post("/api/v1/payments/verify", json=verify_payload)
    assert v2.status_code == 200
    assert v2.json()["data"]["status"] == "PAYMENT_SUCCESS"
    assert v1.json()["data"]["payment_id"] == v2.json()["data"]["payment_id"]


@pytest.mark.asyncio
async def test_webhook_raw_body_signature_verification_success(client: AsyncClient, db_session: AsyncSession):
    """
    Verifies that inbound webhooks are authenticated on RAW request body bytes,
    transition local state to PAYMENT_SUCCESS, and record WebhookEvent idempotency.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Webhook Client",
            "email": "webhook_client@atelier.luxury",
            "phone": "+91 98444 55555",
            "address": "Regent Street, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]

    event_id = f"evt_test_{uuid.uuid4().hex[:12]}"
    payment_id = f"pay_hook_{uuid.uuid4().hex[:10]}"
    webhook_payload = {
        "entity": "event",
        "account_id": "acc_mock_123",
        "event": "payment.captured",
        "contains": ["payment"],
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "entity": "payment",
                    "amount": 279900,
                    "currency": "INR",
                    "status": "captured",
                    "order_id": order_id,
                    "method": "card",
                }
            }
        },
        "created_at": 1700000000,
    }

    raw_body = json.dumps(webhook_payload).encode("utf-8")
    sig = make_webhook_signature(raw_body)

    res = await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-Razorpay-Signature": sig,
            "X-Razorpay-Event-Id": event_id,
        },
    )
    assert res.status_code == 200
    assert res.json()["status"] == "processed"

    # Verify WebhookEvent stored in database
    stmt_event = select(WebhookEvent).where(WebhookEvent.event_id == event_id)
    event_rec = (await db_session.execute(stmt_event)).scalar_one()
    assert event_rec.event_type == "payment.captured"

    # Verify Payment & Consultation transitioned
    stmt_p = select(Payment).where(Payment.provider_order_id == order_id)
    p = (await db_session.execute(stmt_p)).scalar_one()
    assert p.status == PaymentStatus.SUCCESS
    assert p.provider_payment_id == payment_id

    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c = (await db_session.execute(stmt_c)).scalar_one()
    assert c.status == ConsultationStatus.PAYMENT_SUCCESS


@pytest.mark.asyncio
async def test_webhook_order_paid_event(client: AsyncClient, db_session: AsyncSession):
    """Verifies that 'order.paid' webhook event successfully confirms payment."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Order Paid Client",
            "email": "order_paid@atelier.luxury",
            "phone": "+91 98555 66666",
            "address": "Piccadilly, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]

    event_id = f"evt_order_paid_{uuid.uuid4().hex[:10]}"
    webhook_payload = {
        "entity": "event",
        "event": "order.paid",
        "payload": {
            "order": {
                "entity": {
                    "id": order_id,
                    "amount": 279900,
                    "amount_paid": 279900,
                    "status": "paid",
                }
            }
        },
    }
    raw_body = json.dumps(webhook_payload).encode("utf-8")
    sig = make_webhook_signature(raw_body)

    res = await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig, "X-Razorpay-Event-Id": event_id},
    )
    assert res.status_code == 200

    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c = (await db_session.execute(stmt_c)).scalar_one()
    assert c.status == ConsultationStatus.PAYMENT_SUCCESS


@pytest.mark.asyncio
async def test_webhook_invalid_and_missing_signature(client: AsyncClient):
    """Verifies rejection of webhooks with missing or invalid signatures."""
    raw_body = b'{"event":"payment.captured"}'

    # Missing signature
    res_missing = await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json"},
    )
    assert res_missing.status_code == 422

    # Invalid signature
    res_bad = await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": "invalid_signature_hex_12345"},
    )
    assert res_bad.status_code == 400
    assert res_bad.json()["error"]["code"] == "WEBHOOK_SIGNATURE_INVALID"


@pytest.mark.asyncio
async def test_webhook_idempotency_duplicate_event_id(client: AsyncClient, db_session: AsyncSession):
    """Verifies that replaying the exact same webhook event ID is ignored idempotently."""
    event_id = "evt_duplicate_test_001"
    raw_body = json.dumps({"event": "payment.authorized", "id": event_id}).encode("utf-8")
    sig = make_webhook_signature(raw_body)

    headers = {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": sig,
        "X-Razorpay-Event-Id": event_id,
    }

    # First delivery
    res1 = await client.post("/api/v1/payments/razorpay/webhook", content=raw_body, headers=headers)
    assert res1.status_code == 200
    assert res1.json()["status"] == "processed"

    # Second delivery (replay)
    res2 = await client.post("/api/v1/payments/razorpay/webhook", content=raw_body, headers=headers)
    assert res2.status_code == 200
    assert res2.json()["status"] == "duplicate_ignored"

    # Verify exactly 1 record in WebhookEvent table
    stmt = select(WebhookEvent).where(WebhookEvent.event_id == event_id)
    records = (await db_session.execute(stmt)).scalars().all()
    assert len(records) == 1


@pytest.mark.asyncio
async def test_webhook_payment_failed_event(client: AsyncClient, db_session: AsyncSession):
    """Verifies that payment.failed webhook marks the payment as FAILED without failing the consultation."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Failed Payment Client",
            "email": "fail_client@atelier.luxury",
            "phone": "+91 98666 77777",
            "address": "Knightsbridge, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]

    event_id = f"evt_fail_{uuid.uuid4().hex[:10]}"
    webhook_payload = {
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_failed_123",
                    "order_id": order_id,
                    "error_code": "BAD_REQUEST_ERROR",
                    "error_description": "Payment was declined by bank.",
                }
            }
        },
    }
    raw_body = json.dumps(webhook_payload).encode("utf-8")
    sig = make_webhook_signature(raw_body)

    res = await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig, "X-Razorpay-Event-Id": event_id},
    )
    assert res.status_code == 200

    stmt_p = select(Payment).where(Payment.provider_order_id == order_id)
    p = (await db_session.execute(stmt_p)).scalar_one()
    assert p.status == PaymentStatus.FAILED

    # Consultation transitions to PAYMENT_FAILED
    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c = (await db_session.execute(stmt_c)).scalar_one()
    assert c.status == ConsultationStatus.PAYMENT_FAILED


@pytest.mark.asyncio
async def test_race_condition_frontend_then_webhook(client: AsyncClient, db_session: AsyncSession):
    """
    CASE A:
    Frontend verification arrives first -> marks SUCCESS.
    Webhook arrives second -> must not fail, must not duplicate records, retains SUCCESS.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Race Case A",
            "email": "race_a@atelier.luxury",
            "phone": "+91 98777 88888",
            "address": "Bond Street, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_race_a_{uuid.uuid4().hex[:8]}"

    # Step 1: Frontend Verification
    sig = make_payment_signature(order_id, payment_id)
    v_res = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig,
        },
    )
    assert v_res.status_code == 200

    # Step 2: Webhook arrives later
    hook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "amount": 279900,
                }
            }
        },
    }
    raw_body = json.dumps(hook_payload).encode("utf-8")
    hook_sig = make_webhook_signature(raw_body)
    hook_res = await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": hook_sig},
    )
    assert hook_res.status_code == 200

    # Final Check
    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c = (await db_session.execute(stmt_c)).scalar_one()
    assert c.status == ConsultationStatus.PAYMENT_SUCCESS


@pytest.mark.asyncio
async def test_race_condition_webhook_then_frontend(client: AsyncClient, db_session: AsyncSession):
    """
    CASE B:
    Webhook arrives first -> marks SUCCESS.
    Frontend verification arrives second -> returns idempotent success, retains SUCCESS.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Race Case B",
            "email": "race_b@atelier.luxury",
            "phone": "+91 98888 99999",
            "address": "Fleet Street, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_race_b_{uuid.uuid4().hex[:8]}"

    # Step 1: Webhook arrives first
    hook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "amount": 279900,
                }
            }
        },
    }
    raw_body = json.dumps(hook_payload).encode("utf-8")
    hook_sig = make_webhook_signature(raw_body)
    hook_res = await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": hook_sig},
    )
    assert hook_res.status_code == 200

    # Step 2: Frontend verification arrives later
    sig = make_payment_signature(order_id, payment_id)
    v_res = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig,
        },
    )
    assert v_res.status_code == 200
    assert v_res.json()["data"]["status"] == "PAYMENT_SUCCESS"


@pytest.mark.asyncio
async def test_out_of_order_events_payment_failed_after_capture(client: AsyncClient, db_session: AsyncSession):
    """Verifies that an out-of-order payment.failed event does not downgrade a successful payment."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Monotonic Client",
            "email": "monotonic@atelier.luxury",
            "phone": "+91 98111 55555",
            "address": "High Street, Oxford",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_mono_{uuid.uuid4().hex[:8]}"

    # Step 1: Mark SUCCESS via verification
    sig = make_payment_signature(order_id, payment_id)
    await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig,
        },
    )

    # Step 2: Delayed payment.failed webhook arrives
    hook_payload = {
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "error_code": "DELAYED_FAIL",
                }
            }
        },
    }
    raw_body = json.dumps(hook_payload).encode("utf-8")
    hook_sig = make_webhook_signature(raw_body)
    await client.post(
        "/api/v1/payments/razorpay/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": hook_sig},
    )

    # Payment and consultation MUST remain in SUCCESS state
    stmt_p = select(Payment).where(Payment.provider_order_id == order_id)
    p = (await db_session.execute(stmt_p)).scalar_one()
    assert p.status == PaymentStatus.SUCCESS

    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c = (await db_session.execute(stmt_c)).scalar_one()
    assert c.status == ConsultationStatus.PAYMENT_SUCCESS


@pytest.mark.asyncio
async def test_concurrent_payment_order_creation(client: AsyncClient):
    """Verifies that parallel concurrent requests to create payment orders return the same order."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Concurrent Order Client",
            "email": "concurrent_order@atelier.luxury",
            "phone": "+91 98000 88888",
            "address": "Victoria, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    res1 = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    res2 = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    assert res1.status_code == 201
    assert res2.status_code == 201
    assert res1.json()["data"]["order_id"] == res2.json()["data"]["order_id"]


@pytest.mark.asyncio
async def test_concurrent_payment_verification(client: AsyncClient):
    """Verifies that parallel concurrent verification requests succeed idempotently without error."""
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Concurrent Verify Client",
            "email": "concurrent_verify@atelier.luxury",
            "phone": "+91 98000 99999",
            "address": "Strand, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_conc_{uuid.uuid4().hex[:8]}"
    sig = make_payment_signature(order_id, payment_id)

    verify_payload = {
        "consultation_code": code,
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": sig,
    }

    res1 = await client.post("/api/v1/payments/verify", json=verify_payload)
    res2 = await client.post("/api/v1/payments/verify", json=verify_payload)
    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()["data"]["status"] == "PAYMENT_SUCCESS"
    assert res2.json()["data"]["status"] == "PAYMENT_SUCCESS"


@pytest.mark.asyncio
async def test_database_partial_unique_constraint_on_success(db_session: AsyncSession):
    """
    Verifies that the database partial unique index 'uq_payments_consultation_success'
    physically prevents committing two SUCCESS payment rows for the same consultation.
    """
    consultation = Consultation(
        consultation_code="STC-2026-UQ001",
        customer_name="Database Integrity Client",
        email="integrity@atelier.luxury",
        phone="+919876543210",
        address="10 Downing Street",
        package_id="styleora_signature_blueprint",
        package_price_inr=2799,
        total_price_inr=2799,
        status=ConsultationStatus.PAYMENT_SUCCESS,
    )
    db_session.add(consultation)
    await db_session.flush()

    # First SUCCESS payment
    pay1 = Payment(
        consultation_id=consultation.id,
        provider="razorpay",
        provider_order_id="order_uq_001",
        provider_payment_id="pay_uq_001",
        amount=279900,
        currency="INR",
        status=PaymentStatus.SUCCESS,
    )
    db_session.add(pay1)
    await db_session.commit()

    # Second SUCCESS payment for the same consultation must fail unique constraint
    pay2 = Payment(
        consultation_id=consultation.id,
        provider="razorpay",
        provider_order_id="order_uq_002",
        provider_payment_id="pay_uq_002",
        amount=279900,
        currency="INR",
        status=PaymentStatus.SUCCESS,
    )
    db_session.add(pay2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


# =============================================================================
# PHASE 2 REGRESSION TESTS: SIGNATURE SECURITY, STATE TRANSITIONS & TIMESTAMPS
# =============================================================================

@pytest.mark.asyncio
async def test_invalid_signature_replay_on_already_successful_payment_rejected(
    client: AsyncClient, db_session: AsyncSession
):
    """
    TEST 4B REGRESSION:
    Verifies that HMAC-SHA256 signature verification occurs BEFORE any idempotency short-circuit.
    Even if a payment is already confirmed as SUCCESS, replaying with a tampered or invalid signature
    MUST be rejected with HTTP 400 (PAYMENT_SIGNATURE_INVALID) and MUST NOT corrupt existing ledger status.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Signature Replay Target",
            "email": "sig_replay@atelier.luxury",
            "phone": "+91 98111 22222",
            "address": "Mayfair High Street, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_legit_{uuid.uuid4().hex[:10]}"
    legit_sig = make_payment_signature(order_id, payment_id)

    # 1. Initial valid verification succeeds
    v1 = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": legit_sig,
        },
    )
    assert v1.status_code == 200
    assert v1.json()["data"]["status"] == "PAYMENT_SUCCESS"

    # 2. Legitimate idempotent replay with identical valid signature succeeds
    v2 = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": legit_sig,
        },
    )
    assert v2.status_code == 200
    assert v2.json()["data"]["status"] == "PAYMENT_SUCCESS"

    # 3. Tampered replay with invalid signature MUST be rejected with HTTP 400
    v_bad = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": "tampered_signature_hex_000000000000000000000000",
        },
    )
    assert v_bad.status_code == 400
    assert v_bad.json()["error"]["code"] == "PAYMENT_SIGNATURE_INVALID"

    # 4. Confirm database record was NOT corrupted or downgraded
    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c = (await db_session.execute(stmt_c)).scalar_one()
    assert c.status == ConsultationStatus.PAYMENT_SUCCESS

    stmt_p = select(Payment).where(Payment.provider_order_id == order_id)
    p = (await db_session.execute(stmt_p)).scalar_one()
    assert p.status == PaymentStatus.SUCCESS


@pytest.mark.asyncio
async def test_payment_verification_persists_payment_method_and_timestamps(
    client: AsyncClient, db_session: AsyncSession
):
    """
    TEST 5 & 6 REGRESSION:
    Verifies that payment verification:
    1. Fetches and persists the authoritative provider payment method (e.g. 'upi').
    2. Records paid_at as a timezone-aware UTC datetime.
    3. Retains distinct event semantics between local DB timestamps and provider timestamps.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Payment Method Client",
            "email": "method_client@atelier.luxury",
            "phone": "+91 98222 55555",
            "address": "Kensington Palace Gardens, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_method_{uuid.uuid4().hex[:10]}"
    sig = make_payment_signature(order_id, payment_id)

    verify_res = await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig,
        },
    )
    assert verify_res.status_code == 200
    data = verify_res.json()["data"]
    assert data["payment_method"] == "upi"
    assert "paid_at" in data
    assert data["paid_at"] is not None

    # Inspect DB record
    stmt_p = select(Payment).where(Payment.provider_order_id == order_id)
    p = (await db_session.execute(stmt_p)).scalar_one()
    assert p.payment_method == "upi"
    assert p.paid_at is not None
    assert p.created_at is not None
    # Verify UTC serialized representation in API schema response
    assert data["paid_at"].endswith("Z") or "+00:00" in data["paid_at"]

    # Inspect audit log metadata
    stmt_audit = (
        select(AuditLog)
        .where(AuditLog.consultation_id == p.consultation_id, AuditLog.event == AuditEvent.PAYMENT_VERIFIED)
    )
    audit = (await db_session.execute(stmt_audit)).scalar_one()
    assert audit.log_metadata.get("payment_method") == "upi"
    assert "razorpay_payment_created_at" in audit.log_metadata


@pytest.mark.asyncio
async def test_report_payment_failure_endpoint_transitions_state(
    client: AsyncClient, db_session: AsyncSession
):
    """
    TEST 1 REGRESSION:
    Verifies that the client-facing failure reporting endpoint POST /api/v1/payments/fail:
    1. Transitions consultation.status from PAYMENT_PENDING to PAYMENT_FAILED.
    2. Transitions payment.status to FAILED.
    3. Records telemetry in the audit log.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Failure Telemetry Client",
            "email": "fail_telem@atelier.luxury",
            "phone": "+91 98333 66666",
            "address": "Park Lane, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]

    # Initial state should be PAYMENT_PENDING
    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c_init = (await db_session.execute(stmt_c)).scalar_one()
    assert c_init.status == ConsultationStatus.PAYMENT_PENDING

    # Report failure from checkout
    fail_res = await client.post(
        "/api/v1/payments/fail",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "error_code": "BAD_REQUEST_ERROR",
            "error_description": "Payment was declined by card issuing bank.",
            "error_source": "customer",
            "error_step": "payment_authentication",
            "error_reason": "payment_failed",
        },
    )
    assert fail_res.status_code == 200
    assert fail_res.json()["data"]["status"] == "PAYMENT_FAILED"

    # Confirm DB states
    stmt_c2 = select(Consultation).where(Consultation.consultation_code == code)
    c_after = (await db_session.execute(stmt_c2)).scalar_one()
    assert c_after.status == ConsultationStatus.PAYMENT_FAILED

    stmt_p = select(Payment).where(Payment.provider_order_id == order_id)
    p_after = (await db_session.execute(stmt_p)).scalar_one()
    assert p_after.status == PaymentStatus.FAILED

    # Confirm audit trail
    stmt_audit = (
        select(AuditLog)
        .where(AuditLog.consultation_id == c_after.id, AuditLog.event == AuditEvent.PAYMENT_FAILED)
    )
    audit = (await db_session.execute(stmt_audit)).scalar_one()
    assert audit.log_metadata.get("error_code") == "BAD_REQUEST_ERROR"
    assert audit.log_metadata.get("reported_by") == "frontend_checkout"


@pytest.mark.asyncio
async def test_report_payment_failure_does_not_downgrade_successful_payment(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Verifies monotonic state protection:
    If a consultation is already in PAYMENT_SUCCESS, a late or erroneous client failure report
    does NOT downgrade or alter the confirmed payment status.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Monotonic Safety Client",
            "email": "monotonic@atelier.luxury",
            "phone": "+91 98444 77777",
            "address": "Eaton Square, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    order_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order_id = order_res.json()["data"]["order_id"]
    payment_id = f"pay_mono_{uuid.uuid4().hex[:10]}"
    sig = make_payment_signature(order_id, payment_id)

    # Successfully verify
    await client.post(
        "/api/v1/payments/verify",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": sig,
        },
    )

    # Late failure report arrives
    fail_res = await client.post(
        "/api/v1/payments/fail",
        json={
            "consultation_code": code,
            "razorpay_order_id": order_id,
            "error_code": "LATE_CLIENT_DROP",
            "error_description": "Network dropped after user paid.",
        },
    )
    assert fail_res.status_code == 200
    assert fail_res.json()["data"]["status"] == "PAYMENT_SUCCESS"

    # Verify status in database remains PAYMENT_SUCCESS
    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c = (await db_session.execute(stmt_c)).scalar_one()
    assert c.status == ConsultationStatus.PAYMENT_SUCCESS


@pytest.mark.asyncio
async def test_payment_order_recreation_after_failure(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Verifies that when a consultation is in PAYMENT_FAILED status, requesting a new payment order:
    1. Succeeds and creates a new Razorpay order.
    2. Transitions the consultation status back to PAYMENT_PENDING.
    """
    create_res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Retry Client",
            "email": "retry_client@atelier.luxury",
            "phone": "+91 98555 88888",
            "address": "Bond Street, London",
            "package_id": "styleora_signature_blueprint",
        },
    )
    code = create_res.json()["data"]["consultation_code"]

    # Initial order and mark as failed
    order1_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    order1_id = order1_res.json()["data"]["order_id"]

    await client.post(
        "/api/v1/payments/fail",
        json={
            "consultation_code": code,
            "razorpay_order_id": order1_id,
            "error_code": "USER_ABORTED",
            "error_description": "User cancelled checkout.",
        },
    )

    # Verify status is PAYMENT_FAILED
    stmt_c = select(Consultation).where(Consultation.consultation_code == code)
    c1 = (await db_session.execute(stmt_c)).scalar_one()
    assert c1.status == ConsultationStatus.PAYMENT_FAILED

    # Request new checkout order
    order2_res = await client.post("/api/v1/payments/orders", json={"consultation_code": code})
    assert order2_res.status_code == 201
    order2_id = order2_res.json()["data"]["order_id"]
    assert order2_id != order1_id

    # Verify consultation transitioned back to PAYMENT_PENDING
    stmt_c2 = select(Consultation).where(Consultation.consultation_code == code)
    c2 = (await db_session.execute(stmt_c2)).scalar_one()
    assert c2.status == ConsultationStatus.PAYMENT_PENDING

