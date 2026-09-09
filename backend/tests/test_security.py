import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_security_headers_present(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200

    headers = response.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert "Content-Security-Policy" in headers
    assert "checkout.razorpay.com" in headers["Content-Security-Policy"]
    assert "Referrer-Policy" in headers
    assert "Permissions-Policy" in headers


@pytest.mark.asyncio
async def test_request_id_correlation(client: AsyncClient):
    # 1. Server generates request ID if not supplied
    res1 = await client.get("/api/v1/health")
    assert "X-Request-ID" in res1.headers
    assert "X-Response-Time-Ms" in res1.headers

    # 2. Server echoes/propagates supplied request ID
    custom_id = "test-custom-request-id-12345"
    res2 = await client.get("/api/v1/health", headers={"X-Request-ID": custom_id})
    assert res2.headers.get("X-Request-ID") == custom_id
