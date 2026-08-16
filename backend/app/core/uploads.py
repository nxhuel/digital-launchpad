"""Helpers compartidos para subir archivos (attachments de mensajes, entregas, comprobantes y tarjetas)."""
import io
import os
import uuid

from fastapi import HTTPException, UploadFile, status

from backend.app.core.config import settings
from backend.app.models.models import Attachment

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".mp4", ".mp3", ".wav", ".ogg"}


def _detect_mime(content: bytes) -> str | None:
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "image/webp"
    if content.startswith(b"%PDF"):
        return "application/pdf"
    if content.startswith(b"\x00\x00\x00\x1cftyp"):
        return "video/mp4"
    if content.startswith(b"ID3") or content.startswith(b"\xff\xfb"):
        return "audio/mpeg"
    if content.startswith(b"RIFF") and content[8:12] == b"WAVE":
        return "audio/wav"
    if content.startswith(b"OggS"):
        return "audio/ogg"
    return None


def _optimize_image(content: bytes, mime: str) -> tuple[bytes, str] | None:
    """Redimensiona y comprime una imagen real a WebP.

    Devuelve (bytes_optimizados, nuevo_mime) o None si la imagen no se puede
    decodificar (en ese caso el llamador guarda el archivo original tal cual).
    """
    try:
        from PIL import Image, ImageOps

        img = Image.open(io.BytesIO(content))
        img.load()
        # Respeta la orientación EXIF de las fotos de celular
        img = ImageOps.exif_transpose(img)
        # Asegura modo RGB/RGBA (evita errores con modos exóticos como P/CMYK)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if img.mode in ("P", "LA") and "transparency" in img.info else "RGB")
        # Redimensiona si supera el lado máximo
        if max(img.size) > settings.IMAGE_MAX_DIMENSION:
            img.thumbnail((settings.IMAGE_MAX_DIMENSION, settings.IMAGE_MAX_DIMENSION), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=settings.IMAGE_QUALITY, method=4)
        optimized = buf.getvalue()
        # Solo usa la versión optimizada si realmente pesa menos
        if len(optimized) < len(content):
            return optimized, "image/webp"
        return None
    except Exception:
        # Imagen corrupta o formato no soportado por Pillow → se guarda el original
        return None


def save_upload(file: UploadFile, uploaded_by: int) -> Attachment:
    content = file.file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Archivo muy grande (máx {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB)",
        )
    ext = os.path.splitext(file.filename or "file")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Extensión no permitida: {ext}")
    detected = _detect_mime(content)
    if detected is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipo de archivo no válido (magic bytes)")

    # Optimización automática de imágenes: pesan mucho menos (WebP + redimensionado)
    stored_ext = ext
    if detected.startswith("image/"):
        result = _optimize_image(content, detected)
        if result is not None:
            content, detected = result
            stored_ext = ".webp"

    stored_name = f"{uuid.uuid4().hex}{stored_ext}"
    path = os.path.join(settings.UPLOAD_DIR, stored_name)
    with open(path, "wb") as f:
        f.write(content)
    return Attachment(
        filename=file.filename or stored_name,
        mime=detected,
        size=len(content),
        url=f"/uploads/{stored_name}",
        uploaded_by=uploaded_by,
    )
