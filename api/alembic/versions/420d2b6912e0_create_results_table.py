"""create results table

Revision ID: 420d2b6912e0
Revises: 4f48dbe00285
Create Date: 2024-04-28 05:53:54.191377

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '420d2b6912e0'
down_revision: Union[str, None] = '4f48dbe00285'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# inference results table
# id int
# output jsonb


def upgrade() -> None:
    op.create_table(
        "results",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("output", sa.JSON, nullable=False),
    )    


def downgrade() -> None:
    op.drop_table("results")
