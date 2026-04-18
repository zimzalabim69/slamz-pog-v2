@echo off
setlocal

:: Define paths
set "SCRIPT_PATH=%temp%\CreateSlamzShortcut.ps1"
set "TARGET_BAT=%~dp0Slamz_Desktop_Launcher.bat"
set "ICON_PATH=%~dp0slamz_icon.png"
set "SHORTCUT_NAME=Launch SLAMZ.lnk"
set "DESKTOP_PATH=%userprofile%\Desktop"

echo ======================================================
echo   SLAMZ PRO-TOUR - DESKTOP ICON INSTALLER
echo ======================================================
echo.

:: Create PowerShell script to build the shortcut
echo $shell = New-Object -ComObject WScript.Shell > "%SCRIPT_PATH%"
echo $shortcut = $shell.CreateShortcut("%DESKTOP_PATH%\%SHORTCUT_NAME%") >> "%SCRIPT_PATH%"
echo $shortcut.TargetPath = "cmd.exe" >> "%SCRIPT_PATH%"
echo $shortcut.Arguments = "/c `"%TARGET_BAT%`"" >> "%SCRIPT_PATH%"
echo $shortcut.IconLocation = "%ICON_PATH%" >> "%SCRIPT_PATH%"
echo $shortcut.Description = "Slamz Pro-Tour Arcade Launcher" >> "%SCRIPT_PATH%"
echo $shortcut.WorkingDirectory = "%~dp0" >> "%SCRIPT_PATH%"
echo $shortcut.Save() >> "%SCRIPT_PATH%"

:: Execute the script
powershell -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"

:: Cleanup
del "%SCRIPT_PATH%"

echo [OK] Shortcut 'Launch SLAMZ' has been created on your Desktop.
echo [!] You can now use the Slamz Mat icon to enter the arena!
echo.
pause
