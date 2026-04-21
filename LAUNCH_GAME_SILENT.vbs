Set WshShell = CreateObject("WScript.Shell")
strPath = WshShell.CurrentDirectory
WshShell.Run Chr(34) & strPath & "\LAUNCH_GAME.bat" & Chr(34), 0, False
Set WshShell = Nothing
