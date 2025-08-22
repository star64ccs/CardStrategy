# 🚀 CardStrategy 部署指南

## 📋 目錄

1. [快速開始](#快速開始)
2. [環境設置](#環境設置)
3. [本地部署](#本地部署)
4. [雲端部署](#雲端部署)
5. [監控和維護](#監控和維護)

## DEPLOYMENT_GUIDE

# 🚀 CardStrategy 部署指南

## 目錄

1. [部署概述](#部署概述)
2. [環境準備](#環境準備)
3. [Docker 部署](#docker-部署)
4. [手動部署](#手動部署)
5. [CI/CD 部署](#cicd-部署)
6. [環境配置](#環境配置)
7. [監控和維護](#監控和維護)
8. [故障排除](#故障排除)
9. [安全配置](#安全配置)
10. [性能優化](#性能優化)

## 部署概述

CardStrategy 支持多種部署方式，包括 Docker 容器化部署、手動部署和自動化 CI/CD 部署。

### 部署架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Nginx Proxy   │    │   Application   │
│   (Cloudflare)  │───▶│   (SSL/TLS)     │───▶│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │     Redis       │
                       │   Database      │    │     Cache       │
                       └─────────────────┘    └─────────────────┘
```

### 系統要求

- **CPU**: 2+ 核心
- **記憶體**: 4GB+ RAM
- **存儲**: 50GB+ 可用空間
- **網絡**: 穩定的互聯網連接
- **操作系統**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+

## 環境準備

### 1. 系統更新

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y

# 安裝必要工具
sudo apt install -y curl wget git unzip
```

### 2. 安裝 Docker

```bash
# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 啟動 Docker 服務
sudo systemctl start docker
sudo systemctl enable docker

# 將用戶添加到 docker 組
sudo usermod -aG docker $USER
```

### 3. 安裝 Node.js

```bash
# 使用 NodeSource 倉庫
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 驗證安裝
node --version
npm --version
```

### 4. 安裝 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib

# 啟動服務
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 設置密碼
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"
```

### 5. 安裝 Redis

```bash
# Ubuntu/Debian
sudo apt install -y redis-server

# 啟動服務
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Docker 部署

### 1. 快速部署

```bash
# 克隆項目
git clone https://github.com/your-org/cardstrategy.git
cd cardstrategy

# 複製環境變量
cp .env.example .env

# 編輯環境變量
nano .env

# 啟動所有服務
docker-compose up -d

# 檢查服務狀態
docker-compose ps
```

### 2. 分步部署

```bash
# 1. 啟動數據庫和緩存
docker-compose up -d postgres redis

# 2. 等待數據庫就緒
sleep 30

# 3. 運行數據庫遷移
docker-compose exec backend npm run migrate

# 4. 啟動應用服務
docker-compose up -d backend

# 5. 啟動監控服務
docker-compose up -d prometheus grafana

# 6. 啟動日誌服務
docker-compose up -d elasticsearch logstash kibana
```

### 3. 生產環境部署

```bash
# 使用生產配置
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 或使用部署腳本
./scripts/deploy.sh
```

### 4. 服務管理

```bash
# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# 重啟服務
docker-compose restart backend

# 停止所有服務
docker-compose down

# 清理資源
docker-compose down -v --remove-orphans
```

## 手動部署

### 1. 後端部署

```bash
# 克隆項目
git clone https://github.com/your-org/cardstrategy.git
cd cardstrategy/backend

# 安裝依賴
npm install --production

# 設置環境變量
cp .env.example .env
nano .env

# 運行數據庫遷移
npm run migrate

# 啟動應用
npm start

# 或使用 PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. 前端部署

```bash
# 進入前端目錄
cd ../frontend

# 安裝依賴
npm install

# 構建應用
npm run build

# 啟動服務
npm start
```

### 3. 數據庫設置

```bash
# 創建數據庫
sudo -u postgres createdb cardstrategy

# 創建用戶
sudo -u postgres createuser cardstrategy_user

# 設置密碼
sudo -u postgres psql -c "ALTER USER cardstrategy_user PASSWORD 'your_password';"

# 授予權限
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy_user;"

# 運行初始化腳本
psql -h localhost -U cardstrategy_user -d cardstrategy -f init-db.sql
```

## CI/CD 部署

### 1. GitHub Actions 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/cardstrategy
            git pull origin main
            docker-compose pull
            docker-compose up -d
```

### 2. 自動化部署腳本

```bash
#!/bin/bash
# scripts/auto-deploy.sh

set -e

echo "開始自動部署..."

# 拉取最新代碼
git pull origin main

# 備份數據庫
./scripts/backup.sh

# 更新 Docker 鏡像
docker-compose pull

# 重啟服務
docker-compose up -d

# 健康檢查
./scripts/health-check.sh

echo "部署完成！"
```

### 3. 回滾機制

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

echo "開始回滾..."

# 切換到上一個版本
git checkout HEAD~1

# 恢復數據庫備份
./scripts/restore.sh

# 重啟服務
docker-compose up -d

echo "回滾完成！"
```

## 環境配置

### 1. 環境變量

```bash
# .env 文件配置
NODE_ENV=production
PORT=3000

# 數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cardstrategy
DB_USER=cardstrategy_user
DB_PASSWORD=your_secure_password

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 安全配置
CORS_ORIGIN=https://cardstrategy.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# 監控配置
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001

# 備份配置
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=cardstrategy-backups
```

### 2. Nginx 配置

```nginx
# /etc/nginx/sites-available/cardstrategy
server {
    listen 80;
    server_name cardstrategy.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cardstrategy.com;

    ssl_certificate /etc/letsencrypt/live/cardstrategy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cardstrategy.com/privkey.pem;

    # 安全標頭
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 靜態文件
    location / {
        root /var/www/cardstrategy;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. SSL 證書

```bash
# 安裝 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 獲取 SSL 證書
sudo certbot --nginx -d cardstrategy.com

# 自動續期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 監控和維護

### 1. 系統監控

```bash
# 查看系統資源
htop
df -h
free -h

# 查看服務狀態
systemctl status postgresql
systemctl status redis-server
systemctl status nginx

# 查看端口使用
netstat -tlnp
ss -tlnp
```

### 2. 應用監控

```bash
# 查看應用日誌
tail -f /var/log/cardstrategy/app.log

# 查看錯誤日誌
tail -f /var/log/cardstrategy/error.log

# 查看訪問日誌
tail -f /var/log/nginx/access.log
```

### 3. 數據庫監控

```bash
# 連接數據庫
psql -h localhost -U cardstrategy_user -d cardstrategy

# 查看連接數
SELECT count(*) FROM pg_stat_activity;

# 查看慢查詢
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 4. 備份管理

```bash
# 創建數據庫備份
pg_dump -h localhost -U cardstrategy_user -d cardstrategy > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢復數據庫備份
psql -h localhost -U cardstrategy_user -d cardstrategy < backup_file.sql

# 自動備份腳本
#!/bin/bash
# scripts/backup.sh
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U cardstrategy_user -d cardstrategy > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

## 故障排除

### 1. 常見問題

#### 數據庫連接失敗

```bash
# 檢查 PostgreSQL 狀態
sudo systemctl status postgresql

# 檢查連接配置
cat /etc/postgresql/*/main/postgresql.conf | grep listen_addresses

# 檢查防火牆
sudo ufw status
```

#### Redis 連接失敗

```bash
# 檢查 Redis 狀態
sudo systemctl status redis-server

# 測試連接
redis-cli ping

# 檢查配置
cat /etc/redis/redis.conf | grep bind
```

#### 應用啟動失敗

```bash
# 檢查端口佔用
lsof -i :3000

# 檢查日誌
tail -f /var/log/cardstrategy/app.log

# 檢查環境變量
echo $NODE_ENV
echo $DB_HOST
```

### 2. 性能問題

#### 高 CPU 使用率

```bash
# 查看進程
top -p $(pgrep -f node)

# 分析 Node.js 進程
node --inspect=0.0.0.0:9229 app.js
```

#### 高記憶體使用率

```bash
# 查看記憶體使用
free -h

# 查看 Node.js 記憶體
node -e "console.log(process.memoryUsage())"
```

#### 慢查詢

```sql
-- 啟用查詢日誌
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- 查看慢查詢
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 1000;
```

### 3. 安全問題

#### 檢查安全漏洞

```bash
# 運行安全掃描
npm audit

# 更新依賴
npm update

# 檢查端口開放
nmap localhost
```

#### 防火牆配置

```bash
# 配置 UFW
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 安全配置

### 1. 系統安全

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝安全工具
sudo apt install -y fail2ban ufw

# 配置 fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. 數據庫安全

```sql
-- 創建只讀用戶
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE cardstrategy TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 限制連接數
ALTER SYSTEM SET max_connections = 100;
SELECT pg_reload_conf();
```

### 3. 應用安全

```javascript
// 安全中間件配置
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 100 個請求
});
app.use('/api/', limiter);
```

## 性能優化

### 1. 數據庫優化

```sql
-- 創建索引
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);

-- 分析表
ANALYZE cards;
ANALYZE investments;

-- 優化查詢
EXPLAIN ANALYZE SELECT * FROM cards WHERE name LIKE '%Charizard%';
```

### 2. 緩存優化

```javascript
// Redis 緩存配置
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});
```

### 3. 應用優化

```javascript
// 集群模式
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./app.js');
}

// 壓縮響應
app.use(compression());

// 靜態文件緩存
app.use(
  express.static('public', {
    maxAge: '1d',
    etag: true,
  })
);
```

### 4. 監控優化

```bash
# 設置監控告警
# 在 Grafana 中配置告警規則

# 設置日誌輪轉
sudo logrotate -f /etc/logrotate.d/cardstrategy

# 監控腳本
#!/bin/bash
# scripts/monitor.sh
while true; do
  # 檢查服務狀態
  if ! curl -f http://localhost:3000/api/health; then
    echo "服務不可用，發送告警"
    # 發送告警邏輯
  fi

  # 檢查磁碟空間
  DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
  if [ $DISK_USAGE -gt 80 ]; then
    echo "磁碟空間不足，發送告警"
    # 發送告警邏輯
  fi

  sleep 60
done
```

---

**注意**: 本文檔會根據系統更新和最佳實踐持續更新。請定期查看最新版本。

## DEPLOYMENT_SETUP_GUIDE

# 🚀 平台服務連結部署指南

## 📋 服務連結清單

### ✅ 必需服務

1. **GitHub** - 代碼版本控制
2. **PostgreSQL** - 主要數據庫
3. **Redis** - 緩存和會話管理

### 🔧 推薦服務

4. **Render** - 開發/測試環境部署
5. **DigitalOcean** - 生產環境部署
6. **Cloudflare** - CDN、DNS 和安全

## 🛠️ 逐步設置指南

### 第一步：GitHub 設置

#### 1.1 創建 Personal Access Token

```bash
# 訪問 GitHub Settings > Developer settings > Personal access tokens
# 創建新的 token，包含以下權限：
# - repo (完整)
# - workflow
# - admin:org
# - admin:public_key
```

#### 1.2 設置 GitHub Secrets

在您的 GitHub 倉庫中設置以下 Secrets：

```bash
# 在 GitHub 倉庫 Settings > Secrets and variables > Actions 中添加：

RENDER_TOKEN=your-render-api-token
RENDER_STAGING_SERVICE_ID=your-render-service-id
DIGITALOCEAN_ACCESS_TOKEN=your-digitalocean-access-token
DROPLET_ID=your-droplet-id
DROPLET_IP=your-droplet-ip
```

### 第二步：PostgreSQL 設置

#### 2.1 創建數據庫實例

```bash
# 在您的 PostgreSQL 提供商中創建新的數據庫實例
# 記錄以下信息：
# - 主機地址
# - 端口 (通常是 5432)
# - 數據庫名稱
# - 用戶名
# - 密碼
```

#### 2.2 運行數據庫初始化腳本

```bash
# 設置環境變數
export PRODUCTION_DB_HOST=your-postgres-host
export PRODUCTION_DB_PORT=5432
export PRODUCTION_DB_NAME=cardstrategy
export PRODUCTION_DB_USER=your-username
export PRODUCTION_DB_PASSWORD=your-password

# 運行初始化腳本
node scripts/setup-postgresql-production.js
```

### 第三步：Redis 設置

#### 3.1 創建 Redis 實例

```bash
# 在您的 Redis 提供商中創建新的實例
# 記錄以下信息：
# - 主機地址
# - 端口 (通常是 6379)
# - 密碼
# - TLS 設置
```

#### 3.2 運行 Redis 初始化腳本

```bash
# 設置環境變數
export PRODUCTION_REDIS_HOST=your-redis-host
export PRODUCTION_REDIS_PORT=6379
export PRODUCTION_REDIS_PASSWORD=your-redis-password
export PRODUCTION_REDIS_TLS=true

# 運行初始化腳本
node scripts/setup-redis-production.js
```

### 第四步：Render 設置

#### 4.1 創建 Render 賬號

```bash
# 訪問 https://render.com
# 使用 GitHub 賬號登錄
# 創建新的 Web Service
```

#### 4.2 部署到 Render

```bash
# 1. 連接 GitHub 倉庫
# 2. 選擇分支 (develop 用於測試)
# 3. 設置構建命令：
cd backend && npm install && npm run build

# 4. 設置啟動命令：
cd backend && npm start

# 5. 添加環境變數 (從 env.production 文件)
```

#### 4.3 設置環境變數

在 Render 控制台中添加以下環境變數：

```bash
NODE_ENV=production
PORT=3000
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=cardstrategy
DB_USER=your-username
DB_PASSWORD=your-password
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://cardstrategy.com
```

### 第五步：DigitalOcean 設置

#### 5.1 創建 Droplet

```bash
# 1. 登錄 DigitalOcean
# 2. 創建新的 Droplet
# 3. 選擇 Ubuntu 22.04 LTS
# 4. 選擇 Basic 計劃 (至少 1GB RAM)
# 5. 選擇數據中心位置 (建議選擇離用戶最近的)
# 6. 添加 SSH 密鑰
```

#### 5.2 設置服務器

```bash
# 連接到您的 Droplet
ssh root@your-droplet-ip

# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 PostgreSQL 客戶端
sudo apt install postgresql-client -y

# 安裝 Redis 客戶端
sudo apt install redis-tools -y

# 安裝 Nginx
sudo apt install nginx -y

# 安裝 PM2
sudo npm install -g pm2
```

#### 5.3 配置 Nginx

```bash
# 創建 Nginx 配置
sudo nano /etc/nginx/sites-available/cardstrategy

# 添加以下配置：
server {
    listen 80;
    server_name cardstrategy.com www.cardstrategy.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 啟用站點
sudo ln -s /etc/nginx/sites-available/cardstrategy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5.4 創建 PM2 配置

```bash
# 創建 PM2 配置文件
nano ecosystem.config.js

# 添加以下配置：
module.exports = {
  apps: [{
    name: 'cardstrategy-api',
    script: './backend/src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env'
  }]
};

# 啟動應用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 第六步：Cloudflare 設置

#### 6.1 添加域名

```bash
# 1. 登錄 Cloudflare
# 2. 添加您的域名 (cardstrategy.com)
# 3. 更新域名服務器的 NS 記錄
```

#### 6.2 配置 DNS 記錄

```bash
# 在 Cloudflare DNS 中添加以下記錄：

A     @      YOUR_DROPLET_IP     Auto
CNAME www    cardstrategy.com    Auto
CNAME api    cardstrategy.com    Auto
```

#### 6.3 設置 SSL/TLS

```bash
# 1. 進入 SSL/TLS 設置
# 2. 加密模式設置為 "Full (strict)"
# 3. 啟用 "Always Use HTTPS"
# 4. 設置 "Minimum TLS Version" 為 1.2
```

#### 6.4 配置緩存規則

```bash
# 創建頁面規則：

# API 端點 - 不緩存
URL: api.cardstrategy.com/*
設置:
- Cache Level: Bypass
- SSL: Full
- Security Level: Medium

# 靜態資源 - 緩存
URL: cardstrategy.com/*
設置:
- Cache Level: Standard
- Edge Cache TTL: 4 hours
- Browser Cache TTL: 1 hour
```

## 🔧 自動化部署

### 使用 GitHub Actions

```bash
# 推送代碼到 develop 分支會自動部署到 Render
# 推送代碼到 main 分支會自動部署到 DigitalOcean

git push origin develop  # 部署到測試環境
git push origin main     # 部署到生產環境
```

### 手動部署

```bash
# 部署到 DigitalOcean
chmod +x scripts/deploy-digitalocean.sh
./scripts/deploy-digitalocean.sh
```

## 🧪 測試檢查清單

### 基礎功能測試

- [ ] GitHub 倉庫可訪問
- [ ] PostgreSQL 連接正常
- [ ] Redis 連接正常
- [ ] API 端點響應正常
- [ ] 前端頁面加載正常

### 部署測試

- [ ] Render 測試環境正常
- [ ] DigitalOcean 生產環境正常
- [ ] Cloudflare CDN 正常
- [ ] SSL 證書有效
- [ ] 域名解析正常

### 性能測試

- [ ] 頁面加載速度 < 3 秒
- [ ] API 響應時間 < 500ms
- [ ] 數據庫查詢優化
- [ ] 緩存策略生效

### 安全測試

- [ ] HTTPS 強制重定向
- [ ] CORS 設置正確
- [ ] 速率限制生效
- [ ] 防火牆規則正常

## 🚨 故障排除

### 常見問題

#### 1. 數據庫連接失敗

```bash
# 檢查環境變數
echo $DB_HOST
echo $DB_PASSWORD

# 測試連接
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

#### 2. Redis 連接失敗

```bash
# 測試 Redis 連接
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
```

#### 3. 部署失敗

```bash
# 檢查日誌
pm2 logs cardstrategy-api
sudo journalctl -u nginx -f
```

#### 4. SSL 證書問題

```bash
# 檢查 Cloudflare SSL 設置
# 確保設置為 "Full (strict)"
```

## 📞 支持聯繫

如果遇到問題，請檢查：

1. 環境變數設置
2. 服務狀態
3. 網絡連接
4. 防火牆設置
5. 日誌文件

## 🎉 完成！

恭喜！您已成功設置所有必要的服務。您的應用現在應該可以：

- 自動部署到測試和生產環境
- 使用 CDN 加速
- 具備完整的監控和安全保護
- 支持高可用性和擴展性

## DIGITALOCEAN_DEPLOYMENT_GUIDE

# 🌊 DigitalOcean 部署指南

## 📋 DigitalOcean 部署概覽

本指南詳細說明如何在 DigitalOcean 服務器上部署 CardStrategy 高級預測系統。

---

## 🖥️ 1. DigitalOcean 服務器準備

### 1.1 創建 Droplet

1. **登錄 DigitalOcean 控制台**
2. **創建新的 Droplet**：
   - **選擇映像**: Ubuntu 24.04 LTS
   - **選擇計劃**: Basic
   - **CPU**: 2 vCPUs
   - **內存**: 2 GB RAM
   - **存儲**: 50 GB SSD
   - **數據中心**: 選擇離您最近的區域
   - **認證**: SSH 密鑰（推薦）或密碼

### 1.2 連接服務器

```bash
# 使用 SSH 連接到您的服務器
ssh root@your-server-ip

# 例如：
ssh root@164.92.123.456
```

---

## 🔧 2. 服務器初始設置

### 2.1 更新系統

```bash
# 更新系統包
sudo apt update && sudo apt upgrade -y

# 安裝必要的軟件
sudo apt install -y curl wget git build-essential
```

### 2.2 安裝 Node.js

```bash
# 安裝 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 驗證安裝
node --version  # 應該顯示 v18.x.x
npm --version   # 應該顯示 8.x.x 或更高
```

### 2.3 安裝 PostgreSQL

```bash
# 安裝 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 啟動並啟用服務
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 檢查狀態
sudo systemctl status postgresql
```

### 2.4 安裝 Redis

```bash
# 安裝 Redis
sudo apt install redis-server -y

# 啟動並啟用服務
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 檢查狀態
sudo systemctl status redis-server
```

---

## 📁 3. 部署應用程序

### 3.1 克隆代碼

```bash
# 創建應用目錄
sudo mkdir -p /var/www/cardstrategy
sudo chown $USER:$USER /var/www/cardstrategy

# 克隆代碼倉庫
cd /var/www/cardstrategy
git clone https://github.com/your-username/cardstrategy.git .

# 或者如果您使用私有倉庫
git clone https://github.com/your-username/cardstrategy.git .
```

### 3.2 安裝依賴項

```bash
# 安裝前端依賴
npm install

# 安裝後端依賴
cd backend
npm install

# 安裝高級預測系統的額外依賴
npm install @tensorflow/tfjs-node@^4.17.0
npm install brain.js@^2.0.0-beta.23
npm install ml-matrix@^6.10.4
npm install technicalindicators@^3.1.0

cd ..
```

### 3.3 配置環境變量

```bash
# 創建後端環境變量文件
cd backend
cp env.template .env

# 編輯環境變量
nano .env
```

在 `.env` 文件中配置：

```bash
# ==================== 服務器配置 ====================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# ==================== 數據庫配置 ====================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cardstrategy
POSTGRES_USER=cardstrategy_user
POSTGRES_PASSWORD=your-secure-postgres-password
POSTGRES_URL=postgresql://cardstrategy_user:your-secure-postgres-password@localhost:5432/cardstrategy

# ==================== Redis 配置 ====================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password
REDIS_URL=redis://:your-secure-redis-password@localhost:6379

# ==================== JWT配置 ====================
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRE=7d

# ==================== 高級預測配置 ====================
TFJS_BACKEND=cpu
TFJS_MEMORY_GROWTH=true
PREDICTION_CACHE_TTL=3600
PREDICTION_BATCH_SIZE=50
PREDICTION_CONFIDENCE_THRESHOLD=0.7
MODEL_PERFORMANCE_TRACKING=true
MODEL_AUTO_OPTIMIZATION=true

# ==================== 其他配置 ====================
ALLOWED_ORIGINS=https://cardstrategyapp.com,https://www.cardstrategyapp.com
```

### 3.4 設置數據庫

```bash
# 切換到 PostgreSQL 用戶
sudo -u postgres psql

# 在 PostgreSQL 中執行：
CREATE DATABASE cardstrategy;
CREATE USER cardstrategy_user WITH PASSWORD 'your-secure-postgres-password';
GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy_user;
\q

# 初始化數據庫
cd /var/www/cardstrategy/backend
npm run db:init
npm run db:migrate
```

---

## 🚀 4. 使用 PM2 部署

### 4.1 安裝 PM2

```bash
# 全局安裝 PM2
sudo npm install -g pm2

# 安裝 PM2 日誌管理
pm2 install pm2-logrotate
```

### 4.2 配置 PM2

```bash
# 創建 PM2 配置文件
cd /var/www/cardstrategy
nano ecosystem.config.js
```

添加以下內容：

```javascript
module.exports = {
  apps: [
    {
      name: 'cardstrategy',
      script: 'backend/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=2048',
    },
  ],
};
```

### 4.3 啟動應用

```bash
# 創建日誌目錄
mkdir -p logs

# 啟動應用
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 設置開機自啟
pm2 startup
```

---

## 🌐 5. 配置 Nginx

### 5.1 安裝 Nginx

```bash
# 安裝 Nginx
sudo apt install nginx -y

# 啟動並啟用服務
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.2 配置 Nginx

```bash
# 創建 Nginx 配置文件
sudo nano /etc/nginx/sites-available/cardstrategy
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name cardstrategyapp.com www.cardstrategyapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 啟用站點

```bash
# 啟用站點
sudo ln -sf /etc/nginx/sites-available/cardstrategy /etc/nginx/sites-enabled/

# 移除默認站點
sudo rm -f /etc/nginx/sites-enabled/default

# 測試配置
sudo nginx -t

# 重啟 Nginx
sudo systemctl restart nginx
```

---

## 🔒 6. 配置 SSL 證書

### 6.1 安裝 Certbot

```bash
# 安裝 Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 獲取 SSL 證書

```bash
# 獲取 SSL 證書
sudo certbot --nginx -d cardstrategyapp.com -d www.cardstrategyapp.com

# 設置自動續期
sudo crontab -e
```

添加以下行：

```
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 7. 配置防火牆

```bash
# 安裝 UFW
sudo apt install ufw -y

# 配置防火牆規則
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 啟用防火牆
sudo ufw enable
```

---

## 📊 8. 驗證部署

### 8.1 檢查服務狀態

```bash
# 檢查 PM2 狀態
pm2 status

# 檢查 Nginx 狀態
sudo systemctl status nginx

# 檢查 PostgreSQL 狀態
sudo systemctl status postgresql

# 檢查 Redis 狀態
sudo systemctl status redis-server
```

### 8.2 測試 API 端點

```bash
# 測試健康檢查
curl http://localhost:3000/health

# 測試高級預測 API
curl http://localhost:3000/api/advanced-predictions/advanced-models

# 測試外部訪問
curl https://cardstrategyapp.com/health
```

### 8.3 檢查日誌

```bash
# 查看應用日誌
pm2 logs cardstrategy

# 查看 Nginx 日誌
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 9. 故障排除

### 常見問題

#### 1. 端口被佔用

```bash
# 檢查端口使用情況
sudo netstat -tlnp | grep :3000

# 殺死佔用端口的進程
sudo kill -9 <PID>
```

#### 2. 內存不足

```bash
# 檢查內存使用
free -h

# 增加 Node.js 內存限制
export NODE_OPTIONS="--max-old-space-size=2048"
```

#### 3. 數據庫連接失敗

```bash
# 檢查 PostgreSQL 狀態
sudo systemctl status postgresql

# 檢查連接
sudo -u postgres psql -d cardstrategy
```

---

## 📈 10. 性能監控

### 10.1 系統監控

```bash
# 安裝 htop
sudo apt install htop -y

# 監控系統資源
htop
```

### 10.2 應用監控

```bash
# PM2 監控
pm2 monit

# 查看詳細統計
pm2 show cardstrategy
```

---

## 🔄 11. 更新部署

### 11.1 創建部署腳本

```bash
# 創建部署腳本
nano /var/www/cardstrategy/deploy.sh
```

添加以下內容：

```bash
#!/bin/bash
cd /var/www/cardstrategy

# 拉取最新代碼
git pull origin main

# 安裝依賴
npm install
cd backend && npm install && cd ..

# 重啟應用
pm2 restart cardstrategy

echo "部署完成！"
```

### 11.2 設置腳本權限

```bash
chmod +x /var/www/cardstrategy/deploy.sh
```

---

## 🎯 部署完成檢查清單

- [ ] DigitalOcean Droplet 已創建
- [ ] SSH 連接成功
- [ ] Node.js 18.x 已安裝
- [ ] PostgreSQL 已安裝並配置
- [ ] Redis 已安裝並配置
- [ ] 代碼已克隆到服務器
- [ ] 依賴項已安裝
- [ ] 環境變量已配置
- [ ] 數據庫已初始化
- [ ] PM2 已配置並啟動
- [ ] Nginx 已配置
- [ ] SSL 證書已安裝
- [ ] 防火牆已配置
- [ ] API 端點可訪問
- [ ] 高級預測系統正常工作

---

## 🎉 部署成功

恭喜！您的 CardStrategy 高級預測系統已成功部署到 DigitalOcean。

**訪問地址**：

- **主網站**: https://cardstrategyapp.com
- **API 服務**: https://cardstrategyapp.com/api
- **健康檢查**: https://cardstrategyapp.com/health

**管理命令**：

- 重啟應用: `pm2 restart cardstrategy`
- 查看日誌: `pm2 logs cardstrategy`
- 更新部署: `./deploy.sh`

## RENDER_STAGING_GUIDE

# 🧪 Render 測試環境處理指南

## 📋 **概述**

Render 作為您的**測試/開發環境**，用於：

- 🧪 **功能測試** - 新功能開發和測試
- 🔍 **集成測試** - 數據庫和服務集成測試
- 👥 **團隊協作** - 開發團隊共享測試環境
- 🚀 **預發布** - 生產環境部署前的驗證

## 🏗️ **環境架構**

### **Render 服務配置**

```
cardstrategy-api (後端 API)
├── 環境: Node.js
├── 計劃: Free
├── 自動部署: 是
└── 健康檢查: /api/health

cardstrategy-frontend (前端)
├── 環境: Static Site
├── 計劃: Free
├── 自動部署: 是
└── API 端點: https://cardstrategy-api.onrender.com/api

cardstrategy-postgres (數據庫)
├── 類型: PostgreSQL
├── 計劃: Free
└── 數據庫名: cardstrategy

cardstrategy-redis (緩存)
├── 類型: Redis
└── 計劃: Free
```

## 🔄 **部署流程**

### **1. 開發分支部署 (develop)**

```bash
# 推送到 develop 分支
git push origin develop

# GitHub Actions 自動觸發
# 1. 運行測試
# 2. 部署到 Render
# 3. 健康檢查
```

### **2. 生產分支部署 (main)**

```bash
# 合併到 main 分支
git merge develop
git push origin main

# GitHub Actions 自動觸發
# 1. 運行測試
# 2. 部署到 DigitalOcean (生產)
# 3. 健康檢查
```

## 🛠️ **環境變數配置**

### **Render 控制台設置**

在 Render 控制台中設置以下環境變數：

```bash
# 基本配置
NODE_ENV=staging
PORT=3000

# 數據庫配置 (自動從服務獲取)
DB_HOST=cardstrategy-postgres
DB_PORT=5432
DB_NAME=cardstrategy
DB_USER=cardstrategy_user
DB_PASSWORD=<自動生成>

# Redis 配置 (自動從服務獲取)
REDIS_HOST=cardstrategy-redis
REDIS_PORT=6379
REDIS_PASSWORD=<自動生成>

# JWT 配置
JWT_SECRET=<自動生成>
JWT_EXPIRE=24h

# CORS 配置
CORS_ORIGIN=https://cardstrategy-frontend.onrender.com

# 其他配置
UPLOAD_PATH=/app/uploads
LOG_PATH=/app/logs
MODEL_PATH=/app/models
EXPORT_PATH=/app/exports
```

## 📊 **測試環境 URL**

### **服務端點**

- 🌐 **前端**: https://cardstrategy-frontend.onrender.com
- 🔧 **API**: https://cardstrategy-api.onrender.com
- 📊 **健康檢查**: https://cardstrategy-api.onrender.com/api/health

### **API 端點**

```
GET  /api/health          # 健康檢查
GET  /api/status          # 服務狀態
GET  /api/db/test         # 數據庫測試
POST /api/auth/login      # 用戶登錄
GET  /api/cards           # 卡片列表
GET  /api/collections     # 收藏列表
GET  /api/investments     # 投資列表
GET  /api/market          # 市場數據
POST /api/ai/analyze      # AI 分析
```

## 🔍 **測試和驗證**

### **1. 自動化測試**

```bash
# 運行測試套件
npm run test:ci

# 運行特定測試
npm run test:unit
npm run test:integration
npm run test:e2e
```

### **2. 手動測試**

```bash
# 健康檢查
curl https://cardstrategy-api.onrender.com/api/health

# 數據庫連接測試
curl https://cardstrategy-api.onrender.com/api/db/test

# API 端點測試
curl https://cardstrategy-api.onrender.com/api/status
```

### **3. 性能測試**

```bash
# 使用 Apache Bench 測試
ab -n 100 -c 10 https://cardstrategy-api.onrender.com/api/health

# 使用 wrk 測試
wrk -t12 -c400 -d30s https://cardstrategy-api.onrender.com/api/health
```

## 🚨 **監控和警報**

### **健康檢查**

- **端點**: `/api/health`
- **頻率**: 每 30 秒
- **超時**: 10 秒
- **重試**: 3 次

### **日誌監控**

```bash
# 查看應用日誌
# 在 Render 控制台 -> Services -> cardstrategy-api -> Logs

# 常見日誌級別
INFO  - 正常操作
WARN  - 警告信息
ERROR - 錯誤信息
DEBUG - 調試信息
```

### **性能指標**

- **響應時間**: < 500ms
- **可用性**: > 99.9%
- **錯誤率**: < 0.1%

## 🔧 **故障排除**

### **常見問題**

#### **1. 部署失敗**

```bash
# 檢查構建日誌
# Render 控制台 -> Services -> Build Logs

# 常見原因
- 依賴安裝失敗
- 構建腳本錯誤
- 環境變數缺失
```

#### **2. 數據庫連接問題**

```bash
# 檢查數據庫狀態
# Render 控制台 -> Databases -> cardstrategy-postgres

# 測試連接
curl https://cardstrategy-api.onrender.com/api/db/test
```

#### **3. Redis 連接問題**

```bash
# 檢查 Redis 狀態
# Render 控制台 -> Redis -> cardstrategy-redis

# 測試連接
curl https://cardstrategy-api.onrender.com/api/redis/test
```

### **調試步驟**

1. **檢查日誌** - 查看應用和服務日誌
2. **驗證配置** - 檢查環境變數和服務配置
3. **測試端點** - 手動測試 API 端點
4. **重啟服務** - 在 Render 控制台重啟服務

## 📈 **最佳實踐**

### **1. 開發流程**

```bash
# 1. 創建功能分支
git checkout -b feature/new-feature

# 2. 開發和測試
npm run test
npm run lint

# 3. 推送到 develop 分支
git push origin develop

# 4. 自動部署到 Render
# 5. 驗證功能
# 6. 合併到 main 分支
```

### **2. 數據管理**

- **測試數據**: 使用專門的測試數據集
- **數據備份**: 定期備份測試數據庫
- **數據清理**: 定期清理測試數據

### **3. 安全考慮**

- **環境隔離**: 測試環境與生產環境完全隔離
- **敏感數據**: 不要在測試環境使用生產敏感數據
- **訪問控制**: 限制測試環境的訪問權限

## 🎯 **下一步行動**

### **立即需要完成的配置**

1. **設置 GitHub Secrets**

   ```bash
   RENDER_TOKEN=<您的 Render API Token>
   RENDER_STAGING_SERVICE_ID=<您的 Render 服務 ID>
   ```

2. **配置環境變數**

   - 在 Render 控制台設置所有必要的環境變數
   - 確保服務間的正確連接

3. **測試部署流程**

   ```bash
   # 推送到 develop 分支測試
   git push origin develop
   ```

4. **驗證服務**
   - 檢查所有服務是否正常運行
   - 測試 API 端點
   - 驗證數據庫連接

### **可選優化**

1. **監控設置**

   - 設置 Uptime Robot 監控
   - 配置錯誤追蹤 (Sentry)
   - 設置性能監控

2. **自動化測試**

   - 設置端到端測試
   - 配置性能測試
   - 設置安全掃描

3. **文檔更新**
   - 更新 API 文檔
   - 創建部署文檔
   - 設置故障排除指南

## 📞 **支持資源**

- **Render 文檔**: https://render.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
- **Node.js 文檔**: https://nodejs.org/docs
- **PostgreSQL 文檔**: https://www.postgresql.org/docs
- **Redis 文檔**: https://redis.io/documentation

---

**🎉 您的 Render 測試環境已經配置完成！現在可以開始進行開發和測試了。**
