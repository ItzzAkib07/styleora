import datetime
import enum
import uuid
from typing import List, Optional
from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class ConsultationStatus(str, enum.Enum):
    # Standard Lifecycle
    CREATED = "CREATED"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_PROCESSING = "PAYMENT_PROCESSING"
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
    ADMIN_CONTACT_PENDING = "ADMIN_CONTACT_PENDING"
    SLOTS_SHARED = "SLOTS_SHARED"
    SLOT_SELECTED = "SLOT_SELECTED"
    CALENDAR_BOOKED = "CALENDAR_BOOKED"
    MEET_LINK_CREATED = "MEET_LINK_CREATED"
    CONSULTATION_SCHEDULED = "CONSULTATION_SCHEDULED"
    CONSULTATION_COMPLETED = "CONSULTATION_COMPLETED"

    # Exceptional States
    PAYMENT_FAILED = "PAYMENT_FAILED"
    PAYMENT_EXPIRED = "PAYMENT_EXPIRED"
    REFUND_PENDING = "REFUND_PENDING"
    REFUNDED = "REFUNDED"
    CLIENT_CANCELLED = "CLIENT_CANCELLED"
    NO_SHOW = "NO_SHOW"


class Consultation(Base, TimestampMixin):
    __tablename__ = "consultations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    consultation_code: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
        index=True,
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    package_id: Mapped[str] = mapped_column(String(64), nullable=False)
    package_price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    total_price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    style_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    idempotency_key: Mapped[Optional[str]] = mapped_column(
        String(64),
        unique=True,
        nullable=True,
        index=True,
    )

    status: Mapped[ConsultationStatus] = mapped_column(
        Enum(ConsultationStatus, native_enum=False, length=32),
        default=ConsultationStatus.CREATED,
        nullable=False,
        index=True,
    )

    scheduled_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="consultation",
        cascade="all, delete-orphan",
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="consultation",
        cascade="all, delete-orphan",
    )
    add_ons: Mapped[List["ConsultationAddOn"]] = relationship(
        "ConsultationAddOn",
        back_populates="consultation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_consultations_email_status", "email", "status"),
    )


class ConsultationAddOn(Base):
    __tablename__ = "consultation_add_ons"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    consultation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    add_on_id: Mapped[str] = mapped_column(String(64), nullable=False)
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    consultation: Mapped["Consultation"] = relationship(
        "Consultation",
        back_populates="add_ons",
    )

    __table_args__ = (
        UniqueConstraint("consultation_id", "add_on_id", name="uq_consultation_add_ons_consultation_add_on"),
    )
