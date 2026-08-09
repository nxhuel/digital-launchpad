# Clik Agencia Digital — Sistema de Gestión

Panel interno de gestión de proyectos, clientes, comunicación y pagos.

## Stack

- **Backend**: Python 3.11+ / FastAPI / SQLAlchemy / SQLite / JWT
- **Frontend Panel**: React / Vite / TypeScript / Tailwind CSS v4 / TanStack Router
- **Auth**: JWT (access 15 min + refresh 7 días) con bcrypt

## Setup rápido

### Backend

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python seed.py
uvicorn backend.app.main:app --reload
```

### Panel

```bash
cd panel
npm install
npm run dev
```

El panel corre en `http://localhost:5173` y el backend en `http://localhost:8000`.

## Usuarios precargados (seed)

| Rol    | Email                       | Password   |
|--------|-----------------------------|------------|
| Admin  | nahueltisera03@gmail.com    | admin123   |
| Cliente| lucia@example.com           | cliente123 |

## Tests

```bash
pytest tests/ -v
```

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
