@echo off
if "%1"=="dev" (
    start http://localhost:3000
    start cmd /k "cd cloudflare-worker && npm run dev && exit"
    start cmd /k "cd solidjs && npm run dev && exit"
) else if "%1"=="deploy" (
    cd solidjs && npm run build && npm run preview
    cd ..\cloudflare-worker && npm run deploy
) else (
    echo Usage: run dev
    echo        run deploy
)