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
