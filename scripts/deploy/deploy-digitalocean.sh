#!/bin/bash

# DigitalOcean 部署腳本
set -e

echo "🚀 開始部署到 DigitalOcean..."

# 檢查必要的環境變數
if [ -z "$DIGITALOCEAN_ACCESS_TOKEN" ]; then
    echo "❌ 錯誤: 未設置 DIGITALOCEAN_ACCESS_TOKEN"
    exit 1
fi

if [ -z "$DROPLET_IP" ]; then
    echo "❌ 錯誤: 未設置 DROPLET_IP"
    exit 1
fi

# 設置變數
DROPLET_USER="root"
PROJECT_NAME="cardstrategy"
DEPLOY_PATH="/var/www/$PROJECT_NAME"

echo "📦 準備部署文件..."

# 創建部署包
tar -czf deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=dist \
    --exclude=build \
    .

echo "📤 上傳文件到服務器..."

# 上傳部署包
scp -o StrictHostKeyChecking=no deploy.tar.gz $DROPLET_USER@$DROPLET_IP:/tmp/

echo "🔧 在服務器上執行部署..."

# 在服務器上執行部署命令
ssh -o StrictHostKeyChecking=no $DROPLET_USER@$DROPLET_IP << 'EOF'
    set -e
    
    PROJECT_NAME="cardstrategy"
    DEPLOY_PATH="/var/www/$PROJECT_NAME"
    
    echo "📁 創建部署目錄..."
    sudo mkdir -p $DEPLOY_PATH
    sudo chown $USER:$USER $DEPLOY_PATH
    
    echo "📦 解壓部署包..."
    cd $DEPLOY_PATH
    tar -xzf /tmp/deploy.tar.gz
    
    echo "🔧 安裝依賴..."
    npm ci --production
    
    echo "🔧 安裝後端依賴..."
    cd backend
    npm ci --production
    cd ..
    
    echo "🏗️ 構建應用..."
    npm run build:web
    
    echo "🔧 設置環境變數..."
    cp env.example .env
    # 這裡需要手動設置生產環境變數
    
    echo "🔄 重啟服務..."
    sudo systemctl restart cardstrategy-api
    sudo systemctl restart nginx
    
    echo "🧹 清理臨時文件..."
    rm -f /tmp/deploy.tar.gz
    
    echo "✅ 部署完成！"
EOF

echo "🎉 部署成功完成！"

# 清理本地文件
rm -f deploy.tar.gz

echo "🔍 檢查服務狀態..."
ssh -o StrictHostKeyChecking=no $DROPLET_USER@$DROPLET_IP << 'EOF'
    echo "API 服務狀態:"
    sudo systemctl status cardstrategy-api --no-pager -l
    
    echo "Nginx 服務狀態:"
    sudo systemctl status nginx --no-pager -l
    
    echo "數據庫連接測試:"
    curl -f http://localhost:3000/api/health || echo "API 健康檢查失敗"
EOF
