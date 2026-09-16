import datetime
import re
import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.models.consultation import ConsultationStatus

# Authoritative Core Package Definition (Single Core Experience)
VALID_CORE_PACKAGES = {
    "styleora_signature_blueprint": {
        "id": "styleora_signature_blueprint",
        "name": "STYLEORA Signature Blueprint",
        "price": "₹2,799",
        "amount_inr": 2799,
        "amount_paise": 279900,
        "currency": "INR",
        "duration": "30-Minute Private Stylist Consultation + Personalised Blueprint",
    }
}

# Authoritative Optional Add-ons Configuration
VALID_ADD_ONS = {
    "wardrobe_edit": {
        "id": "wardrobe_edit",
        "name": "The Wardrobe Edit",
        "price": "₹1,499",
        "amount_inr": 1499,
        "amount_paise": 149900,
        "currency": "INR",
        "duration": "30-Minute Private Stylist Consultation",
    },
    "shopping_edit": {
        "id": "shopping_edit",
        "name": "The Shopping Edit",
        "price": "₹499",
        "amount_inr": 499,
        "amount_paise": 49900,
        "currency": "INR",
        "duration": "30-Minute Private Stylist Consultation",
    },
    "beauty_atelier": {
        "id": "beauty_atelier",
        "name": "The Beauty Atelier",
        "price": "₹1,499",
        "amount_inr": 1499,
        "amount_paise": 149900,
        "currency": "INR",
        "duration": "30-Minute Private Stylist Consultation",
    },
}

# Historical packages kept strictly for read-only compatibility with any historical records
HISTORICAL_PACKAGES = {
    "signature_silhouette": {
        "id": "signature_silhouette",
        "name": "Signature Silhouette Atelier (Legacy)",
        "price": "₹25,000",
        "amount_inr": 25000,
    },
    "couture_capsule": {
        "id": "couture_capsule",
        "name": "Bespoke Capsule Architecture (Legacy)",
        "price": "₹50,000",
        "amount_inr": 50000,
    },
}

# Backwards-compatibility alias
VALID_PACKAGES = VALID_CORE_PACKAGES

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^\+?[0-9\s\-()]{8,25}$")


class AddOnResponseData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    add_on_id: str
    name: str
    price: str
    amount_inr: int


class ConsultationCreate(BaseModel):
    customer_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name of the client",
        examples=["Lady Genevieve Sterling"],
    )
    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
        description="Client contact and dossier delivery email address",
        examples=["genevieve@sterling.luxury"],
    )
    phone: str = Field(
        ...,
        min_length=8,
        max_length=25,
        description="Direct contact number with optional country code",
        examples=["+91 98765 43210"],
    )
    address: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Client physical or residential address for styling context",
        examples=["Penthouse 4B, 18 Malabar Hill, Mumbai, MH 400006"],
    )
    package_id: str = Field(
        default="styleora_signature_blueprint",
        description="Selected STYLEORA consultation core package ID",
        examples=["styleora_signature_blueprint"],
    )
    selected_add_on_ids: List[str] = Field(
        default_factory=list,
        description="Optional list of selected add-on identifiers",
        examples=[["wardrobe_edit", "shopping_edit"]],
    )
    style_notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional personal style objectives or event context",
    )
    idempotency_key: Optional[str] = Field(
        None,
        max_length=64,
        description="Client-generated unique token to prevent duplicate submissions",
    )

    @field_validator("customer_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError("Customer name must be at least 2 characters long.")
        if any(char in cleaned for char in ["<", ">", "{", "}", ";", "\\"]):
            raise ValueError("Customer name contains invalid characters.")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Please provide a valid email address.")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip()
        if not PHONE_REGEX.match(cleaned):
            raise ValueError("Please provide a valid phone number with 8 to 20 digits.")
        return cleaned

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 5:
            raise ValueError("Address must be at least 5 characters long.")
        return cleaned

    @field_validator("package_id")
    @classmethod
    def validate_package_id(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned in HISTORICAL_PACKAGES:
            raise ValueError(
                f"Package '{cleaned}' is retired. STYLEORA now offers the unified 'styleora_signature_blueprint' experience."
            )
        if cleaned not in VALID_CORE_PACKAGES:
            valid_keys = ", ".join(VALID_CORE_PACKAGES.keys())
            raise ValueError(f"Invalid package selected. Available core package: {valid_keys}")
        return cleaned

    @field_validator("selected_add_on_ids")
    @classmethod
    def validate_add_ons(cls, v: List[str]) -> List[str]:
        if not v:
            return []
        cleaned_list = []
        for item in v:
            c = str(item).strip().lower()
            if c not in VALID_ADD_ONS:
                valid_keys = ", ".join(VALID_ADD_ONS.keys())
                raise ValueError(f"Invalid add-on '{item}' selected. Available add-ons: {valid_keys}")
            cleaned_list.append(c)
        if len(set(cleaned_list)) != len(cleaned_list):
            raise ValueError("Duplicate add-on selections are not permitted.")
        return cleaned_list


class ConsultationResponseData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    consultation_code: str
    customer_name: str
    email: str
    phone: str
    address: str
    package_id: str
    package_name: str
    package_price: str
    package_price_inr: int
    selected_add_ons: List[AddOnResponseData] = Field(default_factory=list)
    total_price_inr: int
    total_price_formatted: str
    style_notes: Optional[str] = None
    status: ConsultationStatus
    scheduled_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime


class ConsultationPublicLookupData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    consultation_code: str = Field(..., description="Official consultation reference code")
    package_id: str = Field(..., description="Consultation tier package identifier")
    package_name: str = Field(..., description="Editorial package name")
    package_price: str = Field(..., description="Core consultation price")
    selected_add_ons: List[str] = Field(default_factory=list, description="Names of selected add-ons")
    total_price_formatted: str = Field(..., description="Total authoritative reservation price")
    status: ConsultationStatus = Field(..., description="Current consultation lifecycle status")
    created_at: datetime.datetime = Field(..., description="Timestamp of consultation reservation")
