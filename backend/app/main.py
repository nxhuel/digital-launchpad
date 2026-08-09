import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.routers import auth, services, projects, messages, deliveries, payments, notifications, users, stats, cards, finances, card_catalog

# Ensure db directory exists (solo SQLite necesita un directorio local)
if settings.DATABASE_URL.startswith("sqlite"):
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

app = FastAPI(title="Clik Agencia Digital - API", version="1.0.0")

if not settings.RESEND_API_KEY and not os.getenv("TESTING"):
    import logging
    logging.getLogger("email").warning(
        "RESEND_API_KEY no está configurado: los nuevos registros no podrán enviar "
        "códigos de verificación (en desarrollo los códigos se loguean en consola)."
    )

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Seed default card categories (idempotente)
card_catalog.seed_default_categories()

# Routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(deliveries.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(users.admin_router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(cards.router, prefix="/api")
app.include_router(finances.router, prefix="/api")
app.include_router(card_catalog.router, prefix="/api")
app.include_router(card_catalog.public_router, prefix="/api")

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
