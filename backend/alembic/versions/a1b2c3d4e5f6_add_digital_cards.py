"""add digital cards

Revision ID: a1b2c3d4e5f6
Revises: 9a44d43b6769
Create Date: 2026-08-05

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '9a44d43b6769'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new notification kinds to the existing enum (SQLite doesn't enforce enums natively so this is fine)

    # Create digital_cards table
    op.create_table(
        'digital_cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False, server_default='otro'),
        sa.Column('event_date', sa.String(50), nullable=True),
        sa.Column('chosen_design', sa.String(255), nullable=True),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('status', sa.String(50), nullable=False, server_default='pendiente'),
        sa.Column('admin_price', sa.Integer(), nullable=True),
        sa.Column('link_entrega', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_digital_cards_id', 'digital_cards', ['id'])
    op.create_index('ix_digital_cards_client_id', 'digital_cards', ['client_id'])
    op.create_index('ix_digital_cards_status', 'digital_cards', ['status'])

    # Create card_messages table
    op.create_table(
        'card_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('card_id', sa.Integer(), sa.ForeignKey('digital_cards.id'), nullable=False),
        sa.Column('sender_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_card_messages_id', 'card_messages', ['id'])
    op.create_index('ix_card_messages_card_id', 'card_messages', ['card_id'])


def downgrade() -> None:
    op.drop_table('card_messages')
    op.drop_table('digital_cards')
