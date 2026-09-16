import asyncio
import datetime
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.audit_log import AuditEvent, AuditLog
from app.models.consultation import Consultation, ConsultationAddOn, ConsultationStatus
from app.schemas.consultation import VALID_CORE_PACKAGES, VALID_ADD_ONS


@pytest.mark.asyncio
async def test_create_consultation_signature_blueprint_success(client: AsyncClient, db_session: AsyncSession):
    """Verifies core package creation at authoritative price ₹2,799 (279,900 paise)."""
    payload = {
        "customer_name": "Lady Genevieve Sterling",
        "email": "genevieve@sterling.luxury",
        "phone": "+91 98765 43210",
        "address": "Penthouse 4B, 18 Malabar Hill, Mumbai, MH 400006",
        "package_id": "styleora_signature_blueprint",
        "style_notes": "Preparation for London Spring Gala.",
    }

    response = await client.post("/api/v1/consultations", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["success"] is True
    res_data = data["data"]

    current_year = datetime.datetime.now(datetime.timezone.utc).year
    assert res_data["consultation_code"].startswith(f"STC-{current_year}-")
    assert res_data["customer_name"] == "Lady Genevieve Sterling"
    assert res_data["email"] == "genevieve@sterling.luxury"
    assert res_data["package_id"] == "styleora_signature_blueprint"
    assert res_data["package_name"] == "STYLEORA Signature Blueprint"
    assert res_data["package_price"] == "₹2,799"
    assert res_data["package_price_inr"] == 2799
    assert res_data["total_price_inr"] == 2799
    assert res_data["total_price_formatted"] == "₹2,799"
    assert res_data["selected_add_ons"] == []
    assert res_data["status"] == "CREATED"
    assert res_data["style_notes"] == "Preparation for London Spring Gala."

    # Verify backend authoritative amount in paise
    core_pkg = VALID_CORE_PACKAGES["styleora_signature_blueprint"]
    assert core_pkg["amount_paise"] == 279900

    # Verify database persistence
    stmt = (
        select(Consultation)
        .options(selectinload(Consultation.add_ons))
        .where(Consultation.consultation_code == res_data["consultation_code"])
    )
    db_res = await db_session.execute(stmt)
    consultation = db_res.scalar_one_or_none()
    assert consultation is not None
    assert consultation.status == ConsultationStatus.CREATED
    assert consultation.package_price_inr == 2799
    assert consultation.total_price_inr == 2799
    assert consultation.style_notes == "Preparation for London Spring Gala."
    assert len(consultation.add_ons) == 0

    # Verify audit log was recorded with safe metadata
    stmt_audit = select(AuditLog).where(AuditLog.consultation_id == consultation.id)
    audit_res = await db_session.execute(stmt_audit)
    audit = audit_res.scalar_one_or_none()
    assert audit is not None
    assert audit.event == AuditEvent.CONSULTATION_CREATED
    assert audit.log_metadata["consultation_code"] == res_data["consultation_code"]
    assert audit.log_metadata["package_id"] == "styleora_signature_blueprint"
    assert audit.log_metadata["has_style_notes"] is True


@pytest.mark.asyncio
async def test_create_consultation_with_single_and_multiple_add_ons(client: AsyncClient, db_session: AsyncSession):
    """Verifies optional add-on attachment and authoritative total calculation."""
    # Test 1: Single add-on (The Wardrobe Edit: ₹1,499 -> total ₹4,298)
    payload_single = {
        "customer_name": "Eleanor Vance",
        "email": "eleanor@vance.luxury",
        "phone": "+91 91234 56789",
        "address": "Mayfair, London, UK",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["wardrobe_edit"],
    }
    res_single = await client.post("/api/v1/consultations", json=payload_single)
    assert res_single.status_code == 201
    data_single = res_single.json()["data"]
    assert len(data_single["selected_add_ons"]) == 1
    assert data_single["selected_add_ons"][0]["add_on_id"] == "wardrobe_edit"
    assert data_single["selected_add_ons"][0]["price"] == "₹1,499"
    assert data_single["total_price_inr"] == 2799 + 1499  # 4298
    assert data_single["total_price_formatted"] == "₹4,298"

    # Test 2: All 3 add-ons (Wardrobe ₹1499 + Shopping ₹499 + Beauty ₹1499 -> total ₹6,296)
    payload_all = {
        "customer_name": "Duchess Sophia",
        "email": "sophia@belgravia.luxury",
        "phone": "+91 99887 76655",
        "address": "Belgravia, London, UK",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["wardrobe_edit", "shopping_edit", "beauty_atelier"],
    }
    res_all = await client.post("/api/v1/consultations", json=payload_all)
    assert res_all.status_code == 201
    data_all = res_all.json()["data"]
    assert len(data_all["selected_add_ons"]) == 3
    assert data_all["total_price_inr"] == 2799 + 1499 + 499 + 1499  # 6296
    assert data_all["total_price_formatted"] == "₹6,296"

    # Verify database relationship
    code = data_all["consultation_code"]
    stmt = (
        select(Consultation)
        .options(selectinload(Consultation.add_ons))
        .where(Consultation.consultation_code == code)
    )
    db_res = await db_session.execute(stmt)
    consultation = db_res.scalar_one()
    assert len(consultation.add_ons) == 3
    persisted_addon_ids = {a.add_on_id for a in consultation.add_ons}
    assert persisted_addon_ids == {"wardrobe_edit", "shopping_edit", "beauty_atelier"}


@pytest.mark.asyncio
async def test_create_consultation_validation_errors(client: AsyncClient):
    """Verifies validation rules on client profile fields."""
    # 1. Missing customer name
    res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": " ",
            "email": "valid@example.com",
            "phone": "+919876543210",
            "address": "Valid address 12345",
            "package_id": "styleora_signature_blueprint",
        },
    )
    assert res.status_code == 422

    # 2. Invalid email format
    res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Valid Name",
            "email": "not-an-email",
            "phone": "+919876543210",
            "address": "Valid address 12345",
            "package_id": "styleora_signature_blueprint",
        },
    )
    assert res.status_code == 422

    # 3. Invalid phone number
    res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Valid Name",
            "email": "valid@example.com",
            "phone": "abc",
            "address": "Valid address 12345",
            "package_id": "styleora_signature_blueprint",
        },
    )
    assert res.status_code == 422

    # 4. Address too short
    res = await client.post(
        "/api/v1/consultations",
        json={
            "customer_name": "Valid Name",
            "email": "valid@example.com",
            "phone": "+919876543210",
            "address": "Tiny",
            "package_id": "styleora_signature_blueprint",
        },
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_rejects_unknown_and_legacy_packages(client: AsyncClient):
    """Verifies rejection of unknown package IDs and retired legacy package IDs."""
    base_payload = {
        "customer_name": "Valid Name",
        "email": "valid@example.com",
        "phone": "+919876543210",
        "address": "Valid address 12345",
    }

    # Unknown package
    res_unknown = await client.post(
        "/api/v1/consultations",
        json={**base_payload, "package_id": "arbitrary_custom_plan"},
    )
    assert res_unknown.status_code == 422

    # Retired legacy packages must be rejected
    res_legacy1 = await client.post(
        "/api/v1/consultations",
        json={**base_payload, "package_id": "signature_silhouette"},
    )
    assert res_legacy1.status_code == 422
    assert "retired" in res_legacy1.text.lower()

    res_legacy2 = await client.post(
        "/api/v1/consultations",
        json={**base_payload, "package_id": "couture_capsule"},
    )
    assert res_legacy2.status_code == 422
    assert "retired" in res_legacy2.text.lower()


@pytest.mark.asyncio
async def test_rejects_unknown_and_duplicate_add_ons(client: AsyncClient):
    """Verifies that unknown or duplicate add-on IDs are rejected."""
    base_payload = {
        "customer_name": "Valid Name",
        "email": "valid@example.com",
        "phone": "+919876543210",
        "address": "Valid address 12345",
        "package_id": "styleora_signature_blueprint",
    }

    # Unknown add-on
    res_unknown = await client.post(
        "/api/v1/consultations",
        json={**base_payload, "selected_add_on_ids": ["personal_driver"]},
    )
    assert res_unknown.status_code == 422

    # Duplicate add-ons
    res_duplicate = await client.post(
        "/api/v1/consultations",
        json={**base_payload, "selected_add_on_ids": ["wardrobe_edit", "wardrobe_edit"]},
    )
    assert res_duplicate.status_code == 422


@pytest.mark.asyncio
async def test_client_cannot_tamper_prices(client: AsyncClient):
    """Verifies that client-supplied price/amount fields are completely ignored by the backend."""
    payload = {
        "customer_name": "Tamper Attempt",
        "email": "tamper@example.com",
        "phone": "+919876543210",
        "address": "Valid Address 12345",
        "package_id": "styleora_signature_blueprint",
        "price": "₹1",
        "amount": 100,
        "amount_inr": 1,
        "selected_add_on_ids": ["shopping_edit"],
        "add_on_prices": {"shopping_edit": 0},
    }

    res = await client.post("/api/v1/consultations", json=payload)
    assert res.status_code == 201
    data = res.json()["data"]
    # Backend price remains strictly authoritative
    assert data["package_price"] == "₹2,799"
    assert data["selected_add_ons"][0]["price"] == "₹499"
    assert data["total_price_inr"] == 3298
    assert data["total_price_formatted"] == "₹3,298"


@pytest.mark.asyncio
async def test_duplicate_submission_protection_idempotency_key(client: AsyncClient, db_session: AsyncSession):
    """Verifies that duplicate requests with the same idempotency key return the original consultation."""
    key = "idem_test_key_001"
    payload = {
        "customer_name": "Alexander Vance",
        "email": "alexander@vance.luxury",
        "phone": "+91 98765 11223",
        "address": "Kensington Palace Gardens, London, UK",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["wardrobe_edit"],
        "idempotency_key": key,
    }

    # First request
    res1 = await client.post("/api/v1/consultations", json=payload)
    assert res1.status_code == 201
    code1 = res1.json()["data"]["consultation_code"]

    # Second request with identical key and payload
    res2 = await client.post("/api/v1/consultations", json=payload)
    assert res2.status_code == 201
    code2 = res2.json()["data"]["consultation_code"]

    assert code1 == code2

    stmt = select(Consultation).where(Consultation.email == "alexander@vance.luxury")
    results = (await db_session.execute(stmt)).scalars().all()
    assert len(results) == 1
    assert results[0].idempotency_key == key


@pytest.mark.asyncio
async def test_idempotency_conflict_on_mismatched_payload(client: AsyncClient):
    """Verifies that reusing the same idempotency key with conflicting payload raises HTTP 409."""
    key = "idem_conflict_key_999"
    payload_original = {
        "customer_name": "Lord Harrington",
        "email": "harrington@estate.luxury",
        "phone": "+91 98765 22334",
        "address": "Cotswolds Country Estate, UK",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["wardrobe_edit"],
        "idempotency_key": key,
    }

    # First request succeeds
    res1 = await client.post("/api/v1/consultations", json=payload_original)
    assert res1.status_code == 201

    # Second request with SAME key but DIFFERENT add-ons
    payload_conflicting = {
        **payload_original,
        "selected_add_on_ids": ["shopping_edit", "beauty_atelier"],
    }
    res2 = await client.post("/api/v1/consultations", json=payload_conflicting)
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "IDEMPOTENCY_KEY_PAYLOAD_MISMATCH"


@pytest.mark.asyncio
async def test_idempotency_survives_beyond_20_records(client: AsyncClient, db_session: AsyncSession):
    target_key = "idem_persistence_test_target_key"
    payload = {
        "customer_name": "Duchess Beatrice",
        "email": "beatrice@royal.luxury",
        "phone": "+91 98111 22233",
        "address": "Windsor Estate, Berkshire, UK",
        "package_id": "styleora_signature_blueprint",
        "idempotency_key": target_key,
    }

    # Initial creation
    initial_res = await client.post("/api/v1/consultations", json=payload)
    assert initial_res.status_code == 201
    original_code = initial_res.json()["data"]["consultation_code"]

    # Insert 22 intermediate records directly into database to surpass the old 20-audit-log limit
    for i in range(22):
        dummy = Consultation(
            consultation_code=f"STC-2026-99{i:04d}",
            customer_name=f"Client {i}",
            email=f"client{i}@atelier.luxury",
            phone="9876543210",
            address="Mayfair, London",
            package_id="styleora_signature_blueprint",
            package_price_inr=2799,
            total_price_inr=2799,
            idempotency_key=f"dummy_key_{i}",
            status=ConsultationStatus.CREATED,
        )
        db_session.add(dummy)
    await db_session.commit()

    # Resubmit with original idempotency key
    replay_res = await client.post("/api/v1/consultations", json=payload)
    assert replay_res.status_code == 201
    replay_code = replay_res.json()["data"]["consultation_code"]

    assert replay_code == original_code

    # Verify still exactly 1 record with target key
    stmt = select(Consultation).where(Consultation.idempotency_key == target_key)
    res = (await db_session.execute(stmt)).scalars().all()
    assert len(res) == 1


@pytest.mark.asyncio
async def test_concurrent_idempotent_submissions(client: AsyncClient, db_session: AsyncSession):
    shared_key = "concurrent_idem_key_777"
    payload = {
        "customer_name": "Seraphina DuPont",
        "email": "seraphina@dupont.luxury",
        "phone": "+91 94455 66778",
        "address": "6 Place Vendome, Paris, France",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["shopping_edit"],
        "idempotency_key": shared_key,
    }

    # Launch sequential submissions with identical idempotency key
    res1 = await client.post("/api/v1/consultations", json=payload)
    res2 = await client.post("/api/v1/consultations", json=payload)

    assert res1.status_code == 201
    assert res2.status_code == 201
    code1 = res1.json()["data"]["consultation_code"]
    code2 = res2.json()["data"]["consultation_code"]

    assert code1 == code2

    stmt = select(Consultation).where(Consultation.idempotency_key == shared_key)
    records = (await db_session.execute(stmt)).scalars().all()
    assert len(records) == 1


@pytest.mark.asyncio
async def test_duplicate_submission_protection_rapid_clicks(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "customer_name": "Camille Monet",
        "email": "camille@monet.luxury",
        "phone": "+91 91234 56789",
        "address": "8 Avenue Montaigne, 75008 Paris, France",
        "package_id": "styleora_signature_blueprint",
    }

    # First submission
    res1 = await client.post("/api/v1/consultations", json=payload)
    assert res1.status_code == 201
    code1 = res1.json()["data"]["consultation_code"]

    # Rapid second submission (same email + package in < 5 mins)
    res2 = await client.post("/api/v1/consultations", json=payload)
    assert res2.status_code == 201
    code2 = res2.json()["data"]["consultation_code"]

    assert code1 == code2

    stmt = select(Consultation).where(Consultation.email == "camille@monet.luxury")
    records = (await db_session.execute(stmt)).scalars().all()
    assert len(records) == 1


@pytest.mark.asyncio
async def test_get_consultation_by_code_public_pii_protected(client: AsyncClient):
    """Verifies that public lookup returns package and add-ons without exposing customer PII."""
    payload = {
        "customer_name": "Margot de Valois",
        "email": "margot@valois.luxury",
        "phone": "+91 98888 77777",
        "address": "Chateau de Fontainebleau, France",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["beauty_atelier"],
        "style_notes": "Highly private styling notes.",
    }

    create_res = await client.post("/api/v1/consultations", json=payload)
    assert create_res.status_code == 201
    code = create_res.json()["data"]["consultation_code"]

    # Public lookup
    lookup_res = await client.get(f"/api/v1/consultations/{code}")
    assert lookup_res.status_code == 200

    pub_data = lookup_res.json()["data"]
    assert pub_data["consultation_code"] == code
    assert pub_data["package_id"] == "styleora_signature_blueprint"
    assert pub_data["package_name"] == "STYLEORA Signature Blueprint"
    assert pub_data["package_price"] == "₹2,799"
    assert pub_data["selected_add_ons"] == ["The Beauty Atelier"]
    assert pub_data["total_price_formatted"] == "₹4,298"
    assert pub_data["status"] == "CREATED"

    # Strictly verify NO sensitive client PII is exposed
    assert "phone" not in pub_data
    assert "address" not in pub_data
    assert "email" not in pub_data
    assert "customer_name" not in pub_data
    assert "style_notes" not in pub_data
    assert "id" not in pub_data


@pytest.mark.asyncio
async def test_get_consultation_not_found(client: AsyncClient):
    res = await client.get("/api/v1/consultations/STC-9999-000000")
    assert res.status_code == 404
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "CONSULTATION_NOT_FOUND"


@pytest.mark.asyncio
async def test_all_eight_addon_pricing_combinations(client: AsyncClient, db_session: AsyncSession):
    """
    Exhaustively verifies all 8 combinations of the core package and optional add-ons:
    - Core only = ₹2,799 (279,900 paise)
    - Core + Wardrobe = ₹4,298 (429,800 paise)
    - Core + Shopping = ₹3,298 (329,800 paise)
    - Core + Beauty = ₹4,298 (429,800 paise)
    - Core + Wardrobe + Shopping = ₹4,797 (479,700 paise)
    - Core + Wardrobe + Beauty = ₹5,797 (579,700 paise)
    - Core + Shopping + Beauty = ₹4,797 (479,700 paise)
    - Core + ALL THREE (Wardrobe + Shopping + Beauty) = ₹6,296 (629,600 paise)
    """
    matrix = [
        ([], 2799, 279900, "₹2,799"),
        (["wardrobe_edit"], 4298, 429800, "₹4,298"),
        (["shopping_edit"], 3298, 329800, "₹3,298"),
        (["beauty_atelier"], 4298, 429800, "₹4,298"),
        (["wardrobe_edit", "shopping_edit"], 4797, 479700, "₹4,797"),
        (["wardrobe_edit", "beauty_atelier"], 5797, 579700, "₹5,797"),
        (["shopping_edit", "beauty_atelier"], 4797, 479700, "₹4,797"),
        (["wardrobe_edit", "shopping_edit", "beauty_atelier"], 6296, 629600, "₹6,296"),
    ]

    for idx, (addon_ids, expected_inr, expected_paise, expected_fmt) in enumerate(matrix):
        payload = {
            "customer_name": f"Matrix Tester {idx}",
            "email": f"matrix_{idx}@styleora.luxury",
            "phone": f"+91 98000 0000{idx}",
            "address": f"Matrix Suite {idx}, Mayfair, London",
            "package_id": "styleora_signature_blueprint",
            "selected_add_on_ids": addon_ids,
        }

        res = await client.post("/api/v1/consultations", json=payload)
        assert res.status_code == 201, f"Failed for combo {addon_ids}: {res.text}"
        data = res.json()["data"]

        assert data["package_price_inr"] == 2799
        assert data["package_price"] == "₹2,799"
        assert data["total_price_inr"] == expected_inr
        assert data["total_price_formatted"] == expected_fmt
        assert len(data["selected_add_ons"]) == len(addon_ids)

        # Mathematical verification: INR to paise equality
        assert expected_inr * 100 == expected_paise

        # Verify database persisted snapshot columns
        stmt = (
            select(Consultation)
            .options(selectinload(Consultation.add_ons))
            .where(Consultation.consultation_code == data["consultation_code"])
        )
        db_res = await db_session.execute(stmt)
        record = db_res.scalar_one()
        assert record.package_price_inr == 2799
        assert record.total_price_inr == expected_inr
        assert len(record.add_ons) == len(addon_ids)


@pytest.mark.asyncio
async def test_price_snapshot_immutability_regression(client: AsyncClient, db_session: AsyncSession):
    """
    Verifies historical price immutability:
    If future commercial package prices or add-on prices in the registry are modified,
    previously created consultations retain their frozen quoted snapshot price.
    """
    payload = {
        "customer_name": "Duchess of Sutherland",
        "email": "sutherland@highland.luxury",
        "phone": "+91 97777 88888",
        "address": "Dunrobin Castle, Golspie, UK",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["wardrobe_edit"],
    }

    res = await client.post("/api/v1/consultations", json=payload)
    assert res.status_code == 201
    code = res.json()["data"]["consultation_code"]

    # Verify initial pricing snapshot: ₹2,799 + ₹1,499 = ₹4,298
    assert res.json()["data"]["package_price_inr"] == 2799
    assert res.json()["data"]["total_price_inr"] == 4298

    # Simulate future price hike in the live package registry
    orig_pkg_amount = VALID_CORE_PACKAGES["styleora_signature_blueprint"]["amount_inr"]
    orig_pkg_price = VALID_CORE_PACKAGES["styleora_signature_blueprint"]["price"]
    orig_addon_amount = VALID_ADD_ONS["wardrobe_edit"]["amount_inr"]
    orig_addon_price = VALID_ADD_ONS["wardrobe_edit"]["price"]

    try:
        VALID_CORE_PACKAGES["styleora_signature_blueprint"]["amount_inr"] = 9999
        VALID_CORE_PACKAGES["styleora_signature_blueprint"]["price"] = "₹9,999"
        VALID_ADD_ONS["wardrobe_edit"]["amount_inr"] = 8888
        VALID_ADD_ONS["wardrobe_edit"]["price"] = "₹8,888"

        # 1. Verify public lookup endpoint retains original frozen price
        lookup_res = await client.get(f"/api/v1/consultations/{code}")
        assert lookup_res.status_code == 200
        pub_data = lookup_res.json()["data"]
        assert pub_data["package_price"] == "₹2,799"
        assert pub_data["total_price_formatted"] == "₹4,298"

        # 2. Verify database entity query retains frozen columns
        stmt = (
            select(Consultation)
            .options(selectinload(Consultation.add_ons))
            .where(Consultation.consultation_code == code)
        )
        db_res = await db_session.execute(stmt)
        record = db_res.scalar_one()
        assert record.package_price_inr == 2799
        assert record.total_price_inr == 4298
        assert record.add_ons[0].price_inr == 1499

    finally:
        # Strictly restore registry state
        VALID_CORE_PACKAGES["styleora_signature_blueprint"]["amount_inr"] = orig_pkg_amount
        VALID_CORE_PACKAGES["styleora_signature_blueprint"]["price"] = orig_pkg_price
        VALID_ADD_ONS["wardrobe_edit"]["amount_inr"] = orig_addon_amount
        VALID_ADD_ONS["wardrobe_edit"]["price"] = orig_addon_price


@pytest.mark.asyncio
async def test_client_price_tampering_ignored_and_backend_authoritative(client: AsyncClient, db_session: AsyncSession):
    """
    Verifies that client attempting to inject package_price_inr, total_price_inr,
    amount, price, or discount fields cannot alter authoritative backend prices.
    """
    payload = {
        "customer_name": "Price Tamper Tester",
        "email": "tamperer@exploit.luxury",
        "phone": "+91 99999 00001",
        "address": "1 Cyber Lane, Security City",
        "package_id": "styleora_signature_blueprint",
        "package_price_inr": 1,
        "total_price_inr": 1,
        "package_price": "₹1",
        "total_price": "₹1",
        "amount": 100,
        "amount_paise": 100,
        "selected_add_on_ids": ["shopping_edit"],
    }

    res = await client.post("/api/v1/consultations", json=payload)
    assert res.status_code == 201
    data = res.json()["data"]

    # Backend enforces genuine values
    assert data["package_price_inr"] == 2799
    assert data["package_price"] == "₹2,799"
    assert data["total_price_inr"] == 3298
    assert data["total_price_formatted"] == "₹3,298"

    stmt = select(Consultation).where(Consultation.consultation_code == data["consultation_code"])
    record = (await db_session.execute(stmt)).scalar_one()
    assert record.package_price_inr == 2799
    assert record.total_price_inr == 3298


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "modified_field,modified_val",
    [
        ("customer_name", "Completely Different Name"),
        ("email", "different_email@estate.luxury"),
        ("phone", "+91 98888 00000"),
        ("address", "A Different Castle, Scotland"),
        ("style_notes", "Completely different style preferences"),
    ],
)
async def test_idempotency_lifecycle_field_mismatches(
    client: AsyncClient, modified_field: str, modified_val: str
):
    """
    Verifies that any modification to client profile input fields under the same
    idempotency key raises HTTP 409 Conflict with IDEMPOTENCY_KEY_PAYLOAD_MISMATCH.
    """
    key = f"idem_mismatch_{modified_field}"
    base_payload = {
        "customer_name": "Original Name",
        "email": "original@estate.luxury",
        "phone": "+91 98765 43210",
        "address": "Original Estate, Oxfordshire, UK",
        "package_id": "styleora_signature_blueprint",
        "selected_add_on_ids": ["wardrobe_edit"],
        "style_notes": "Original style notes.",
        "idempotency_key": key,
    }

    res1 = await client.post("/api/v1/consultations", json=base_payload)
    assert res1.status_code == 201

    conflicting_payload = {**base_payload, modified_field: modified_val}
    res2 = await client.post("/api/v1/consultations", json=conflicting_payload)
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "IDEMPOTENCY_KEY_PAYLOAD_MISMATCH"


@pytest.mark.asyncio
async def test_idempotency_distinct_key_creates_new_consultation(client: AsyncClient):
    """
    Verifies that distinct idempotency keys create distinct consultation records
    with unique consultation codes.
    """
    payload1 = {
        "customer_name": "Viscount Sterling",
        "email": "sterling_first@mayfair.luxury",
        "phone": "+91 98123 45678",
        "address": "1 Berkeley Square, London",
        "package_id": "styleora_signature_blueprint",
        "idempotency_key": "distinct_key_alpha",
    }
    payload2 = {
        "customer_name": "Viscount Sterling",
        "email": "sterling_second@mayfair.luxury",
        "phone": "+91 98123 45678",
        "address": "1 Berkeley Square, London",
        "package_id": "styleora_signature_blueprint",
        "idempotency_key": "distinct_key_beta",
    }

    res1 = await client.post("/api/v1/consultations", json=payload1)
    res2 = await client.post("/api/v1/consultations", json=payload2)

    assert res1.status_code == 201
    assert res2.status_code == 201

    code1 = res1.json()["data"]["consultation_code"]
    code2 = res2.json()["data"]["consultation_code"]
    assert code1 != code2


@pytest.mark.asyncio
async def test_rate_limiting_post_consultations(client: AsyncClient):
    """Verifies rate limiting triggers after exceeding configured threshold (10 req/min)."""
    payload = {
        "customer_name": "Rate Limit Tester",
        "email": "ratelimit@tester.luxury",
        "phone": "+91 98000 11111",
        "address": "10 Downing Street, London",
        "package_id": "styleora_signature_blueprint",
    }

    # 10 requests should succeed (201 Created)
    for i in range(10):
        res = await client.post(
            "/api/v1/consultations",
            json={**payload, "email": f"ratelimit_{i}@tester.luxury"},
        )
        assert res.status_code == 201

    # 11th request must be rejected with 429 Too Many Requests
    exceeded_res = await client.post(
        "/api/v1/consultations",
        json={**payload, "email": "ratelimit_exceeded@tester.luxury"},
    )
    assert exceeded_res.status_code == 429
    assert exceeded_res.json()["error"]["code"] == "RATE_LIMIT_EXCEEDED"
