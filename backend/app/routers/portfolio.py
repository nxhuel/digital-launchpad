from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import require_admin
from backend.app.core.uploads import save_upload
from backend.app.models.models import User, PortfolioItem
from backend.app.schemas.schemas import PortfolioItemOut, PortfolioItemCreate, PortfolioItemUpdate, UploadedFileOut

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
public_router = APIRouter(prefix="/public", tags=["portfolio-public"])


# --- Admin CRUD ---

@router.get("", response_model=List[PortfolioItemOut])
def list_portfolio_items(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(PortfolioItem).order_by(PortfolioItem.order, PortfolioItem.id).all()


@router.post("", response_model=PortfolioItemOut, status_code=status.HTTP_201_CREATED)
def create_portfolio_item(body: PortfolioItemCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = PortfolioItem(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=PortfolioItemOut)
def get_portfolio_item(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item no encontrado")
    return item


@router.patch("/{item_id}", response_model=PortfolioItemOut)
def update_portfolio_item(item_id: int, body: PortfolioItemUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item no encontrado")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_item(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item no encontrado")
    db.delete(item)
    db.commit()


@router.put("/reorder")
def reorder_portfolio_items(body: List[dict], db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Reorder items. Body: [{id, order}, ...]"""
    for entry in body:
        db.query(PortfolioItem).filter(PortfolioItem.id == entry["id"]).update({"order": entry["order"]})
    db.commit()
    return {"ok": True}


@router.post("/upload", response_model=UploadedFileOut)
def upload_portfolio_image(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Upload de imagen para el portfolio (admin only)."""
    att = save_upload(file, current_user.id)
    return UploadedFileOut(url=att.url, filename=att.filename, mime=att.mime, size=att.size)


# --- Public ---

@public_router.get("/portfolio", response_model=List[PortfolioItemOut])
def public_list_portfolio(db: Session = Depends(get_db)):
    """Lista items activos del portfolio (público, sin auth)."""
    return (
        db.query(PortfolioItem)
        .filter(PortfolioItem.active == True)
        .order_by(PortfolioItem.order, PortfolioItem.id)
        .all()
    )
