import datetime
import enum
import uuid
from typing import Optional
from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class PaymentStatus(str, enum.Enum):
    CREATED = "CREATED"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_PROCESSING = "PAYMENT_PROCESSING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    consultation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider: Mapped[str] = mapped_column(String(32), default="razorpay", nullable=False)
    provider_order_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    provider_payment_id: Mapped[Optional[str]] = mapped_column(String(128), unique=True, nullable=True, index=True)

    amount: Mapped[int] = mapped_column(BigInteger, nullable=False, comment="Amount in lowest denomination, e.g. paise")
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)

    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=32),
        default=PaymentStatus.CREATED,
        nullable=False,
        index=True,
    )
    payment_method: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    paid_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    consultation: Mapped["Consultation"] = relationship(
        "Consultation",
        back_populates="payments",
    )

    __table_args__ = (
        Index("ix_payments_provider_order", "provider", "provider_order_id"),
    )
