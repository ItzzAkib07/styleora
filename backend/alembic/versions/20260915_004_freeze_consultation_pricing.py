"""Freeze consultation pricing with package_price_inr and total_price_inr

Revision ID: 004_freeze_consultation_pricing
Revises: 003_consultation_add_ons
Create Date: 2026-09-15 02:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "004_freeze_consultation_pricing"
down_revision: Union[str, None] = "003_consultation_add_ons"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns as nullable first
    op.add_column("consultations", sa.Column("package_price_inr", sa.Integer(), nullable=True))
    op.add_column("consultations", sa.Column("total_price_inr", sa.Integer(), nullable=True))

    # 2. Backfill existing historical records safely based on authoritative registry
    op.execute(
        sa.text(
            """
            UPDATE consultations
            SET package_price_inr = CASE
                WHEN package_id = 'signature_silhouette' THEN 25000
                WHEN package_id = 'couture_capsule' THEN 50000
                WHEN package_id = 'styleora_signature_blueprint' THEN 2799
                ELSE 2799
            END
            """
        )
    )

    op.execute(
        sa.text(
            """
            UPDATE consultations
            SET total_price_inr = package_price_inr + COALESCE(
                (SELECT SUM(price_inr) FROM consultation_add_ons WHERE consultation_add_ons.consultation_id = consultations.id),
                0
            )
            """
        )
    )

    # 3. Enforce NOT NULL using batch_alter_table for cross-database compatibility
    with op.batch_alter_table("consultations") as batch_op:
        batch_op.alter_column("package_price_inr", nullable=False, existing_type=sa.Integer())
        batch_op.alter_column("total_price_inr", nullable=False, existing_type=sa.Integer())


def downgrade() -> None:
    with op.batch_alter_table("consultations") as batch_op:
        batch_op.drop_column("total_price_inr")
        batch_op.drop_column("package_price_inr")
