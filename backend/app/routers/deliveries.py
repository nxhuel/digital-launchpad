from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, require_admin, check_project_ownership
from backend.app.models.models import Project, DeliveryRecord, User, Notification, NotificationKind, Attachment, AttachmentOwnerType
from backend.app.schemas.schemas import DeliveryCreate, DeliveryUpdate, DeliveryOut

router = APIRouter(prefix="/projects/{project_id}/deliveries", tags=["deliveries"])


@router.get("", response_model=List[DeliveryOut])
def list_deliveries(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    return (
        db.query(DeliveryRecord)
        .filter(DeliveryRecord.project_id == project_id)
        .order_by(DeliveryRecord.created_at.desc())
        .all()
    )


@router.post("", response_model=DeliveryOut, status_code=status.HTTP_201_CREATED)
def create_delivery(project_id: int, body: DeliveryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    delivery = DeliveryRecord(project_id=project_id, note=body.note, link=body.link)
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    # Attach files if provided
    if body.attachment_ids:
        attachments = db.query(Attachment).filter(
            Attachment.id.in_(body.attachment_ids),
            Attachment.owner_type == AttachmentOwnerType.delivery.value,
        ).all()
        for att in attachments:
            att.owner_id = delivery.id
        db.commit()
    notif = Notification(
        user_id=project.client_id,
        kind=NotificationKind.delivery_added,
        title="Nueva entrega",
        body=f"Hay una nueva entrega en '{project.title}'",
        link=f"/projects/{project_id}",
    )
    db.add(notif)
    db.commit()
    return delivery


@router.put("/{delivery_id}", response_model=DeliveryOut)
def update_delivery(project_id: int, delivery_id: int, body: DeliveryUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    delivery = db.query(DeliveryRecord).filter(DeliveryRecord.id == delivery_id, DeliveryRecord.project_id == project_id).first()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrega no encontrada")
    if body.note is not None:
        delivery.note = body.note
    if body.link is not None:
        delivery.link = body.link
    from datetime import datetime, timezone
    delivery.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(delivery)
    project = delivery.project
    notif = Notification(
        user_id=project.client_id,
        kind=NotificationKind.delivery_added,
        title="Entrega actualizada",
        body=f"Se actualizó una entrega en '{project.title}'",
        link=f"/projects/{project_id}",
    )
    db.add(notif)
    db.commit()
    return delivery
