"""Despliegue de tarjetas digitales estáticas vía .ZIP.

Flujo: el admin sube un .ZIP con index.html (+ styles.css, script.js, assets/)
desde el panel ("Subir ZIP"). Se descomprime en <DEPLOY_DIR>/<slug>/ y queda
disponible en /tarjetas-digitales/<slug> sin tocar código ni redeployar.

ABM completo: alta (upload), listado, edición de título, renombre del slug
(cambia la URL), re-subida del ZIP y baja (borra DB + carpeta del disco).
"""
import csv
import io
import logging
import mimetypes
import os
import re
import shutil
import tempfile
import time
import unicodedata
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import cloudinary
import cloudinary.uploader
import cloudinary.utils
import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse, RedirectResponse, StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from PIL import Image
from sqlalchemy.orm import Session

from backend.app.core.config import BASE_DIR, settings
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_admin
from backend.app.models.models import (
    CardSubmission,
    DeployedCard,
    Notification,
    NotificationKind,
    User,
)
from backend.app.schemas.schemas import (
    CARD_FEATURES,
    LEGACY_CARD_FEATURES,
    SUBMISSION_KINDS,
    DeployedCardDetailOut,
    DeployedCardOut,
    DeployedCardOwnerUpdate,
    DeployedCardConfigUpdate,
    DeployedCardRename,
    DeployedCardUpdate,
    FeatureDetectionOut,
    PublicCardConfig,
    SubmissionIn,
    SubmissionOut,
    SubmissionResult,
)

router = APIRouter(prefix="/admin/deployed-cards", tags=["admin deployed cards"])
serve_router = APIRouter(tags=["deployed cards"])
card_public_router = APIRouter(prefix="/public", tags=["public"])
my_router = APIRouter(prefix="/my-cards", tags=["my cards"])

# Se puede sobreescribir con la variable de entorno DEPLOY_DIR (útil en tests).
DEPLOY_DIR = os.getenv("DEPLOY_DIR", os.path.join(BASE_DIR, "deployed_cards"))
os.makedirs(DEPLOY_DIR, exist_ok=True)

MAX_ZIP_SIZE = 50 * 1024 * 1024  # 50 MB por ZIP
MAX_FILES = 1000  # archivos por ZIP
MAX_TOTAL_UNCOMPRESSED = 200 * 1024 * 1024  # 200 MB anti zip-bomb
MAX_PHOTO_SIZE = 10 * 1024 * 1024  # 10 MB por foto de invitado
PHOTO_ZIP_MAX_FILES = 500
PHOTO_ZIP_MAX_BYTES = 300 * 1024 * 1024
SLUG_RE = re.compile(r"^[a-z0-9-]{1,100}$")
JUNK_NAMES = {"__MACOSX", ".DS_Store", "Thumbs.db", "desktop.ini"}


def _slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:100] or "tarjeta"


def suggest_slug(filename: str) -> str:
    """Slug por defecto a partir del nombre del ZIP (ej: cliente123.zip -> cliente123)."""
    base = os.path.basename(filename or "")
    if base.lower().endswith(".zip"):
        base = base[:-4]
    return _slugify(base)


def _validate_slug_or_400(slug: str) -> str:
    slug = (slug or "").strip().lower()
    if not SLUG_RE.match(slug):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Slug inválido: solo minúsculas, números y guiones (1-100 caracteres)",
        )
    return slug


def _is_junk(name: str) -> bool:
    parts = name.split("/")
    return any(p in JUNK_NAMES or p == "__MACOSX" for p in parts)


def _validate_zip(content: bytes) -> List[zipfile.ZipInfo]:
    """Valida el ZIP y devuelve los miembros útiles. Lanza 422 si no es válido."""
    try:
        zf = zipfile.ZipFile(io.BytesIO(content))
    except zipfile.BadZipFile:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo no es un ZIP válido",
        )
    with zf:
        infos = zf.infolist()
        if len(infos) > MAX_FILES + 50:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"El ZIP tiene demasiados archivos (máximo {MAX_FILES})",
            )
        clean: List[zipfile.ZipInfo] = []
        total = 0
        for info in infos:
            name = info.filename
            if not name or name.endswith("/"):
                continue
            if _is_junk(name):
                continue
            # Anti zip-slip: sin rutas absolutas ni ".."
            if name.startswith("/") or ".." in name.split("/"):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"El ZIP contiene una ruta no permitida: {name}",
                )
            # Sin symlinks
            if (info.external_attr >> 16) & 0o170000 == 0o120000:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"El ZIP contiene un enlace simbólico no permitido: {name}",
                )
            total += info.file_size
            if total > MAX_TOTAL_UNCOMPRESSED:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="El contenido descomprimido supera el máximo permitido (200 MB)",
                )
            clean.append(info)
        names = [i.filename for i in clean]
        if "index.html" not in names:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El ZIP debe contener index.html en la raíz",
            )
        return clean


# ─── Detección automática de secciones ───────────────────────────────────────
# Solo se inspeccionan archivos de texto del ZIP (HTML/JS/CSS). El contrato de
# las tarjetas es explícito, así que buscamos los literales que realmente usa
# la tarjeta para llamar a la API. No se ejecuta nada del ZIP.
DETECT_TEXT_EXTENSIONS = {".html", ".htm", ".js", ".mjs", ".css"}
DETECT_MAX_FILE_BYTES = 2 * 1024 * 1024
DETECT_MAX_TOTAL_BYTES = 6 * 1024 * 1024

_KIND_VALUE = r"['\"`]\s*{}\s*['\"`]"
_FEATURE_PATTERNS: Dict[str, List[re.Pattern]] = {
    "rsvp": [re.compile(r"['\"]?kind['\"]?\s*[:=]\s*" + _KIND_VALUE.format("rsvp"), re.I)],
    "canciones": [re.compile(r"['\"]?kind['\"]?\s*[:=]\s*" + _KIND_VALUE.format("cancion"), re.I)],
    "mensajes": [re.compile(r"['\"]?kind['\"]?\s*[:=]\s*" + _KIND_VALUE.format("mensaje"), re.I)],
    "album": [re.compile(r"/fotos\b", re.I)],
    "menu": [re.compile(r"\bmenu_options\b|\bmenuOptions\b", re.I)],
}


def _detect_features_from_files(files: Dict[str, str]) -> Tuple[List[str], Dict[str, List[str]]]:
    """Devuelve las secciones detectadas y en qué archivos se encontraron."""
    sources: Dict[str, List[str]] = {}
    for feature, patterns in _FEATURE_PATTERNS.items():
        hits = [
            filename
            for filename, text in files.items()
            if any(pattern.search(text) for pattern in patterns)
        ]
        if hits:
            sources[feature] = sorted(hits)
    features = [feature for feature in CARD_FEATURES if feature in sources]
    return features, sources


def _zip_text_files(content: bytes) -> Dict[str, str]:
    """Lee los archivos de texto relevantes del ZIP, sin extraerlo a disco."""
    files: Dict[str, str] = {}
    total = 0
    infos = _validate_zip(content)
    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        for info in infos:
            ext = os.path.splitext(info.filename)[1].lower()
            if ext not in DETECT_TEXT_EXTENSIONS:
                continue
            if info.file_size > DETECT_MAX_FILE_BYTES:
                continue
            total += info.file_size
            if total > DETECT_MAX_TOTAL_BYTES:
                break
            try:
                raw = zf.read(info.filename)
            except (KeyError, OSError):
                continue
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                text = raw.decode("latin-1", errors="ignore")
            if text:
                files[info.filename] = text
    return files


def _detect_features_from_zip(content: bytes) -> Tuple[List[str], Dict[str, List[str]]]:
    return _detect_features_from_files(_zip_text_files(content))


def _extract_to_slug(content: bytes, slug: str) -> None:
    """Descomprime el ZIP (ya validado) en DEPLOY_DIR/<slug> de forma atómica."""
    target = os.path.join(DEPLOY_DIR, slug)
    tmp = tempfile.mkdtemp(prefix=f".{slug}-", dir=DEPLOY_DIR)
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as zf:
            for info in _validate_zip(content):
                zf.extract(info, tmp)
        # Reemplazo atómico: la URL nunca queda a medio escribir
        if os.path.isdir(target):
            shutil.rmtree(target)
        os.replace(tmp, target)
    except Exception:
        shutil.rmtree(tmp, ignore_errors=True)
        raise


def _dir_size(path: str) -> int:
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total


def _to_out(card: DeployedCard) -> DeployedCardOut:
    out = DeployedCardOut.model_validate(card)
    out.url = f"/tarjetas-digitales/{card.slug}"
    out.size_bytes = _dir_size(os.path.join(DEPLOY_DIR, card.slug))
    return out


def _clean_features(raw: Any) -> List[str]:
    """Normaliza las secciones habilitadas a claves conocidas, sin repetidos."""
    if not isinstance(raw, (list, tuple)):
        return []
    cleaned: List[str] = []
    for item in raw:
        key = str(item).strip().lower()
        if key in CARD_FEATURES and key not in cleaned:
            cleaned.append(key)
    return cleaned


def _features(card: DeployedCard) -> List[str]:
    cfg = card.config if isinstance(card.config, dict) else {}
    # Tarjetas viejas (sin features) mantienen las secciones que existían
    # cuando se subieron: no se les activan canciones/mensajes por sorpresa.
    if "features" not in cfg:
        return list(LEGACY_CARD_FEATURES)
    return _clean_features(cfg.get("features"))


def _menu_options(card: DeployedCard) -> List[str]:
    cfg = card.config if isinstance(card.config, dict) else {}
    opts = cfg.get("menu_options", [])
    return [o for o in opts if isinstance(o, str)][:30]


def _to_detail(card: DeployedCard, db: Session) -> DeployedCardDetailOut:
    out = DeployedCardDetailOut.model_validate(_to_out(card))
    out.client_id = card.client_id
    out.submissions_open = card.submissions_open
    out.menu_options = _menu_options(card)
    out.features = _features(card)
    out.responses_count = db.query(CardSubmission).filter(CardSubmission.card_id == card.id).count()
    if card.client_id:
        owner = db.query(User).filter(User.id == card.client_id).first()
        out.client_name = owner.name if owner else None
    return out


def _get_or_404(db: Session, card_id: int) -> DeployedCard:
    card = db.query(DeployedCard).filter(DeployedCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    return card


# ─── ABM (admin) ─────────────────────────────────────────────────────────────
@router.post("/upload", response_model=DeployedCardDetailOut, status_code=status.HTTP_201_CREATED)
async def upload_card(
    file: UploadFile = File(...),
    slug: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    filename = file.filename or ""
    if not filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo debe ser un .ZIP",
        )
    content = await file.read()
    if len(content) > MAX_ZIP_SIZE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El ZIP supera el máximo permitido (50 MB)",
        )
    # El slug principal sale del nombre del ZIP; se puede editar después.
    final_slug = _validate_slug_or_400(slug or suggest_slug(filename))
    if db.query(DeployedCard).filter(DeployedCard.slug == final_slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una tarjeta desplegada con el slug '{final_slug}'",
        )
    _validate_zip(content)
    _extract_to_slug(content, final_slug)

    card = DeployedCard(
        slug=final_slug,
        title=(title or "").strip() or final_slug,
        source_filename=os.path.basename(filename),
        deployed_by=current_user.id,
    )
    # Secciones tildadas en el checklist. Si no se envía el campo se asumen
    # todas (compatibilidad); una cadena vacía significa "ninguna".
    selected = list(CARD_FEATURES) if features is None else _clean_features(features.split(","))
    card.config = {"features": selected}
    db.add(card)
    db.commit()
    db.refresh(card)
    return _to_detail(card, db)


@router.post("/detect-features", response_model=FeatureDetectionOut)
async def detect_features(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
):
    """Detecta las secciones que implementa un ZIP antes de publicarlo.

    Se usa desde el checklist del panel para tildar automáticamente las
    secciones. No modifica nada ni extrae archivos: solo lee el ZIP.
    """
    filename = file.filename or ""
    if not filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo debe ser un .ZIP",
        )
    content = await file.read()
    if len(content) > MAX_ZIP_SIZE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El ZIP supera el máximo permitido (50 MB)",
        )
    features, sources = _detect_features_from_zip(content)
    return FeatureDetectionOut(features=features, sources=sources)


@router.get("", response_model=List[DeployedCardDetailOut])
def list_cards(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    cards = db.query(DeployedCard).order_by(DeployedCard.created_at.desc()).all()
    return [_to_detail(c, db) for c in cards]


@router.patch("/{card_id}", response_model=DeployedCardDetailOut)
def update_card(
    card_id: int,
    body: DeployedCardUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    card.title = body.title.strip()
    db.commit()
    db.refresh(card)
    return _to_detail(card, db)


@router.post("/{card_id}/rename", response_model=DeployedCardDetailOut)
def rename_card(
    card_id: int,
    body: DeployedCardRename,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    new_slug = _validate_slug_or_400(body.slug)
    if new_slug == card.slug:
        return _to_detail(card, db)
    if db.query(DeployedCard).filter(DeployedCard.slug == new_slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una tarjeta desplegada con el slug '{new_slug}'",
        )
    old_dir = os.path.join(DEPLOY_DIR, card.slug)
    new_dir = os.path.join(DEPLOY_DIR, new_slug)
    if os.path.isdir(old_dir):
        os.rename(old_dir, new_dir)
    card.slug = new_slug
    db.commit()
    db.refresh(card)
    return _to_detail(card, db)


@router.post("/{card_id}/redeploy", response_model=DeployedCardDetailOut)
async def redeploy_card(
    card_id: int,
    file: UploadFile = File(...),
    features: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    filename = file.filename or ""
    if not filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo debe ser un .ZIP",
        )
    content = await file.read()
    if len(content) > MAX_ZIP_SIZE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El ZIP supera el máximo permitido (50 MB)",
        )
    _validate_zip(content)
    _extract_to_slug(content, card.slug)
    card.source_filename = os.path.basename(filename)
    # El panel manda las secciones detectadas en el ZIP nuevo. Si un cliente
    # de la API no manda `features`, se mantienen las que ya tenía la tarjeta.
    if features is not None:
        cfg = card.config if isinstance(card.config, dict) else {}
        card.config = {**cfg, "features": _clean_features(features.split(","))}
    db.commit()
    db.refresh(card)
    return _to_detail(card, db)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    # Borra también las fotos de Cloudinary (best effort) para no dejar basura
    fotos = (
        db.query(CardSubmission)
        .filter(CardSubmission.card_id == card_id, CardSubmission.kind == "foto")
        .all()
    )
    for sub in fotos:
        _destroy_photo(sub)
    shutil.rmtree(os.path.join(DEPLOY_DIR, card.slug), ignore_errors=True)
    db.delete(card)
    db.commit()
    return None


# ─── Servidor público de tarjetas ────────────────────────────────────────────
@serve_router.get("/tarjetas-digitales/{slug}")
def serve_deployed_card_root(slug: str):
    # Sin trailing slash el navegador resuelve las referencias relativas
    # (styles.css, assets/...) contra /tarjetas-digitales/ en vez de la
    # carpeta de la tarjeta. Se redirige a la URL canónica con slash final.
    return RedirectResponse(url=f"/tarjetas-digitales/{slug}/", status_code=307)


@serve_router.get("/tarjetas-digitales/{slug}/{file_path:path}")
def serve_deployed_card(slug: str, file_path: str = ""):
    deploy_root = os.path.realpath(DEPLOY_DIR)
    base = os.path.realpath(os.path.join(DEPLOY_DIR, slug))
    # El slug debe quedar dentro de DEPLOY_DIR (anti traversal en el slug)
    if base != deploy_root and not base.startswith(deploy_root + os.sep):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    if not os.path.isdir(base):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")

    target = os.path.join(base, file_path) if file_path else base
    real = os.path.realpath(target)
    if real != base and not real.startswith(base + os.sep):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado")
    if os.path.isdir(real):
        real = os.path.join(real, "index.html")
    if not os.path.isfile(real):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrado")

    media_type, _ = mimetypes.guess_type(real)
    return FileResponse(real, media_type=media_type or "application/octet-stream")


# ─── API pública de tarjetas dinámicas ───────────────────────────────────────
# Sin auth (la usan los invitados desde la tarjeta). Con rate-limit por IP.
_submit_attempts: Dict[str, list] = defaultdict(list)
SUBMIT_WINDOW = 60
SUBMIT_LIMIT = 20
MAX_PAYLOAD_BYTES = 32 * 1024


def _submit_rate_limit(key: str):
    now = time.time()
    _submit_attempts[key] = [t for t in _submit_attempts[key] if now - t < SUBMIT_WINDOW]
    if len(_submit_attempts[key]) >= SUBMIT_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos. Intenta de nuevo en 1 minuto.",
        )
    _submit_attempts[key].append(now)


def _get_card_or_404(db: Session, slug: str) -> DeployedCard:
    card = db.query(DeployedCard).filter(DeployedCard.slug == slug).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    return card


_MISSING = object()
MAX_NESTED_ITEMS = 30
MAX_NESTED_KEYS = 20


def _clean_scalar(value: Any) -> Any:
    """Normaliza un valor escalar de un payload. Devuelve _MISSING si no sirve."""
    if isinstance(value, str):
        return value.strip()[:2000]
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return _MISSING


def _clean_companion(item: Any) -> Optional[Dict[str, Any]]:
    """Limpia un acompañante/subinvitado: objeto plano con valores escalares."""
    if not isinstance(item, dict):
        return None
    clean: Dict[str, Any] = {}
    for k, v in list(item.items())[:MAX_NESTED_KEYS]:
        if not isinstance(k, str) or not k or len(k) > 100:
            continue
        cleaned = _clean_scalar(v)
        if cleaned is not _MISSING:
            clean[k] = cleaned
    return clean or None


def _clean_payload(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Limpia el payload libre de una respuesta.

    Acepta escalares y listas de objetos planos para poder guardar el grupo
    familiar: el invitado principal + sus acompañantes/subinvitados, cada uno
    con su propio `asisten`, `menu`, etc. No permite anidamiento profundo.
    """
    clean: Dict[str, Any] = {}
    for k, v in list(raw.items())[:30]:
        if not isinstance(k, str) or not k or len(k) > 100:
            continue
        if isinstance(v, list):
            cleaned_list: List[Any] = []
            for item in v[:MAX_NESTED_ITEMS]:
                if isinstance(item, dict):
                    companion = _clean_companion(item)
                    if companion is not None:
                        cleaned_list.append(companion)
                else:
                    scalar = _clean_scalar(item)
                    if scalar is not _MISSING:
                        cleaned_list.append(scalar)
            if cleaned_list or v == []:
                clean[k] = cleaned_list
        else:
            cleaned = _clean_scalar(v)
            if cleaned is not _MISSING:
                clean[k] = cleaned
    return clean


def _notify_card_event(card: DeployedCard, title: str, body: str, db: Session) -> None:
    """Avisa al dueño de la tarjeta; si no tiene dueño, a los admins.

    Las notificaciones nunca deben romper una respuesta pública: si algo falla
    (por ejemplo, un enum viejo en la base), se revierte solo este insert y se
    registra el error.
    """
    try:
        if card.client_id:
            recipients = [card.client_id]
            link = "/mi-tarjeta"
        else:
            recipients = [
                user.id for user in db.query(User).filter(User.role == "admin").all()
            ]
            link = "/sitios"
        if not recipients:
            return
        for user_id in recipients:
            db.add(
                Notification(
                    user_id=user_id,
                    kind=NotificationKind.card_submission,
                    title=title,
                    body=body,
                    link=link,
                )
            )
        db.commit()
    except Exception:
        db.rollback()
        logging.getLogger("card_deploy").warning(
            "No se pudo crear la notificación de la tarjeta", exc_info=True
        )


def _submission_notification_text(
    kind: str, payload: Dict[str, Any], card: DeployedCard
) -> Tuple[str, str]:
    nombre = str(payload.get("nombre") or "Un invitado").strip()[:120] or "Un invitado"
    card_title = card.title[:120]

    if kind == "rsvp":
        asisten = payload.get("asisten")
        if asisten is True:
            action = "confirmó su asistencia"
        elif asisten is False:
            action = "avisó que no asiste"
        else:
            action = "respondió la invitación"
        people = _rsvp_people_count(payload)
        suffix = f" por {people} personas" if people > 1 else ""
        return "Nueva confirmación", f"{nombre} {action}{suffix} en '{card_title}'"

    if kind == "cancion":
        cancion = str(payload.get("cancion") or "").strip()[:80]
        detail = f" '{cancion}'" if cancion else " una canción"
        return "Nueva canción", f"{nombre} pidió{detail} en '{card_title}'"

    if kind == "mensaje":
        return "Nuevo mensaje", f"{nombre} dejó un mensaje en '{card_title}'"

    if kind == "menu":
        menu = str(payload.get("menu") or "").strip()[:80]
        detail = f" '{menu}'" if menu else " su menú"
        return "Nuevo menú", f"{nombre} eligió{detail} en '{card_title}'"

    return "Nueva respuesta", f"{nombre} respondió en '{card_title}'"


@card_public_router.get("/tarjetas/{slug}/config", response_model=PublicCardConfig)
def public_card_config(slug: str, db: Session = Depends(get_db)):
    card = _get_card_or_404(db, slug)
    return PublicCardConfig(
        slug=card.slug,
        title=card.title,
        menu_options=_menu_options(card),
        features=_features(card),
        submissions_open=card.submissions_open,
    )


@card_public_router.post("/tarjetas/{slug}/respuestas", response_model=SubmissionResult, status_code=status.HTTP_201_CREATED)
def public_submit(
    slug: str,
    body: SubmissionIn,
    request: Request,
    db: Session = Depends(get_db),
):
    card = _get_card_or_404(db, slug)
    if not card.submissions_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las confirmaciones están cerradas para esta tarjeta",
        )
    ip = request.client.host if request.client else "unknown"
    _submit_rate_limit(f"{ip}:{slug}")

    kind = (body.kind or "").strip().lower()
    if kind not in SUBMISSION_KINDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Tipo no válido. Usá uno de: {', '.join(SUBMISSION_KINDS)}",
        )
    payload = _clean_payload(body.model_dump(exclude={"kind"}))
    import json as _json
    if len(_json.dumps(payload, ensure_ascii=False)) > MAX_PAYLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Los datos enviados son demasiado largos",
        )
    if kind == "rsvp" and not payload.get("nombre"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El nombre es obligatorio para confirmar asistencia",
        )
    # Compatibilidad: las tarjetas nuevas mandan el grupo en `acompañantes`.
    # Se normaliza el conteo para que el panel/CSV y las tarjetas viejas que
    # solo conocen `cantidad` sigan funcionando.
    if kind == "rsvp":
        companions = None
        for key in ("acompañantes", "acompanantes", "subinvitados"):
            if isinstance(payload.get(key), list):
                companions = payload[key]
                break
        if companions is not None:
            payload["acompañantes"] = companions
            payload["cantidad"] = len(companions)
    sub = CardSubmission(card_id=card.id, kind=kind, payload=payload)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    sub_id = sub.id
    title, body = _submission_notification_text(kind, payload, card)
    _notify_card_event(card, title, body, db)
    return SubmissionResult(id=sub_id)


# ─── Respuestas: admin ───────────────────────────────────────────────────────
def _list_submissions(db: Session, card_id: int, kind: Optional[str] = None) -> List[CardSubmission]:
    q = db.query(CardSubmission).filter(CardSubmission.card_id == card_id)
    if kind:
        q = q.filter(CardSubmission.kind == kind)
    return q.order_by(CardSubmission.created_at.desc()).all()


COMPANION_PAYLOAD_KEYS = ("acompañantes", "acompanantes", "subinvitados")

# Las primeras tarjetas guardaban el detalle de los acompañantes dentro de
# `mensaje` con este formato. Se reconstruye para que el Excel muestre las
# mismas personas que el panel.
LEGACY_COMPANION_LINE = re.compile(
    r"^\s*Invitado\s+\d+\s*:\s*(.*?)\s*[—–-]\s*(S[ií],?\s*asiste|No\s+asiste)\s*$",
    re.IGNORECASE,
)

EXPORT_KIND_LABELS = {
    "rsvp": "Confirmación",
    "cancion": "Canción",
    "menu": "Menú",
    "mensaje": "Mensaje",
    "otro": "Otro",
}

EXPORT_FIELD_LABELS = {
    "menu": "Menú",
    "notas": "Notas",
    "cancion": "Canción",
    "canción": "Canción",
    "tema": "Canción",
    "musica": "Canción",
    "música": "Canción",
    "mensaje": "Mensaje",
    "dedicatoria": "Deseo",
    "deseo": "Deseo",
    "deseos": "Deseo",
    "texto": "Mensaje",
    "restriccion": "Restricción alimentaria",
    "restricción": "Restricción alimentaria",
    "restricciones": "Restricción alimentaria",
    "alimentacion": "Restricción alimentaria",
    "alimentación": "Restricción alimentaria",
    "telefono": "Teléfono",
    "teléfono": "Teléfono",
}

# Columnas que se estilan distinto en el Excel.
EXPORT_STATUS_LABELS = {True: "Asiste", False: "No asiste", None: "Sin responder"}


def _bool_or_none(value: Any) -> Optional[bool]:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        if value == 1:
            return True
        if value == 0:
            return False
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "si", "sí", "asiste"}:
            return True
        if normalized in {"false", "0", "no", "no asiste"}:
            return False
    return None


def _status_label(value: Optional[bool]) -> str:
    return EXPORT_STATUS_LABELS[value]


def _kind_label(kind: str) -> str:
    return EXPORT_KIND_LABELS.get(str(kind).lower(), str(kind).capitalize() or "Respuesta")


def _strip_legacy_companion_lines(value: Any) -> str:
    """Quita del mensaje las líneas que en realidad son el detalle de acompañantes."""
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")
    lines = [line for line in text.split("\n") if not LEGACY_COMPANION_LINE.match(line)]
    return "\n".join(lines).strip()


def _legacy_companions_from_message(value: Any) -> List[Dict[str, Any]]:
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")
    companions: List[Dict[str, Any]] = []
    for line in text.split("\n"):
        match = LEGACY_COMPANION_LINE.match(line)
        if not match:
            continue
        companions.append(
            {
                "nombre": match.group(1).strip() or f"Acompañante {len(companions) + 1}",
                "asisten": bool(re.match(r"^s[ií],?\s*asiste$", match.group(2).strip(), re.IGNORECASE)),
            }
        )
        if len(companions) >= 20:
            break
    return companions


def _has_companion_list(payload: Dict[str, Any]) -> bool:
    return any(isinstance(payload.get(key), list) for key in COMPANION_PAYLOAD_KEYS)


def _row_companions(payload: Any) -> List[Dict[str, Any]]:
    """Acompañantes declarados, incluyendo el formato viejo dentro de `mensaje`."""
    if not isinstance(payload, dict):
        return []
    for key in COMPANION_PAYLOAD_KEYS:
        value = payload.get(key)
        if isinstance(value, list):
            companions: List[Dict[str, Any]] = []
            for item in value:
                if isinstance(item, dict):
                    companions.append(item)
                elif isinstance(item, (str, int, float)):
                    companions.append({"nombre": str(item)})
            return companions
    return _legacy_companions_from_message(payload.get("mensaje"))


def _row_people(payload: Any) -> List[Dict[str, Any]]:
    """Personas del grupo (sin el principal) para el resumen y el Excel.

    Si la tarjeta vieja solo mandaba `cantidad`, ese valor era el total de
    asistentes (principal incluido): se crean acompañantes sintéticos para no
    inflar ni perder personas.
    """
    if not isinstance(payload, dict):
        return []
    companions = _row_companions(payload)
    asisten = _bool_or_none(payload.get("asisten"))
    if _has_companion_list(payload) or companions:
        return companions

    try:
        total = int(payload.get("cantidad") or 0)
    except (TypeError, ValueError):
        total = 0
    synthetic = min(20, max(0, total - 1)) if asisten is True else 0
    for index in range(synthetic):
        companions.append(
            {
                "nombre": f"Acompañante {len(companions) + 1}",
                "asisten": asisten,
            }
        )
    return companions


def _rsvp_people_count(payload: Dict[str, Any]) -> int:
    """Cantidad de personas del grupo para las notificaciones.

    Con lista de acompañantes (nueva o vieja) se cuenta el principal + la lista.
    Sin lista, `cantidad` era el total de asistentes en las tarjetas viejas.
    """
    companions = _row_companions(payload)
    if _has_companion_list(payload) or companions:
        return 1 + len(companions)
    try:
        total = int(payload.get("cantidad") or 0)
    except (TypeError, ValueError):
        total = 0
    return max(1, total)


def _guest_name(payload: Dict[str, Any]) -> str:
    name = str(payload.get("nombre") or "").strip()
    return name or "Sin nombre"


def _companion_text(companion: Dict[str, Any], keys: Tuple[str, ...]) -> str:
    for key in keys:
        value = companion.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def _companion_name(companion: Dict[str, Any], index: int) -> str:
    name = str(companion.get("nombre") or "").strip()
    return name or f"Acompañante {index + 1}"


def _payload_export_fields(payload: Dict[str, Any], kind: str) -> Dict[str, str]:
    """Campos visibles del payload, con las mismas etiquetas que el panel."""
    fields: Dict[str, str] = {}
    for key, value in payload.items():
        if key in COMPANION_PAYLOAD_KEYS or key in {"nombre", "asisten", "cantidad"}:
            continue
        if isinstance(value, (dict, list)) or value is None:
            continue
        text = str(value).strip()
        if not text:
            continue
        # En un RSVP, `mensaje` puede traer la lista vieja de acompañantes.
        if kind == "rsvp" and key in {"mensaje", "dedicatoria", "deseo", "deseos", "texto"}:
            text = _strip_legacy_companion_lines(text)
            if not text:
                continue
        label = EXPORT_FIELD_LABELS.get(key)
        if not label:
            label = key.replace("_", " ").strip()
            if label:
                label = label[0].upper() + label[1:]
        if not label:
            continue
        if label in fields:
            if text not in fields[label].split(" · "):
                fields[label] = f"{fields[label]} · {text}"
        else:
            fields[label] = text
    return fields


def _export_summary(rows: List[CardSubmission]) -> str:
    groups = 0
    attending = 0
    declined = 0
    pending = 0
    for row in rows:
        if row.kind != "rsvp":
            continue
        groups += 1
        payload = row.payload if isinstance(row.payload, dict) else {}
        states = [_bool_or_none(payload.get("asisten"))]
        states.extend(_bool_or_none(companion.get("asisten")) for companion in _row_people(payload))
        for state in states:
            if state is True:
                attending += 1
            elif state is False:
                declined += 1
            else:
                pending += 1

    if groups:
        parts = [
            f"{groups} {'confirmación' if groups == 1 else 'confirmaciones'}",
            f"{attending} asisten",
            f"{declined} no asisten",
        ]
        if pending:
            parts.append(f"{pending} sin responder")
        return " · ".join(parts)
    count = len(rows)
    return f"{count} {'respuesta' if count == 1 else 'respuestas'}"


def _as_naive_utc(value: Any) -> Any:
    if not isinstance(value, datetime):
        return value
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def _build_export_table(
    rows: List[CardSubmission],
) -> Tuple[List[str], List[List[Any]], str]:
    """Arma las columnas del Excel/CSV con el mismo criterio que el panel."""
    prepared: List[Tuple[CardSubmission, Dict[str, Any], Dict[str, str], List[Dict[str, Any]]]] = []
    field_order: List[str] = []
    max_companions = 0

    for row in rows:
        payload = row.payload if isinstance(row.payload, dict) else {}
        fields = _payload_export_fields(payload, row.kind)
        for label in fields:
            if label not in field_order:
                field_order.append(label)
        companions = _row_people(payload)
        max_companions = max(max_companions, len(companions))
        prepared.append((row, payload, fields, companions))

    companion_headers: List[str] = []
    for index in range(1, max_companions + 1):
        companion_headers.extend(
            [
                f"Acompañante {index} · Nombre",
                f"Acompañante {index} · Estado",
                f"Acompañante {index} · Menú",
                f"Acompañante {index} · Notas",
            ]
        )

    headers = ["Tipo", "Invitado", "Estado"] + field_order + companion_headers + ["Fecha"]
    data: List[List[Any]] = []
    for row, payload, fields, companions in prepared:
        main_state = _bool_or_none(payload.get("asisten"))
        values: List[Any] = [
            _kind_label(row.kind),
            _guest_name(payload),
            _status_label(main_state) if row.kind == "rsvp" or "asisten" in payload else "",
        ]
        values.extend(fields.get(label, "") for label in field_order)

        for index in range(max_companions):
            companion = companions[index] if index < len(companions) else {}
            values.extend(
                [
                    _companion_name(companion, index) if companion else "",
                    _status_label(_bool_or_none(companion.get("asisten"))) if companion else "",
                    _companion_text(companion, ("menu",)) if companion else "",
                    _companion_text(companion, ("notas", "nota", "detalle")) if companion else "",
                ]
            )

        values.append(_as_naive_utc(row.created_at) if row.created_at else "")
        data.append(values)

    return headers, data, _export_summary(rows)


def _csv_cell(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.strftime("%d/%m/%Y %H:%M")
    return value


def _submissions_csv(slug: str, rows: List[CardSubmission]) -> StreamingResponse:
    headers, data, _ = _build_export_table(rows)
    output = io.StringIO()
    writer = csv.writer(output, lineterminator="\r\n")
    writer.writerow(headers)
    for row in data:
        writer.writerow([_csv_cell(value) for value in row])
    payload = "\ufeff" + output.getvalue()
    return StreamingResponse(
        iter([payload]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="respuestas-{slug}.csv"'},
    )


def _submissions_xlsx(card: DeployedCard, rows: List[CardSubmission]) -> StreamingResponse:
    """Excel con el mismo aspecto del panel: título, resumen, estados y tabla."""
    headers, data, summary = _build_export_table(rows)
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Respuestas"
    sheet.sheet_view.showGridLines = False

    last_col = len(headers)
    last_letter = get_column_letter(last_col)
    header_row = 3

    # Título y resumen, como el encabezado del panel.
    sheet.merge_cells(start_row=1, start_column=1, end_row=1, end_column=last_col)
    title_cell = sheet.cell(row=1, column=1, value=f"Respuestas · {card.title}")
    title_cell.font = Font(bold=True, size=16, color="FFFFFF")
    title_cell.fill = PatternFill("solid", fgColor="6D28D9")
    title_cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    sheet.row_dimensions[1].height = 30

    sheet.merge_cells(start_row=2, start_column=1, end_row=2, end_column=last_col)
    summary_cell = sheet.cell(row=2, column=1, value=summary)
    summary_cell.font = Font(size=10, color="5B21B6")
    summary_cell.fill = PatternFill("solid", fgColor="F5F3FF")
    summary_cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    sheet.row_dimensions[2].height = 22

    for column, header in enumerate(headers, start=1):
        cell = sheet.cell(row=header_row, column=column, value=header)
        cell.font = Font(bold=True, color="FFFFFF", size=10)
        cell.fill = PatternFill("solid", fgColor="7C3AED")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = Border(bottom=Side(style="thin", color="6D28D9"))
    sheet.row_dimensions[header_row].height = 28

    thin = Side(style="thin", color="E2E8F0")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    status_styles = {
        "Asiste": ("D1FAE5", "047857"),
        "No asiste": ("F1F5F9", "475569"),
        "Sin responder": ("FEF3C7", "B45309"),
    }

    if not data:
        sheet.merge_cells(
            start_row=header_row + 1,
            start_column=1,
            end_row=header_row + 1,
            end_column=last_col,
        )
        empty_cell = sheet.cell(
            row=header_row + 1,
            column=1,
            value="Todavía no hay respuestas para esta tarjeta.",
        )
        empty_cell.font = Font(italic=True, size=10, color="94A3B8")
        empty_cell.alignment = Alignment(horizontal="center", vertical="center")
        sheet.row_dimensions[header_row + 1].height = 32

    for row_index, values in enumerate(data, start=header_row + 1):
        for column_index, value in enumerate(values, start=1):
            cell = sheet.cell(row=row_index, column=column_index, value=value)
            cell.border = border
            cell.alignment = Alignment(vertical="top", wrap_text=True)
            header = headers[column_index - 1]

            if header == "Tipo":
                cell.font = Font(bold=True, size=9, color="6D28D9")
                cell.fill = PatternFill("solid", fgColor="F5F3FF")
                cell.alignment = Alignment(horizontal="center", vertical="top")
            elif header == "Estado" or header.endswith("· Estado"):
                fill, color = status_styles.get(str(value), ("FFFFFF", "475569"))
                cell.fill = PatternFill("solid", fgColor=fill)
                cell.font = Font(bold=True, size=9, color=color)
                cell.alignment = Alignment(horizontal="center", vertical="top")
            elif header == "Fecha":
                cell.font = Font(size=9, color="64748B")
                cell.alignment = Alignment(horizontal="right", vertical="top")
                if isinstance(value, datetime):
                    cell.number_format = "dd/mm/yyyy hh:mm"
            else:
                cell.font = Font(size=10, color="334155")
                if row_index % 2 == 0:
                    cell.fill = PatternFill("solid", fgColor="FAFAFA")

    widths = {
        "Tipo": 15,
        "Invitado": 26,
        "Estado": 14,
        "Menú": 18,
        "Notas": 36,
        "Canción": 26,
        "Mensaje": 36,
        "Fecha": 18,
    }
    column_widths: List[float] = []
    for column, header in enumerate(headers, start=1):
        if header in widths:
            width = widths[header]
        elif header.endswith("· Nombre"):
            width = 24
        elif header.endswith("· Estado"):
            width = 12
        elif header.endswith("· Menú"):
            width = 16
        elif header.endswith("· Notas"):
            width = 28
        else:
            width = 22
        column_widths.append(width)
        sheet.column_dimensions[get_column_letter(column)].width = width

    # Altura aproximada para que las notas largas se lean completas al abrir.
    for row_index, values in enumerate(data, start=header_row + 1):
        max_lines = 1
        for column_index, value in enumerate(values):
            text = str(value or "")
            chars_per_line = max(8, int(column_widths[column_index] * 1.05))
            lines = sum(
                max(1, (len(part) + chars_per_line - 1) // chars_per_line)
                for part in text.split("\n")
            )
            max_lines = max(max_lines, lines)
        sheet.row_dimensions[row_index].height = min(120, max(24, max_lines * 14 + 6))

    if data:
        last_row = header_row + len(data)
        sheet.auto_filter.ref = f"A{header_row}:{last_letter}{last_row}"
    sheet.freeze_panes = f"A{header_row + 1}"
    sheet.page_setup.orientation = "landscape"
    sheet.page_setup.fitToWidth = 1
    sheet.sheet_properties.pageSetUpPr.fitToPage = True

    output = io.BytesIO()
    workbook.save(output)
    payload = output.getvalue()
    return StreamingResponse(
        iter([payload]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="respuestas-{card.slug}.xlsx"'},
    )


@router.get("/{card_id}/respuestas", response_model=List[SubmissionOut])
def list_responses(
    card_id: int,
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    _get_or_404(db, card_id)
    return _list_submissions(db, card_id, kind)


@router.get("/{card_id}/respuestas.csv")
def export_responses_csv(
    card_id: int,
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    return _submissions_csv(card.slug, _list_submissions(db, card_id, kind))


@router.get("/{card_id}/respuestas.xlsx")
def export_responses_xlsx(
    card_id: int,
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    return _submissions_xlsx(card, _list_submissions(db, card_id, kind))


@router.delete("/{card_id}/respuestas/{sub_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_response(
    card_id: int,
    sub_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    sub = (
        db.query(CardSubmission)
        .filter(CardSubmission.id == sub_id, CardSubmission.card_id == card_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Respuesta no encontrada")
    _destroy_photo(sub)
    db.delete(sub)
    db.commit()
    return None


def _apply_config(
    card: DeployedCard,
    menu_options: Optional[List[str]],
    submissions_open: Optional[bool],
    features: Optional[List[str]] = None,
):
    cfg = dict(card.config) if isinstance(card.config, dict) else {}
    if menu_options is not None:
        cleaned = []
        for o in menu_options[:30]:
            if isinstance(o, str) and o.strip():
                cleaned.append(o.strip()[:100])
        cfg["menu_options"] = cleaned
    if features is not None:
        cfg["features"] = _clean_features(features)
    card.config = cfg
    # Reasignar para que SQLAlchemy detecte el cambio en la columna JSON
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(card, "config")
    if submissions_open is not None:
        card.submissions_open = submissions_open


@router.patch("/{card_id}/config", response_model=DeployedCardDetailOut)
def update_config(
    card_id: int,
    body: DeployedCardConfigUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    _apply_config(card, body.menu_options, body.submissions_open, body.features)
    db.commit()
    db.refresh(card)
    return _to_detail(card, db)


@router.patch("/{card_id}/owner", response_model=DeployedCardDetailOut)
def update_owner(
    card_id: int,
    body: DeployedCardOwnerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    if body.client_id is None:
        card.client_id = None
    else:
        owner = db.query(User).filter(User.id == body.client_id).first()
        if not owner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        if owner.role != "client":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El dueño debe ser un usuario cliente",
            )
        card.client_id = owner.id
    db.commit()
    db.refresh(card)
    return _to_detail(card, db)


# ─── Mi tarjeta: cliente dueño ───────────────────────────────────────────────
def _get_owned_card(db: Session, user: User, card_id: int) -> DeployedCard:
    card = (
        db.query(DeployedCard)
        .filter(DeployedCard.id == card_id, DeployedCard.client_id == user.id)
        .first()
    )
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    return card


@my_router.get("", response_model=List[DeployedCardDetailOut])
def my_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cards = (
        db.query(DeployedCard)
        .filter(DeployedCard.client_id == current_user.id)
        .order_by(DeployedCard.created_at.desc())
        .all()
    )
    return [_to_detail(c, db) for c in cards]


@my_router.get("/{card_id}/respuestas", response_model=List[SubmissionOut])
def my_card_responses(
    card_id: int,
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_card(db, current_user, card_id)
    return _list_submissions(db, card_id, kind)


@my_router.get("/{card_id}/respuestas.csv")
def my_card_responses_csv(
    card_id: int,
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = _get_owned_card(db, current_user, card_id)
    return _submissions_csv(card.slug, _list_submissions(db, card_id, kind))


@my_router.get("/{card_id}/respuestas.xlsx")
def my_card_responses_xlsx(
    card_id: int,
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = _get_owned_card(db, current_user, card_id)
    return _submissions_xlsx(card, _list_submissions(db, card_id, kind))


@my_router.patch("/{card_id}/config", response_model=DeployedCardDetailOut)
def my_card_update_config(
    card_id: int,
    body: DeployedCardConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = _get_owned_card(db, current_user, card_id)
    if body.submissions_open is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede abrir o cerrar las respuestas",
        )
    if body.features is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede cambiar las secciones de la tarjeta",
        )
    _apply_config(card, body.menu_options, None)
    db.commit()
    db.refresh(card)
    return _to_detail(card, db)


# ─── Fotos de invitados (Cloudinary) ─────────────────────────────────────────
# Las fotos NO tocan el disco de SeNode: van directo a Cloudinary y en la DB
# solo queda la URL (kind="foto"). El álbum es privado: solo admin y dueño.
def _cloudinary_configured() -> bool:
    return bool(
        settings.CLOUDINARY_CLOUD_NAME
        and settings.CLOUDINARY_API_KEY
        and settings.CLOUDINARY_API_SECRET
    )


def _cloudinary_setup():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def _destroy_photo(sub: CardSubmission) -> None:
    """Borra la foto de Cloudinary (best effort: nunca rompe el flujo)."""
    try:
        payload = sub.payload if isinstance(sub.payload, dict) else {}
        public_id = payload.get("public_id")
        if sub.kind == "foto" and public_id and _cloudinary_configured():
            _cloudinary_setup()
            cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception:
        import logging
        logging.getLogger("card_deploy").warning("No se pudo borrar foto de Cloudinary", exc_info=True)


def _download_bytes(url: str) -> bytes:
    r = httpx.get(url, timeout=30, follow_redirects=True)
    r.raise_for_status()
    return r.content


@card_public_router.post("/tarjetas/{slug}/fotos", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
async def public_upload_photo(
    slug: str,
    request: Request,
    file: UploadFile = File(...),
    nombre: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    card = _get_card_or_404(db, slug)
    if not card.submissions_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las respuestas están cerradas para esta tarjeta",
        )
    if not _cloudinary_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La subida de fotos no está configurada",
        )
    ip = request.client.host if request.client else "unknown"
    _submit_rate_limit(f"foto:{ip}:{slug}")

    content = await file.read()
    if len(content) > MAX_PHOTO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La foto supera el máximo permitido (10 MB)",
        )
    try:
        with Image.open(io.BytesIO(content)) as img:
            img.verify()
            formato = (img.format or "jpg").lower()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo no es una imagen válida",
        )

    _cloudinary_setup()
    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(content),
            folder=f"clik-tarjetas/{slug}",
            resource_type="image",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se pudo subir la foto. Intenta de nuevo.",
        )
    public_id = result.get("public_id", "")
    thumb_url, _ = cloudinary.utils.cloudinary_url(
        public_id, width=400, height=400, crop="fill", format="jpg"
    )
    payload: Dict[str, Any] = {
        "url": result.get("secure_url", ""),
        "thumb_url": thumb_url,
        "public_id": public_id,
        "formato": formato,
    }
    if nombre and nombre.strip():
        payload["nombre"] = nombre.strip()[:255]
    sub = CardSubmission(card_id=card.id, kind="foto", payload=payload)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    out = SubmissionOut.model_validate(sub)
    guest = str(payload.get("nombre") or "Un invitado").strip()[:120] or "Un invitado"
    _notify_card_event(
        card,
        "Nueva foto",
        f"{guest} subió una foto a '{card.title[:120]}'",
        db,
    )
    return out


def _parse_ids_or_400(ids: Optional[str]) -> Optional[List[int]]:
    if not ids:
        return None
    try:
        parsed = [int(p) for p in ids.split(",") if p.strip()]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Parámetro ids inválido: se esperan ids numéricos separados por coma",
        )
    if not parsed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Parámetro ids inválido: no contiene ids",
        )
    return parsed


def _fotos_zip_stream(
    card: DeployedCard, db: Session, ids: Optional[List[int]] = None
) -> StreamingResponse:
    query = (
        db.query(CardSubmission)
        .filter(CardSubmission.card_id == card.id, CardSubmission.kind == "foto")
    )
    if ids is not None:
        query = query.filter(CardSubmission.id.in_(ids))
    fotos = query.order_by(CardSubmission.created_at).all()
    urls = []
    for f in fotos:
        payload = f.payload if isinstance(f.payload, dict) else {}
        if payload.get("url"):
            urls.append((f, payload["url"]))
    if not urls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron las fotos seleccionadas"
            if ids is not None
            else "Esta tarjeta no tiene fotos",
        )
    if len(urls) > PHOTO_ZIP_MAX_FILES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Demasiadas fotos para un solo ZIP (máximo {PHOTO_ZIP_MAX_FILES})",
        )
    buf = io.BytesIO()
    total = 0
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, (sub, url) in enumerate(urls, start=1):
            payload = sub.payload if isinstance(sub.payload, dict) else {}
            data = _download_bytes(str(url))
            total += len(data)
            if total > PHOTO_ZIP_MAX_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Las fotos superan el máximo para un solo ZIP",
                )
            ext = str(payload.get("formato") or "jpg").lower().strip(".")
            zf.writestr(f"foto-{i:03d}.{ext}", data)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="fotos-{card.slug}.zip"'},
    )


@router.get("/{card_id}/fotos.zip")
def export_photos_zip(
    card_id: int,
    ids: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    card = _get_or_404(db, card_id)
    return _fotos_zip_stream(card, db, _parse_ids_or_400(ids))


@my_router.get("/{card_id}/fotos.zip")
def my_photos_zip(
    card_id: int,
    ids: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = _get_owned_card(db, current_user, card_id)
    return _fotos_zip_stream(card, db, _parse_ids_or_400(ids))
