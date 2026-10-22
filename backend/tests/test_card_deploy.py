"""Tests de despliegue de tarjetas estáticas vía .ZIP (ABM + serving)."""
import io
import os
import zipfile

import pytest

from backend.app.routers import card_deploy
from backend.tests.conftest import register_and_verify


def make_zip(files: dict[str, bytes | str]) -> io.BytesIO:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, content in files.items():
            data = content.encode() if isinstance(content, str) else content
            zf.writestr(name, data)
    buf.seek(0)
    return buf


BASIC_FILES = {
    "index.html": "<html><body>Hola</body></html>",
    "styles.css": "body { color: red; }",
    "script.js": "console.log('hola')",
    "assets/foto.png": b"\x89PNG\r\n\x1a\n",
}


@pytest.fixture
def deploy_dir(tmp_path, monkeypatch):
    path = tmp_path / "cards"
    path.mkdir()
    monkeypatch.setattr(card_deploy, "DEPLOY_DIR", str(path))
    return path


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def upload(client, token, filename="cliente123.zip", files=None, **data):
    buf = make_zip(files or BASIC_FILES)
    return client.post(
        "/api/admin/deployed-cards/upload",
        files={"file": (filename, buf, "application/zip")},
        data=data,
        headers=auth_headers(token),
    )


def test_upload_and_serve(client, admin_token, deploy_dir):
    resp = upload(client, admin_token, slug="cliente123", title="Boda Juli")
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["slug"] == "cliente123"
    assert body["title"] == "Boda Juli"
    assert body["url"] == "/tarjetas-digitales/cliente123"
    assert os.path.isfile(deploy_dir / "cliente123" / "index.html")

    index = client.get("/tarjetas-digitales/cliente123/", follow_redirects=False)
    # Sin trailing slash se redirige a la URL canónica (para que las
    # referencias relativas resuelvan dentro de la carpeta de la tarjeta)
    bare = client.get("/tarjetas-digitales/cliente123", follow_redirects=False)
    assert bare.status_code == 307
    assert bare.headers["location"] == "/tarjetas-digitales/cliente123/"

    index = client.get("/tarjetas-digitales/cliente123/")
    assert index.status_code == 200
    assert "Hola" in index.text
    assert "text/html" in index.headers["content-type"]

    css = client.get("/tarjetas-digitales/cliente123/styles.css")
    assert css.status_code == 200
    assert "text/css" in css.headers["content-type"]

    assert client.get("/tarjetas-digitales/cliente123/noexiste.css").status_code == 404
    assert client.get("/tarjetas-digitales/noexiste").status_code == 404


def test_upload_slug_defaults_to_zip_name(client, admin_token, deploy_dir):
    resp = upload(client, admin_token, filename="Cliente 123.zip")
    assert resp.status_code == 201, resp.text
    assert resp.json()["slug"] == "cliente-123"


def test_upload_requires_index_html(client, admin_token, deploy_dir):
    resp = upload(client, admin_token, slug="sinindex", files={"styles.css": "x"})
    assert resp.status_code == 422
    assert "index.html" in resp.json()["detail"]


def test_upload_rejects_bad_slug(client, admin_token, deploy_dir):
    resp = upload(client, admin_token, slug="Cliente 123!")
    assert resp.status_code == 422


def test_upload_rejects_non_zip(client, admin_token, deploy_dir):
    resp = client.post(
        "/api/admin/deployed-cards/upload",
        files={"file": ("hola.txt", io.BytesIO(b"hola"), "text/plain")},
        data={"slug": "hola"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 422


def test_upload_rejects_zip_slip(client, admin_token, deploy_dir):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("index.html", "<html></html>")
        zf.writestr("../../evil.txt", "evil")
    buf.seek(0)
    resp = client.post(
        "/api/admin/deployed-cards/upload",
        files={"file": ("evil.zip", buf, "application/zip")},
        data={"slug": "evil"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 422
    assert not os.path.exists(deploy_dir / "evil.txt")


def test_upload_duplicate_slug(client, admin_token, deploy_dir):
    assert upload(client, admin_token, slug="dupli").status_code == 201
    resp = upload(client, admin_token, slug="dupli")
    assert resp.status_code == 400


def test_rename_changes_url(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="viejo").json()["id"]
    resp = client.post(
        f"/api/admin/deployed-cards/{card_id}/rename",
        json={"slug": "nuevo"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["url"] == "/tarjetas-digitales/nuevo"
    assert client.get("/tarjetas-digitales/viejo/").status_code == 404
    assert client.get("/tarjetas-digitales/nuevo/").status_code == 200
    assert not os.path.exists(deploy_dir / "viejo")


def test_rename_conflict(client, admin_token, deploy_dir):
    upload(client, admin_token, slug="uno")
    dos_id = upload(client, admin_token, slug="dos").json()["id"]
    resp = client.post(
        f"/api/admin/deployed-cards/{dos_id}/rename",
        json={"slug": "uno"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 400


def test_redeploy_replaces_files(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="cambio").json()["id"]
    buf = make_zip({**BASIC_FILES, "index.html": "<html><body>Chau</body></html>"})
    resp = client.post(
        f"/api/admin/deployed-cards/{card_id}/redeploy",
        files={"file": ("nuevo.zip", buf, "application/zip")},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 200, resp.text
    assert "Chau" in client.get("/tarjetas-digitales/cambio/").text


def test_update_title(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="tit", title="Viejo").json()["id"]
    resp = client.patch(
        f"/api/admin/deployed-cards/{card_id}",
        json={"title": "Nuevo"},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Nuevo"


def test_list_cards(client, admin_token, deploy_dir):
    upload(client, admin_token, slug="a1")
    upload(client, admin_token, slug="a2")
    resp = client.get("/api/admin/deployed-cards", headers=auth_headers(admin_token))
    assert resp.status_code == 200
    slugs = {c["slug"] for c in resp.json()}
    assert {"a1", "a2"} <= slugs
    assert all(c["size_bytes"] > 0 for c in resp.json())


def test_delete_removes_files(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="borrar").json()["id"]
    resp = client.delete(
        f"/api/admin/deployed-cards/{card_id}", headers=auth_headers(admin_token)
    )
    assert resp.status_code == 204
    assert not os.path.exists(deploy_dir / "borrar")
    assert client.get("/tarjetas-digitales/borrar/").status_code == 404


def test_client_cannot_manage(client, deploy_dir):
    token = register_and_verify(client, "cli@test.com")
    headers = auth_headers(token)
    buf = make_zip(BASIC_FILES)
    resp = client.post(
        "/api/admin/deployed-cards/upload",
        files={"file": ("x.zip", buf, "application/zip")},
        data={"slug": "x"},
        headers=headers,
    )
    assert resp.status_code == 403
    assert client.get("/api/admin/deployed-cards", headers=headers).status_code == 403


def test_upload_stores_selected_features(client, admin_token, deploy_dir):
    resp = upload(client, admin_token, slug="solo-menu", features="menu")
    assert resp.status_code == 201, resp.text
    assert resp.json()["features"] == ["menu"]
    cfg = client.get("/api/public/tarjetas/solo-menu/config").json()
    assert cfg["features"] == ["menu"]


def test_upload_without_features_enables_all(client, admin_token, deploy_dir):
    # Compatibilidad: los llamados viejos siguen con todas las secciones
    body = upload(client, admin_token, slug="todas").json()
    assert body["features"] == ["rsvp", "menu", "canciones", "mensajes", "album"]


def test_legacy_card_without_features_keeps_old_sections(client, admin_token, deploy_dir):
    # Tarjetas viejas (config sin "features") no deberían ganar canciones ni
    # mensajes que su ZIP no implementa.
    from backend.app.models.models import DeployedCard
    from backend.tests.conftest import TestingSessionLocal

    card_id = upload(client, admin_token, slug="vieja").json()["id"]
    db = TestingSessionLocal()
    card = db.query(DeployedCard).filter(DeployedCard.id == card_id).first()
    card.config = {}
    db.commit()
    db.close()

    cfg = client.get("/api/public/tarjetas/vieja/config").json()
    assert cfg["features"] == ["rsvp", "album", "menu"]


def test_upload_with_empty_features_disables_all(client, admin_token, deploy_dir):
    body = upload(client, admin_token, slug="ninguna", features="").json()
    assert body["features"] == []


def test_admin_updates_features_and_unknown_are_ignored(client, admin_token, deploy_dir):
    card_id = upload(client, admin_token, slug="cambia", features="rsvp").json()["id"]
    resp = client.patch(
        f"/api/admin/deployed-cards/{card_id}/config",
        json={"features": ["album", "otra", "album"]},
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["features"] == ["album"]
    listed = client.get("/api/admin/deployed-cards", headers=auth_headers(admin_token)).json()
    assert next(c for c in listed if c["id"] == card_id)["features"] == ["album"]


def test_client_owner_cannot_change_features(client, admin_token, deploy_dir):
    email = "solo-admin@test.com"
    token = register_and_verify(client, email)
    users = client.get(
        "/api/admin/users?search=solo-admin", headers=auth_headers(admin_token)
    ).json()
    owner_id = [u for u in users if u["email"] == email][0]["id"]
    card_id = upload(client, admin_token, slug="ajustes", features="rsvp").json()["id"]
    client.patch(
        f"/api/admin/deployed-cards/{card_id}/owner",
        json={"client_id": owner_id},
        headers=auth_headers(admin_token),
    )
    resp = client.patch(
        f"/api/my-cards/{card_id}/config",
        json={"features": ["rsvp", "menu"]},
        headers=auth_headers(token),
    )
    assert resp.status_code == 403


def test_anonymous_cannot_manage(client, deploy_dir):
    buf = make_zip(BASIC_FILES)
    resp = client.post(
        "/api/admin/deployed-cards/upload",
        files={"file": ("x.zip", buf, "application/zip")},
        data={"slug": "x"},
    )
    assert resp.status_code in (401, 403)
    # El serving sí es público
    assert client.get("/tarjetas-digitales/nada/").status_code == 404
