import asyncio
import os
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Set test environment
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["RAZORPAY_KEY_ID"] = "rzp_test_mock_key_123"
os.environ["RAZORPAY_KEY_SECRET"] = "rzp_test_mock_secret_456"
os.environ["RAZORPAY_WEBHOOK_SECRET"] = "rzp_test_mock_webhook_sec_789"
os.environ["RAZORPAY_MODE"] = "test"

from app.core.limiter import limiter
from app.db.base import Base
from app.services.razorpay_client import razorpay_client
razorpay_client.key_id = "rzp_test_mock_key_123"
razorpay_client.key_secret = "rzp_test_mock_secret_456"
razorpay_client.webhook_secret = "rzp_test_mock_webhook_sec_789"
from app.db.session import get_db
from app.main import create_application

test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    limiter.reset()
    app = create_application()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()
    limiter.reset()

