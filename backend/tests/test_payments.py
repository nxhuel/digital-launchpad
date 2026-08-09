API = "/api"


def _create_service(client, admin_token):
    resp = client.post(f"{API}/services", json={
        "name": "Svc Pago",
        "slug": "svc-pago",
        "description": "Test",
        "base_price": 100000,
        "features": ["F1"],
        "icon": "Package",
        "order": 1,
        "supports_maintenance": False,
    }, headers={"Authorization": f"Bearer {admin_token}"})
    return resp.json()


def _create_client_token(client):
    resp = client.post(f"{API}/auth/register", json={
        "name": "Client", "email": "pay@test.com", "password": "Cliente123",
    })
    assert resp.status_code == 201, resp.text
    code = client.email_codes["pay@test.com"]
    resp = client.post(f"{API}/auth/verify-email", json={"email": "pay@test.com", "code": code})
    assert resp.status_code == 200, resp.text
    resp = client.post(f"{API}/auth/login", json={
        "email": "pay@test.com", "password": "Cliente123",
    })
    return resp.json()["access_token"]


def _accept_project(client, admin_token, client_token, installments=1, price=100000):
    svc = _create_service(client, admin_token)
    resp = client.post(f"{API}/projects", json={
        "service_id": svc["id"], "title": "Proy",
    }, headers={"Authorization": f"Bearer {client_token}"})
    pid = resp.json()["id"]
    client.patch(f"{API}/projects/{pid}", json={
        "admin_price": price, "installments": installments,
    }, headers={"Authorization": f"Bearer {admin_token}"})
    client.post(f"{API}/projects/{pid}/accept", headers={"Authorization": f"Bearer {client_token}"})
    return pid


def _confirm_all(client, admin_token, client_token, pid):
    payments = client.get(
        f"{API}/projects/{pid}/payments",
        headers={"Authorization": f"Bearer {client_token}"},
    ).json()
    for p in payments:
        client.patch(
            f"{API}/projects/{pid}/payments/{p['id']}",
            json={"status": "confirmado"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )


def test_no_next_due_for_single_payment(client, admin_token):
    client_token = _create_client_token(client)
    pid = _accept_project(client, admin_token, client_token, installments=1)

    # Con la única cuota pendiente no hay "próximo pago" que estimar
    resp = client.get(f"{API}/projects/{pid}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.json()["next_due_date"] is None

    # Después de confirmar el pago único, tampoco (bug original: mostraba una fecha)
    _confirm_all(client, admin_token, client_token, pid)
    resp = client.get(f"{API}/projects/{pid}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.json()["next_due_date"] is None


def test_next_due_for_installments(client, admin_token):
    client_token = _create_client_token(client)
    pid = _accept_project(client, admin_token, client_token, installments=2)

    # Con cuotas pendientes sí hay próx. pago estimado
    resp = client.get(f"{API}/projects/{pid}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.json()["next_due_date"] is not None

    # Al pagar todas las cuotas, no queda nada pendiente → None
    _confirm_all(client, admin_token, client_token, pid)
    resp = client.get(f"{API}/projects/{pid}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.json()["next_due_date"] is None


def test_confirmed_payment_auto_registers_income(client, admin_token):
    client_token = _create_client_token(client)
    pid = _accept_project(client, admin_token, client_token, installments=1, price=250000)

    payments = client.get(
        f"{API}/projects/{pid}/payments",
        headers={"Authorization": f"Bearer {client_token}"},
    ).json()
    pay_id = payments[0]["id"]

    # Confirmar el pago → se registra el ingreso en Finanzas
    client.patch(
        f"{API}/projects/{pid}/payments/{pay_id}",
        json={"status": "confirmado"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    entries = client.get(f"{API}/finances", headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert len(entries) == 1
    assert entries[0]["income"] == 250000
    assert entries[0]["expense"] is None
    assert entries[0]["description"] == "Pago — Proy"

    # Recon firmar no duplica la entrada
    client.patch(
        f"{API}/projects/{pid}/payments/{pay_id}",
        json={"status": "confirmado"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    entries = client.get(f"{API}/finances", headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert len(entries) == 1


def test_confirmed_maintenance_auto_registers_income(client, admin_token):
    client_token = _create_client_token(client)
    svc = _create_service(client, admin_token)
    resp = client.post(f"{API}/projects", json={
        "service_id": svc["id"], "title": "Proy Maint",
    }, headers={"Authorization": f"Bearer {client_token}"})
    pid = resp.json()["id"]
    client.patch(f"{API}/projects/{pid}", json={
        "admin_price": 100000, "installments": 1,
        "maintenance_enabled": True, "maintenance_monthly": 50000,
    }, headers={"Authorization": f"Bearer {admin_token}"})
    client.post(f"{API}/projects/{pid}/accept", headers={"Authorization": f"Bearer {client_token}"})

    # Pago de mantenimiento pendiente
    payments = client.get(
        f"{API}/projects/{pid}/payments",
        headers={"Authorization": f"Bearer {client_token}"},
    ).json()
    maint = next(p for p in payments if p["kind"] == "maintenance")

    client.patch(
        f"{API}/projects/{pid}/payments/{maint['id']}",
        json={"status": "confirmado"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    entries = client.get(f"{API}/finances", headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert any(e["income"] == 50000 and "Mantenimiento" in e["description"] for e in entries)


def test_reject_after_confirm_removes_income(client, admin_token):
    client_token = _create_client_token(client)
    pid = _accept_project(client, admin_token, client_token, installments=1)

    payments = client.get(
        f"{API}/projects/{pid}/payments",
        headers={"Authorization": f"Bearer {client_token}"},
    ).json()
    pay_id = payments[0]["id"]

    # Confirmar → se registra el ingreso
    client.patch(
        f"{API}/projects/{pid}/payments/{pay_id}",
        json={"status": "confirmado"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    entries = client.get(f"{API}/finances", headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert len(entries) == 1

    # Rechazar un pago ya confirmado → se anula el ingreso (sin fantasmas en el libro)
    client.patch(
        f"{API}/projects/{pid}/payments/{pay_id}",
        json={"status": "rechazado"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    entries = client.get(f"{API}/finances", headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert len(entries) == 0
