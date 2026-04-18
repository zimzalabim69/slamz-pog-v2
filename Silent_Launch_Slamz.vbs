Set WshShell = CreateObject("WScript.Shell")
strPath = WshShell.CurrentDirectory & "\Slamz_Desktop_Launcher.bat"
' Run the launcher hidden (0)
WshShell.Run """" & strPath & """", 0, False
