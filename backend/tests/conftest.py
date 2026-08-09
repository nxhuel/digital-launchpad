import os
os.environ["TESTING"] = "1"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.database import Base, get_db
from backend.app.core.security import hash_password
from backend.app.models.models import User, UserRole
from backend.app.main import app
from backend.app.routers import auth as auth_module

TEST_DATABASE_URL = "sqlite:///./test_clik.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(monkeypatch):
    """Cliente de test con el envío de emails mockeado: captura los códigos en `client.email_codes`."""
    codes: dict[str, str] = {}

    def fake_send_code(to_email: str, code: str, name: str | None = None, purpose: str = "verification"):
        codes[to_email] = code

    monkeypatch.setattr(auth_module, "send_code_email", fake_send_code)
    c = TestClient(app)
    c.email_codes = codes  # type: ignore[attr-defined]
    return c


@pytest.fixture
def admin_token(client):
    db = TestingSessionLocal()
    admin = User(
        name="Admin",
        email="admin@test.com",
        password_hash=hash_password("admin123"),
        role=UserRole.admin,
        email_verified=True,
    )
    db.add(admin)
    db.commit()
    db.close()
    resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    return resp.json()["access_token"]


def register_and_verify(client, email: str, password: str = "Password123", name: str = "Test User") -> str:
    """Registra un usuario, verifica su email y devuelve el access token (o '' si falló el login)."""
    resp = client.post("/api/auth/register", json={"name": name, "email": email, "password": password})
    assert resp.status_code == 201, resp.text
    code = client.email_codes.get(email)  # type: ignore[attr-defined]
    assert code, f"No se capturó el código para {email}"
    resp = client.post("/api/auth/verify-email", json={"email": email, "code": code})
    assert resp.status_code == 200, resp.text
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]
