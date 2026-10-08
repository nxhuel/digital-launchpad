from pydantic_settings import BaseSettings
from typing import List
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Settings(BaseSettings):
    JWT_SECRET: str = "super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # Email (Resend)
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = ""  # ej: "Clik Agencia Digital <hola@clik.com.ar>" (dominio verificado en Resend)
    VERIFICATION_CODE_MINUTES: int = 10
    RESET_CODE_MINUTES: int = 15
    # PostgreSQL por defecto (dev local con docker-compose o Railway vía DATABASE_URL).
    # En tests se usa SQLite (sin necesidad de levantar Postgres).
    DATABASE_URL: str = (
        "sqlite:///./test_clik.db"
        if os.getenv("TESTING")
        else "postgresql://clik:clik@localhost:5432/clik"
    )
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:8000"
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    MAX_UPLOAD_SIZE: int = 25 * 1024 * 1024
    # Optimización de imágenes al subir (redimensionar + convertir a WebP)
    IMAGE_MAX_DIMENSION: int = 1600  # px, lado más largo de la imagen optimizada
    IMAGE_QUALITY: int = 80  # calidad WebP (1-100)
    # Offset horario para fechas del libro de finanzas (Argentina UTC-3)
    TIMEZONE_OFFSET_HOURS: int = -3
    # Cloudinary (fotos de invitados en tarjetas dinámicas; vacío = desactivado)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = {"env_file": os.path.join(BASE_DIR, ".env"), "env_file_encoding": "utf-8"}


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Ensure db directory exists (solo SQLite necesita un directorio local)
if settings.DATABASE_URL.startswith("sqlite"):
    _db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    _db_dir = os.path.dirname(_db_path)
    if _db_dir:
        os.makedirs(_db_dir, exist_ok=True)
