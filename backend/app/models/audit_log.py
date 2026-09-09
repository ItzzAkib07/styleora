import datetime
import enum
import uuid
from typing import Any, Dict, Optional
from sqlalchemy import DateTime, Enum, ForeignKey, Index, JSON, String, Uuid, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class AuditEvent(str, enum.Enum):
    CONSULTATION_CREATED = "CONSULTATION_CREATED"
    PAYMENT_ORDER_CREATED = "PAYMENT_ORDER_CREATED"
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    PAYMENT_VERIFIED = "PAYMENT_VERIFIED"
    PAYMENT_WEBHOOK_RECEIVED = "PAYMENT_WEBHOOK_RECEIVED"
    CONFIRMATION_EMAIL_SENT = "CONFIRMATION_EMAIL_SENT"
    ADMIN_EMAIL_SENT = "ADMIN_EMAIL_SENT"


class AuditActorType(str, enum.Enum):
    CUSTOMER = "customer"
    SYSTEM = "system"
    ADMIN = "admin"
    WEBHOOK = "webhook"


class AuditLog(Base):
    __tablename__ = "audit_logs"

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
    event: Mapped[AuditEvent] = mapped_column(
        Enum(AuditEvent, native_enum=False, length=64),
        nullable=False,
        index=True,
    )
    actor_type: Mapped[AuditActorType] = mapped_column(
        Enum(AuditActorType, native_enum=False, length=32),
        default=AuditActorType.SYSTEM,
        nullable=False,
    )
    actor_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    log_metadata: Mapped[Dict[str, Any]] = mapped_column(
        "metadata",
        JSON().with_variant(JSONB, "postgresql"),
        default=dict,
        nullable=False,
    )

    # Relationships
    consultation: Mapped["Consultation"] = relationship(
        "Consultation",
        back_populates="audit_logs",
    )

    __table_args__ = (
        Index("ix_audit_logs_consultation_event", "consultation_id", "event"),
    )
