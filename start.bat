@echo off
echo ==============================================
echo [⭐] Starting ClaimWire Hackathon Environment
echo ==============================================

echo.
echo [1/3] Starting Python ML Service (Port 8000)...
start cmd /k "cd /d %~dp0ml-service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [2/3] Starting Node.js Orchestrator (Port 3000)...
start cmd /k "cd /d %~dp0backend && npm install && npm run dev"

echo.
echo [3/3] Starting React Admin Dashboard (Port 5173)...
start cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo All services are booting up in separate terminal windows!
echo Make sure your .env files are configured with Gemini and WhatsApp Tokens.
pause
