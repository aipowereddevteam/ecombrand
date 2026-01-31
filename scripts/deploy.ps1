
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
Start-Sleep -Seconds 15

$TargetUrl = "http://0.0.0.0:5000/api/v1/"

Write-Host "Checking Endpoint: $TargetUrl" -ForegroundColor Yellow

if (Test-Connection -ComputerName localhost -Count 1 -Quiet) {
    try {
        $response = Invoke-WebRequest -Uri $TargetUrl -Method Head -UseBasicParsing
        Write-Host "Backend is UP (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        $img = $_.Exception.Response
        if ($img) {
             Write-Host "Backend Reachable but returned error: $($img.StatusCode) (This might be expected if no route exists at $TargetUrl)" -ForegroundColor Yellow
        } else {
             Write-Host "Backend check failed. Check logs with: docker-compose logs -f api-server" -ForegroundColor Red
        }
    }
}

