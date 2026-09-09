from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIErrorDetails(BaseModel):
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable safe error message")
    reference_id: Optional[str] = Field(None, description="Correlation request ID for support")
    details: Optional[Any] = Field(None, description="Optional safe contextual details")


class APIResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True, description="Indicates request success")
    data: Optional[T] = Field(default=None, description="Payload on success")
    message: Optional[str] = Field(default=None, description="Descriptive status message")
    error: Optional[APIErrorDetails] = Field(default=None, description="Error details on failure")


class HealthStatusData(BaseModel):
    status: str
    environment: str
    version: str
    database: str
    timestamp: str
