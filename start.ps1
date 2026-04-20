$root = $PSScriptRoot

Write-Host "Starting Task Management App..." -ForegroundColor Cyan

# Start .NET API in a new terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "cd '$root\TaskManagement.API'; Write-Host 'API starting on http://localhost:5242' -ForegroundColor Green; dotnet run --launch-profile http"

# Give the API a moment to initialize before starting the frontend
Start-Sleep -Seconds 2

# Start Angular dev server in a new terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "cd '$root\task-management-ui'; Write-Host 'Angular starting on http://localhost:4200' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "Both servers are starting:" -ForegroundColor Cyan
Write-Host "  API:      http://localhost:5242" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close the opened terminal windows to stop the servers." -ForegroundColor Gray
