@echo off
if "%1"=="dev" (
    echo Starting Cloudflare Worker backend on http://localhost:8787
    echo Starting SolidJS frontend on http://localhost:5173
    start cmd /k "cd cloudflare-worker && npm run dev"
    timeout /t 2 /nobreak
    start cmd /k "cd solidjs && npm run dev"
) else if "%1"=="deploy" (
    cd solidjs && npm run build
    cd ..\cloudflare-worker && npm run deploy
) else (
    echo Usage: run dev
    echo        run deploy
)