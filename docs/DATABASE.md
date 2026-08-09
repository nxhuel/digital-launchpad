# Clik Agencia Digital — Base de Datos

**Motor**: SQLite (`clik.db`)
**ORM**: SQLAlchemy 2.x
**Migraciones**: Alembic

## Entidades

### User
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| name | str | |
| email | str | unique, indexed |
| password_hash | str | bcrypt |
| role | enum(`admin`, `client`) | default `client` |
| active | bool | default true |
| created_at | datetime | default now |

### Service
Catálogo interno. No se expone públicamente.
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| name | str | |
| slug | str | unique |
| description | text | |
| base_price | int | ARS |
| features | JSON | list[str] |
| icon | str | nombre ícono Lucide |
| order | int | |
| active | bool | default true |
| supports_maintenance | bool | true solo para Páginas Web, Sistemas Web, Sistemas con IA |

### Project
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| client_id | FK → users.id | |
| service_id | FK → services.id | |
| title | str | |
| description | text | |
| budget_hint | int nullable | presupuesto sugerido por el cliente |
| status | enum | `pendiente`, `cotizado`, `aceptado`, `desarrollo`, `entregado`, `completado`, `rechazado` |
| admin_price | int nullable | precio final |
| installments | int | default 1 |
| maintenance_enabled | bool | default false |
| maintenance_monthly | int nullable | default `admin_price / 2` |
| accepted_at | datetime nullable | |
| created_at | datetime | |
| updated_at | datetime | |

Campos calculados:
- `next_due_date` = último `paid_at` confirmado (o `accepted_at`) + 30 días.

### Message
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| project_id | FK → projects.id | |
| sender_id | FK → users.id | |
| body | text | |
| created_at | datetime | |

### Attachment
Polimórfico simple.
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| owner_type | enum | `message`, `delivery`, `payment_receipt` |
| owner_id | int | |
| filename | str | |
| mime | str | |
| size | int | bytes |
| url | str | relativa a `/uploads` |
| uploaded_by | FK → users.id | |
| created_at | datetime | |

### DeliveryRecord
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| project_id | FK → projects.id | |
| note | text | |
| link | str nullable | URL de preview/entrega |
| created_at | datetime | |
| updated_at | datetime | |

Adjuntos vía `Attachment(owner_type='delivery')`. Editable en cualquier momento; conservar historial con timestamps.

### Payment
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| project_id | FK → projects.id | |
| amount | int | > 0 |
| kind | enum | `project`, `maintenance` |
| installment_number | int nullable | 1..N para `project` |
| method | enum | `mp_link`, `alias`, `qr`, `otro` |
| status | enum | `pendiente`, `confirmado`, `rechazado` — default `pendiente` |
| paid_at | datetime nullable | seteado al confirmar |
| created_at | datetime | |

Comprobante vía `Attachment(owner_type='payment_receipt')`.

### Notification
| Campo | Tipo | Notas |
|---|---|---|
| id | int PK | |
| user_id | FK → users.id | destinatario |
| kind | enum | `user_registered`, `project_created`, `project_status_changed`, `new_message`, `payment_uploaded`, `payment_confirmed`, `delivery_added` |
| title | str | |
| body | text | |
| link | str nullable | ruta interna del panel |
| read | bool | default false |
| created_at | datetime | |

## Relaciones
- User `1—N` Project (como client). Admin no es dueño de proyectos.
- Project `1—N` Message, DeliveryRecord, Payment.
- Message `1—N` Attachment.
- DeliveryRecord `1—N` Attachment.
- Payment `1—N` Attachment (comprobantes).
- User `1—N` Notification.

## Índices sugeridos
- `users(email)` unique
- `projects(client_id, status)`
- `messages(project_id, created_at)`
- `payments(project_id, status, paid_at)`
- `notifications(user_id, read, created_at)`

## Seed inicial
- Admin: `nahueltisera03@gmail.com` / `admin123`
- Cliente demo: `lucia@example.com` / `cliente123`
- 6 servicios base (ver SYSTEM_SPEC §4).
