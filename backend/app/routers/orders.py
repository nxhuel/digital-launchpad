"""Flujo de autoatención de pedidos (tarjetas digitales).

- POST /public/order/upload: sube imágenes SIN autenticación (el cliente todavía no
  tiene cuenta) con rate-limit por IP. Devuelve la info del archivo para guardarla en
  localStorage hasta que el cliente se registre/inicie sesión.
- POST /orders/from-form: autenticado. Crea el proyecto + chat inicial a partir de lo
  que el cliente respondió en el formulario (y de las imágenes ya subidas).
"""
import time
from collections import defaultdict

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.core.uploads import save_upload
from backend.app.models.models import (
    Attachment,
    AttachmentOwnerType,
    Message,
    Notification,
    NotificationKind,
    Project,
    Service,
    User,
)
from backend.app.schemas.schemas import OrderProjectCreate, ProjectOut, UploadedFileOut

router = APIRouter(prefix="/orders", tags=["orders"])
public_router = APIRouter(prefix="/public", tags=["public"])

# Rate limiting simple por IP (mismo patrón que auth.py)
_attempts: dict[str, list[float]] = defaultdict(list)
RATE_WINDOW = 60
UPLOAD_LIMIT = 20


def _rate_limit(key: str, limit: int):
    now = time.time()
    _attempts[key] = [t for t in _attempts[key] if now - t < RATE_WINDOW]
    if len(_attempts[key]) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos. Intenta de nuevo en 1 minuto.",
        )
    _attempts[key].append(now)


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _first_admin(db: Session) -> User | None:
    return db.query(User).filter(User.role == "admin").order_by(User.id).first()


# ─── Upload público (pre-registro) ───────────────────────────────────────────
@public_router.post("/order/upload", response_model=UploadedFileOut)
def upload_pending_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    _rate_limit(f"order-upload:{_client_ip(request)}", limit=UPLOAD_LIMIT)
    admin = _first_admin(db)
    if admin is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Servicio no disponible")
    # save_upload guarda el archivo y devuelve el Attachment sin persistirlo
    att = save_upload(file, admin.id)
    return UploadedFileOut(url=att.url, filename=att.filename, mime=att.mime, size=att.size)


# ─── Creación del proyecto desde el formulario (post login/registro) ─────────
@router.post("/from-form", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project_from_order(
    body: OrderProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.slug == "tarjetas-digitales").first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El servicio de tarjetas digitales no está disponible",
        )

    # Validación: las imágenes deben ser subidas por el propio sistema
    for ex in body.exchanges:
        for img in ex.images:
            if not img.url.startswith("/uploads/"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="URL de imagen inválida",
                )

    title = body.title.strip() or (body.design_name.strip() or "Nuevo pedido")[:255]

    parts = [body.description.strip()]
    if body.design_name.strip():
        parts.append(f"Plantilla de referencia: {body.design_name.strip()}")
    if body.references.strip():
        parts.append(f"Referencias:\n{body.references.strip()}")
    description = "\n\n".join(p for p in parts if p)[:10000]

    project = Project(
        client_id=current_user.id,
        service_id=service.id,
        title=title,
        description=description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Chat inicial: el equipo pregunta (como admin) y el cliente responde
    admin = _first_admin(db)
    team_sender = admin.id if admin else current_user.id
    for ex in body.exchanges:
        question = ex.question.strip()
        if question:
            db.add(Message(project_id=project.id, sender_id=team_sender, body=question))
        answer = ex.answer.strip()
        if answer:
            db.add(Message(project_id=project.id, sender_id=current_user.id, body=answer))
        for img in ex.images:
            msg = Message(
                project_id=project.id,
                sender_id=current_user.id,
                body=img.filename or "Imagen adjuntada",
            )
            db.add(msg)
            db.flush()
            db.add(
                Attachment(
                    owner_type=AttachmentOwnerType.message,
                    owner_id=msg.id,
                    filename=img.filename or "imagen",
                    mime=img.mime or "image/jpeg",
                    size=img.size or 0,
                    url=img.url,
                    uploaded_by=current_user.id,
                )
            )
    db.commit()

    # Notificaciones (cliente + admins)
    notif = Notification(
        user_id=current_user.id,
        kind=NotificationKind.project_created,
        title="Pedido creado",
        body=f"Tu pedido '{project.title}' se creó. Arrancamos con esto.",
        link=f"/projects/{project.id}",
    )
    db.add(notif)
    for admin_user in db.query(User).filter(User.role == "admin").all():
        db.add(
            Notification(
                user_id=admin_user.id,
                kind=NotificationKind.project_created,
                title="Nuevo pedido de tarjeta digital",
                body=f"{current_user.name} envió '{project.title}'",
                link=f"/projects/{project.id}",
            )
        )
    db.commit()

    return ProjectOut.model_validate(project)
