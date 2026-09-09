import json
import logging
import sys
import time
from typing import Any, Dict
from contextvars import ContextVar

# Context variable for correlation request ID
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="system")

SENSITIVE_KEYS = {
    "password",
    "secret",
    "token",
    "authorization",
    "key",
    "razorpay_key_secret",
    "razorpay_signature",
    "resend_api_key",
    "webhook_secret",
}


def mask_sensitive_data(data: Any) -> Any:
    if isinstance(data, dict):
        masked: Dict[str, Any] = {}
        for k, v in data.items():
            if any(s in k.lower() for s in SENSITIVE_KEYS):
                masked[k] = "********"
            else:
                masked[k] = mask_sensitive_data(v)
        return masked
    elif isinstance(data, list):
        return [mask_sensitive_data(item) for item in data]
    return data


class StructuredJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_ctx.get(),
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "extra_data"):
            log_record["data"] = mask_sensitive_data(getattr(record, "extra_data"))
        return json.dumps(log_record)


def setup_logging(debug: bool = False) -> logging.Logger:
    level = logging.DEBUG if debug else logging.INFO
    logger = logging.getLogger("styleora")
    logger.setLevel(level)

    # Avoid duplicate handlers
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = StructuredJsonFormatter(datefmt="%Y-%m-%dT%H:%M:%S%z")
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    # Configure uvicorn loggers to harmonize
    for uv_logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        uv_logger = logging.getLogger(uv_logger_name)
        uv_logger.handlers = logger.handlers

    return logger


logger = setup_logging()
