"""Add users, refresh tokens, officer zones, complaint reporter_id.

Revision ID: 002
Revises: 001
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if "users" not in tables:
        op.create_table(
            "users",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("email", sa.String(255), nullable=False, unique=True),
            sa.Column("hashed_password", sa.String(255), nullable=False),
            sa.Column("full_name", sa.String(200), nullable=False),
            sa.Column(
                "role",
                sa.Enum(
                    "Citizen",
                    "Road Authority Officer",
                    "Admin",
                    name="userrole",
                ),
                nullable=False,
            ),
            sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_users_email", "users", ["email"])

    if "refresh_tokens" not in tables:
        op.create_table(
            "refresh_tokens",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
            sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("revoked", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if "officer_zones" not in tables:
        op.create_table(
            "officer_zones",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("officer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
            sa.Column("district", sa.String(100), nullable=False),
            sa.Column("state", sa.String(100), nullable=False),
            sa.Column("road_types", sa.String(255), nullable=True),
        )

    if "complaints" in tables:
        cols = {c["name"] for c in inspector.get_columns("complaints")}
        if "reporter_id" not in cols:
            op.add_column(
                "complaints",
                sa.Column("reporter_id", postgresql.UUID(as_uuid=True), nullable=True),
            )
            op.create_foreign_key(
                "fk_complaints_reporter_id",
                "complaints",
                "users",
                ["reporter_id"],
                ["id"],
            )
            op.create_index("ix_complaints_reporter_id", "complaints", ["reporter_id"])


def downgrade() -> None:
    pass
