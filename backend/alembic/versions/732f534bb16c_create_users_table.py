"""create users table

Revision ID: 732f534bb16c
Revises: 
Create Date: 2024-04-01 03:23:42.341721

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '732f534bb16c'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String(255), nullable=False),
        # created_at with timezone
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column("deleted_at", sa.TIMESTAMP(timezone=True)),
    )


def downgrade():
    op.drop_table("users")
