#!/bin/bash

# CardStrategy Ubuntu 24.04 LTS 服務器設置腳本
# 適用於 DigitalOcean Droplet

set -e  # 遇到錯誤立即退出

echo "🚀 開始設置 CardStrategy 服務器 (Ubuntu 24.04 LTS)..."
echo "📅 設置時間: $(date)"
echo "====================================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 更新系統
update_system() {
    log_info "更新系統..."
    sudo apt update
    sudo apt upgrade -y
    log_success "系統更新完成"
}

# 安裝基本工具
install_basic_tools() {
    log_info "安裝基本工具..."
    sudo apt install -y curl wget git unzip htop vim ufw fail2ban
    log_success "基本工具安裝完成"
}

# 配置防火牆
setup_firewall() {
    log_info "配置防火牆..."
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable
    log_success "防火牆配置完成"
}

# 安裝 Node.js 18
install_nodejs() {
    log_info "安裝 Node.js 18..."
    
    # 添加 NodeSource 倉庫
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    
    # 安裝 Node.js
    sudo apt install -y nodejs
    
    # 驗證安裝
    node_version=$(node --version)
    npm_version=$(npm --version)
    log_success "Node.js 安裝完成: $node_version, npm: $npm_version"
}

# 安裝 PostgreSQL
install_postgresql() {
    log_info "安裝 PostgreSQL..."
    
    # 安裝 PostgreSQL
    sudo apt install -y postgresql postgresql-contrib
    
    # 啟動並啟用服務
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # 創建數據庫和用戶
    sudo -u postgres psql -c "CREATE DATABASE cardstrategy;"
    sudo -u postgres psql -c "CREATE USER cardstrategy_user WITH PASSWORD 'your-secure-password';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy_user;"
    sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
    sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS \"btree_gin\";"
    
    log_success "PostgreSQL 安裝完成"
}

# 安裝 Redis
install_redis() {
    log_info "安裝 Redis..."
    
    # 安裝 Redis
    sudo apt install -y redis-server
    
    # 配置 Redis
    sudo sed -i 's/# requirepass foobared/requirepass your-redis-password/' /etc/redis/redis.conf
    sudo sed -i 's/bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
    
    # 啟動並啟用服務
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    log_success "Redis 安裝完成"
}

# 安裝 Nginx
install_nginx() {
    log_info "安裝 Nginx..."
    
    # 安裝 Nginx
    sudo apt install -y nginx
    
    # 啟動並啟用服務
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # 配置防火牆
    sudo ufw allow 'Nginx Full'
    
    log_success "Nginx 安裝完成"
}

# 安裝 PM2
install_pm2() {
    log_info "安裝 PM2..."
    
    # 全局安裝 PM2
    sudo npm install -g pm2
    
    # 設置 PM2 開機自啟
    pm2 startup
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
    
    log_success "PM2 安裝完成"
}

# 安裝 Certbot
install_certbot() {
    log_info "安裝 Certbot..."
    
    # 安裝 Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    log_success "Certbot 安裝完成"
}

# 創建應用目錄
create_app_directory() {
    log_info "創建應用目錄..."
    
    # 創建目錄
    sudo mkdir -p /var/www/cardstrategy
    sudo chown $USER:$USER /var/www/cardstrategy
    
    # 創建日誌目錄
    mkdir -p /var/www/cardstrategy/logs
    mkdir -p /var/www/cardstrategy/uploads
    
    log_success "應用目錄創建完成"
}

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx..."
    
    # 創建 Nginx 配置
    sudo tee /etc/nginx/sites-available/cardstrategy > /dev/null <<EOF
server {
    listen 80;
    server_name cardstrategyapp.com www.cardstrategyapp.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # 啟用站點
    sudo ln -sf /etc/nginx/sites-available/cardstrategy /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 測試配置
    sudo nginx -t
    
    # 重啟 Nginx
    sudo systemctl restart nginx
    
    log_success "Nginx 配置完成"
}

# 設置安全配置
setup_security() {
    log_info "設置安全配置..."
    
    # 配置 fail2ban
    sudo systemctl start fail2ban
    sudo systemctl enable fail2ban
    
    # 設置 SSH 安全
    sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    
    # 重啟 SSH 服務
    sudo systemctl restart ssh
    
    log_success "安全配置完成"
}

# 創建部署腳本
create_deployment_script() {
    log_info "創建部署腳本..."
    
    # 創建部署腳本
    cat > /var/www/cardstrategy/deploy.sh <<'EOF'
#!/bin/bash
cd /var/www/cardstrategy
git pull origin main
npm ci --production
cd backend && npm ci --production && cd ..
pm2 restart cardstrategy
echo "部署完成！"
EOF
    
    chmod +x /var/www/cardstrategy/deploy.sh
    
    log_success "部署腳本創建完成"
}

# 顯示系統信息
show_system_info() {
    log_info "系統信息..."
    
    echo "====================================="
    echo "🖥️  服務器配置完成！"
    echo "====================================="
    echo "📋 已安裝的服務:"
    echo "   ✅ Node.js $(node --version)"
    echo "   ✅ npm $(npm --version)"
    echo "   ✅ PostgreSQL $(psql --version)"
    echo "   ✅ Redis $(redis-server --version)"
    echo "   ✅ Nginx $(nginx -v 2>&1)"
    echo "   ✅ PM2 $(pm2 --version)"
    echo "   ✅ Certbot $(certbot --version)"
    echo ""
    echo "📁 應用目錄: /var/www/cardstrategy"
    echo "📝 日誌目錄: /var/www/cardstrategy/logs"
    echo "🖼️  上傳目錄: /var/www/cardstrategy/uploads"
    echo ""
    echo "🔧 常用命令:"
    echo "   查看狀態: pm2 status"
    echo "   查看日誌: pm2 logs cardstrategy"
    echo "   重啟應用: pm2 restart cardstrategy"
    echo "   部署更新: ./deploy.sh"
    echo ""
    echo "🌐 下一步操作:"
    echo "   1. 上傳代碼到 /var/www/cardstrategy"
    echo "   2. 配置環境變數 (.env 文件)"
    echo "   3. 運行部署腳本"
    echo "   4. 配置 SSL 證書"
    echo ""
    echo "⚠️  重要提醒:"
    echo "   - 請更改 PostgreSQL 和 Redis 密碼"
    echo "   - 配置 SSH 密鑰認證"
    echo "   - 設置定期備份"
    echo "====================================="
}

# 主設置流程
main() {
    echo "開始服務器設置流程..."
    
    update_system
    install_basic_tools
    setup_firewall
    install_nodejs
    install_postgresql
    install_redis
    install_nginx
    install_pm2
    install_certbot
    create_app_directory
    configure_nginx
    setup_security
    create_deployment_script
    show_system_info
    
    echo ""
    echo "🎉 服務器設置完成！"
    echo "🌐 準備部署 CardStrategy 應用程序"
}

# 執行主流程
main "$@"
