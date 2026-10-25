"""Tests de tarjetas dinámicas: config pública, respuestas, CSV, dueño y mi-tarjeta."""
import io
import zipfile

from backend.app.routers import card_deploy
from backend.tests.conftest import register_and_verify
from backend.tests.test_card_deploy import auth_headers, deploy_dir, make_zip, upload, BASIC_FILES  # noqa: F401


def _submit(client, slug, payload):
    return client.post(f"/api/public/tarjetas/{slug}/respuestas", json=payload)


def test_public_config(client, admin_token, deploy_dir):
    upload(client, admin_token, slug="boda", title="Boda")
    resp = client.get("/api/public/tarjetas/boda/config")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["slug"] == "boda"
    assert body["menu_options"] == []
    assert body["submissions_open"] is True
    assert client.get("/api/public/tarjetas/noexiste/config").status_code == 404


def test_submit_rsvp_and_list(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    resp = _submit(client, "boda", {
        "kind": "rsvp", "nombre": "Juan Pérez", "asisten": True,
        "cantidad": 2, "menu": "Veggie", "cancion": "La Bamba",
    })
    assert resp.status_code == 201, resp.text
    assert resp.json()["ok"] is True

    headers = auth_headers(admin_token)
    listed = client.get(f"/api/admin/deployed-cards/{card_id}/respuestas", headers=headers)
    assert listed.status_code == 200
    rows = listed.json()
    assert len(rows) == 1
    assert rows[0]["kind"] == "rsvp"
    assert rows[0]["payload"]["nombre"] == "Juan Pérez"
    assert rows[0]["payload"]["menu"] == "Veggie"

    # Sin dueño asignado, la notificación llega a los admins.
    notifs = client.get("/api/notifications", headers=headers).json()
    assert any(n["kind"] == "card_submission" for n in notifs)
    assert any("Juan Pérez" in n["body"] for n in notifs)


def test_submit_rsvp_with_companion_details(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    resp = _submit(client, "boda", {
        "kind": "rsvp",
        "nombre": "Juan Pérez",
        "asisten": True,
        "menu": "Normal",
        # Aunque una tarjeta vieja mande un total equivocado, con detalle
        # individual la lista de acompañantes es la fuente de verdad.
        "cantidad": 5,
        "acompañantes": [
            {"nombre": "Ana Pérez", "asisten": True, "menu": "Veggie"},
            {"nombre": "Luis Pérez", "asisten": False},
            {"nombre": "Sofía Pérez", "asisten": None, "menu": "Celíaco"},
        ],
        "cancion": "La Bamba",
        "mensaje": "¡Felicitaciones!",
    })
    assert resp.status_code == 201, resp.text

    headers = auth_headers(admin_token)
    rows = client.get(
        f"/api/admin/deployed-cards/{card_id}/respuestas", headers=headers
    ).json()
    payload = rows[0]["payload"]
    assert payload["cantidad"] == 3
    assert len(payload["acompañantes"]) == 3
    assert payload["acompañantes"][0]["nombre"] == "Ana Pérez"
    assert payload["acompañantes"][0]["menu"] == "Veggie"
    assert payload["acompañantes"][1]["asisten"] is False
    assert payload["acompañantes"][2]["asisten"] is None

    # La notificación cuenta personas reales, no el `cantidad` viejo.
    notifs = client.get("/api/notifications", headers=headers).json()
    assert any("por 4 personas" in n["body"] for n in notifs)


def test_legacy_message_companions_feed_notification_and_csv(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="legacy").json()["id"]
    resp = _submit(client, "legacy", {
        "kind": "rsvp",
        "nombre": "Nahuel",
        "asisten": True,
        # Tarjeta vieja: `cantidad` era el total de asistentes (principal
        # incluido) y el detalle viajaba dentro de `mensaje`.
        "cantidad": 2,
        "mensaje": (
            "Restricción alimentaria: sin sal\n"
            "Invitado 1: Ana Pérez — No asiste\n"
            "Invitado 2: Luis Pérez — Sí, asiste"
        ),
    })
    assert resp.status_code == 201, resp.text

    headers = auth_headers(admin_token)
    notifs = client.get("/api/notifications", headers=headers).json()
    body = next(n["body"] for n in notifs if "Nahuel" in n["body"])
    # El grupo tiene 3 personas; no 1 + el `cantidad` viejo (que ya incluía
    # al principal y solo contaba asistentes).
    assert "por 3 personas" in body

    csv_resp = client.get(
        f"/api/admin/deployed-cards/{card_id}/respuestas.csv", headers=headers
    )
    assert csv_resp.status_code == 200
    text = csv_resp.text
    assert "Acompañante 1 · Nombre" in text
    assert "Ana Pérez" in text
    assert "Luis Pérez" in text


def test_legacy_solo_attendee_is_not_double_counted(client, admin_token, deploy_dir):
    upload(client, admin_token, slug="solo")
    resp = _submit(client, "solo", {
        "kind": "rsvp", "nombre": "Ana", "asisten": True, "cantidad": 1,
    })
    assert resp.status_code == 201, resp.text

    headers = auth_headers(admin_token)
    notifs = client.get("/api/notifications", headers=headers).json()
    body = next(n["body"] for n in notifs if "Ana" in n["body"])
    assert "por 2 personas" not in body


def test_export_csv_flattens_companions(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    _submit(client, "boda", {
        "kind": "rsvp",
        "nombre": "Juan Pérez",
        "asisten": True,
        "acompañantes": [
            {"nombre": "Ana Pérez", "asisten": True, "menu": "Veggie"},
            {"nombre": "Luis Pérez", "asisten": False},
        ],
    })
    headers = auth_headers(admin_token)
    resp = client.get(
        f"/api/admin/deployed-cards/{card_id}/respuestas.csv", headers=headers
    )
    assert resp.status_code == 200
    text = resp.text
    assert "Acompañante 1 · Nombre" in text
    assert "Acompañante 1 · Menú" in text
    assert "Ana Pérez" in text
    assert "Veggie" in text


def test_submit_validations(client, admin_token, deploy_dir):
    upload(client, admin_token, slug="boda")
    # kind inválido
    assert _submit(client, "boda", {"kind": "hack"}).status_code == 422
    # rsvp sin nombre
    assert _submit(client, "boda", {"kind": "rsvp", "asisten": True}).status_code == 422
    # tarjeta inexistente
    assert _submit(client, "noexiste", {"kind": "rsvp", "nombre": "X"}).status_code == 404


def test_submit_closed_card(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    headers = auth_headers(admin_token)
    resp = client.patch(
        f"/api/admin/deployed-cards/{card_id}/config",
        json={"submissions_open": False},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["submissions_open"] is False
    assert _submit(client, "boda", {"kind": "rsvp", "nombre": "X"}).status_code == 400
    cfg = client.get("/api/public/tarjetas/boda/config").json()
    assert cfg["submissions_open"] is False


def test_admin_config_menu_options(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    headers = auth_headers(admin_token)
    resp = client.patch(
        f"/api/admin/deployed-cards/{card_id}/config",
        json={"menu_options": ["Normal", "Veggie", "Celíaco"]},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["menu_options"] == ["Normal", "Veggie", "Celíaco"]
    cfg = client.get("/api/public/tarjetas/boda/config").json()
    assert cfg["menu_options"] == ["Normal", "Veggie", "Celíaco"]


def test_export_csv(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    _submit(client, "boda", {"kind": "rsvp", "nombre": "Ana", "menu": "Normal"})
    _submit(client, "boda", {"kind": "cancion", "nombre": "Ana", "cancion": "X"})
    headers = auth_headers(admin_token)
    resp = client.get(f"/api/admin/deployed-cards/{card_id}/respuestas.csv", headers=headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    text = resp.text
    # El export respeta las columnas del panel (con tildes y BOM UTF-8).
    assert text.startswith("\ufeff")
    assert "Invitado" in text and "Ana" in text
    # filtro por kind
    only = client.get(
        f"/api/admin/deployed-cards/{card_id}/respuestas.csv?kind=cancion", headers=headers
    )
    assert "Canción" in only.text


def test_delete_response(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    sub_id = _submit(client, "boda", {"kind": "rsvp", "nombre": "Borrar"}).json()["id"]
    headers = auth_headers(admin_token)
    assert client.delete(
        f"/api/admin/deployed-cards/{card_id}/respuestas/{sub_id}", headers=headers
    ).status_code == 204
    rows = client.get(f"/api/admin/deployed-cards/{card_id}/respuestas", headers=headers).json()
    assert rows == []


def test_owner_and_my_cards(client, admin_token, deploy_dir):
    client_email = "novios@test.com"
    client_token = register_and_verify(client, client_email)
    # Sin vincular: no ve nada
    mine = client.get("/api/my-cards", headers=auth_headers(client_token))
    assert mine.status_code == 200 and mine.json() == []

    # Admin vincula dueño: necesita el id del cliente
    search = client.get(
        "/api/admin/users?search=novios", headers=auth_headers(admin_token)
    ).json()
    owner_id = [u for u in search if u["email"] == client_email][0]["id"]
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    resp = client.patch(
        f"/api/admin/deployed-cards/{card_id}/owner",
        json={"client_id": owner_id},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 200
    assert resp.json()["client_id"] == owner_id

    # El cliente ve su tarjeta y sus respuestas
    mine = client.get("/api/my-cards", headers=auth_headers(client_token)).json()
    assert len(mine) == 1 and mine[0]["slug"] == "boda"
    _submit(client, "boda", {"kind": "rsvp", "nombre": "Invitado"})
    rows = client.get(
        f"/api/my-cards/{card_id}/respuestas", headers=auth_headers(client_token)
    )
    assert rows.status_code == 200 and len(rows.json()) == 1
    # El dueño recibe la novedad en su campana de notificaciones.
    notifs = client.get("/api/notifications", headers=auth_headers(client_token)).json()
    assert any(
        n["kind"] == "card_submission" and "Invitado" in n["body"] for n in notifs
    )
    csv_resp = client.get(
        f"/api/my-cards/{card_id}/respuestas.csv", headers=auth_headers(client_token)
    )
    assert csv_resp.status_code == 200 and "Invitado" in csv_resp.text


def test_client_edits_menu_but_not_open_state(client, admin_token, deploy_dir):
    client_token = register_and_verify(client, "menu@test.com")
    search = client.get("/api/admin/users?search=menu", headers=auth_headers(admin_token)).json()
    owner_id = [u for u in search if u["email"] == "menu@test.com"][0]["id"]
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    client.patch(
        f"/api/admin/deployed-cards/{card_id}/owner",
        json={"client_id": owner_id},
        headers=auth_headers(admin_token),
    )
    headers = auth_headers(client_token)
    resp = client.patch(
        f"/api/my-cards/{card_id}/config", json={"menu_options": ["Infantil"]}, headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["menu_options"] == ["Infantil"]
    # No puede abrir/cerrar respuestas
    forbidden = client.patch(
        f"/api/my-cards/{card_id}/config", json={"submissions_open": False}, headers=headers
    )
    assert forbidden.status_code == 403


def test_client_cannot_see_others_card(client, admin_token, deploy_dir):
    token_a = register_and_verify(client, "a@test.com")
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    headers = auth_headers(token_a)
    assert client.get(f"/api/my-cards/{card_id}/respuestas", headers=headers).status_code == 404
    assert client.patch(
        f"/api/my-cards/{card_id}/config", json={"menu_options": ["X"]}, headers=headers
    ).status_code == 404


def test_owner_must_be_client(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    # id 1 es el admin del fixture
    resp = client.patch(
        f"/api/admin/deployed-cards/{card_id}/owner",
        json={"client_id": 1},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 400
    resp = client.patch(
        f"/api/admin/deployed-cards/{card_id}/owner",
        json={"client_id": 999999},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 404
