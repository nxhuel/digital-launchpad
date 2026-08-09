from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.database import get_db
from backend.app.core.dependencies import require_admin
from backend.app.models.models import (
    User, Project, ProjectStatus, Payment, PaymentStatus, PaymentKind,
    UserRole, DigitalCard
)
from backend.app.schemas.schemas import AdminStats, ProjectOut, CardOut

router = APIRouter(prefix="/admin/stats", tags=["stats"])


@router.get("", response_model=AdminStats)
def get_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    from backend.app.routers.projects import _get_next_due_date
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_end = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)

    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(
        Project.status.in_([ProjectStatus.desarrollo, ProjectStatus.aceptado])
    ).count()
    total_clients = db.query(User).filter(User.role == UserRole.client).count()

    # Income: project payments from COMPLETED projects + maintenance payments
    # confirmed in this month
    project_income = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .join(Project)
        .filter(
            Payment.status == PaymentStatus.confirmado,
            Payment.paid_at >= month_start,
            Payment.paid_at < month_end,
            Payment.kind == PaymentKind.project,
            Project.status == ProjectStatus.completado,
        )
        .scalar()
        or 0
    )
    maintenance_income = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.status == PaymentStatus.confirmado,
            Payment.paid_at >= month_start,
            Payment.paid_at < month_end,
            Payment.kind == PaymentKind.maintenance,
        )
        .scalar()
        or 0
    )
    monthly_income = project_income + maintenance_income

    pending_payments = (
        db.query(Payment)
        .filter(Payment.status == PaymentStatus.pendiente)
        .count()
    )

    recent = (
        db.query(Project)
        .order_by(Project.updated_at.desc())
        .limit(10)
        .all()
    )
    recent_out = []
    for p in recent:
        po = ProjectOut.model_validate(p)
        po.next_due_date = _get_next_due_date(p, db)
        recent_out.append(po)

    from backend.app.models.models import Service
    income_by_svc_rows = (
        db.query(Service.name, func.coalesce(func.sum(Payment.amount), 0))
        .join(Project, Project.service_id == Service.id)
        .join(Payment, Payment.project_id == Project.id)
        .filter(Payment.status == PaymentStatus.confirmado)
        .group_by(Service.id)
        .all()
    )
    income_by_service = [{"service_name": r[0], "income": r[1]} for r in income_by_svc_rows]

    # Cards stats: "en producción" = sin link de entrega cargado todavía
    pending_cards = db.query(DigitalCard).filter(DigitalCard.link_entrega.is_(None)).count()
    recent_cards_rows = (
        db.query(DigitalCard)
        .order_by(DigitalCard.updated_at.desc())
        .limit(5)
        .all()
    )
    recent_cards = [CardOut.model_validate(c) for c in recent_cards_rows]

    return AdminStats(
        total_projects=total_projects,
        active_projects=active_projects,
        total_clients=total_clients,
        monthly_income=monthly_income,
        pending_payments=pending_payments,
        recent_projects=recent_out,
        income_by_service=income_by_service,
        pending_cards=pending_cards,
        recent_cards=recent_cards,
    )
