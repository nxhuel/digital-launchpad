from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import require_admin
from backend.app.models.models import MonthlyExpense, User
from backend.app.schemas.schemas import MonthlyExpenseCreate, MonthlyExpenseUpdate, MonthlyExpenseOut

router = APIRouter(prefix="/monthly-expenses", tags=["monthly-expenses"])


def _month_key(date_str: str) -> str:
    return date_str[:7]  # YYYY-MM-DD → YYYY-MM


@router.get("", response_model=List[MonthlyExpenseOut])
def list_expenses(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(MonthlyExpense).order_by(MonthlyExpense.payment_date.desc()).all()


@router.post("", response_model=MonthlyExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(body: MonthlyExpenseCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    expense = MonthlyExpense(
        service_name=body.service_name.strip(),
        amount=body.amount,
        payment_date=body.payment_date,
        month_key=_month_key(body.payment_date),
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.patch("/{expense_id}", response_model=MonthlyExpenseOut)
def update_expense(expense_id: int, body: MonthlyExpenseUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    expense = db.query(MonthlyExpense).filter(MonthlyExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")
    data = body.model_dump(exclude_unset=True)
    if "service_name" in data:
        data["service_name"] = data["service_name"].strip()
    if "payment_date" in data:
        data["month_key"] = _month_key(data["payment_date"])
    for key, value in data.items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    expense = db.query(MonthlyExpense).filter(MonthlyExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")
    db.delete(expense)
    db.commit()
