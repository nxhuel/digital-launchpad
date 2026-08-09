from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.core.config import settings

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_admin, check_project_ownership
from backend.app.core.uploads import save_upload
from backend.app.models.models import (
    Project, Payment, PaymentStatus, User, AttachmentOwnerType,
    Notification, NotificationKind, PaymentKind, FinanceEntry
)
from backend.app.schemas.schemas import PaymentOut, PaymentConfirm, PaymentMethodUpdate

router = APIRouter(prefix="/projects/{project_id}/payments", tags=["payments"])


@router.get("", response_model=List[PaymentOut])
def list_payments(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    return db.query(Payment).filter(Payment.project_id == project_id).order_by(Payment.created_at).all()


def _local_today() -> str:
    """Fecha de hoy en la zona horaria del negocio (no UTC)."""
    tz = timezone(timedelta(hours=settings.TIMEZONE_OFFSET_HOURS))
    return datetime.now(tz).strftime("%Y-%m-%d")


def _register_income_entry(payment: Payment, project: Project, db: Session):
    """Auto-registra el ingreso confirmado en el módulo de Finanzas."""
    if payment.kind == PaymentKind.maintenance.value:
        desc = f"Mantenimiento — {project.title}"
    elif payment.installment_number:
        desc = f"Pago cuota {payment.installment_number} — {project.title}"
    else:
        desc = f"Pago — {project.title}"
    db.add(FinanceEntry(
        date=_local_today(),
        description=desc,
        income=payment.amount,
        expense=None,
        source_payment_id=payment.id,
    ))


@router.patch("/{payment_id}", response_model=PaymentOut)
def confirm_payment(payment_id: int, body: PaymentConfirm, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
    was_confirmed = payment.status == PaymentStatus.confirmado
    payment.status = PaymentStatus(body.status)
    if body.status == "confirmado":
        payment.paid_at = datetime.now(timezone.utc)
        project = payment.project
        # Auto-registro en Finanzas: solo la primera vez que se confirma (evita duplicados)
        if not was_confirmed and project:
            _register_income_entry(payment, project, db)
        if payment.kind == PaymentKind.maintenance.value and project:
            from backend.app.routers.projects import _generate_next_maintenance
            _generate_next_maintenance(project, db)
        project.updated_at = datetime.now(timezone.utc)
        notif = Notification(
            user_id=project.client_id,
            kind=NotificationKind.payment_confirmed,
            title="Pago confirmado",
            body=f"Pago de ${payment.amount} confirmado",
            link=f"/projects/{project.id}",
        )
        db.add(notif)
    elif body.status == "rechazado":
        project = payment.project
        # Si se rechaza un pago que ya estaba confirmado, se anula su ingreso en Finanzas
        if was_confirmed:
            db.query(FinanceEntry).filter(FinanceEntry.source_payment_id == payment.id).delete()
        notif = Notification(
            user_id=project.client_id,
            kind=NotificationKind.payment_confirmed,
            title="Pago rechazado",
            body=f"Pago de ${payment.amount} rechazado",
            link=f"/projects/{project.id}",
        )
        db.add(notif)
    db.commit()
    db.refresh(payment)
    return payment


@router.patch("/{payment_id}/method", response_model=PaymentOut)
def set_payment_method(payment_id: int, body: PaymentMethodUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
    payment.method = body.method
    db.commit()
    db.refresh(payment)
    return payment


@router.post("/{payment_id}/receipt", response_model=PaymentOut)
def upload_receipt(payment_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
    project = payment.project
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    if payment.status == PaymentStatus.confirmado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pago ya confirmado")
    att = save_upload(file, current_user.id)
    att.owner_type = AttachmentOwnerType.payment_receipt
    att.owner_id = payment.id
    db.add(att)
    db.commit()
    db.refresh(payment)
    project = payment.project
    sender_name = current_user.name
    if current_user.role == "admin":
        target_id = project.client_id
    else:
        admin = db.query(User).filter(User.role == "admin").first()
        target_id = admin.id if admin else project.client_id
    notif = Notification(
        user_id=target_id,
        kind=NotificationKind.payment_uploaded,
        title="Comprobante subido",
        body=f"{sender_name} subió comprobante para pago de ${payment.amount}",
        link=f"/projects/{project.id}",
    )
    db.add(notif)
    db.commit()
    return payment
