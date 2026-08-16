"""Preguntas configurables del formulario de pedido de tarjetas digitales.

El admin puede crear, editar, ocultar y reordenar preguntas. Las 5 por defecto tienen
roles fijos (title/description/reference/detail/images) que alimentan el autocompletado
del proyecto y el chat inicial; aunque su texto sea editable, el rol no se cambia para
no romper ese mapeo.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import SessionLocal, get_db
from backend.app.core.dependencies import require_admin
from backend.app.models.models import FormQuestion, FormQuestionFieldType, FormQuestionRole, User
from backend.app.schemas.schemas import FormQuestionCreate, FormQuestionOut, FormQuestionUpdate, ReorderRequest

router = APIRouter(prefix="/form-questions", tags=["form questions"])
public_router = APIRouter(prefix="/public", tags=["public"])

DEFAULT_QUESTIONS = [
    (FormQuestionRole.title, FormQuestionFieldType.text, "Elegí un título para etiquetar tu tarjeta digital", 1),
    (FormQuestionRole.description, FormQuestionFieldType.longtext, "Da una breve descripción de lo que esperás como resultado", 2),
    (FormQuestionRole.reference, FormQuestionFieldType.url, "¿Tenés alguna referencia web u otra tarjeta digital que te gustaría compartirnos?", 3),
    (FormQuestionRole.detail, FormQuestionFieldType.longtext, "Si es posible, explicanos de manera detallada todo lo que querés que tenga tu tarjeta digital, mientras más preciso, mejor va a ser el resultado", 4),
    (FormQuestionRole.images, FormQuestionFieldType.images, "Adjuntá las imágenes que deseas compartir", 5),
]


def seed_default_questions():
    """Siembra las 5 preguntas por defecto (idempotente) al arrancar."""
    db = SessionLocal()
    try:
        if db.query(FormQuestion).count() > 0:
            return
        for role, field_type, text, order in DEFAULT_QUESTIONS:
            db.add(FormQuestion(role=role.value, field_type=field_type.value, text=text, order=order))
        db.commit()
    finally:
        db.close()


def _get_question_or_404(db: Session, question_id: int) -> FormQuestion:
    q = db.query(FormQuestion).filter(FormQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pregunta no encontrada")
    return q


# ─── Admin ───────────────────────────────────────────────────────────────────
@router.get("", response_model=List[FormQuestionOut])
def list_questions(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(FormQuestion).order_by(FormQuestion.order, FormQuestion.id).all()


@router.post("", response_model=FormQuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(body: FormQuestionCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    q = FormQuestion(
        role=None,  # personalizada
        field_type=body.field_type,
        text=body.text.strip(),
        order=body.order,
        active=body.active,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.patch("/{question_id}", response_model=FormQuestionOut)
def update_question(
    question_id: int,
    body: FormQuestionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = _get_question_or_404(db, question_id)
    data = body.model_dump(exclude_unset=True)
    # Las preguntas con rol fijo no cambian de tipo de campo: rompería el mapeo
    if q.role is not None and "field_type" in data and data["field_type"] != q.field_type.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede cambiar el tipo de una pregunta con rol fijo",
        )
    for key, value in data.items():
        setattr(q, key, value)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Eliminación lógica (active=False): nunca se pierde el rol ni el mapeo."""
    q = _get_question_or_404(db, question_id)
    q.active = False
    db.commit()


@router.post("/reorder", response_model=List[FormQuestionOut])
def reorder_questions(body: ReorderRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    for idx, question_id in enumerate(body.order):
        q = db.query(FormQuestion).filter(FormQuestion.id == question_id).first()
        if q:
            q.order = idx
    db.commit()
    return db.query(FormQuestion).order_by(FormQuestion.order, FormQuestion.id).all()


# ─── Público (alimenta el modal de /tarjetas-digitales) ──────────────────────
@public_router.get("/form-questions", response_model=List[FormQuestionOut])
def public_questions(db: Session = Depends(get_db)):
    return (
        db.query(FormQuestion)
        .filter(FormQuestion.active == True)  # noqa: E712
        .order_by(FormQuestion.order, FormQuestion.id)
        .all()
    )
