@echo off
setlocal

echo ======================================================
echo   SLAMZ POG v2 - NODE GHOST PURGE TOOL
echo ======================================================
echo.
echo [!] Attempting to clear all dangling Node.js processes...

:: Kill by Image Name (aggressive)
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js ghosts have been exorcised.
) else (
    echo [OK] No Node.js processes were find - the environment is clean.
)

:: Clear by Port explicitly just in case
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4173') do (
    if not "%%a"=="0" (
        echo [!] Specialized cleanup for Port 4173 (PID %%a)
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo ======================================================
echo   SANITY RESTORED. You can now launch SLAMZ safely.
echo ======================================================
echo.
pause
exit /b 0
