# =====================================================================
# Clik Agencia Digital — Imagen única (backend + frontend)
# Un solo Dockerfile en la raíz: SeNode lo detecta y no hay que
# configurar build/start commands. Todo queda en un solo dominio:
#   /          -> frontend (SPA con fallback a index.html)
#   /api/*     -> FastAPI
#   /uploads/* -> archivos subidos
# =====================================================================

# ---------- Stage 1: build del frontend ----------
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Dependencias primero (caché de capas)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Código + build
COPY frontend/ .
RUN npm run build
# Salida: /app/frontend/dist

# ---------- Stage 2: backend + servir frontend ----------
FROM python:3.11-slim

WORKDIR /app

# Dependencias del backend
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Código del backend (misma estructura que el Dockerfile actual)
COPY backend/ backend/

# Frontend ya compilado
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Uploads runtime
RUN mkdir -p backend/uploads

RUN chmod +x backend/entrypoint.sh

EXPOSE 8000

CMD ["backend/entrypoint.sh"]
