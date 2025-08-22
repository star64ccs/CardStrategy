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
