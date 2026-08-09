API = "/api"


def _create_client_token(client):
    resp = client.post(f"{API}/auth/register", json={
        "name": "Client", "email": "fin@test.com", "password": "Cliente123",
    })
    assert resp.status_code == 201, resp.text
    code = client.email_codes["fin@test.com"]
    resp = client.post(f"{API}/auth/verify-email", json={"email": "fin@test.com", "code": code})
    assert resp.status_code == 200, resp.text
    resp = client.post(f"{API}/auth/login", json={
        "email": "fin@test.com", "password": "Cliente123",
    })
    return resp.json()["access_token"]


def test_finance_crud(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create income
    resp = client.post(f"{API}/finances", json={
        "date": "2026-05-15",
        "description": "inicio contable",
        "income": 0,
        "expense": None,
    }, headers=headers)
    # 0 no es un monto válido
    assert resp.status_code == 400

    resp = client.post(f"{API}/finances", json={
        "date": "2026-05-17",
        "description": "pago cliente",
        "income": 50000,
        "expense": None,
    }, headers=headers)
    assert resp.status_code == 201
    first_id = resp.json()["id"]

    resp = client.post(f"{API}/finances", json={
        "date": "2026-05-18",
        "description": "adq. de dominio",
        "income": None,
        "expense": 16900,
    }, headers=headers)
    assert resp.status_code == 201

    # List (ordered by date)
    resp = client.get(f"{API}/finances", headers=headers)
    assert resp.status_code == 200
    entries = resp.json()
    assert len(entries) == 2
    assert entries[0]["description"] == "pago cliente"
    assert entries[1]["expense"] == 16900

    # Update (solo descripción → no debe romper por validación de montos)
    resp = client.patch(f"{API}/finances/{first_id}", json={
        "description": "solo cambié el texto",
    }, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["description"] == "solo cambié el texto"
    assert resp.json()["income"] == 50000

    # Update
    resp = client.patch(f"{API}/finances/{first_id}", json={
        "description": "pago cliente (actualizado)",
        "income": 60000,
    }, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["income"] == 60000

    # Update sin monto válido
    resp = client.patch(f"{API}/finances/{first_id}", json={
        "income": None,
        "expense": None,
    }, headers=headers)
    assert resp.status_code == 400

    # Delete
    resp = client.delete(f"{API}/finances/{first_id}", headers=headers)
    assert resp.status_code == 204

    resp = client.get(f"{API}/finances", headers=headers)
    assert len(resp.json()) == 1


def test_finances_requires_admin(client, admin_token):
    client_token = _create_client_token(client)
    resp = client.get(f"{API}/finances", headers={"Authorization": f"Bearer {client_token}"})
    assert resp.status_code == 403
    resp = client.post(f"{API}/finances", json={
        "date": "2026-05-17",
        "description": "x",
        "income": 1000,
        "expense": None,
    }, headers={"Authorization": f"Bearer {client_token}"})
    assert resp.status_code == 403
