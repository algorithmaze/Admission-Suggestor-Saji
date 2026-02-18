Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Admission Suggestor Application" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptDir

# Check directories
if (-not (Test-Path "backend")) {
    Write-Host "[ERROR] 'backend' directory not found!" -ForegroundColor Red
    exit
}
if (-not (Test-Path "frontend")) {
    Write-Host "[ERROR] 'frontend' directory not found!" -ForegroundColor Red
    exit
}

Write-Host "[1/2] Launching Backend Server (FastAPI)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd backend && python -m uvicorn main:app --reload"

Write-Host "[2/2] Launching Frontend Application (React/Vite)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd frontend && npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Servers are starting in new windows." -ForegroundColor Green
Write-Host "  - Backend: http://localhost:8000"
Write-Host "  - Frontend: http://localhost:5173"
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Read-Host -Prompt "Press Enter to exit this launcher..."
