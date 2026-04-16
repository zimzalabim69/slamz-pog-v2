@echo off
setlocal

set "PROJECT_DIR=C:\Users\sikke\CascadeProjects\slamz-pog-v2"
set "GAME_URL=http://127.0.0.1:4173"

cd /d "%PROJECT_DIR%"

echo.
echo ========================================
echo   SLAMZ POG v2 - VIBE JAM 2026
echo ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ready = $false; try { $response = Invoke-WebRequest -UseBasicParsing '%GAME_URL%' -TimeoutSec 2; if ($response.StatusCode -eq 200) { $ready = $true } } catch {}; if (-not $ready) { Start-Process cmd.exe -ArgumentList '/k','cd /d "%PROJECT_DIR%" && npm run dev -- --host 127.0.0.1 --port 4173' -WorkingDirectory '%PROJECT_DIR%' }; exit 0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$deadline = (Get-Date).AddSeconds(20); do { try { $response = Invoke-WebRequest -UseBasicParsing '%GAME_URL%' -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch {}; Start-Sleep -Milliseconds 500 } while ((Get-Date) -lt $deadline); exit 0"

start "" "%GAME_URL%"
exit /b 0
