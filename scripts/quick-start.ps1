# CardStrategy 快速啟動腳本 (Windows PowerShell)
# 適用於 Windows 系統

param(
    [switch]$SkipDocker,
    [switch]$SkipDatabase
)

Write-Host "🚀 CardStrategy 快速啟動腳本" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# 檢查 Node.js
Write-Host "檢查 Node.js 版本..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本：$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安裝" -ForegroundColor Red
    Write-Host "請先安裝 Node.js 18.0.0 或更高版本" -ForegroundColor Red
    Write-Host "下載地址：https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 檢查 npm
Write-Host "檢查 npm 版本..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 版本：$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 未安裝" -ForegroundColor Red
    exit 1
}

# 檢查 Docker
$dockerAvailable = $false
if (-not $SkipDocker) {
    Write-Host "檢查 Docker..." -ForegroundColor Yellow
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
        Write-Host "✅ Docker 已安裝" -ForegroundColor Green
        $dockerAvailable = $true
    } catch {
        Write-Host "⚠️  Docker 未安裝，將跳過 Docker 服務" -ForegroundColor Yellow
        Write-Host "請安裝 Docker Desktop：https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    }
}

# 創建必要的目錄
Write-Host "創建必要的目錄..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/logs" | Out-Null

# 安裝依賴
Write-Host "安裝前端依賴..." -ForegroundColor Yellow
npm install

Write-Host "安裝後端依賴..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# 創建環境變數檔案（如果不存在）
if (-not (Test-Path ".env")) {
    Write-Host "創建環境變數檔案..." -ForegroundColor Yellow
    @"
# 應用配置
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000/api

# 數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cardstrategy
DB_USER=postgres
DB_PASSWORD=cardstrategy123

# JWT 配置
JWT_SECRET=cardstrategy-super-secret-jwt-key-2024
JWT_EXPIRE=30d

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# 其他配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ 已創建 .env 檔案" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env 檔案已存在" -ForegroundColor Cyan
}

# 啟動 Docker 服務（如果可用）
if ($dockerAvailable -and -not $SkipDatabase) {
    Write-Host "啟動 Docker 服務..." -ForegroundColor Yellow
    docker-compose up -d postgres redis
    
    Write-Host "等待數據庫啟動..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "初始化數據庫..." -ForegroundColor Yellow
    Set-Location backend
    npm run migrate
    npm run seed
    Set-Location ..
}

Write-Host ""
Write-Host "🎉 環境配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 啟動應用：" -ForegroundColor Cyan
Write-Host "1. 啟動後端服務：cd backend && npm run dev" -ForegroundColor White
Write-Host "2. 啟動前端服務：npm run start" -ForegroundColor White
Write-Host ""
Write-Host "🌐 訪問地址：" -ForegroundColor Cyan
Write-Host "- 前端應用：http://localhost:3000" -ForegroundColor White
Write-Host "- 後端 API：http://localhost:3000/api" -ForegroundColor White
Write-Host "- Grafana 監控：http://localhost:3001 (admin/admin123)" -ForegroundColor White
Write-Host "- Prometheus：http://localhost:9090" -ForegroundColor White
Write-Host ""
Write-Host "📚 更多資訊請查看 README.md" -ForegroundColor Cyan
