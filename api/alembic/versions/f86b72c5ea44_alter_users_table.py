"""alter users table

Revision ID: f86b72c5ea44
Revises: d30132832894
Create Date: 2024-05-23 05:32:58.183505

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f86b72c5ea44'
down_revision: Union[str, None] = 'd30132832894'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# alter users table add role_id column
def upgrade() -> None:
    op.add_column("users", sa.Column("role_id", sa.BigInteger, sa.ForeignKey("roles.id"), nullable=False))


def downgrade() -> None:
    op.drop_column("users", "role_id")
