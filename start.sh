#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  Nexus AI Research Agent - Production Studio Launcher"
echo "========================================================"
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "[1/3] Installing Python dependencies..."
python3 -m pip install -q -r requirements.txt

echo "[2/3] Checking frontend build..."
if [ ! -f "frontend/dist/index.html" ]; then
    echo "Building frontend web interface..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

echo "[3/3] Launching Production Backend on http://localhost:8000..."
echo "Opening http://localhost:8000 in your browser..."

if which xdg-open > /dev/null; then
  xdg-open http://localhost:8000 &
elif which open > /dev/null; then
  open http://localhost:8000 &
fi

python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
