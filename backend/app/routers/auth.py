import hmac
import os
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.email import send_code_email
from backend.app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_code,
    hash_code,
)
from backend.app.core.dependencies import get_current_user
from backend.app.models.models import (
    User,
    Notification,
    NotificationKind,
    AuthCode,
    AuthCodePurpose,
)
from backend.app.schemas.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserOut,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Rate limiting (por IP / por email) ---
_attempts: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 100 if os.getenv("TESTING") else 10
RATE_WINDOW = 60
CODE_ATTEMPTS = 5

# Hash de relleno para igualar el tiempo de respuesta cuando el email no existe (anti-enumeración)
_DUMMY_HASH = hash_password("dummy-password-for-timing")


def _rate_limit(key: str, limit: int | None = None):
    now = time.time()
    # Limpieza oportunista para que el dict no crezca sin límite en producción
    if len(_attempts) > 2000:
        for k in [k for k, v in _attempts.items() if not v or now - v[-1] > RATE_WINDOW * 10]:
            del _attempts[k]
    lim = limit or RATE_LIMIT
    _attempts[key] = [t for t in _attempts[key] if now - t < RATE_WINDOW]
    if len(_attempts[key]) >= lim:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos. Intenta de nuevo en 1 minuto.",
        )
    _attempts[key].append(now)


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _is_expired(dt: datetime) -> bool:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt < _now_utc()


# --- Códigos de verificación ---
def _invalidate_codes(db: Session, user_id: int, purpose: AuthCodePurpose):
    pending = (
        db.query(AuthCode)
        .filter(AuthCode.user_id == user_id, AuthCode.purpose == purpose, AuthCode.used == False)  # noqa: E712
        .all()
    )
    for c in pending:
        c.used = True
    db.commit()


def _save_code(db: Session, user_id: int, purpose: AuthCodePurpose, minutes: int) -> str:
    # Higiene: limpia códigos viejos del mismo usuario/propósito (usados o expirados)
    db.query(AuthCode).filter(
        AuthCode.user_id == user_id,
        AuthCode.purpose == purpose,
        (AuthCode.used == True) | (AuthCode.expires_at < _now_utc()),  # noqa: E712
    ).delete(synchronize_session=False)
    code = generate_code()
    record = AuthCode(
        user_id=user_id,
        purpose=purpose,
        code_hash=hash_code(code),
        expires_at=_now_utc() + timedelta(minutes=minutes),
    )
    db.add(record)
    db.commit()
    return code


def _latest_code(db: Session, user_id: int, purpose: AuthCodePurpose) -> AuthCode | None:
    return (
        db.query(AuthCode)
        .filter(AuthCode.user_id == user_id, AuthCode.purpose == purpose, AuthCode.used == False)  # noqa: E712
        .order_by(AuthCode.created_at.desc())
        .first()
    )


def _validate_code(db: Session, user_id: int, purpose: AuthCodePurpose, submitted: str) -> AuthCode:
    record = _latest_code(db, user_id, purpose)
    if record is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código inválido o expirado")
    if record.attempts >= CODE_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Demasiados intentos. Solicitá un código nuevo.",
        )
    if _is_expired(record.expires_at):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El código expiró. Solicitá uno nuevo.")
    if not hmac.compare_digest(hash_code(submitted), record.code_hash):
        record.attempts += 1
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código incorrecto")
    return record


def _issue_tokens(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id, user.role, user.token_version),
        refresh_token=create_refresh_token(user.id, user.role, user.token_version),
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    _rate_limit(f"register:{_client_ip(request)}")
    email = _normalize_email(body.email)

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya registrado")

    user = User(
        name=body.name.strip(),
        email=email,
        password_hash=hash_password(body.password),
        role="client",
        email_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _invalidate_codes(db, user.id, AuthCodePurpose.email_verification)
    code = _save_code(db, user.id, AuthCodePurpose.email_verification, settings.VERIFICATION_CODE_MINUTES)

    try:
        send_code_email(email, code, name=user.name, purpose="verification")
    except Exception:
        # El email no se pudo enviar: no dejamos una cuenta sin verificar a medias.
        db.query(AuthCode).filter(AuthCode.user_id == user.id).delete()
        db.delete(user)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No pudimos enviar el código de verificación. Intentá de nuevo en unos minutos.",
        )

    # Notify all admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            kind=NotificationKind.user_registered,
            title="Nuevo usuario registrado",
            body=f"{user.name} ({user.email}) se registró en la plataforma",
            link="/users",
        )
        db.add(notif)
    db.commit()
    return user


@router.post("/login", response_model=TokenResponse)
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    _rate_limit(f"login:{_client_ip(request)}")
    email = _normalize_email(body.email)

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        # Igualamos el tiempo de respuesta para no revelar si el email existe
        verify_password(body.password, _DUMMY_HASH)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not user.active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No podés ingresar en este momento")
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "EMAIL_NOT_VERIFIED", "message": "Confirmá tu correo para poder ingresar."},
        )
    return _issue_tokens(user)


@router.post("/verify-email", response_model=TokenResponse)
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    _rate_limit(f"verify:{_normalize_email(body.email)}", limit=10)
    user = db.query(User).filter(User.email == _normalize_email(body.email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código inválido o expirado")
    if user.email_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tu correo ya fue confirmado")

    _validate_code(db, user.id, AuthCodePurpose.email_verification, body.code)
    user.email_verified = True
    _invalidate_codes(db, user.id, AuthCodePurpose.email_verification)
    db.commit()
    db.refresh(user)
    return _issue_tokens(user)


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(body: ResendVerificationRequest, request: Request, db: Session = Depends(get_db)):
    email = _normalize_email(body.email)
    _rate_limit(f"resend:{email}", limit=1)
    _rate_limit(f"resend-ip:{_client_ip(request)}", limit=5)

    user = db.query(User).filter(User.email == email).first()
    if user and not user.email_verified and user.active:
        _invalidate_codes(db, user.id, AuthCodePurpose.email_verification)
        code = _save_code(db, user.id, AuthCodePurpose.email_verification, settings.VERIFICATION_CODE_MINUTES)
        try:
            send_code_email(email, code, name=user.name, purpose="verification")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="No pudimos enviar el código. Intentá de nuevo en unos minutos.",
            )
    return MessageResponse(message="Si el correo está pendiente de confirmación, enviamos un código nuevo.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    email = _normalize_email(body.email)
    _rate_limit(f"forgot:{email}", limit=1)
    _rate_limit(f"forgot-ip:{_client_ip(request)}", limit=5)

    user = db.query(User).filter(User.email == email).first()
    if user and user.active and user.email_verified:
        _invalidate_codes(db, user.id, AuthCodePurpose.password_reset)
        code = _save_code(db, user.id, AuthCodePurpose.password_reset, settings.RESET_CODE_MINUTES)
        try:
            send_code_email(email, code, name=user.name, purpose="reset")
        except Exception:
            # No revelamos si el email existe: respondemos igual.
            import logging
            logging.getLogger("auth").warning("No se pudo enviar el código de reset a %s", email)
    return MessageResponse(
        message="Si el email está registrado, te enviamos un código para restablecer tu contraseña."
    )


@router.post("/reset-password", response_model=TokenResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = _normalize_email(body.email)
    _rate_limit(f"reset:{email}", limit=10)

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.active or not user.email_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código inválido o expirado")

    _validate_code(db, user.id, AuthCodePurpose.password_reset, body.code)
    user.password_hash = hash_password(body.new_password)
    user.token_version += 1  # invalida todas las sesiones anteriores
    _invalidate_codes(db, user.id, AuthCodePurpose.password_reset)
    db.commit()
    db.refresh(user)
    return _issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido o expirado")
    user = db.query(User).filter(User.id == payload.sub, User.active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    if payload.ver != user.token_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión expirada. Ingresá de nuevo.")
    return _issue_tokens(user)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
