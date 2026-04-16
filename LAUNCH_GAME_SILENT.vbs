Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\sikke\CascadeProjects\slamz-pog-v2"
WshShell.Run Chr(34) & "C:\Users\sikke\CascadeProjects\slamz-pog-v2\LAUNCH_GAME.bat" & Chr(34), 0, False
Set WshShell = Nothing
