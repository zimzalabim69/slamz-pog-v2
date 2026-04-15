@echo off
title SLAMZ POG v2 - Starting...
cd /d "C:\Users\sikke\CascadeProjects\slamz-pog-v2"

echo.
echo ========================================
echo   SLAMZ POG v2 - VIBE JAM 2026
echo ========================================
echo.

REM === CLEANUP PHASE ===
echo [CLEANUP] Clearing conflicts...

REM 1. Kill Node.js processes (dev servers, build tools)
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Killed zombie Node processes
) else (
    echo   [OK] No Node conflicts found
)

REM 2. Kill npm processes (package manager locks)
taskkill /F /IM npm.exe /T >nul 2>&1

REM 3. Kill anything on ports 5174-5176 (Vite's port range)
for /L %%p in (5174,1,5176) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo   [OK] Freed port %%p (killed PID %%a)
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM 4. Clear browser cache/storage (optional - uncomment if needed)
REM echo   [OK] Clearing browser storage...
REM start "" "http://localhost:5174/clear-storage.html"

REM 5. Give OS time to release resources
timeout /t 2 /nobreak > nul

echo.
echo [START] Launching fresh server...
echo.

REM === LAUNCH PHASE ===
start "SLAMZ POG v2 Server" cmd /k "npm run dev"

REM Wait for Vite to initialize
timeout /t 4 /nobreak > nul

REM Open game in browser
start "" "http://localhost:5174"

echo.
echo [READY] Game launched successfully!
echo.
echo Server console is running in background.
echo Close "SLAMZ POG v2 Server" window to stop.
echo.
pause
