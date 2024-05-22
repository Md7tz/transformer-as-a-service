"""create roles table

Revision ID: d30132832894
Revises: 420d2b6912e0
Create Date: 2024-05-23 05:28:39.530195

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd30132832894'
down_revision: Union[str, None] = '420d2b6912e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("type", sa.String(50), nullable=False, default="user"),
    )


def downgrade() -> None:
    op.drop_table("roles")
