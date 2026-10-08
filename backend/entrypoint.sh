#!/bin/sh
set -e

# Directorio raíz del proyecto: el padre de donde vive este script (backend/)
cd "$(dirname "$0")/.."

python << 'PYEOF'
import os

# Ensure upload dir exists
from backend.app.core.config import settings
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

print(f"DB URL: {settings.DATABASE_URL}")

# Create tables
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.models.models import User, Service, Project, Message, Attachment, DeliveryRecord, Payment, Notification, FinanceEntry, DigitalCard, CardMessage, CardCategory, CardDesign, AuthCode, FormQuestion, PortfolioItem, MonthlyExpense, DeployedCard, CardSubmission
Base.metadata.create_all(bind=engine)
print("Tables created")

# Migraciones idempotentes (PostgreSQL-safe). En base nueva create_all ya genera todo;
# esto protege contra esquemas viejos.
from sqlalchemy import text
MIGRATIONS = [
    ("delivery_records", "updated_at", "TIMESTAMP"),
    ("finance_entries", "source_payment_id", "INTEGER"),
    ("users", "email_verified", "BOOLEAN NOT NULL DEFAULT TRUE"),
    ("users", "token_version", "INTEGER NOT NULL DEFAULT 0"),
    ("card_designs", "discount_label", "VARCHAR(100)"),
    ("projects", "deposit_percentage", "INTEGER"),
    ("deployed_cards", "client_id", "INTEGER"),
    ("deployed_cards", "config", "JSON"),
    ("deployed_cards", "submissions_open", "BOOLEAN NOT NULL DEFAULT TRUE"),
]
# Portfolio items se crea via create_all; si falta la tabla, la crea automáticamente.
with engine.begin() as conn:
    for table, column, definition in MIGRATIONS:
        try:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {definition}"))
            print(f"Migration: ensured {column} on {table}")
        except Exception as e:
            print(f"Migration note ({table}.{column}): {e}")
    # Add 'deposit' to paymentkind enum if missing
    try:
        conn.execute(text("ALTER TYPE paymentkind ADD VALUE IF NOT EXISTS 'deposit'"))
        print("Migration: added deposit to paymentkind enum")
    except Exception as e:
        print(f"Migration note (paymentkind deposit): {e}")

# Verify tables
with engine.connect() as conn:
    tables = [r[0] for r in conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'")).fetchall()]
    print("Tables in db:", tables)

# Check seed
db = SessionLocal()
exists = db.query(User).filter(User.email == 'nahueltisera03@gmail.com').first()
db.close()
if not exists:
    import subprocess
    subprocess.run(['python', '-m', 'backend.seed'], check=True)
    print('Seed data created')
else:
    print('Seed data already exists')
PYEOF

# Escucha en el puerto que configure el host (SeNode/Railway) o 8000 por defecto
exec uvicorn backend.app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
