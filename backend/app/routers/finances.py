from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import require_admin
from backend.app.models.models import FinanceEntry, User
from backend.app.schemas.schemas import FinanceEntryCreate, FinanceEntryUpdate, FinanceEntryOut

router = APIRouter(prefix="/finances", tags=["finances"])


def _validate_amounts(income, expense):
    if (income is None or income <= 0) and (expense is None or expense <= 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debés cargar un monto de ingreso o de egreso",
        )


@router.get("", response_model=List[FinanceEntryOut])
def list_entries(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(FinanceEntry).order_by(FinanceEntry.date, FinanceEntry.id).all()


@router.post("", response_model=FinanceEntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(body: FinanceEntryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _validate_amounts(body.income, body.expense)
    entry = FinanceEntry(**body.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/{entry_id}", response_model=FinanceEntryOut)
def update_entry(entry_id: int, body: FinanceEntryUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    entry = db.query(FinanceEntry).filter(FinanceEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimiento no encontrado")
    data = body.model_dump(exclude_unset=True)
    # Si no se tocan los montos, se validan los valores actuales (no rechazar ediciones de descripción/fecha)
    _validate_amounts(data.get("income", entry.income), data.get("expense", entry.expense))
    for key, value in data.items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    entry = db.query(FinanceEntry).filter(FinanceEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimiento no encontrado")
    db.delete(entry)
    db.commit()
