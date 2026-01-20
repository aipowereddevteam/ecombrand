<!-- deploy -->
.\scripts\deploy.ps1
<!--d# Docker Commands for E-Commerce Platform

## Redis Setup

### Home Environment (Port 6379 - Default)
```bash
# Start Redis container for HOME
docker run -d --name ecom-redis-home -p 6379:6379 redis:latest

# Start with persistence (recommended)
docker run -d --name ecom-redis-home -p 6379:6379 -v redis-data:/data redis:latest redis-server --appendonly yes

# Check if running
docker ps | findstr redis
```

### Office Environment (Port 6380)
```bash
# Start Redis container for OFFICE
docker run -d --name ecom-redis-office -p 6380:6379 redis:latest

# Start with persistence (recommended)
docker run -d --name ecom-redis-office -p 6380:6379 -v redis-data-office:/data redis:latest redis-server --appendonly yes

# Check if running
docker ps | findstr redis
```

### Manage Redis Containers
```bash
# Stop Redis
docker stop ecom-redis-home
# OR
docker stop ecom-redis-office

# Start existing container
docker start ecom-redis-home
# OR
docker start ecom-redis-office

# Remove container (when switching environments)
docker rm -f ecom-redis-home
docker rm -f ecom-redis-office

# View Redis logs
docker logs ecom-redis-home
docker logs ecom-redis-office

# Access Redis CLI
docker exec -it ecom-redis-home redis-cli
# OR (for office with port 6380)
docker exec -it ecom-redis-office redis-cli
```

### Test Redis Connection
```bash
# Test from outside container (requires redis-cli installed)
# Home
redis-cli -p 6379 ping

# Office  
redis-cli -p 6380 ping

# Expected output: PONG
```

### Environment Configuration

Update your `.env` file based on location:

**For HOME:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

**For OFFICE:**
```env
REDIS_HOST=localhost
REDIS_PORT=6380
```

### Quick Switch Script (PowerShell)

Save as `switch-redis.ps1`:
```powershell
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("home", "office")]
    [string]$Location
)

if ($Location -eq "home") {
    Write-Host "Switching to HOME environment (port 6379)..."
    docker stop ecom-redis-office -ErrorAction SilentlyContinue
    docker start ecom-redis-home -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -ne 0) {
        docker run -d --name ecom-redis-home -p 6379:6379 -v redis-data:/data redis:latest redis-server --appendonly yes
    }
    
    Write-Host "✅ Redis running on port 6379"
    Write-Host "Update .env: REDIS_PORT=6379"
} else {
    Write-Host "Switching to OFFICE environment (port 6380)..."
    docker stop ecom-redis-home -ErrorAction SilentlyContinue
    docker start ecom-redis-office -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -ne 0) {
        docker run -d --name ecom-redis-office -p 6380:6379 -v redis-data-office:/data redis:latest redis-server --appendonly yes
    }
    
    Write-Host "✅ Redis running on port 6380"
    Write-Host "Update .env: REDIS_PORT=6380"
}
```

**Usage:**
```bash
# At home
.\switch-redis.ps1 home

# At office
.\switch-redis.ps1 office
```

## MongoDB Setup (for local development)
```bash
# Start MongoDB
docker run -d --name ecom-mongo -p 27017:27017 -v mongo-data:/data/db mongo:latest

# Stop MongoDB
docker stop ecom-mongo

# Start existing
docker start ecom-mongo
```

## Full Stack with Docker Compose

Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  redis:
    image: redis:latest
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: ecom

volumes:
  redis-data:
  mongo-data:
```

**Usage:**
```bash
# Home (.env has REDIS_PORT=6379)
docker-compose up -d

# Office (.env has REDIS_PORT=6380)
docker-compose up -d

# Stop all
docker-compose down
```
office redis port 6380
home redis port 6379
