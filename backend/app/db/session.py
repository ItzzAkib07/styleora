import urllib.parse
from typing import Any, AsyncGenerator, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool
from app.config.settings import get_settings
from app.core.logging import logger

settings = get_settings()


def normalize_database_url(raw_url: str) -> Tuple[str, Dict[str, Any]]:
    """
    Normalizes database connection string for asyncpg and Supabase PostgreSQL.
    - Accurately splits userinfo and host at the last '@'
    - Encodes special characters in user/password (e.g. '@', '?', '#')
    - Strips incompatible query parameters (?sslmode=) from URL for asyncpg
    - Automatically injects connect_args for SSL and PgBouncer statement caching
    """
    if not raw_url or "sqlite" in raw_url:
        return raw_url, {"check_same_thread": False} if "sqlite" in raw_url else {}

    if "://" not in raw_url:
        return raw_url, {}

    prefix = "postgresql+asyncpg://"
    _, rest = raw_url.split("://", 1)

    connect_args: Dict[str, Any] = {}

    # Split user credentials and host at the last '@'
    if "@" in rest:
        userinfo, host_part = rest.rsplit("@", 1)
        if ":" in userinfo:
            user, password = userinfo.split(":", 1)
            unquoted_pw = urllib.parse.unquote(password)
            quoted_pw = urllib.parse.quote(unquoted_pw, safe="")
            userinfo = f"{user}:{quoted_pw}"
    else:
        userinfo = ""
        host_part = rest

    # Extract query parameters from host part if present
    if "?" in host_part:
        host_db, query = host_part.split("?", 1)
        params = urllib.parse.parse_qs(query)
        if "sslmode" in params or "ssl" in params:
            connect_args["ssl"] = "require"
    else:
        host_db = host_part

    if userinfo:
        normalized_url = f"{prefix}{userinfo}@{host_db}"
    else:
        normalized_url = f"{prefix}{host_db}"

    # Supabase PostgreSQL requirements
    if "supabase.co" in normalized_url or "supabase.com" in normalized_url:
        connect_args["ssl"] = "require"
        # If pooler or port 6543 (transaction pooler) is used, disable statement cache for PgBouncer
        if "pooler.supabase.com" in normalized_url or ":6543" in normalized_url:
            connect_args["statement_cache_size"] = 0
            connect_args["prepared_statement_cache_size"] = 0

    return normalized_url, connect_args


normalized_db_url, db_connect_args = normalize_database_url(settings.DATABASE_URL)

is_sqlite = "sqlite" in normalized_db_url

engine_kwargs: Dict[str, Any] = {
    "echo": settings.DB_ECHO,
    "future": True,
    "connect_args": db_connect_args,
}

if is_sqlite:
    engine_kwargs["poolclass"] = NullPool
else:
    # AsyncAdaptedQueuePool settings for containerized/serverless environments
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_timeout"] = 30
    engine_kwargs["pool_recycle"] = 1800  # Recycle after 30 mins to avoid dropped idle connections
    engine_kwargs["pool_pre_ping"] = True  # Check liveness before checking out connection

engine = create_async_engine(normalized_db_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an async database session.
    Guarantees session rollback on error and proper closure in all cases.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
