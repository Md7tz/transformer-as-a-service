"""create prompts table

Revision ID: 4f48dbe00285
Revises: 544ae2458a87
Create Date: 2024-04-27 04:08:37.365873

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f48dbe00285'
down_revision: Union[str, None] = '544ae2458a87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Create prompts table
# id int
# user_id BigInteger
# model_id BigInteger
# input text
# analysis_type varchar(50)
# created_at TIMESTAMP
# deleted_at TIMESTAMP


def upgrade() -> None:
    op.create_table(
        "prompts",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.BigInteger, nullable=False),
        sa.Column("model_id", sa.BigInteger, nullable=False),
        sa.Column("result_id", sa.BigInteger, nullable=False),
        sa.Column("input", sa.Text, nullable=False),
        sa.Column("analysis_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.TIMESTAMP(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("prompts")
