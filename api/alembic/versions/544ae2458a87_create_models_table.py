"""create models table

Revision ID: 544ae2458a87
Revises: 732f534bb16c
Create Date: 2024-04-27 04:02:29.328593

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '544ae2458a87'
down_revision: Union[str, None] = '732f534bb16c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# table models
# id int
# name
# description
# properties jsonb 
# type varchar(50)

def upgrade() -> None:
    op.create_table(
        "models",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.String(255), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("properties", sa.JSON, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("models")
