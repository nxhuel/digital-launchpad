from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.core.uploads import save_upload
from backend.app.models.models import (
    DigitalCard, CardStatus, User, Notification, NotificationKind, CardMessage,
    AttachmentOwnerType
)
from backend.app.schemas.schemas import CardCreate, CardUpdate, CardOut, CardMessageCreate, CardMessageOut

router = APIRouter(prefix="/cards", tags=["cards"])


def _create_notification(user_id: int, kind: NotificationKind, title: str, body: str, link: Optional[str] = None, db: Optional[Session] = None):
    if db is None:
        return
    notif = Notification(user_id=user_id, kind=kind, title=title, body=body, link=link)
    db.add(notif)
    db.commit()


# ─── List ──────────────────────────────────────────────────────────────────
@router.get("", response_model=List[CardOut])
def list_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(DigitalCard)
    if current_user.role == "client":
        q = q.filter(DigitalCard.client_id == current_user.id)
    q = q.order_by(DigitalCard.updated_at.desc())
    return q.all()


# ─── Create ────────────────────────────────────────────────────────────────
@router.post("", response_model=CardOut, status_code=status.HTTP_201_CREATED)
def create_card(body: CardCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = DigitalCard(
        client_id=current_user.id,
        title=body.title,
        event_type=body.event_type,
        event_date=body.event_date,
        chosen_design=body.chosen_design,
        description=body.description,
    )
    db.add(card)
    db.commit()
    db.refresh(card)

    # Notify client
    _create_notification(
        user_id=current_user.id,
        kind=NotificationKind.card_created,
        title="Tarjeta creada",
        body=f"Tu solicitud de tarjeta '{card.title}' fue recibida. Te contactamos pronto.",
        link=f"/cards/{card.id}",
        db=db,
    )
    # Notify admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        _create_notification(
            user_id=admin.id,
            kind=NotificationKind.card_created,
            title="Nueva tarjeta digital",
            body=f"{current_user.name} solicitó una tarjeta: '{card.title}'",
            link=f"/cards/{card.id}",
            db=db,
        )
    return CardOut.model_validate(card)


# ─── Get ───────────────────────────────────────────────────────────────────
@router.get("/{card_id}", response_model=CardOut)
def get_card(card_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(DigitalCard).filter(DigitalCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    if current_user.role == "client" and card.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso")
    return CardOut.model_validate(card)


# ─── Update (admin only for status/price/link; client can update pending) ──
@router.patch("/{card_id}", response_model=CardOut)
def update_card(card_id: int, body: CardUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(DigitalCard).filter(DigitalCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    if current_user.role == "client" and card.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso")

    # Only admin can change status, price, delivery link
    admin_fields = {"status", "admin_price", "link_entrega"}
    if current_user.role != "admin":
        for field in admin_fields:
            if getattr(body, field, None) is not None:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Solo admin puede cambiar '{field}'")

    prev_status = card.status
    prev_link = card.link_entrega
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(card, key, value)
    card.updated_at = datetime.now(timezone.utc)

    # Auto-entrega "tikitaka": al cargar el link de la tarjeta terminada,
    # la tarjeta pasa sola a "entregada" (si aún estaba pendiente/en proceso).
    # No se fuerza si el admin ya setea un estado explícito en el mismo PATCH.
    auto_delivered = False
    if (
        current_user.role == "admin"
        and body.link_entrega
        and body.link_entrega != prev_link
        and body.status is None
    ):
        if card.status in (CardStatus.pendiente, CardStatus.en_proceso):
            card.status = CardStatus.entregada
            auto_delivered = True

    db.commit()
    db.refresh(card)

    # Aviso automático (solo cuando la tarjeta pasa a entregada, sin duplicados)
    if auto_delivered:
        _create_notification(
            user_id=card.client_id,
            kind=NotificationKind.card_status_changed,
            title="Tu tarjeta está lista 🎉",
            body=f"'{card.title}' ya está lista. Entrá y mirala con la vista previa.",
            link=f"/cards/{card.id}",
            db=db,
        )

    # Notify client on status change (if admin changed it)
    if body.status and prev_status != card.status and current_user.role == "admin":
        STATUS_LABELS = {
            "pendiente": "Pendiente",
            "en_proceso": "En proceso",
            "entregada": "Entregada",
            "completada": "Completada",
            "cancelada": "Cancelada",
        }
        _create_notification(
            user_id=card.client_id,
            kind=NotificationKind.card_status_changed,
            title="Estado de tu tarjeta actualizado",
            body=f"'{card.title}' cambió a {STATUS_LABELS.get(card.status, card.status)}",
            link=f"/cards/{card.id}",
            db=db,
        )

    return CardOut.model_validate(card)


# ─── Messages ──────────────────────────────────────────────────────────────
@router.get("/{card_id}/messages", response_model=List[CardMessageOut])
def list_card_messages(card_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(DigitalCard).filter(DigitalCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    if current_user.role == "client" and card.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso")
    msgs = db.query(CardMessage).filter(CardMessage.card_id == card_id).order_by(CardMessage.created_at.asc()).all()
    return msgs


@router.post("/{card_id}/messages/upload", response_model=CardMessageOut, status_code=status.HTTP_201_CREATED)
def upload_card_message_file(card_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(DigitalCard).filter(DigitalCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    if current_user.role == "client" and card.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso")

    msg = CardMessage(card_id=card_id, sender_id=current_user.id, body="")
    db.add(msg)
    db.commit()
    db.refresh(msg)

    att = save_upload(file, current_user.id)
    att.owner_type = AttachmentOwnerType.card_message
    att.owner_id = msg.id
    db.add(att)
    db.commit()
    db.refresh(msg)

    # Avisar a la otra parte (igual que un mensaje con adjunto)
    if current_user.role == "client":
        admins = db.query(User).filter(User.role == "admin").all()
        for admin in admins:
            _create_notification(
                user_id=admin.id,
                kind=NotificationKind.new_message,
                title="Nuevo adjunto en tarjeta",
                body=f"{current_user.name} subió material a '{card.title}'",
                link=f"/cards/{card_id}",
                db=db,
            )
    else:
        _create_notification(
            user_id=card.client_id,
            kind=NotificationKind.new_message,
            title="Nuevo adjunto",
            body=f"Subimos material nuevo a tu tarjeta '{card.title}'",
            link=f"/cards/{card_id}",
            db=db,
        )
    return msg


@router.post("/{card_id}/messages", response_model=CardMessageOut, status_code=status.HTTP_201_CREATED)
def send_card_message(card_id: int, body: CardMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    card = db.query(DigitalCard).filter(DigitalCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    if current_user.role == "client" and card.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin acceso")

    msg = CardMessage(card_id=card_id, sender_id=current_user.id, body=body.body)
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Notify the other party
    notify_user_id = card.client_id if current_user.role == "admin" else None
    if current_user.role == "client":
        admins = db.query(User).filter(User.role == "admin").all()
        for admin in admins:
            _create_notification(
                user_id=admin.id,
                kind=NotificationKind.new_message,
                title="Nuevo mensaje en tarjeta",
                body=f"{current_user.name} escribió en '{card.title}'",
                link=f"/cards/{card_id}",
                db=db,
            )
    elif notify_user_id:
        _create_notification(
            user_id=notify_user_id,
            kind=NotificationKind.new_message,
            title="Nuevo mensaje",
            body=f"Recibiste un mensaje sobre tu tarjeta '{card.title}'",
            link=f"/cards/{card_id}",
            db=db,
        )

    return msg
