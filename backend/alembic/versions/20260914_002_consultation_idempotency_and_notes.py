"""Add style_notes and idempotency_key to consultations

Revision ID: 002_idempotency_notes
Revises: 001_initial_schema
Create Date: 2026-09-14 02:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "002_idempotency_notes"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add style_notes to persist client styling objectives and wardrobe goals
    op.add_column("consultations", sa.Column("style_notes", sa.Text(), nullable=True))

    # 2. Add idempotency_key for deterministic, database-backed idempotency protection
    op.add_column("consultations", sa.Column("idempotency_key", sa.String(length=64), nullable=True))
    op.create_index(
        "ix_consultations_idempotency_key",
        "consultations",
        ["idempotency_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_consultations_idempotency_key", table_name="consultations")
    op.drop_column("consultations", "idempotency_key")
    op.drop_column("consultations", "style_notes")
