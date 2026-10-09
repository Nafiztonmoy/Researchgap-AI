# ResearchGap AI - Development Environment Launcher
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     Launching ResearchGap AI Services     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Python FastAPI AI Service (Port 8001)
Write-Host "--> Launching AI Service (FastAPI / Uvicorn on port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\ai-service'; .\.venv\Scripts\Activate.ps1; Write-Host 'AI Service running on http://127.0.0.1:8001' -ForegroundColor Green; uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

# 2. Laravel Queue Worker (Processes PDF parsing, embeddings, analysis, comparison, and gap discovery)
Write-Host "--> Launching Laravel Queue Worker..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\web'; Write-Host 'Laravel Queue Worker listening for background jobs...' -ForegroundColor Green; php artisan queue:listen"

# 3. Laravel Web Server (Port 8000)
Write-Host "--> Launching Laravel Web Server on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\web'; Write-Host 'Laravel Web Server running on http://127.0.0.1:8000' -ForegroundColor Green; php artisan serve"

Write-Host "`nAll 3 core background services started in separate windows!" -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Optional: If you want React HMR live reloading, open a terminal in 'web/' and run: npm run dev" -ForegroundColor Gray
