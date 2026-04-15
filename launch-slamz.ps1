# Change to project directory
Set-Location 'C:\Users\sikke\CascadeProjects\slamz-pog-v2'

# Check if dev server is running
$viteRunning = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }

if (-not $viteRunning) {
    # Start dev server in background
    Write-Host "Starting SLAMZ POG v2 dev server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\sikke\CascadeProjects\slamz-pog-v2'; npm run dev" -WindowStyle Normal
    
    # Wait for server to start
    Start-Sleep -Seconds 3
}

# Open browser
Start-Process "http://localhost:5174"
