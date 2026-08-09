from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import secrets
from jose import JWTError, jwt
from pydantic import BaseModel
import bcrypt

from backend.app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def generate_code(length: int = 6) -> str:
    """Código numérico aleatorio seguro (secrets)."""
    max_val = 10 ** length
    return str(secrets.randbelow(max_val)).zfill(length)


def hash_code(code: str) -> str:
    """Hash sha256 del código (no se guarda en texto plano)."""
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


class TokenPayload(BaseModel):
    sub: int
    role: str
    ver: int = 0
    exp: datetime


def create_access_token(user_id: int, role: str, token_version: int = 0) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "ver": token_version, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: int, role: str, token_version: int = 0) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "role": role, "ver": token_version, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[TokenPayload]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return TokenPayload(
            sub=int(payload["sub"]),
            role=payload["role"],
            ver=int(payload.get("ver", 0)),
            exp=payload["exp"],
        )
    except (JWTError, KeyError, ValueError):
        return None
