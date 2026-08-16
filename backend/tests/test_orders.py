"""Tests del flujo de autoatención de pedidos (formulario de tarjetas digitales)."""
import base64

from tests.conftest import TestingSessionLocal, register_and_verify
from backend.app.models.models import FormQuestion, FormQuestionFieldType, FormQuestionRole

# PNG válido 1x1 (se decodifica con Pillow y se optimiza a WebP)
PNG_1PX = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
)

QUESTIONS = [
    ("title", "text", "Elegí un título para etiquetar tu tarjeta digital"),
    ("description", "longtext", "Da una breve descripción de lo que esperás como resultado"),
    ("reference", "url", "¿Tenés alguna referencia web u otra tarjeta digital que te gustaría compartirnos?"),
    ("detail", "longtext", "Explicanos en detalle todo lo que querés que tenga tu tarjeta digital"),
    ("images", "images", "Adjuntá las imágenes que deseas compartir"),
]


def seed_questions(client, token):
    ids = []
    for role, field_type, text in QUESTIONS:
        # El admin no puede setear role: los roles fijos los siembra el sistema.
        resp = client.post(
            "/api/form-questions",
            headers={"Authorization": f"Bearer {token}"},
            json={"text": text, "field_type": field_type},
        )
        assert resp.status_code == 201, resp.text
        ids.append(resp.json()["id"])
    return ids


def create_tarjetas_service(client, token):
    resp = client.post(
        "/api/services",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Tarjetas Digitales",
            "slug": "tarjetas-digitales",
            "description": "Invitaciones digitales",
            "base_price": 0,
            "features": [],
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def test_public_form_questions_only_active(client, admin_token):
    ids = seed_questions(client, admin_token)
    # Oculto una pregunta → no debe aparecer en el endpoint público
    resp = client.patch(
        f"/api/form-questions/{ids[0]}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"active": False},
    )
    assert resp.status_code == 200

    resp = client.get("/api/public/form-questions")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == len(QUESTIONS) - 1
    assert data[0]["text"] == QUESTIONS[1][2]  # el título oculto se corrió del top


def test_admin_question_crud_and_reorder(client, admin_token):
    ids = seed_questions(client, admin_token)

    # Crear pregunta personalizada
    resp = client.post(
        "/api/form-questions",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"text": "¿Cómo te enteraste de nosotros?", "field_type": "text"},
    )
    assert resp.status_code == 201
    custom_id = resp.json()["id"]
    assert resp.json()["role"] is None

    # Editar texto
    resp = client.patch(
        f"/api/form-questions/{custom_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"text": "¿Cómo nos conociste?"},
    )
    assert resp.status_code == 200
    assert resp.json()["text"] == "¿Cómo nos conociste?"

    # Reordenar: la personalizada primero
    resp = client.post(
        "/api/form-questions/reorder",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"order": [custom_id] + ids},
    )
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == custom_id

    # Eliminar (lógico) y restaurar
    resp = client.delete(
        f"/api/form-questions/{custom_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 204
    resp = client.patch(
        f"/api/form-questions/{custom_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"active": True},
    )
    assert resp.status_code == 200
    assert resp.json()["active"] is True

    # Cliente no puede acceder al panel
    client_token = register_and_verify(client, "cliente-form@test.com")
    resp = client.get("/api/form-questions", headers={"Authorization": f"Bearer {client_token}"})
    assert resp.status_code == 403


def test_public_upload_requires_admin_exists(client, admin_token):
    """El upload público guarda el archivo con el primer admin como uploader."""
    resp = client.post(
        "/api/public/order/upload",
        files={"file": ("foto.png", PNG_1PX, "image/png")},
    )
    assert resp.status_code == 200, resp.text


def test_fixed_role_question_guard(client, admin_token):
    """Una pregunta con rol fijo (sembrada por el sistema) no cambia de field_type."""
    db = TestingSessionLocal()
    q = FormQuestion(
        role=FormQuestionRole.title.value,
        field_type=FormQuestionFieldType.text.value,
        text="Elegí un título",
        order=1,
    )
    db.add(q)
    db.commit()
    qid = q.id
    db.close()

    resp = client.patch(
        f"/api/form-questions/{qid}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"field_type": "url"},
    )
    assert resp.status_code == 400

    # Editar el texto sí está permitido
    resp = client.patch(
        f"/api/form-questions/{qid}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"text": "Elegí un título para tu tarjeta"},
    )
    assert resp.status_code == 200
    assert resp.json()["text"] == "Elegí un título para tu tarjeta"


def test_public_upload_accepts_image(client, admin_token):
    resp = client.post(
        "/api/public/order/upload",
        files={"file": ("foto.png", PNG_1PX, "image/png")},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["url"].startswith("/uploads/")
    assert data["mime"].startswith("image/")
    assert data["size"] > 0


def test_public_upload_rejects_bad_file(client, admin_token):
    resp = client.post(
        "/api/public/order/upload",
        files={"file": ("texto.txt", b"hola", "text/plain")},
    )
    assert resp.status_code == 400


def test_from_form_creates_project_and_chat(client, admin_token):
    client_token = register_and_verify(client, "cliente-order@test.com")
    service_id = create_tarjetas_service(client, admin_token)

    resp = client.post(
        "/api/orders/from-form",
        headers={"Authorization": f"Bearer {client_token}"},
        json={
            "title": "Boda Ana y Luis",
            "description": "Queremos una invitación elegante con fotos.",
            "references": "https://ejemplo.com/invitacion",
            "design_id": None,
            "design_name": "Boda Julieta y Riso",
            "source": "template",
            "exchanges": [
                {
                    "question": "Explicanos en detalle todo lo que querés...",
                    "answer": "Queremos música, fotos y el mapa del salón.",
                    "images": [],
                },
                {
                    "question": "Adjuntá las imágenes que deseas compartir",
                    "answer": "",
                    "images": [
                        {"url": "/uploads/abc123.webp", "filename": "foto.png", "mime": "image/webp", "size": 1024}
                    ],
                },
            ],
        },
    )
    assert resp.status_code == 201, resp.text
    project = resp.json()
    assert project["title"] == "Boda Ana y Luis"
    assert project["service_id"] == service_id
    assert "Plantilla de referencia: Boda Julieta y Riso" in project["description"]
    assert "Referencias:" in project["description"]

    # Chat inicial: 4 mensajes (pregunta detalle, respuesta, pregunta imágenes, imagen)
    resp = client.get(
        f"/api/projects/{project['id']}/messages",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert resp.status_code == 200
    msgs = resp.json()
    assert len(msgs) == 4
    # El primer mensaje es del equipo (pregunta) y el segundo del cliente (respuesta)
    assert msgs[0]["body"].startswith("Explicanos")
    assert msgs[1]["body"] == "Queremos música, fotos y el mapa del salón."
    assert msgs[2]["body"] == "Adjuntá las imágenes que deseas compartir"
    assert msgs[3]["attachments"] and msgs[3]["attachments"][0]["url"] == "/uploads/abc123.webp"

    # Notificación al cliente
    resp = client.get("/api/notifications", headers={"Authorization": f"Bearer {client_token}"})
    assert resp.status_code == 200
    assert any(n["title"] == "Pedido creado" for n in resp.json())


def test_from_form_requires_auth(client):
    resp = client.post(
        "/api/orders/from-form",
        json={"title": "Sin token", "description": "", "references": "", "exchanges": []},
    )
    # Sin credenciales, HTTPBearer responde 403
    assert resp.status_code == 403


def test_from_form_rejects_invalid_image_url(client, admin_token):
    client_token = register_and_verify(client, "cliente-badimg@test.com")
    create_tarjetas_service(client, admin_token)

    resp = client.post(
        "/api/orders/from-form",
        headers={"Authorization": f"Bearer {client_token}"},
        json={
            "title": "Pedido",
            "description": "",
            "references": "",
            "exchanges": [
                {
                    "question": "Adjuntá las imágenes",
                    "answer": "",
                    "images": [{"url": "https://otro-sitio.com/mal.png", "filename": "x.png", "mime": "image/png", "size": 1}],
                }
            ],
        },
    )
    assert resp.status_code == 400
