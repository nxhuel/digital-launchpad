"""Tests de fotos de invitados (Cloudinary mockeado: no toca red ni disco)."""
import base64
import io
import zipfile

import pytest

from backend.app.core.config import settings
from backend.app.routers import card_deploy
from backend.tests.conftest import register_and_verify
from backend.tests.test_card_deploy import auth_headers, deploy_dir, upload  # noqa: F401

PNG_1PX = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)


@pytest.fixture
def cloudinary_mock(monkeypatch):
    calls = {"upload": [], "destroy": []}
    monkeypatch.setattr(settings, "CLOUDINARY_CLOUD_NAME", "test-cloud")
    monkeypatch.setattr(settings, "CLOUDINARY_API_KEY", "test-key")
    monkeypatch.setattr(settings, "CLOUDINARY_API_SECRET", "test-secret")

    def fake_upload(file, **kwargs):
        content = file.read() if hasattr(file, "read") else file
        calls["upload"].append({"size": len(content), "kwargs": kwargs})
        return {
            "secure_url": "https://res.cloudinary.com/test-cloud/image/upload/foto123.jpg",
            "public_id": "clik-tarjetas/boda/foto123",
            "format": "jpg",
            "bytes": len(content),
        }

    def fake_destroy(public_id, **kwargs):
        calls["destroy"].append(public_id)
        return {"result": "ok"}

    def fake_url(public_id, **kwargs):
        return (f"https://res.cloudinary.com/test-cloud/image/upload/thumb/{public_id}.jpg", {})

    monkeypatch.setattr(card_deploy.cloudinary.uploader, "upload", fake_upload)
    monkeypatch.setattr(card_deploy.cloudinary.uploader, "destroy", fake_destroy)
    monkeypatch.setattr(card_deploy.cloudinary.utils, "cloudinary_url", fake_url)
    return calls


def _upload_photo(client, slug, content=PNG_1PX, filename="foto.png", nombre=None):
    data = {}
    if nombre:
        data["nombre"] = nombre
    files = {"file": (filename, io.BytesIO(content), "image/png")}
    return client.post(f"/api/public/tarjetas/{slug}/fotos", files=files, data=data)


def test_upload_photo_ok(client, admin_token, deploy_dir, cloudinary_mock):
    upload(client, admin_token, slug="boda")
    resp = _upload_photo(client, "boda", nombre="Ana")
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["kind"] == "foto"
    assert body["payload"]["url"].startswith("https://res.cloudinary.com/")
    assert body["payload"]["public_id"] == "clik-tarjetas/boda/foto123"
    assert body["payload"]["nombre"] == "Ana"
    assert cloudinary_mock["upload"][0]["kwargs"]["folder"] == "clik-tarjetas/boda"

    # Aparece en respuestas kind=foto
    rows = client.get(
        "/api/admin/deployed-cards/1/respuestas?kind=foto",
        headers=auth_headers(admin_token),
    ).json()
    assert len(rows) == 1


def test_upload_photo_requires_image(client, admin_token, deploy_dir, cloudinary_mock):
    upload(client, admin_token, slug="boda")
    resp = _upload_photo(client, "boda", content=b"no es imagen", filename="x.txt")
    assert resp.status_code == 422
    assert cloudinary_mock["upload"] == []


def test_upload_photo_max_size(client, admin_token, deploy_dir, cloudinary_mock, monkeypatch):
    monkeypatch.setattr(card_deploy, "MAX_PHOTO_SIZE", 10)
    upload(client, admin_token, slug="boda")
    assert _upload_photo(client, "boda").status_code == 422


def test_upload_photo_closed_card(client, admin_token, deploy_dir, cloudinary_mock):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    client.patch(
        f"/api/admin/deployed-cards/{card_id}/config",
        json={"submissions_open": False},
        headers=auth_headers(admin_token),
    )
    assert _upload_photo(client, "boda").status_code == 400


def test_upload_photo_unconfigured(client, admin_token, deploy_dir, monkeypatch):
    upload(client, admin_token, slug="boda")
    monkeypatch.setattr(settings, "CLOUDINARY_CLOUD_NAME", "")
    resp = _upload_photo(client, "boda")
    assert resp.status_code == 503


def test_delete_response_destroys_cloudinary(client, admin_token, deploy_dir, cloudinary_mock):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    sub_id = _upload_photo(client, "boda").json()["id"]
    headers = auth_headers(admin_token)
    assert client.delete(
        f"/api/admin/deployed-cards/{card_id}/respuestas/{sub_id}", headers=headers
    ).status_code == 204
    assert cloudinary_mock["destroy"] == ["clik-tarjetas/boda/foto123"]


def test_delete_card_destroys_photos(client, admin_token, deploy_dir, cloudinary_mock):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    _upload_photo(client, "boda")
    _upload_photo(client, "boda")
    headers = auth_headers(admin_token)
    assert client.delete(f"/api/admin/deployed-cards/{card_id}", headers=headers).status_code == 204
    assert cloudinary_mock["destroy"] == [
        "clik-tarjetas/boda/foto123",
        "clik-tarjetas/boda/foto123",
    ]


def test_export_photos_zip(client, admin_token, deploy_dir, cloudinary_mock, monkeypatch):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    _upload_photo(client, "boda")
    monkeypatch.setattr(card_deploy, "_download_bytes", lambda url: b"FAKEIMG")
    headers = auth_headers(admin_token)
    resp = client.get(f"/api/admin/deployed-cards/{card_id}/fotos.zip", headers=headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/zip"
    zf = zipfile.ZipFile(io.BytesIO(resp.content))
    names = zf.namelist()
    assert len(names) == 1 and names[0].startswith("foto-")
    assert zf.read(names[0]) == b"FAKEIMG"


def test_export_photos_zip_with_ids(client, admin_token, deploy_dir, cloudinary_mock, monkeypatch):
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    _upload_photo(client, "boda", nombre="Ana")
    _upload_photo(client, "boda", nombre="Beto")
    monkeypatch.setattr(card_deploy, "_download_bytes", lambda url: b"FAKEIMG")
    headers = auth_headers(admin_token)
    rows = client.get(f"/api/admin/deployed-cards/{card_id}/respuestas?kind=foto", headers=headers).json()
    assert len(rows) == 2
    resp = client.get(f"/api/admin/deployed-cards/{card_id}/fotos.zip?ids={rows[0]['id']}", headers=headers)
    assert resp.status_code == 200
    assert len(zipfile.ZipFile(io.BytesIO(resp.content)).namelist()) == 1
    resp = client.get(f"/api/admin/deployed-cards/{card_id}/fotos.zip?ids=999999", headers=headers)
    assert resp.status_code == 404
    resp = client.get(f"/api/admin/deployed-cards/{card_id}/fotos.zip?ids=abc", headers=headers)
    assert resp.status_code == 422


def test_client_photos_zip(client, admin_token, deploy_dir, cloudinary_mock, monkeypatch):
    token = register_and_verify(client, "novia@test.com")
    search = client.get("/api/admin/users?search=novia", headers=auth_headers(admin_token)).json()
    owner_id = [u for u in search if u["email"] == "novia@test.com"][0]["id"]
    card_id = upload(client, admin_token, slug="boda").json()["id"]
    client.patch(
        f"/api/admin/deployed-cards/{card_id}/owner",
        json={"client_id": owner_id},
        headers=auth_headers(admin_token),
    )
    _upload_photo(client, "boda")
    monkeypatch.setattr(card_deploy, "_download_bytes", lambda url: b"FAKEIMG")
    resp = client.get(f"/api/my-cards/{card_id}/fotos.zip", headers=auth_headers(token))
    assert resp.status_code == 200
    assert zipfile.ZipFile(io.BytesIO(resp.content)).namelist()
