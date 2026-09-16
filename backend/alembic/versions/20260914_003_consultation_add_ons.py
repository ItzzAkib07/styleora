"""Create consultation_add_ons table

Revision ID: 003_consultation_add_ons
Revises: 002_idempotency_notes
Create Date: 2026-09-14 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "003_consultation_add_ons"
down_revision: Union[str, None] = "002_idempotency_notes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consultation_add_ons",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("consultation_id", sa.Uuid(as_uuid=True), sa.ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("add_on_id", sa.String(length=64), nullable=False),
        sa.Column("price_inr", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("consultation_id", "add_on_id", name="uq_consultation_add_ons_consultation_add_on"),
    )
    op.create_index(
        "ix_consultation_add_ons_consultation_id",
        "consultation_add_ons",
        ["consultation_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_consultation_add_ons_consultation_id", table_name="consultation_add_ons")
    op.drop_table("consultation_add_ons")
