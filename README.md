# Clik Agencia Digital — Sistema de Gestión

Panel interno de gestión de proyectos, clientes, comunicación y pagos.

## Stack

- **Backend**: Python 3.11+ / FastAPI / SQLAlchemy / SQLite / JWT
- **Frontend Panel**: React / Vite / TypeScript / Tailwind CSS v4 / TanStack Router
- **Auth**: JWT (access 15 min + refresh 7 días) con bcrypt

## Setup rápido

```bash
docker-compose up --build -d
```

El panel corre en `http://localhost:5173` y el backend en `http://localhost:8000`.

## Usuarios precargados (seed)

| Rol    | Email                       | Password   |
|--------|-----------------------------|------------|
| Admin  | nahueltisera03@gmail.com    | admin123   |
| Cliente| lucia@example.com           | cliente123 |

## Estructura

```
├── backend/
│   ├── app/
│   │   ├── core/          # Config, seguridad, DB
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # Endpoints REST
│   │   └── schemas/       # Pydantic schemas
│   └── main.py            # Entry point
├── panel/                 # React + Vite panel interno
├── uploads/               # Archivos subidos
├── alembic/               # Migraciones
├── tests/                 # Tests pytest
├── seed.py                # Seed de datos
└── .env.example
```
