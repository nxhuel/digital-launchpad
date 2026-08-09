import base64

API = "/api"

# PNG 1x1 transparente válido
PNG_1x1 = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
)


def _admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _client_token(client):
    resp = client.post(f"{API}/auth/register", json={
        "name": "Client", "email": "cat@test.com", "password": "Cliente123",
    })
    assert resp.status_code == 201, resp.text
    code = client.email_codes["cat@test.com"]
    resp = client.post(f"{API}/auth/verify-email", json={"email": "cat@test.com", "code": code})
    assert resp.status_code == 200, resp.text
    resp = client.post(f"{API}/auth/login", json={
        "email": "cat@test.com", "password": "Cliente123",
    })
    return resp.json()["access_token"]


def test_category_create_and_duplicate(client, admin_token):
    h = _admin_headers(admin_token)
    resp = client.post(f"{API}/admin/card-catalog/categories", json={"name": "Casamientos"}, headers=h)
    assert resp.status_code == 201
    cat = resp.json()
    assert cat["slug"] == "casamientos"

    # Duplicado → 400
    resp = client.post(f"{API}/admin/card-catalog/categories", json={"name": "Casamientos"}, headers=h)
    assert resp.status_code == 400

    resp = client.get(f"{API}/admin/card-catalog/categories", headers=h)
    assert len(resp.json()) == 1


def test_design_crud_and_public_catalog(client, admin_token):
    h = _admin_headers(admin_token)
    cat = client.post(f"{API}/admin/card-catalog/categories", json={"name": "Casamientos"}, headers=h).json()

    # Create
    resp = client.post(f"{API}/admin/card-catalog/designs", json={
        "name": "Boda Julieta",
        "category_id": cat["id"],
        "tag": "Popular",
        "demo_url": "https://bodajyg.lovable.app/",
    }, headers=h)
    assert resp.status_code == 201
    design_id = resp.json()["id"]

    # Upload image (preview)
    resp = client.post(
        f"{API}/admin/card-catalog/designs/{design_id}/image",
        headers=h,
        files={"file": ("preview.png", PNG_1x1, "image/png")},
    )
    assert resp.status_code == 200
    assert resp.json()["image_url"].startswith("/uploads/")

    # Update
    resp = client.patch(f"{API}/admin/card-catalog/designs/{design_id}", json={"tag": "Nuevo"}, headers=h)
    assert resp.status_code == 200
    assert resp.json()["tag"] == "Nuevo"

    # Public catalog: aparece la tarjeta activa con su categoría
    resp = client.get(f"{API}/public/card-catalog")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["categories"]) == 1
    assert len(data["designs"]) == 1
    assert data["designs"][0]["category"] == "casamientos"
    assert data["designs"][0]["category_name"] == "Casamientos"
    assert data["designs"][0]["demo_url"] == "https://bodajyg.lovable.app/"
    assert data["designs"][0]["image_url"].startswith("/uploads/")

    # Al desactivar, desaparece del catálogo público (y su categoría vacía)
    client.patch(f"{API}/admin/card-catalog/designs/{design_id}", json={"active": False}, headers=h)
    resp = client.get(f"{API}/public/card-catalog")
    assert resp.json()["designs"] == []
    assert resp.json()["categories"] == []

    # Delete
    resp = client.delete(f"{API}/admin/card-catalog/designs/{design_id}", headers=h)
    assert resp.status_code == 204

    # Categoría inexistente al crear tarjeta → 404
    resp = client.post(f"{API}/admin/card-catalog/designs", json={
        "name": "X", "category_id": 9999,
    }, headers=h)
    assert resp.status_code == 404


def test_card_catalog_requires_admin(client, admin_token):
    tok = _client_token(client)
    resp = client.get(f"{API}/admin/card-catalog/designs", headers={"Authorization": f"Bearer {tok}"})
    assert resp.status_code == 403
    resp = client.post(f"{API}/admin/card-catalog/categories", json={"name": "XV"},
                       headers={"Authorization": f"Bearer {tok}"})
    assert resp.status_code == 403


def test_reorder_categories(client, admin_token):
    h = _admin_headers(admin_token)
    c1 = client.post(f"{API}/admin/card-catalog/categories", json={"name": "Casamientos"}, headers=h).json()
    c2 = client.post(f"{API}/admin/card-catalog/categories", json={"name": "XV / 15 años"}, headers=h).json()

    # Reordenar: primero XV, después Casamientos
    resp = client.post(
        f"{API}/admin/card-catalog/categories/reorder",
        json={"order": [c2["id"], c1["id"]]},
        headers=h,
    )
    assert resp.status_code == 200
    assert [c["id"] for c in resp.json()] == [c2["id"], c1["id"]]


def test_reorder_designs_and_discount_label(client, admin_token):
    h = _admin_headers(admin_token)
    cat = client.post(f"{API}/admin/card-catalog/categories", json={"name": "Regalos"}, headers=h).json()

    d1 = client.post(f"{API}/admin/card-catalog/designs", json={
        "name": "San Valentín", "category_id": cat["id"],
        "discount_label": "-20% SAN VALENTÍN",
    }, headers=h).json()
    d2 = client.post(f"{API}/admin/card-catalog/designs", json={
        "name": "Aniversario", "category_id": cat["id"],
    }, headers=h).json()

    # Reordenar: primero d2, después d1
    resp = client.post(
        f"{API}/admin/card-catalog/designs/reorder",
        json={"order": [d2["id"], d1["id"]]},
        headers=h,
    )
    assert resp.status_code == 200
    assert [d["id"] for d in resp.json()] == [d2["id"], d1["id"]]

    # El descuento viaja al catálogo público
    resp = client.get(f"{API}/public/card-catalog")
    data = resp.json()
    by_id = {d["id"]: d for d in data["designs"]}
    assert by_id[d1["id"]]["discount_label"] == "-20% SAN VALENTÍN"
    assert by_id[d2["id"]]["discount_label"] is None
    # El orden público respeta el reorder (d2 antes que d1)
    assert [d["id"] for d in data["designs"]] == [d2["id"], d1["id"]]

    # Actualizar/quitar el descuento
    resp = client.patch(f"{API}/admin/card-catalog/designs/{d1['id']}", json={"discount_label": None}, headers=h)
    assert resp.status_code == 200
    assert resp.json()["discount_label"] is None
