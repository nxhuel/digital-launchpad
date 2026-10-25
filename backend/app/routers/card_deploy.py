"""Despliegue de tarjetas digitales estáticas vía .ZIP.

Flujo: el admin sube un .ZIP con index.html (+ styles.css, script.js, assets/)
desde el panel ("Subir ZIP"). Se descomprime en <DEPLOY_DIR>/<slug>/ y queda
disponible en /tarjetas-digitales/<slug> sin tocar código ni redeployar.

ABM completo: alta (upload), listado, edición de título, renombre del slug
(cambia la URL), re-subida del ZIP y baja (borra DB + carpeta del disco).
"""
import io
import csv
import json
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
from typing import Any, Dict, List, Optional, Tuple

import cloudinary
import cloudinary.uploader
import cloudinary.utils
import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse, RedirectResponse, StreamingResponse
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
        companions = payload.get("acompañantes")
        count = len(companions) if isinstance(companions, list) else 0
        try:
            count = max(count, int(payload.get("cantidad") or 0))
        except (TypeError, ValueError):
            pass
        people = count + 1
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


def _csv_value(value: Any) -> Any:
    """Convierte listas/dicts a JSON legible para una celda de Excel."""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return value


def _row_companions(payload: Any) -> List[Dict[str, Any]]:
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
    return []


def _submissions_csv(slug: str, rows: List[CardSubmission]) -> StreamingResponse:
    keys: List[str] = []
    max_companions = 0
    for r in rows:
        payload = r.payload if isinstance(r.payload, dict) else {}
        for k in payload.keys():
            if k in COMPANION_PAYLOAD_KEYS:
                continue
            if k not in keys:
                keys.append(k)
        if r.kind == "rsvp":
            max_companions = max(max_companions, len(_row_companions(payload)))

    companion_columns: List[str] = []
    for idx in range(1, max_companions + 1):
        companion_columns.extend(
            [
                f"acompañante_{idx}_nombre",
                f"acompañante_{idx}_asisten",
                f"acompañante_{idx}_menu",
                f"acompañante_{idx}_notas",
            ]
        )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "tipo", "fecha"] + keys + companion_columns)
    for r in rows:
        payload = r.payload if isinstance(r.payload, dict) else {}
        created = r.created_at.isoformat(sep=" ") if r.created_at else ""
        base = [r.id, r.kind, created] + [_csv_value(payload.get(k, "")) for k in keys]
        companions = _row_companions(payload)
        extra: List[Any] = []
        for idx in range(max_companions):
            companion = companions[idx] if idx < len(companions) else {}
            extra.extend(
                [
                    _csv_value(companion.get("nombre", "")),
                    _csv_value(companion.get("asisten", "")),
                    _csv_value(companion.get("menu", "")),
                    _csv_value(companion.get("notas", "")),
                ]
            )
        writer.writerow(base + extra)
    output.seek(0)
    data = output.getvalue()
    return StreamingResponse(
        iter([data]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="respuestas-{slug}.csv"'},
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
