@echo off
SETLOCAL EnableExtensions

echo ========================================================
echo   Starting Admission Suggestor Application
echo ========================================================
echo.

:: Get the directory where this script is located
SET "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: Check if backend directory exists
IF NOT EXIST "backend" (
    echo [ERROR] 'backend' directory not found!
    echo Please make sure you are running this script from the project root.
    pause
    exit /b 1
)

:: Check if frontend directory exists
IF NOT EXIST "frontend" (
    echo [ERROR] 'frontend' directory not found!
    pause
    exit /b 1
)

echo [1/2] Launching Backend Server (FastAPI)...
start "Admission Suggestor Backend" cmd /k "cd backend && python -m uvicorn main:app --reload"

echo [2/2] Launching Frontend Application (React/Vite)...
start "Admission Suggestor Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Servers are starting in new windows.
echo   - Backend: http://localhost:8000
echo   - Frontend: http://localhost:5173
echo ========================================================
echo.
pause
