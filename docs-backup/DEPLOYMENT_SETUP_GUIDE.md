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
