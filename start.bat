@echo off
echo ========================================================
echo   Nexus AI Research Agent - Production Studio Launcher
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python dependencies...
python -m pip install -q -r requirements.txt

echo [2/3] Checking frontend build...
if not exist "frontend\dist\index.html" (
    echo Building frontend web interface...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

echo [3/3] Launching Production Backend on http://localhost:8000...
echo.
echo Application will be available at: http://localhost:8000
echo Opening browser...
start http://localhost:8000

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
