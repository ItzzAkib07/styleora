from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Environment
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, production")
    APP_NAME: str = "STYLEORA API"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = Field(default=False)

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS & Security
    FRONTEND_URL: str = Field(
        default="http://localhost:5173",
        description="Allowed frontend origin for CORS"
    )
    ADDITIONAL_ALLOWED_ORIGINS: List[str] = Field(
        default=[],
        description="Additional allowed origins for staging/production"
    )

    # Database (Supabase PostgreSQL in production)
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost:5432/postgres",
        description="Async PostgreSQL connection string (Supabase)"
    )
    DB_ECHO: bool = Field(default=False, description="Log SQL queries in development")

    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "100/minute"
    RATE_LIMIT_STORAGE_URL: str = "memory://"

    # Razorpay Test Mode Configuration
    RAZORPAY_MODE: str = Field(default="test")
    RAZORPAY_KEY_ID: str = Field(default="")
    RAZORPAY_KEY_SECRET: str = Field(default="")
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="")
    RESEND_API_KEY: str = Field(default="")
    ADMIN_EMAIL: str = Field(default="hello@styleora.me")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def allowed_cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_URL.rstrip("/")]
        for origin in self.ADDITIONAL_ALLOWED_ORIGINS:
            cleaned = origin.rstrip("/")
            if cleaned and cleaned not in origins:
                origins.append(cleaned)
        # In local development, also permit standard dev ports if needed
        if not self.is_production:
            dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
            for dev in dev_origins:
                if dev not in origins:
                    origins.append(dev)
        return origins


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()

