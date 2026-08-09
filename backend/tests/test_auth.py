API = "/api"


def _register(client, email, password="Password123", name="Test User"):
    resp = client.post(f"{API}/auth/register", json={
        "name": name, "email": email, "password": password,
    })
    assert resp.status_code == 201, resp.text
    return resp.json()


def _verify(client, email):
    code = client.email_codes[email]
    resp = client.post(f"{API}/auth/verify-email", json={"email": email, "code": code})
    assert resp.status_code == 200, resp.text
    return resp.json()


def _register_and_verify(client, email, password="Password123"):
    _register(client, email, password)
    return _verify(client, email)


def test_register(client):
    data = _register(client, "new@test.com")
    assert data["email"] == "new@test.com"
    assert data["role"] == "client"
    assert data["email_verified"] is False
    assert "password" not in data


def test_register_normalizes_email(client):
    _register(client, "Mixed@Test.COM ")
    resp = client.post(f"{API}/auth/login", json={"email": "mixed@test.com", "password": "Password123"})
    # Existe (normalizado) pero aún no está verificado
    assert resp.status_code == 403
    assert resp.json()["detail"]["code"] == "EMAIL_NOT_VERIFIED"


def test_register_short_password(client):
    resp = client.post(f"{API}/auth/register", json={
        "name": "X", "email": "short@test.com", "password": "1234567",
    })
    assert resp.status_code == 422


def test_register_password_needs_uppercase(client):
    # Sin mayúscula → 422
    resp = client.post(f"{API}/auth/register", json={
        "name": "X", "email": "lower@test.com", "password": "solominusculas123",
    })
    assert resp.status_code == 422
    assert "mayúscula" in resp.text.lower()

    # Con mayúscula y 8+ caracteres → OK
    resp = client.post(f"{API}/auth/register", json={
        "name": "X", "email": "upper@test.com", "password": "Mayuscula123",
    })
    assert resp.status_code == 201


def test_register_duplicate(client):
    _register(client, "dup@test.com")
    resp = client.post(f"{API}/auth/register", json={
        "name": "Duplicate", "email": "dup@test.com", "password": "Password123",
    })
    assert resp.status_code == 400


def test_login_blocked_until_verified(client):
    _register(client, "blocked@test.com")
    resp = client.post(f"{API}/auth/login", json={
        "email": "blocked@test.com", "password": "Password123",
    })
    assert resp.status_code == 403
    assert resp.json()["detail"]["code"] == "EMAIL_NOT_VERIFIED"
    # Sin tokens
    assert "access_token" not in resp.json()


def test_full_register_verify_login_flow(client):
    _register(client, "flow@test.com")
    tokens = _verify(client, "flow@test.com")

    resp = client.post(f"{API}/auth/login", json={
        "email": "flow@test.com", "password": "Password123",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    assert "refresh_token" in resp.json()

    me_resp = client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "flow@test.com"
    assert me_resp.json()["email_verified"] is True


def test_verify_wrong_code(client):
    _register(client, "wrong@test.com")
    resp = client.post(f"{API}/auth/verify-email", json={"email": "wrong@test.com", "code": "000000"})
    assert resp.status_code == 400
    # El login sigue bloqueado
    resp = client.post(f"{API}/auth/login", json={"email": "wrong@test.com", "password": "Password123"})
    assert resp.status_code == 403


def test_resend_verification(client):
    _register(client, "resend@test.com")
    first_code = client.email_codes["resend@test.com"]
    resp = client.post(f"{API}/auth/resend-verification", json={"email": "resend@test.com"})
    assert resp.status_code == 200
    new_code = client.email_codes["resend@test.com"]
    assert new_code != first_code
    # El primer código ya no sirve, el nuevo sí
    resp = client.post(f"{API}/auth/verify-email", json={"email": "resend@test.com", "code": first_code})
    assert resp.status_code == 400
    resp = client.post(f"{API}/auth/verify-email", json={"email": "resend@test.com", "code": new_code})
    assert resp.status_code == 200


def test_forgot_password_does_not_leak_email(client):
    # Email inexistente → 200 con mensaje genérico
    resp = client.post(f"{API}/auth/forgot-password", json={"email": "nobody@test.com"})
    assert resp.status_code == 200
    msg_inexistente = resp.json()["message"]

    # Email existente → respuesta idéntica (no revela si existe)
    _register(client, "exists@test.com")
    _verify(client, "exists@test.com")
    resp = client.post(f"{API}/auth/forgot-password", json={"email": "exists@test.com"})
    assert resp.status_code == 200
    assert resp.json()["message"] == msg_inexistente


def test_forgot_and_reset_password(client):
    _register(client, "reset@test.com")
    _verify(client, "reset@test.com")

    # Usuario con sesión activa
    resp = client.post(f"{API}/auth/login", json={"email": "reset@test.com", "password": "Password123"})
    old_tokens = resp.json()

    resp = client.post(f"{API}/auth/forgot-password", json={"email": "reset@test.com"})
    assert resp.status_code == 200
    code = client.email_codes["reset@test.com"]

    resp = client.post(f"{API}/auth/reset-password", json={
        "email": "reset@test.com", "code": code, "new_password": "NuevaPass123",
    })
    assert resp.status_code == 200
    new_tokens = resp.json()
    assert "access_token" in new_tokens

    # La contraseña vieja ya no funciona
    resp = client.post(f"{API}/auth/login", json={"email": "reset@test.com", "password": "Password123"})
    assert resp.status_code == 401

    # La nueva funciona
    resp = client.post(f"{API}/auth/login", json={"email": "reset@test.com", "password": "NuevaPass123"})
    assert resp.status_code == 200

    # Las sesiones anteriores quedaron invalidadas
    resp = client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {old_tokens['access_token']}"})
    assert resp.status_code == 401
    resp = client.post(f"{API}/auth/refresh", json={"refresh_token": old_tokens["refresh_token"]})
    assert resp.status_code == 401


def test_reset_wrong_code(client):
    _register(client, "resetwrong@test.com")
    _verify(client, "resetwrong@test.com")
    client.post(f"{API}/auth/forgot-password", json={"email": "resetwrong@test.com"})
    resp = client.post(f"{API}/auth/reset-password", json={
        "email": "resetwrong@test.com", "code": "999999", "new_password": "NuevaPass123",
    })
    assert resp.status_code == 400


def test_login_invalid(client):
    resp = client.post(f"{API}/auth/login", json={
        "email": "noexists@test.com", "password": "wrong",
    })
    assert resp.status_code == 401


def test_me(client):
    tokens = _register_and_verify(client, "me@test.com")
    me_resp = client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "me@test.com"


def test_me_unauthorized(client):
    resp = client.get(f"{API}/auth/me")
    assert resp.status_code in (401, 403)


def test_refresh(client):
    tokens = _register_and_verify(client, "refresh@test.com")
    resp = client.post(f"{API}/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 200
    assert "access_token" in resp.json()
