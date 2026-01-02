# deploy.ps1 - Development Workflow Script

Write-Host "1. Starting Infrastructure (Redis & MongoDB)..." -ForegroundColor Cyan
docker-compose up -d redis mongodb

Write-Host "2. Building Application Services..." -ForegroundColor Cyan
docker-compose build

# Note: 'docker-compose push' requires 'image:' fields in docker-compose.yml
# Example:
# services:
#   api-server:
#     image: myusername/ecom-api:latest
#
# Uncomment the line below once you have added image tags:
# Write-Host "3. Pushing Images to Registry..." -ForegroundColor Cyan
# docker-compose push

Write-Host "4. Starting Application Stack..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "Deployment Complete! Checking connectivity..." -ForegroundColor Green
Start-Sleep -Seconds 5
if (Test-Connection -ComputerName localhost -Count 1 -Quiet) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method Head -UseBasicParsing
        Write-Host "Backend is UP (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "Backend check failed. Check logs with: docker-compose logs -f api-server" -ForegroundColor Red
    }
}
