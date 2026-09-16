"""Create webhook_events table and enforce payment uniqueness for consultation success

Revision ID: 005_webhook_events
Revises: 004_freeze_consultation_pricing
Create Date: 2026-09-16 14:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "005_webhook_events"
down_revision: Union[str, None] = "004_freeze_consultation_pricing"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create webhook_events table for persistent webhook idempotency
    op.create_table(
        "webhook_events",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("event_id", sa.String(length=128), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column(
            "payload",
            sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql"),
            nullable=False,
        ),
        sa.Column("processed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_webhook_events_id", "webhook_events", ["id"])
    op.create_index("ix_webhook_events_event_id", "webhook_events", ["event_id"], unique=True)
    op.create_index("ix_webhook_events_event_type", "webhook_events", ["event_type"])

    # 2. Enforce only one SUCCESS payment per consultation
    op.create_index(
        "uq_payments_consultation_success",
        "payments",
        ["consultation_id"],
        unique=True,
        postgresql_where=sa.text("status = 'SUCCESS'"),
    )


def downgrade() -> None:
    op.drop_index("uq_payments_consultation_success", table_name="payments")
    op.drop_index("ix_webhook_events_event_type", table_name="webhook_events")
    op.drop_index("ix_webhook_events_event_id", table_name="webhook_events")
    op.drop_index("ix_webhook_events_id", table_name="webhook_events")
    op.drop_table("webhook_events")
