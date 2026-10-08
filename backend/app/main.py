import mimetypes
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import BASE_DIR, settings
from backend.app.core.database import engine, Base
from backend.app.routers import auth, services, projects, messages, deliveries, payments, notifications, users, stats, cards, finances, card_catalog, form_questions, orders, portfolio, monthly_expenses, card_deploy

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

# Seed default form questions (idempotente)
form_questions.seed_default_questions()

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
app.include_router(form_questions.router, prefix="/api")
app.include_router(form_questions.public_router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(orders.public_router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(portfolio.public_router, prefix="/api")
app.include_router(monthly_expenses.router, prefix="/api")
app.include_router(card_deploy.router, prefix="/api")
app.include_router(card_deploy.my_router, prefix="/api")
app.include_router(card_deploy.card_public_router, prefix="/api")
# Rutas públicas de tarjetas desplegadas: van ANTES del fallback SPA para que
# /tarjetas-digitales/<slug> sirva los archivos y no el index.html del panel.
# La página del catálogo (/tarjetas-digitales exacto) sigue cayendo al SPA.
app.include_router(card_deploy.serve_router)

# Asegura que las imágenes WebP (generadas por la optimización de uploads)
# se sirvan con su content-type correcto
mimetypes.add_type("image/webp", ".webp")

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}

# ------------------------------------------------------------------
# Frontend estático (imagen única backend + frontend)
# Si existe el build de Vite (frontend/dist), se sirve desde FastAPI
# con SPA fallback: rutas desconocidas -> index.html (routing client).
# En dev local (sin dist) o tests, esto simplemente no se activa.
# IMPORTANTE: este catch-all va SIEMPRE al final, después de todos los
# routers /api y de /api/health, para no interceptarlos.
# ------------------------------------------------------------------
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")
if os.path.isdir(FRONTEND_DIST) and not os.getenv("TESTING"):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        # No interceptar la API ni los uploads
        if full_path.split("/", 1)[0] in ("api", "uploads"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = os.path.join(FRONTEND_DIST, full_path)
        real = os.path.realpath(candidate)
        dist_root = os.path.realpath(FRONTEND_DIST)
        # Protección contra path traversal: el archivo debe estar dentro de dist
        if full_path and real.startswith(dist_root) and os.path.isfile(real):
            return FileResponse(real)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
