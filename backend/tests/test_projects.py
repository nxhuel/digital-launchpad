API = "/api"


def _create_service(client, admin_token):
    resp = client.post(f"{API}/services", json={
        "name": "Test Service",
        "slug": "test-service",
        "description": "Test",
        "base_price": 100000,
        "features": ["Feature 1"],
        "icon": "Package",
        "order": 1,
        "supports_maintenance": True,
    }, headers={"Authorization": f"Bearer {admin_token}"})
    return resp.json()


def _create_client_and_token(client):
    resp = client.post(f"{API}/auth/register", json={
        "name": "Client", "email": "c@test.com", "password": "Cliente123",
    })
    assert resp.status_code == 201, resp.text
    code = client.email_codes["c@test.com"]
    resp = client.post(f"{API}/auth/verify-email", json={"email": "c@test.com", "code": code})
    assert resp.status_code == 200, resp.text
    resp = client.post(f"{API}/auth/login", json={
        "email": "c@test.com", "password": "Cliente123",
    })
    return resp.json()["access_token"]


def test_create_project(client, admin_token):
    svc = _create_service(client, admin_token)
    client_token = _create_client_and_token(client)

    resp = client.post(
        f"{API}/projects",
        json={"service_id": svc["id"], "title": "Mi Proyecto", "description": "Test"},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Mi Proyecto"
    assert data["status"] == "pendiente"


def test_list_projects(client, admin_token):
    svc = _create_service(client, admin_token)
    client_token = _create_client_and_token(client)

    client.post(
        f"{API}/projects",
        json={"service_id": svc["id"], "title": "Proyecto 1"},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    resp = client.get(
        f"{API}/projects",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_accept_project(client, admin_token):
    svc = _create_service(client, admin_token)
    client_token = _create_client_and_token(client)

    resp = client.post(
        f"{API}/projects",
        json={"service_id": svc["id"], "title": "Mi Proyecto"},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    project_id = resp.json()["id"]

    resp = client.patch(
        f"{API}/projects/{project_id}",
        json={"admin_price": 200000, "installments": 2},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200

    resp = client.post(
        f"{API}/projects/{project_id}/accept",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "aceptado"

    resp = client.get(
        f"{API}/projects/{project_id}/payments",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 200
    payments = resp.json()
    assert len(payments) == 2
    assert sum(p["amount"] for p in payments) == 200000


def test_reject_project(client, admin_token):
    svc = _create_service(client, admin_token)
    client_token = _create_client_and_token(client)

    resp = client.post(
        f"{API}/projects",
        json={"service_id": svc["id"], "title": "Mi Proyecto"},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    project_id = resp.json()["id"]

    resp = client.patch(
        f"{API}/projects/{project_id}",
        json={"admin_price": 200000},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200

    resp = client.post(
        f"{API}/projects/{project_id}/reject",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rechazado"


def test_payment_flow(client, admin_token):
    svc = _create_service(client, admin_token)
    client_token = _create_client_and_token(client)

    # Create project
    resp = client.post(
        f"{API}/projects",
        json={"service_id": svc["id"], "title": "Test Pago"},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    pid = resp.json()["id"]
    client.patch(
        f"{API}/projects/{pid}",
        json={"admin_price": 100000},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    client.post(f"{API}/projects/{pid}/accept", headers={"Authorization": f"Bearer {client_token}"})

    # List payments
    resp = client.get(f"{API}/projects/{pid}/payments", headers={"Authorization": f"Bearer {client_token}"})
    pay_id = resp.json()[0]["id"]
    assert resp.json()[0]["status"] == "pendiente"

    # Admin confirms payment
    resp = client.patch(
        f"{API}/projects/{pid}/payments/{pay_id}",
        json={"status": "confirmado"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "confirmado"
    assert resp.json()["paid_at"] is not None
