from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, check_project_ownership, require_admin
from backend.app.core.email import send_status_change_email
from backend.app.models.models import (
    Project, Service, User, ProjectStatus, Payment, PaymentKind, PaymentStatus,
    Notification, NotificationKind
)
from backend.app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])


def _generate_installments(project: Project, db: Session):
    """Genera pagos del proyecto: seña (si aplica) + cuotas restantes."""
    if not project.admin_price:
        return
    price = project.admin_price
    deposit_pct = project.deposit_percentage or 0
    installments = max(project.installments, 1)

    # Eliminar pagos existentes del proyecto (re-generación limpia)
    db.query(Payment).filter(
        Payment.project_id == project.id,
        Payment.kind == PaymentKind.project,
    ).delete()

    # 1) Seña (si aplica) — tipo propio, no es cuota
    if deposit_pct > 0:
        deposit_amt = round(price * deposit_pct / 100)
        db.add(Payment(
            project_id=project.id,
            amount=deposit_amt,
            kind=PaymentKind.deposit,
        ))
        remaining = price - deposit_amt
    else:
        remaining = price

    # 2) Cuotas del saldo restante — SIEMPRE arrancan en 1
    if installments > 0 and remaining > 0:
        amt_per = round(remaining / installments)
        total = 0
        for i in range(installments):
            amt = amt_per
            if i == installments - 1:
                amt = remaining - total
            if amt > 0:
                num = i + 1 if installments > 1 else None
                db.add(Payment(
                    project_id=project.id,
                    amount=amt,
                    kind=PaymentKind.project,
                    installment_number=num,
                ))
            total += amt

    db.commit()


def _generate_next_maintenance(project: Project, db: Session):
    if not project.maintenance_enabled or not project.maintenance_monthly:
        return
    payment = Payment(
        project_id=project.id,
        amount=project.maintenance_monthly,
        kind=PaymentKind.maintenance,
    )
    db.add(payment)
    db.commit()


def _create_notification(user_id: int, kind: NotificationKind, title: str, body: str, link: Optional[str] = None, db: Optional[Session] = None):
    if db is None:
        return
    notif = Notification(user_id=user_id, kind=kind, title=title, body=body, link=link)
    db.add(notif)
    db.commit()


def _get_next_due_date(project: Project, db: Session) -> Optional[datetime]:
    # Pago único sin mantenimiento: no hay "próximo pago"
    if project.installments <= 1 and not project.maintenance_enabled:
        return None
    # Si no queda nada pendiente de cobrar, no hay próximo pago
    pending = (
        db.query(Payment)
        .filter(
            Payment.project_id == project.id,
            Payment.status == PaymentStatus.pendiente,
        )
        .count()
    )
    if pending == 0:
        return None
    last_paid = (
        db.query(Payment)
        .filter(
            Payment.project_id == project.id,
            Payment.kind == PaymentKind.project,
            Payment.status == PaymentStatus.confirmado,
        )
        .order_by(Payment.paid_at.desc())
        .first()
    )
    if last_paid and last_paid.paid_at:
        return last_paid.paid_at + timedelta(days=30)
    if project.accepted_at:
        return project.accepted_at + timedelta(days=30)
    return None


@router.get("", response_model=List[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Project)
    if current_user.role == "client":
        q = q.filter(Project.client_id == current_user.id)
    q = q.order_by(Project.updated_at.desc())
    projects = q.all()
    result = []
    for p in projects:
        po = ProjectOut.model_validate(p)
        po.next_due_date = _get_next_due_date(p, db)
        result.append(po)
    return result


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(body: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = db.query(Service).filter(Service.id == body.service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    project = Project(
        client_id=current_user.id,
        service_id=body.service_id,
        title=body.title,
        description=body.description,
        budget_hint=body.budget_hint,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    _create_notification(
        user_id=current_user.id,
        kind=NotificationKind.project_created,
        title="Proyecto creado",
        body=f"Tu proyecto '{project.title}' ha sido creado",
        link=f"/projects/{project.id}",
        db=db,
    )
    # Notify admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        _create_notification(
            user_id=admin.id,
            kind=NotificationKind.project_created,
            title="Nuevo proyecto",
            body=f"{current_user.name} creó '{project.title}'",
            link=f"/projects/{project.id}",
            db=db,
        )
    return ProjectOut.model_validate(project)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    po = ProjectOut.model_validate(project)
    po.next_due_date = _get_next_due_date(project, db)
    return po


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, body: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    if body.status and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admin puede cambiar estado")
    if body.maintenance_enabled is not None and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admin puede gestionar mantenimiento")
    if body.status == ProjectStatus.completado.value:
        pending = db.query(Payment).filter(
            Payment.project_id == project.id,
            Payment.kind == PaymentKind.project,
            Payment.status != PaymentStatus.confirmado,
        ).count()
        if pending > 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se puede completar: hay cuotas pendientes")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    # Auto-set maintenance monthly to half of admin_price when maintenance is enabled
    if body.maintenance_enabled and project.maintenance_enabled and not body.maintenance_monthly:
        if project.admin_price and not project.maintenance_monthly:
            project.maintenance_monthly = round(project.admin_price / 2)
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    # Notify on status change (in-app + email)
    if body.status and project.client_id != current_user.id:
        _create_notification(
            user_id=project.client_id,
            kind=NotificationKind.project_status_changed,
            title="Estado actualizado",
            body=f"'{project.title}' cambió a {body.status}",
            link=f"/projects/{project.id}",
            db=db,
        )
        # Send email notification to client
        client = db.query(User).filter(User.id == project.client_id).first()
        if client:
            try:
                send_status_change_email(
                    to_email=client.email,
                    project_title=project.title,
                    new_status=body.status,
                    project_id=project.id,
                    client_name=client.name,
                )
            except Exception:
                pass  # Log ya manejado en _send
    po = ProjectOut.model_validate(project)
    po.next_due_date = _get_next_due_date(project, db)
    return po


@router.post("/{project_id}/accept", response_model=ProjectOut)
def accept_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    if project.status not in (ProjectStatus.cotizado, ProjectStatus.pendiente):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado no permite aceptación")
    if project.admin_price is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin debe fijar precio primero")
    project.status = ProjectStatus.aceptado
    project.accepted_at = datetime.now(timezone.utc)
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    _generate_installments(project, db)
    if project.maintenance_enabled:
        _generate_next_maintenance(project, db)
    _create_notification(
        user_id=project.client_id,
        kind=NotificationKind.project_status_changed,
        title="Cotización aceptada",
        body=f"Has aceptado la cotización de '{project.title}'",
        link=f"/projects/{project.id}",
        db=db,
    )
    # Send email notification
    client = db.query(User).filter(User.id == project.client_id).first()
    if client:
        try:
            send_status_change_email(
                to_email=client.email,
                project_title=project.title,
                new_status="aceptado",
                project_id=project.id,
                client_name=client.name,
            )
        except Exception:
            pass
    po = ProjectOut.model_validate(project)
    po.next_due_date = _get_next_due_date(project, db)
    return po


@router.post("/{project_id}/reject", response_model=ProjectOut)
def reject_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    if project.status not in (ProjectStatus.cotizado, ProjectStatus.pendiente):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado no permite rechazo")
    project.status = ProjectStatus.rechazado
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    _create_notification(
        user_id=project.client_id,
        kind=NotificationKind.project_status_changed,
        title="Cotización rechazada",
        body=f"Has rechazado la cotización de '{project.title}'",
        link=f"/projects/{project.id}",
        db=db,
    )
    # Send email notification
    client = db.query(User).filter(User.id == project.client_id).first()
    if client:
        try:
            send_status_change_email(
                to_email=client.email,
                project_title=project.title,
                new_status="rechazado",
                project_id=project.id,
                client_name=client.name,
            )
        except Exception:
            pass
    po = ProjectOut.model_validate(project)
    po.next_due_date = _get_next_due_date(project, db)
    return po


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Eliminar un proyecto (solo admin)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    db.delete(project)
    db.commit()
