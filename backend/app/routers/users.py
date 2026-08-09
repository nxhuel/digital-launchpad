from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.dependencies import require_admin
from backend.app.models.models import User, UserRole, Project
from backend.app.schemas.schemas import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(User).filter(User.role == UserRole.client).order_by(User.created_at.desc()).all()


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


# --- Admin user endpoints (frontend calls /admin/users) ---

class AdminUserOut(UserOut):
    project_count: int = 0


@admin_router.get("/users", response_model=List[AdminUserOut])
def list_admin_users(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(User).filter(User.role == UserRole.client)
    if search:
        like = f"%{search}%"
        q = q.filter((User.name.ilike(like)) | (User.email.ilike(like)))
    users = q.order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        pc = db.query(Project).filter(Project.client_id == u.id).count()
        result.append(AdminUserOut(
            id=u.id, name=u.name, email=u.email, role=u.role,
            active=u.active, email_verified=u.email_verified, created_at=u.created_at,
            project_count=pc,
        ))
    return result


@admin_router.patch("/users/{user_id}", response_model=UserOut)
def admin_update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
