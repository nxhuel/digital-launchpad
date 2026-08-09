"""Catálogo de tarjetas digitales (invitaciones reales desplegadas).

Solo el admin puede subir/editar tarjetas. El catálogo público alimenta /tarjetas-digitales.
"""
import re
import unicodedata
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.app.core.database import SessionLocal, get_db
from backend.app.core.dependencies import require_admin
from backend.app.core.uploads import save_upload
from backend.app.models.models import CardCategory, CardDesign, User
from backend.app.schemas.schemas import (
    CardCategoryCreate,
    CardCategoryOut,
    CardDesignCreate,
    CardDesignOut,
    CardDesignUpdate,
    PublicCardCatalog,
    PublicCardDesignOut,
    ReorderRequest,
)

router = APIRouter(prefix="/admin/card-catalog", tags=["admin card catalog"])
public_router = APIRouter(prefix="/public", tags=["public"])


def _slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "categoria"


DEFAULT_CATEGORIES = [
    ("casamientos", "Casamientos", "Invitaciones elegantes para el día más importante.", 1),
    ("xv", "XV / 15 años", "Diseños modernos y soñados para los 15.", 2),
    ("peques", "Peques / Infantiles", "Cumples, baby showers y bautismos con onda.", 3),
    ("empresariales", "Empresariales", "Lanzamientos, inauguraciones y eventos corporativos.", 4),
    ("regalos", "Regalos", "Tarjetas y diseños personalizados para sorprender en ocasiones especiales.", 5),
]


def seed_default_categories():
    """Siembra las categorías por defecto (idempotente) al arrancar."""
    db = SessionLocal()
    try:
        if db.query(CardCategory).count() > 0:
            return
        for slug, name, description, order in DEFAULT_CATEGORIES:
            db.add(CardCategory(slug=slug, name=name, description=description, order=order))
        db.commit()
    finally:
        db.close()


def _get_category_or_404(db: Session, category_id: int) -> CardCategory:
    category = db.query(CardCategory).filter(CardCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return category


def _validate_url(value: Optional[str], field: str):
    if not value:
        return
    if value.startswith(("http://", "https://", "/")):
        return
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"{field} debe ser una URL válida (http/https)",
    )


# ─── Categorías (admin) ────────────────────────────────────────────────────
@router.get("/categories", response_model=List[CardCategoryOut])
def list_categories(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(CardCategory).order_by(CardCategory.order, CardCategory.name).all()


@router.post("/categories", response_model=CardCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(body: CardCategoryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    slug = body.slug or _slugify(body.name)
    if db.query(CardCategory).filter(CardCategory.slug == slug).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe una categoría con ese nombre")
    category = CardCategory(slug=slug, name=body.name, description=body.description, order=body.order)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.post("/categories/reorder", response_model=List[CardCategoryOut])
def reorder_categories(body: ReorderRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Reordena las categorías según el orden de ids recibido (position = índice)."""
    for idx, cat_id in enumerate(body.order):
        cat = db.query(CardCategory).filter(CardCategory.id == cat_id).first()
        if cat:
            cat.order = idx
    db.commit()
    return db.query(CardCategory).order_by(CardCategory.order, CardCategory.name).all()


# ─── Tarjetas (admin) ──────────────────────────────────────────────────────
@router.get("/designs", response_model=List[CardDesignOut])
def list_designs(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(CardDesign).order_by(CardDesign.category_id, CardDesign.order, CardDesign.name).all()


@router.post("/designs", response_model=CardDesignOut, status_code=status.HTTP_201_CREATED)
def create_design(body: CardDesignCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _get_category_or_404(db, body.category_id)
    _validate_url(body.demo_url, "La URL de la invitación")
    _validate_url(body.image_url, "La URL de la imagen")
    design = CardDesign(**body.model_dump())
    db.add(design)
    db.commit()
    db.refresh(design)
    return design


@router.post("/designs/{design_id}/image", response_model=CardDesignOut)
def upload_design_image(
    design_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    design = db.query(CardDesign).filter(CardDesign.id == design_id).first()
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    att = save_upload(file, current_user.id)
    if not att.mime.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La preview debe ser una imagen (png, jpg, webp)",
        )
    design.image_url = att.url
    design.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(design)
    return design


@router.post("/designs/reorder", response_model=List[CardDesignOut])
def reorder_designs(body: ReorderRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Reordena las tarjetas según el orden de ids recibido (position = índice)."""
    for idx, design_id in enumerate(body.order):
        d = db.query(CardDesign).filter(CardDesign.id == design_id).first()
        if d:
            d.order = idx
    db.commit()
    return db.query(CardDesign).order_by(CardDesign.category_id, CardDesign.order, CardDesign.name).all()


@router.patch("/designs/{design_id}", response_model=CardDesignOut)
def update_design(design_id: int, body: CardDesignUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    design = db.query(CardDesign).filter(CardDesign.id == design_id).first()
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    data = body.model_dump(exclude_unset=True)
    if "category_id" in data:
        _get_category_or_404(db, data["category_id"])
    _validate_url(data.get("demo_url", design.demo_url), "La URL de la invitación")
    _validate_url(data.get("image_url", design.image_url), "La URL de la imagen")
    for key, value in data.items():
        setattr(design, key, value)
    design.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(design)
    return design


@router.delete("/designs/{design_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_design(design_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    design = db.query(CardDesign).filter(CardDesign.id == design_id).first()
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    db.delete(design)
    db.commit()


# ─── Catálogo público (sin auth, alimenta /tarjetas-digitales) ─────────────
@public_router.get("/card-catalog", response_model=PublicCardCatalog)
def public_catalog(db: Session = Depends(get_db)):
    categories = db.query(CardCategory).order_by(CardCategory.order, CardCategory.name).all()
    designs = (
        db.query(CardDesign)
        .filter(CardDesign.active == True)  # noqa: E712
        .order_by(CardDesign.order, CardDesign.name)
        .all()
    )
    cat_map = {c.id: c for c in categories}
    # Solo categorías que tienen al menos una tarjeta publicada
    used_ids = {d.category_id for d in designs}
    visible = [c for c in categories if c.id in used_ids]

    return PublicCardCatalog(
        categories=[CardCategoryOut.model_validate(c) for c in visible],
        designs=[
            PublicCardDesignOut(
                id=d.id,
                name=d.name,
                category=c.slug,
                category_name=c.name,
                tag=d.tag,
                discount_label=d.discount_label,
                demo_url=d.demo_url,
                image_url=d.image_url,
            )
            for d in designs
            if (c := cat_map.get(d.category_id))
        ],
    )
