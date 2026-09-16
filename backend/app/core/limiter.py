from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config.settings import get_settings

settings = get_settings()

# Centralized rate limiter initialized with settings default
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.RATE_LIMIT_DEFAULT],
)
