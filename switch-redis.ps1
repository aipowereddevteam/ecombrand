param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("home", "office")]
    [string]$Location
)

Write-Host "`n🔄 Redis Environment Switcher" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

if ($Location -eq "home") {
    Write-Host "📍 Switching to HOME environment (port 6379)..." -ForegroundColor Yellow
    
    # Stop office Redis if running
    docker stop ecom-redis-office 2>$null
    
    # Try to start existing home Redis
    docker start ecom-redis-home 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Creating new Redis container for HOME..." -ForegroundColor Gray
        docker run -d --name ecom-redis-home -p 6379:6379 -v redis-data:/data redis:latest redis-server --appendonly yes
    }
    
    Write-Host "`n✅ Redis is running on port 6379" -ForegroundColor Green
    Write-Host "📝 Update server/.env: REDIS_PORT=6379" -ForegroundColor White
    
} else {
    Write-Host "📍 Switching to OFFICE environment (port 6380)..." -ForegroundColor Yellow
    
    # Stop home Redis if running
    docker stop ecom-redis-home 2>$null
    
    # Try to start existing office Redis
    docker start ecom-redis-office 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Creating new Redis container for OFFICE..." -ForegroundColor Gray
        docker run -d --name ecom-redis-office -p 6380:6379 -v redis-data-office:/data redis:latest redis-server --appendonly yes
    }
    
    Write-Host "`n✅ Redis is running on port 6380" -ForegroundColor Green
    Write-Host "📝 Update server/.env: REDIS_PORT=6380" -ForegroundColor White
}

# Test connection
Write-Host "`n🔍 Testing Redis connection..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

if ($Location -eq "home") {
    $result = docker exec ecom-redis-home redis-cli ping 2>$null
} else {
    $result = docker exec ecom-redis-office redis-cli ping 2>$null
}

if ($result -eq "PONG") {
    Write-Host "✅ Redis is responding correctly!`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis may not be ready yet. Wait a few seconds and test manually.`n" -ForegroundColor Yellow
}
