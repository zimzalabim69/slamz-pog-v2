@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "GAME_URL=http://localhost:4173"

cd /d "%PROJECT_DIR%"

echo ======================================================
echo   SLAMZ PRO-TOUR v2 - PRO TOUR DESKTOP LAUNCHER
echo ======================================================
echo.
echo [1/3] Sanitizing environment (Killing stale ghosts)...

:: Find and kill processes on port 4173 specifically
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4173') do (
    if not "%%a"=="0" (
        echo [!] Cleaning up stale process ID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
)

:: Also kill any hidden cmd or node windows that might be lingering
taskkill /F /FI "WINDOWTITLE eq Slamz Dev Server*" >nul 2>&1

echo [2/3] Starting Slamz Server in background...
:: Start the server in a new window with a specific title for tracking
start "Slamz Dev Server" /min cmd /c "npm run dev -- --host --port 4173"

echo [3/3] Waiting for hardware to initialize...
:WAIT_LOOP
:: Added -UseBasicParsing to suppress the Security Warning pop-up
powershell -Command "try { $res = Invoke-WebRequest -Uri '%GAME_URL%' -TimeoutSec 2 -UseBasicParsing; if ($res.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
if %errorlevel% neq 0 (
    timeout /t 1 /nobreak >nul
    goto :WAIT_LOOP
)

:OPEN_BROWSER
echo [FIN] Launching arcade interface...
start "" "%GAME_URL%"

exit /b 0
