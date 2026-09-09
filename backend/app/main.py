from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config.settings import get_settings
from app.core.logging import logger
from app.db.session import engine
from app.exceptions.handlers import register_exception_handlers
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.api.v1.router import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        f"Starting {settings.APP_NAME} v{settings.APP_VERSION} [Env: {settings.ENVIRONMENT}]"
    )
    # Validate database connectivity without leaking credentials
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection validated successfully.")
    except Exception as exc:
        logger.error(
            "Initial database connectivity check failed. Check DATABASE_URL and network configuration.",
            extra={"extra_data": {"error_type": type(exc).__name__}}
        )

    yield

    logger.info("Shutting down STYLEORA backend services.")
    await engine.dispose()


def create_application() -> FastAPI:
    app = FastAPI(
        title="STYLEORA — Personal Style Atelier API",
        description="Production API for STYLEORA Luxury Personal Styling Platform (Module 1)",
        version=settings.APP_VERSION,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # Register Exception Handlers
    register_exception_handlers(app)

    # Middleware Pipeline
    # 1. Security Headers
    app.add_middleware(SecurityHeadersMiddleware)

    # 2. Strict CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Response-Time-Ms"],
    )

    # 3. Correlation Request ID & Logging
    app.add_middleware(RequestIdMiddleware)

    # Include Versioned API Routes
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
