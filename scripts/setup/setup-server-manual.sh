#!/bin/bash

# CardStrategy Ubuntu 24.04 LTS 手動服務器設置腳本
# 適用於 DigitalOcean Droplet

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

echo "====================================="
echo "🖥️  CardStrategy 服務器設置指南"
echo "====================================="
echo ""
echo "📋 請按順序執行以下命令："
echo ""

# 1. 安裝基本工具
echo "1️⃣  安裝基本工具："
echo "sudo apt install -y curl wget git unzip htop vim ufw fail2ban"
echo ""

# 2. 配置防火牆
echo "2️⃣  配置防火牆："
echo "sudo ufw default deny incoming"
echo "sudo ufw default allow outgoing"
echo "sudo ufw allow ssh"
echo "sudo ufw allow 80"
echo "sudo ufw allow 443"
echo "sudo ufw --force enable"
echo ""

# 3. 安裝 Node.js 18
echo "3️⃣  安裝 Node.js 18："
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "sudo apt install -y nodejs"
echo ""

# 4. 安裝 PostgreSQL
echo "4️⃣  安裝 PostgreSQL："
echo "sudo apt install -y postgresql postgresql-contrib"
echo "sudo systemctl start postgresql"
echo "sudo systemctl enable postgresql"
echo ""

# 5. 創建數據庫和用戶
echo "5️⃣  創建數據庫和用戶："
echo "sudo -u postgres psql -c \"CREATE DATABASE cardstrategy;\""
echo "sudo -u postgres psql -c \"CREATE USER cardstrategy_user WITH PASSWORD 'your-secure-password';\""
echo "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy_user;\""
echo "sudo -u postgres psql -c \"CREATE EXTENSION IF NOT EXISTS \\\"uuid-ossp\\\";\""
echo "sudo -u postgres psql -c \"CREATE EXTENSION IF NOT EXISTS \\\"pg_trgm\\\";\""
echo "sudo -u postgres psql -c \"CREATE EXTENSION IF NOT EXISTS \\\"btree_gin\\\";\""
echo ""

# 6. 安裝 Redis
echo "6️⃣  安裝 Redis："
echo "sudo apt install -y redis-server"
echo "sudo sed -i 's/# requirepass foobared/requirepass your-redis-password/' /etc/redis/redis.conf"
echo "sudo systemctl start redis-server"
echo "sudo systemctl enable redis-server"
echo ""

# 7. 安裝 Nginx
echo "7️⃣  安裝 Nginx："
echo "sudo apt install -y nginx"
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"
echo "sudo ufw allow 'Nginx Full'"
echo ""

# 8. 安裝 PM2
echo "8️⃣  安裝 PM2："
echo "sudo npm install -g pm2"
echo "pm2 startup"
echo "sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u \$USER --hp \$HOME"
echo ""

# 9. 安裝 Certbot
echo "9️⃣  安裝 Certbot："
echo "sudo apt install -y certbot python3-certbot-nginx"
echo ""

# 10. 創建應用目錄
echo "🔟  創建應用目錄："
echo "sudo mkdir -p /var/www/cardstrategy"
echo "sudo chown \$USER:\$USER /var/www/cardstrategy"
echo "mkdir -p /var/www/cardstrategy/logs"
echo "mkdir -p /var/www/cardstrategy/uploads"
echo ""

# 11. 配置 Nginx
echo "1️⃣1️⃣  配置 Nginx："
echo "sudo tee /etc/nginx/sites-available/cardstrategy > /dev/null <<'EOF'"
echo "server {"
echo "    listen 80;"
echo "    server_name cardstrategyapp.com www.cardstrategyapp.com;"
echo "    "
echo "    location / {"
echo "        proxy_pass http://localhost:3000;"
echo "        proxy_http_version 1.1;"
echo "        proxy_set_header Upgrade \$http_upgrade;"
echo "        proxy_set_header Connection 'upgrade';"
echo "        proxy_set_header Host \$host;"
echo "        proxy_set_header X-Real-IP \$remote_addr;"
echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
echo "        proxy_cache_bypass \$http_upgrade;"
echo "    }"
echo "}"
echo "EOF"
echo ""
echo "sudo ln -sf /etc/nginx/sites-available/cardstrategy /etc/nginx/sites-enabled/"
echo "sudo rm -f /etc/nginx/sites-enabled/default"
echo "sudo nginx -t"
echo "sudo systemctl restart nginx"
echo ""

# 12. 設置安全配置
echo "1️⃣2️⃣  設置安全配置："
echo "sudo systemctl start fail2ban"
echo "sudo systemctl enable fail2ban"
echo ""

# 13. 創建部署腳本
echo "1️⃣3️⃣  創建部署腳本："
echo "cat > /var/www/cardstrategy/deploy.sh <<'EOF'"
echo "#!/bin/bash"
echo "cd /var/www/cardstrategy"
echo "git pull origin main"
echo "npm ci --production"
echo "cd backend && npm ci --production && cd .."
echo "pm2 restart cardstrategy"
echo "echo \"部署完成！\""
echo "EOF"
echo ""
echo "chmod +x /var/www/cardstrategy/deploy.sh"
echo ""

echo "====================================="
echo "🎉 設置完成！"
echo "====================================="
echo ""
echo "📋 下一步操作："
echo "1. 上傳代碼到 /var/www/cardstrategy"
echo "2. 配置環境變數 (.env 文件)"
echo "3. 運行部署腳本"
echo "4. 配置 SSL 證書"
echo ""
echo "🔧 常用命令："
echo "   pm2 status"
echo "   pm2 logs cardstrategy"
echo "   pm2 restart cardstrategy"
echo "   sudo systemctl status nginx"
echo "   sudo systemctl status postgresql"
echo "   sudo systemctl status redis-server"
echo ""
echo "⚠️  重要提醒："
echo "   - 請更改 PostgreSQL 和 Redis 密碼"
echo "   - 配置 SSH 密鑰認證"
echo "   - 設置定期備份"
echo "====================================="
