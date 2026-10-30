# ==============================================================================
# Production Multi-Stage Dockerfile for Nexus AI Research Agent
# Builds the React 19 Frontend and serves via FastAPI Asynchronous Backend
# Compatible with: Render, Railway, Hugging Face Spaces, Fly.io, AWS App Runner
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Build (Node.js 20)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime (Python 3.11-slim)
# ------------------------------------------------------------------------------
FROM python:3.11-slim AS runtime
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./backend/
COPY sample_outputs/ ./sample_outputs/

# Copy compiled frontend from Stage 1 into the location expected by backend/main.py
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default port
EXPOSE 8000

# Universal startup: dynamically binds to $PORT provided by host (Render, Railway, Hugging Face)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
