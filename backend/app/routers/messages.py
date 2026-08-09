from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, check_project_ownership
from backend.app.core.uploads import save_upload
from backend.app.models.models import Project, Message, User, Notification, NotificationKind, AttachmentOwnerType
from backend.app.schemas.schemas import MessageCreate, MessageOut

router = APIRouter(prefix="/projects/{project_id}/messages", tags=["messages"])


@router.get("", response_model=List[MessageOut])
def list_messages(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    return (
        db.query(Message)
        .filter(Message.project_id == project_id)
        .order_by(Message.created_at)
        .all()
    )


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def create_message(project_id: int, body: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)
    msg = Message(project_id=project_id, sender_id=current_user.id, body=body.body)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    # Notify project participants
    if current_user.id == project.client_id:
        admins = db.query(User).filter(User.role == "admin").all()
        for admin in admins:
            notif = Notification(
                user_id=admin.id,
                kind=NotificationKind.new_message,
                title="Nuevo mensaje",
                body=f"{current_user.name} dijo: {body.body[:100]}",
                link=f"/projects/{project_id}",
            )
            db.add(notif)
    else:
        notif = Notification(
            user_id=project.client_id,
            kind=NotificationKind.new_message,
            title="Nuevo mensaje",
            body=f"Admin dijo: {body.body[:100]}",
            link=f"/projects/{project_id}",
        )
        db.add(notif)
    db.commit()
    return msg


@router.post("/upload", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def upload_message_file(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
    check_project_ownership(project, current_user)

    msg = Message(project_id=project_id, sender_id=current_user.id, body="")
    db.add(msg)
    db.commit()
    db.refresh(msg)

    att = save_upload(file, current_user.id)
    att.owner_type = AttachmentOwnerType.message
    att.owner_id = msg.id
    db.add(att)
    db.commit()
    db.refresh(msg)
    return msg
