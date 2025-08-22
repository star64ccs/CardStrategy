#!/bin/bash

# CardStrategy 快速啟動腳本
# 適用於 Windows PowerShell 和 Linux/macOS

set -e

echo "🚀 CardStrategy 快速啟動腳本"
echo "================================"

# 檢查操作系統
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "檢測到 Windows 系統"
    SHELL_CMD="powershell"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "檢測到 macOS 系統"
    SHELL_CMD="bash"
else
    echo "檢測到 Linux 系統"
    SHELL_CMD="bash"
fi

# 檢查 Node.js
echo "檢查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝"
    echo "請先安裝 Node.js 18.0.0 或更高版本"
    echo "下載地址：https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本：$NODE_VERSION"

# 檢查 npm
echo "檢查 npm 版本..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm 版本：$NPM_VERSION"

# 檢查 Docker
echo "檢查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker 未安裝，將跳過 Docker 服務"
    DOCKER_AVAILABLE=false
else
    echo "✅ Docker 已安裝"
    DOCKER_AVAILABLE=true
fi

# 創建必要的目錄
echo "創建必要的目錄..."
mkdir -p uploads
mkdir -p logs
mkdir -p backend/uploads
mkdir -p backend/logs

# 安裝依賴
echo "安裝前端依賴..."
npm install

echo "安裝後端依賴..."
cd backend && npm install && cd ..

# 創建環境變數檔案（如果不存在）
if [ ! -f .env ]; then
    echo "創建環境變數檔案..."
    cat > .env << EOF
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
EOF
    echo "✅ 已創建 .env 檔案"
else
    echo "ℹ️  .env 檔案已存在"
fi

# 啟動 Docker 服務（如果可用）
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "啟動 Docker 服務..."
    docker-compose up -d postgres redis
    
    echo "等待數據庫啟動..."
    sleep 10
    
    echo "初始化數據庫..."
    cd backend
    npm run migrate
    npm run seed
    cd ..
fi

echo ""
echo "🎉 環境配置完成！"
echo ""
echo "📋 啟動應用："
echo "1. 啟動後端服務：cd backend && npm run dev"
echo "2. 啟動前端服務：npm run start"
echo ""
echo "🌐 訪問地址："
echo "- 前端應用：http://localhost:3000"
echo "- 後端 API：http://localhost:3000/api"
echo "- Grafana 監控：http://localhost:3001 (admin/admin123)"
echo "- Prometheus：http://localhost:9090"
echo ""
echo "📚 更多資訊請查看 README.md"
