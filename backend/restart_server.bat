@echo off
echo Stopping any running uvicorn processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *uvicorn*" 2>nul
timeout /t 2 /nobreak >nul
echo Starting server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000

