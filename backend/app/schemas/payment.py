import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class PaymentOrderCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    consultation_code: str = Field(
        ...,
        min_length=5,
        max_length=32,
        description="Official consultation reference code",
        examples=["STC-2026-000101"],
    )

    @field_validator("consultation_code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("Consultation code cannot be empty.")
        return cleaned


class PaymentOrderResponseData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: str = Field(..., description="Razorpay provider order identifier")
    amount: int = Field(..., description="Authoritative order amount in currency subunits (paise)")
    amount_inr: int = Field(..., description="Order amount in Indian Rupees (INR)")
    currency: str = Field(default="INR", description="Payment currency code")
    key_id: str = Field(..., description="Public Razorpay client Key ID")
    consultation_code: str = Field(..., description="Associated consultation reference code")
    package_name: str = Field(..., description="Name of the booked experience")
    customer_name: str = Field(..., description="Customer full name for checkout prefill")
    email: str = Field(..., description="Customer email address for checkout prefill")
    phone: str = Field(..., description="Customer phone number for checkout prefill")


class PaymentVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    consultation_code: str = Field(
        ...,
        min_length=5,
        max_length=32,
        description="Official consultation reference code",
    )
    razorpay_order_id: str = Field(
        ...,
        min_length=5,
        max_length=128,
        description="Razorpay order identifier returned by checkout",
    )
    razorpay_payment_id: str = Field(
        ...,
        min_length=5,
        max_length=128,
        description="Razorpay payment identifier returned by checkout",
    )
    razorpay_signature: str = Field(
        ...,
        min_length=10,
        max_length=256,
        description="HMAC-SHA256 signature returned by checkout",
    )

    @field_validator("consultation_code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("razorpay_order_id", "razorpay_payment_id", "razorpay_signature")
    @classmethod
    def validate_strings(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Payment credential parameter cannot be empty.")
        return cleaned


class PaymentVerifyResponseData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    consultation_code: str = Field(..., description="Official consultation reference code")
    payment_id: str = Field(..., description="Razorpay payment identifier")
    order_id: str = Field(..., description="Razorpay order identifier")
    amount: int = Field(..., description="Reconciled payment amount in paise")
    amount_inr: int = Field(..., description="Reconciled payment amount in INR")
    currency: str = Field(..., description="Currency code")
    status: str = Field(..., description="Confirmed consultation lifecycle status")
    paid_at: datetime.datetime = Field(..., description="Timestamp of payment confirmation")
    payment_method: Optional[str] = Field(None, description="Authoritative payment method (e.g. upi, card, netbanking)")


class PaymentFailRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    consultation_code: str = Field(
        ...,
        min_length=5,
        max_length=32,
        description="Official consultation reference code",
    )
    razorpay_order_id: Optional[str] = Field(
        None,
        max_length=128,
        description="Razorpay order identifier if available",
    )
    error_code: Optional[str] = Field(
        None,
        max_length=128,
        description="Gateway failure error code",
    )
    error_description: Optional[str] = Field(
        None,
        max_length=500,
        description="Customer-facing or gateway error description",
    )
    error_source: Optional[str] = Field(
        None,
        max_length=128,
        description="Source of the error (e.g. customer, gateway)",
    )
    error_step: Optional[str] = Field(
        None,
        max_length=128,
        description="Step at which payment failed",
    )
    error_reason: Optional[str] = Field(
        None,
        max_length=128,
        description="Specific reason code from payment provider",
    )

    @field_validator("consultation_code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("Consultation code cannot be empty.")
        return cleaned

