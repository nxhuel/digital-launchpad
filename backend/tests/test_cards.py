API = "/api"


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


def _create_card(client, token):
    resp = client.post(
        f"{API}/cards",
        json={
            "title": "Casamiento de Ana y Luis",
            "event_type": "casamiento",
            "event_date": "2026-12-01",
            "chosen_design": "julietarisso-casamiento",
            "description": "Colores pastel, música de los 80",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    return resp.json()


def test_create_card(client, admin_token):
    client_token = _create_client_and_token(client)
    card = _create_card(client, client_token)
    assert card["status"] == "pendiente"
    assert card["title"] == "Casamiento de Ana y Luis"
    assert card["event_type"] == "casamiento"


def test_upload_image_to_card_chat(client, admin_token):
    client_token = _create_client_and_token(client)
    card = _create_card(client, client_token)

    # Real JPEG magic bytes so the server detects image/jpeg
    jpg = b"\xff\xd8\xff\xe0" + b"\x00\x10JFIF\x00\x01" + b"\x00" * 64
    resp = client.post(
        f"{API}/cards/{card['id']}/messages/upload",
        files={"file": ("foto.jpg", jpg, "image/jpeg")},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 201
    msg = resp.json()
    assert len(msg["attachments"]) == 1
    assert msg["attachments"][0]["mime"] == "image/jpeg"
    assert msg["attachments"][0]["filename"] == "foto.jpg"

    # Visible in the chat for the client and for the admin
    resp = client.get(
        f"{API}/cards/{card['id']}/messages",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert len(resp.json()[0]["attachments"]) == 1

    resp = client.get(
        f"{API}/cards/{card['id']}/messages",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert len(resp.json()[0]["attachments"]) == 1


def test_upload_rejects_invalid_file(client, admin_token):
    client_token = _create_client_and_token(client)
    card = _create_card(client, client_token)

    resp = client.post(
        f"{API}/cards/{card['id']}/messages/upload",
        files={"file": ("malo.exe", b"MZ\x90\x00" * 100, "application/octet-stream")},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 400


def test_admin_delivery_auto_status_and_notification(client, admin_token):
    client_token = _create_client_and_token(client)
    card = _create_card(client, client_token)

    resp = client.patch(
        f"{API}/cards/{card['id']}",
        json={"link_entrega": "https://mi-tarjeta.lovable.app"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "entregada"

    # The client received the "tu tarjeta está lista" notification
    resp = client.get(
        f"{API}/notifications",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 200
    titles = [n["title"] for n in resp.json()]
    assert any("lista" in t.lower() for t in titles)


def test_client_cannot_set_delivery_link(client, admin_token):
    client_token = _create_client_and_token(client)
    card = _create_card(client, client_token)

    resp = client.patch(
        f"{API}/cards/{card['id']}",
        json={"link_entrega": "https://nope.lovable.app"},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 403
