"""Enhance complaints schema with full CMS fields.

Revision ID: 001
Revises:
Create Date: 2026-05-31

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if "complaints" not in tables:
        op.create_table(
            "jurisdictions",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column(
                "level",
                sa.Enum("COUNTRY", "STATE", "DISTRICT", "LOCAL", name="jurisdictionlevel"),
                nullable=False,
            ),
            sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("contact_email", sa.String(), nullable=True),
            sa.Column("contact_phone", sa.String(), nullable=True),
            sa.Column("boundary", sa.Text(), nullable=True),
        )
        op.create_table(
            "roads",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("type", sa.String(), nullable=False),
            sa.Column("jurisdiction_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("geometry", sa.Text(), nullable=True),
            sa.Column("relay_date", sa.Date(), nullable=True),
            sa.Column("budget_sanctioned", sa.Numeric(12, 2), nullable=True),
            sa.Column("budget_spent", sa.Numeric(12, 2), nullable=True),
            sa.Column("source_url", sa.String(), nullable=True),
            sa.Column("contractor_name", sa.String(), nullable=True),
        )
        op.create_table(
            "complaints",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("complaint_number", sa.String(16), nullable=False, unique=True),
            sa.Column("title", sa.String(200), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("latitude", sa.Float(), nullable=False),
            sa.Column("longitude", sa.Float(), nullable=False),
            sa.Column("location", sa.Text(), nullable=True),
            sa.Column("image_path", sa.String(512), nullable=True),
            sa.Column(
                "severity",
                sa.Enum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="severitylevel"),
                nullable=False,
            ),
            sa.Column(
                "status",
                sa.Enum(
                    "PENDING", "UNDER_REVIEW", "ROUTED", "RESOLVED", name="complaintstatus"
                ),
                nullable=False,
            ),
            sa.Column("assigned_department", sa.String(255), nullable=True),
            sa.Column("authority_email", sa.String(255), nullable=True),
            sa.Column("escalation_contact", sa.String(255), nullable=True),
            sa.Column("district", sa.String(100), nullable=True),
            sa.Column("state", sa.String(100), nullable=True),
            sa.Column("country", sa.String(100), server_default="India"),
            sa.Column("road_type", sa.String(32), nullable=True),
            sa.Column("road_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("assigned_jurisdiction_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("issue_type", sa.String(100), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_complaints_complaint_number", "complaints", ["complaint_number"])
        return

    cols = {c["name"] for c in inspector.get_columns("complaints")}

    if "complaint_number" not in cols:
        op.add_column("complaints", sa.Column("complaint_number", sa.String(16), nullable=True))
        op.execute(
            """
            UPDATE complaints
            SET complaint_number = 'RW-' || UPPER(RIGHT(REPLACE(id::text, '-', ''), 4))
            WHERE complaint_number IS NULL
            """
        )
        op.alter_column("complaints", "complaint_number", nullable=False)
        op.create_index("ix_complaints_complaint_number", "complaints", ["complaint_number"], unique=True)

    for col_name, col_type in [
        ("title", sa.String(200)),
        ("description", sa.Text()),
        ("latitude", sa.Float()),
        ("longitude", sa.Float()),
        ("image_path", sa.String(512)),
        ("assigned_department", sa.String(255)),
        ("authority_email", sa.String(255)),
        ("escalation_contact", sa.String(255)),
        ("district", sa.String(100)),
        ("state", sa.String(100)),
        ("country", sa.String(100)),
        ("road_type", sa.String(32)),
        ("updated_at", sa.DateTime(timezone=True)),
    ]:
        if col_name not in cols:
            op.add_column("complaints", sa.Column(col_name, col_type, nullable=True))

    if "severity" not in cols:
        op.add_column(
            "complaints",
            sa.Column("severity", sa.String(20), server_default="Medium", nullable=True),
        )

    op.execute(
        """
        UPDATE complaints
        SET title = COALESCE(issue_type, 'Road issue'),
            description = issue_type,
            latitude = 16.5062,
            longitude = 80.6480
        WHERE title IS NULL
        """
    )


def downgrade() -> None:
    pass
