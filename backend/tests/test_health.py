import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_liveness_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"
    assert "version" in data["data"]
    assert "timestamp" in data["data"]


@pytest.mark.asyncio
async def test_readiness_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "ready"
    assert data["data"]["database"] == "connected"
