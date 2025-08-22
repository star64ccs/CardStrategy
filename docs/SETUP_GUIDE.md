# ⚙️ CardStrategy 環境設置指南

## 📋 目錄

1. [環境要求](#環境要求)
2. [數據庫設置](#數據庫設置)
3. [緩存設置](#緩存設置)
4. [CDN 設置](#cdn-設置)
5. [故障排除](#故障排除)

## ENVIRONMENT_SETUP_GUIDE

# 🚀 CardStrategy 執行環境配置指南

## 📋 目錄

- [系統需求](#系統需求)
- [快速開始](#快速開始)
- [詳細配置步驟](#詳細配置步驟)
- [開發環境配置](#開發環境配置)
- [生產環境配置](#生產環境配置)
- [故障排除](#故障排除)

## 🖥️ 系統需求

### 最低系統要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Docker**: 20.10 或更高版本
- **Docker Compose**: 2.0 或更高版本
- **Git**: 2.30 或更高版本

### 推薦系統配置

- **RAM**: 8GB 或更多
- **CPU**: 4核心 或更多
- **磁碟空間**: 50GB 可用空間
- **操作系統**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+

## ⚡ 快速開始

### 方法一：使用自動化腳本（推薦）

#### Windows 用戶

```powershell
# 在 PowerShell 中執行
.\scripts\quick-start.ps1
```

#### Linux/macOS 用戶

```bash
# 在終端中執行
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

### 方法二：使用 Node.js 腳本

```bash
node scripts/setup-environment.js
```

## 🔧 詳細配置步驟

### 1. 安裝必要軟體

#### Node.js 安裝

1. 訪問 [Node.js 官網](https://nodejs.org/)
2. 下載並安裝 LTS 版本（18.x 或更高）
3. 驗證安裝：
   ```bash
   node --version
   npm --version
   ```

#### Docker 安裝

1. **Windows/macOS**: 下載並安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. **Linux**: 使用包管理器安裝 Docker Engine
3. 驗證安裝：
   ```bash
   docker --version
   docker-compose --version
   ```

### 2. 克隆專案

```bash
git clone https://github.com/your-username/CardStrategy.git
cd CardStrategy
```

### 3. 環境變數配置

#### 創建環境變數檔案

```bash
# 複製範例檔案
cp env.example .env
```

#### 編輯 .env 檔案

```env
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
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# 第三方 API 配置（需要自行申請）
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLOUD_VISION_API_KEY=your-google-cloud-vision-api-key

# 其他配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
```

### 4. 安裝依賴

#### 前端依賴

```bash
npm install
```

#### 後端依賴

```bash
cd backend
npm install
cd ..
```

### 5. 啟動服務

#### 使用 Docker Compose（推薦）

```bash
# 啟動數據庫和緩存服務
docker-compose up -d postgres redis

# 等待服務啟動
sleep 10

# 初始化數據庫
cd backend
npm run migrate
npm run seed
cd ..
```

#### 手動啟動服務

```bash
# 啟動 PostgreSQL（如果已安裝）
sudo systemctl start postgresql

# 啟動 Redis（如果已安裝）
sudo systemctl start redis
```

### 6. 啟動應用

#### 啟動後端服務

```bash
cd backend
npm run dev
```

#### 啟動前端服務

```bash
# 在新的終端視窗中
npm run start
```

## 🛠️ 開發環境配置

### 開發工具推薦

- **IDE**: Visual Studio Code
- **資料庫管理**: pgAdmin 或 DBeaver
- **API 測試**: Postman 或 Insomnia
- **Git 客戶端**: GitKraken 或 SourceTree

### VS Code 擴展推薦

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-react-native"
  ]
}
```

### 開發腳本

```bash
# 運行測試
npm run test

# 運行測試並生成覆蓋率報告
npm run test:coverage

# 代碼檢查
npm run lint

# 格式化代碼
npm run format

# 類型檢查
npm run type-check
```

## 🚀 生產環境配置

### 生產環境變數

```env
NODE_ENV=production
PORT=3000
API_URL=https://api.cardstrategy.com

# 生產數據庫
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=cardstrategy_prod
DB_USER=cardstrategy_user
DB_PASSWORD=your-secure-password

# 生產 Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# 安全配置
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://cardstrategy.com
```

### 部署腳本

```bash
# 構建生產版本
npm run build

# 部署到生產環境
npm run deploy:production
```

## 🔍 故障排除

### 常見問題

#### 1. Node.js 版本過低

```bash
# 錯誤訊息：需要 Node.js 18.0.0 或更高版本
# 解決方案：更新 Node.js
nvm install 18
nvm use 18
```

#### 2. Docker 服務啟動失敗

```bash
# 檢查 Docker 狀態
docker info

# 重啟 Docker 服務
sudo systemctl restart docker

# 清理 Docker 資源
docker system prune -a
```

#### 3. 數據庫連接失敗

```bash
# 檢查 PostgreSQL 狀態
sudo systemctl status postgresql

# 檢查數據庫連接
psql -h localhost -U postgres -d cardstrategy

# 重新初始化數據庫
cd backend
npm run migrate:undo
npm run migrate
npm run seed
```

#### 4. 端口被佔用

```bash
# 檢查端口使用情況
netstat -tulpn | grep :3000

# 殺死佔用端口的進程
sudo kill -9 <PID>
```

#### 5. 依賴安裝失敗

```bash
# 清理 npm 緩存
npm cache clean --force

# 刪除 node_modules 並重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 日誌查看

```bash
# 查看應用日誌
tail -f logs/app.log

# 查看 Docker 日誌
docker-compose logs -f backend

# 查看數據庫日誌
docker-compose logs -f postgres
```

### 性能監控

```bash
# 啟動監控服務
docker-compose up -d prometheus grafana

# 訪問監控面板
# Grafana: http://localhost:3001 (admin/admin123)
# Prometheus: http://localhost:9090
```

## 📚 相關文檔

- [開發指南](./docs/developer-guide/development-guide.md)
- [API 文檔](./API_DOCUMENTATION.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [故障排除指南](./TROUBLESHOOTING_GUIDE.md)

## 🆘 獲取幫助

如果遇到問題，請：

1. 查看 [故障排除](#故障排除) 章節
2. 檢查 [GitHub Issues](https://github.com/your-username/CardStrategy/issues)
3. 查看專案文檔
4. 聯繫開發團隊

---

**注意**: 請確保在生產環境中使用安全的密碼和 API 金鑰，並定期更新依賴包以修復安全漏洞。

## POSTGRESQL_SETUP_GUIDE

# 🗄️ PostgreSQL 生產環境配置指南

## 📋 配置概覽

本指南詳細說明如何為 CardStrategy 專案配置 PostgreSQL 生產環境。

---

## 🚀 1. PostgreSQL 服務器配置

### 1.1 如果您使用雲端 PostgreSQL 服務

#### **AWS RDS PostgreSQL**

```bash
# 配置參數
引擎: PostgreSQL 15
實例類型: db.t3.micro (免費層) 或 db.t3.small
存儲: 20GB SSD
多可用區: 否 (免費層)
備份保留: 7天
維護窗口: 選擇合適時間

# 連接信息
主機: your-db-instance.region.rds.amazonaws.com
端口: 5432
數據庫名稱: cardstrategy
用戶名: cardstrategy_user
密碼: your-secure-password
```

#### **Google Cloud SQL PostgreSQL**

```bash
# 配置參數
版本: PostgreSQL 15
機器類型: db-f1-micro (免費層) 或 db-g1-small
存儲: 10GB SSD
備份: 啟用
高可用性: 否 (免費層)

# 連接信息
主機: your-instance-ip
端口: 5432
數據庫名稱: cardstrategy
用戶名: cardstrategy_user
密碼: your-secure-password
```

#### **DigitalOcean Managed Databases**

```bash
# 配置參數
版本: PostgreSQL 15
計劃: Basic ($15/月)
存儲: 25GB SSD
節點: 1個
備份: 自動備份

# 連接信息
主機: your-db-host.digitalocean.com
端口: 25060
數據庫名稱: cardstrategy
用戶名: doadmin
密碼: your-secure-password
```

### 1.2 如果您自建 PostgreSQL 服務器

#### **Ubuntu 服務器安裝**

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 啟動服務
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 檢查狀態
sudo systemctl status postgresql
```

---

## 🔧 2. 數據庫初始配置

### 2.1 創建數據庫和用戶

```sql
-- 連接到 PostgreSQL
sudo -u postgres psql

-- 創建數據庫
CREATE DATABASE cardstrategy;

-- 創建用戶
CREATE USER cardstrategy_user WITH PASSWORD 'your-secure-password';

-- 授予權限
GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy_user;

-- 創建必要的擴展
\c cardstrategy
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 退出
\q
```

### 2.2 配置 PostgreSQL 連接

#### **編輯 PostgreSQL 配置**

```bash
# 編輯 postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# 添加或修改以下配置
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

#### **配置客戶端認證**

```bash
# 編輯 pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 添加以下行 (允許密碼認證)
host    cardstrategy    cardstrategy_user    0.0.0.0/0    md5
host    cardstrategy    cardstrategy_user    ::/0         md5

# 重啟 PostgreSQL
sudo systemctl restart postgresql
```

---

## 🔐 3. 安全配置

### 3.1 防火牆配置

```bash
# 配置 UFW 防火牆
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 5432/tcp  # PostgreSQL (僅在內網使用)

# 檢查防火牆狀態
sudo ufw status
```

### 3.2 SSL 配置 (推薦)

```bash
# 生成 SSL 證書
sudo mkdir -p /etc/ssl/certs/postgresql
cd /etc/ssl/certs/postgresql

# 生成自簽名證書
sudo openssl req -new -x509 -days 365 -nodes -text -out server.crt -keyout server.key -subj "/CN=your-db-host"

# 設置權限
sudo chmod 600 server.key
sudo chown postgres:postgres server.key server.crt

# 編輯 postgresql.conf 啟用 SSL
sudo nano /etc/postgresql/15/main/postgresql.conf

# 添加以下配置
ssl = on
ssl_cert_file = '/etc/ssl/certs/postgresql/server.crt'
ssl_key_file = '/etc/ssl/certs/postgresql/server.key'

# 重啟 PostgreSQL
sudo systemctl restart postgresql
```

---

## 📊 4. 性能優化配置

### 4.1 內存配置

```sql
-- 連接到 PostgreSQL
sudo -u postgres psql

-- 查看當前配置
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW work_mem;

-- 優化配置 (根據服務器內存調整)
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- 重新加載配置
SELECT pg_reload_conf();
```

### 4.2 索引優化

```sql
-- 創建常用索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_cards_name ON cards USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY idx_cards_created_at ON cards(created_at);
CREATE INDEX CONCURRENTLY idx_collections_user_id ON collections(user_id);
CREATE INDEX CONCURRENTLY idx_investments_user_id ON investments(user_id);
```

---

## 🔄 5. 數據庫遷移

### 5.1 運行遷移腳本

```bash
# 進入後端目錄
cd backend

# 安裝依賴
npm install

# 運行遷移
npm run migrate:production

# 驗證遷移
npm run db:verify
```

### 5.2 創建初始數據

```sql
-- 連接到數據庫
psql -h your-host -U cardstrategy_user -d cardstrategy

-- 創建初始管理員用戶
INSERT INTO users (email, password, role, is_active, created_at)
VALUES ('admin@cardstrategy.com', '$2b$12$your-hashed-password', 'admin', true, NOW());

-- 創建初始配置
INSERT INTO system_configs (key, value, created_at)
VALUES
('app_name', 'CardStrategy', NOW()),
('app_version', '3.1.0', NOW()),
('maintenance_mode', 'false', NOW());
```

---

## 📈 6. 監控和維護

### 6.1 備份配置

```bash
# 創建備份腳本
sudo nano /usr/local/bin/backup_postgresql.sh

#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="cardstrategy"
DB_USER="cardstrategy_user"

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 執行備份
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/cardstrategy_$DATE.sql

# 壓縮備份
gzip $BACKUP_DIR/cardstrategy_$DATE.sql

# 刪除7天前的備份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# 設置執行權限
sudo chmod +x /usr/local/bin/backup_postgresql.sh

# 添加到 crontab (每天凌晨2點備份)
sudo crontab -e
# 添加以下行
0 2 * * * /usr/local/bin/backup_postgresql.sh
```

### 6.2 性能監控

```sql
-- 查看數據庫大小
SELECT pg_size_pretty(pg_database_size('cardstrategy'));

-- 查看表大小
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看連接數
SELECT count(*) FROM pg_stat_activity;

-- 查看慢查詢
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🔍 7. 連接測試

### 7.1 測試數據庫連接

```bash
# 使用 psql 測試連接
psql -h your-host -U cardstrategy_user -d cardstrategy

# 測試查詢
SELECT version();
SELECT current_database();
SELECT current_user;

# 退出
\q
```

### 7.2 應用程序連接測試

```bash
# 創建測試腳本
nano test-db-connection.js

const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ 數據庫連接成功');

    const result = await client.query('SELECT version()');
    console.log('PostgreSQL 版本:', result.rows[0].version);

    await client.end();
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', error.message);
  }
}

testConnection();

# 運行測試
node test-db-connection.js
```

---

## 🚨 8. 故障排除

### 8.1 常見問題

#### **連接被拒絕**

```bash
# 檢查 PostgreSQL 是否運行
sudo systemctl status postgresql

# 檢查端口是否監聽
sudo netstat -tlnp | grep 5432

# 檢查防火牆
sudo ufw status
```

#### **認證失敗**

```bash
# 檢查 pg_hba.conf 配置
sudo cat /etc/postgresql/15/main/pg_hba.conf

# 重新加載配置
sudo systemctl reload postgresql
```

#### **內存不足**

```bash
# 檢查系統內存
free -h

# 調整 PostgreSQL 內存配置
sudo nano /etc/postgresql/15/main/postgresql.conf
# 減少 shared_buffers 和 effective_cache_size
```

---

## 📝 9. 環境變數配置

### 9.1 創建生產環境變數文件

```bash
# 創建 .env 文件
nano backend/.env

# 添加以下配置
NODE_ENV=production
PORT=3000

# PostgreSQL 配置
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DB=cardstrategy
POSTGRES_USER=cardstrategy_user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_URL=postgresql://cardstrategy_user:your-secure-password@your-postgres-host:5432/cardstrategy

# 其他配置...
```

---

## ✅ 10. 驗證清單

### 10.1 配置完成檢查

- [ ] PostgreSQL 服務器已安裝並運行
- [ ] 數據庫和用戶已創建
- [ ] 權限已正確設置
- [ ] SSL 證書已配置 (可選)
- [ ] 防火牆已配置
- [ ] 性能優化已應用
- [ ] 備份腳本已設置
- [ ] 連接測試已通過
- [ ] 環境變數已配置
- [ ] 數據庫遷移已執行

---

**配置完成後，您的 PostgreSQL 數據庫將具備生產環境的安全性和性能。**

## REDIS_SETUP_GUIDE

# 🔧 Redis 設置指南

## 📋 **概述**

Redis 連接失敗是因為本地環境沒有運行 Redis 服務。以下是幾種解決方案：

## 🚀 **解決方案選項**

### **選項 1: 跳過本地 Redis 檢查 (推薦)**

如果您不需要在本地運行 Redis，可以設置環境變數跳過檢查：

```bash
# 在 PowerShell 中設置環境變數
$env:SKIP_LOCAL_SERVICES="true"

# 然後運行檢查
npm run check:services
```

或者在 `.env` 文件中添加：

```bash
SKIP_LOCAL_SERVICES=true
```

### **選項 2: 使用 Docker Desktop**

1. **啟動 Docker Desktop**

   - 在 Windows 開始菜單中搜索 "Docker Desktop"
   - 啟動應用程序
   - 等待 Docker 引擎完全啟動

2. **運行 Redis 容器**

   ```bash
   docker run -d --name redis-cardstrategy -p 6379:6379 redis:7-alpine
   ```

3. **設置本地環境變數**
   ```bash
   # 在 .env 文件中添加
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

### **選項 3: 使用 Docker Compose**

如果 Docker Desktop 已運行：

```bash
# 啟動 Redis 服務
docker-compose up redis -d

# 檢查狀態
docker-compose ps
```

### **選項 4: 安裝 Windows 版本的 Redis**

1. **下載 Redis for Windows**

   - 前往: https://github.com/microsoftarchive/redis/releases
   - 下載最新版本的 Redis-x64-xxx.msi

2. **安裝 Redis**

   - 運行下載的 .msi 文件
   - 按照安裝嚮導完成安裝

3. **啟動 Redis 服務**

   ```bash
   # 啟動 Redis 服務
   net start Redis

   # 或者手動啟動
   redis-server
   ```

## 🔍 **驗證設置**

設置完成後，運行以下命令驗證：

```bash
# 檢查服務狀態
npm run check:services

# 或者直接測試 Redis 連接
redis-cli ping
```

## 📊 **預期結果**

### **成功設置後**:

```
🔍 檢查 Redis 連接...
✅ Redis 連接成功
📊 Redis 版本: 7.x.x
✅ Redis 讀寫測試通過
```

### **跳過檢查後**:

```
🔍 檢查 Redis 連接...
⚠️  跳過 Redis 檢查 - 設置了 SKIP_LOCAL_SERVICES
```

## 💡 **建議**

- **開發環境**: 使用選項 1 (跳過檢查) 最簡單
- **測試環境**: 使用選項 2 (Docker) 最靈活
- **生產環境**: 使用選項 4 (Windows 服務) 最穩定

## 🚨 **故障排除**

### **Docker 連接問題**:

```bash
# 檢查 Docker 是否運行
docker --version
docker ps

# 重啟 Docker Desktop
# 然後重新運行容器
```

### **端口衝突**:

```bash
# 檢查端口是否被佔用
netstat -an | findstr :6379

# 如果端口被佔用，使用不同端口
docker run -d --name redis-cardstrategy -p 6380:6379 redis:7-alpine
```

### **權限問題**:

```bash
# 以管理員身份運行 PowerShell
# 然後執行 Docker 命令
```

## CLOUDFLARE_SETUP_GUIDE

# 🌐 Cloudflare 設置指南 - cardstrategyapp.com

## 📊 當前狀態

✅ **已完成**:

- 域名 `cardstrategyapp.com` 已添加到 Cloudflare
- 狀態: `✓ Active`
- 計劃: `Free`
- 唯一訪客: 321

⚠️ **待完成**:

- API Token 配置
- DNS 記錄設置
- SSL/TLS 配置
- 性能優化設置

## 🚀 快速設置步驟

### 第一步：獲取 Cloudflare API Token

1. **登錄 Cloudflare 控制台**

   - 訪問 https://dash.cloudflare.com
   - 使用您的賬號登錄

2. **創建 API Token**

   - 點擊右上角個人頭像 → "My Profile"
   - 左側菜單選擇 "API Tokens"
   - 點擊 "Create Token"

3. **選擇 Token 模板**

   - 選擇 "Custom token"
   - 或者使用 "Edit zone DNS" 模板

4. **設置權限**

   ```
   Permissions:
   - Zone:Zone:Read (所有區域)
   - Zone:DNS:Edit (所有區域)
   - Zone:Zone Settings:Edit (所有區域)
   - Zone:Page Rules:Edit (所有區域)
   ```

5. **設置 Zone Resources**

   ```
   Include: Specific zone
   Zone: cardstrategyapp.com
   ```

6. **創建 Token**
   - 點擊 "Continue to summary"
   - 點擊 "Create Token"
   - **重要**: 複製並保存 Token，它只會顯示一次！

### 第二步：獲取 Zone ID

1. **在 Cloudflare 控制台**
   - 選擇您的域名 `cardstrategyapp.com`
   - 在右側邊欄找到 "Zone ID"
   - 複製這個 ID

### 第三步：設置環境變數

在您的系統中設置以下環境變數：

```bash
# Cloudflare 配置
export CLOUDFLARE_API_TOKEN="your-api-token-here"
export CLOUDFLARE_ZONE_ID="your-zone-id-here"

# DigitalOcean Droplet IP (用於 DNS 記錄)
export DROPLET_IP="your-droplet-ip-here"
```

### 第四步：運行自動配置腳本

```bash
# 安裝依賴 (如果還沒有)
npm install axios

# 運行 Cloudflare 配置腳本
npm run setup:cloudflare
```

## 🔧 手動配置選項

如果您想手動配置，請按照以下步驟：

### 1. DNS 記錄配置

在 Cloudflare DNS 設置中添加以下記錄：

| 類型  | 名稱 | 內容                | 代理狀態  |
| ----- | ---- | ------------------- | --------- |
| A     | @    | YOUR_DROPLET_IP     | ✅ 已代理 |
| CNAME | www  | cardstrategyapp.com | ✅ 已代理 |
| CNAME | api  | cardstrategyapp.com | ✅ 已代理 |
| CNAME | cdn  | cardstrategyapp.com | ✅ 已代理 |

### 2. SSL/TLS 設置

1. **加密模式**: 設置為 "Full (strict)"
2. **Always Use HTTPS**: 啟用
3. **最低 TLS 版本**: 設置為 1.2

### 3. 頁面規則配置

#### 規則 1: API 端點 (不緩存)

```
URL: api.cardstrategyapp.com/*
設置:
- Cache Level: Bypass
- SSL: Full
- Security Level: Medium
```

#### 規則 2: 靜態資源 (緩存)

```
URL: cardstrategyapp.com/*
設置:
- Cache Level: Standard
- Edge Cache TTL: 4 hours
- Browser Cache TTL: 1 hour
```

### 4. 安全設置

1. **安全級別**: Medium
2. **HSTS**: 啟用
   - Max Age: 31536000 (1 年)
   - Include Subdomains: 啟用
   - Preload: 啟用

### 5. 性能優化

啟用以下功能：

- ✅ Auto Minify (JavaScript, CSS, HTML)
- ✅ Brotli Compression
- ✅ Early Hints
- ✅ HTTP/2 Server Push
- ✅ Rocket Loader
- ✅ Polish (Lossy)
- ✅ WebP

## 🔍 驗證配置

### 檢查 DNS 解析

```bash
# 檢查主域名
nslookup cardstrategyapp.com

# 檢查子域名
nslookup www.cardstrategyapp.com
nslookup api.cardstrategyapp.com
nslookup cdn.cardstrategyapp.com
```

### 檢查 SSL 證書

```bash
# 檢查 SSL 證書
openssl s_client -connect cardstrategyapp.com:443 -servername cardstrategyapp.com
```

### 檢查性能

```bash
# 使用 curl 測試響應時間
curl -w "@curl-format.txt" -o /dev/null -s "https://cardstrategyapp.com"
```

## 📋 配置檢查清單

- [ ] API Token 已創建並保存
- [ ] Zone ID 已獲取
- [ ] 環境變數已設置
- [ ] DNS 記錄已配置
- [ ] SSL/TLS 設置完成
- [ ] 頁面規則已創建
- [ ] 安全設置已配置
- [ ] 性能優化已啟用
- [ ] 域名可以正常訪問
- [ ] HTTPS 重定向正常
- [ ] 子域名可以訪問

## 🚨 故障排除

### 常見問題

1. **API Token 權限不足**

   ```
   錯誤: 403 Forbidden
   解決: 檢查 Token 權限，確保包含所有必要的權限
   ```

2. **Zone ID 錯誤**

   ```
   錯誤: Zone not found
   解決: 確認 Zone ID 正確，域名在您的賬號下
   ```

3. **DNS 記錄衝突**

   ```
   錯誤: Record already exists
   解決: 刪除現有記錄或使用不同的名稱
   ```

4. **SSL 證書問題**
   ```
   錯誤: SSL certificate error
   解決: 確保 DigitalOcean Droplet 配置了 SSL 證書
   ```

### 調試命令

```bash
# 檢查環境變數
echo $CLOUDFLARE_API_TOKEN
echo $CLOUDFLARE_ZONE_ID
echo $DROPLET_IP

# 測試 API 連接
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID"
```

## 📞 支持

### Cloudflare 支持

- **文檔**: https://developers.cloudflare.com/
- **社區**: https://community.cloudflare.com/
- **支持**: https://support.cloudflare.com/

### 相關文檔

- **API 文檔**: https://api.cloudflare.com/
- **DNS 設置**: https://developers.cloudflare.com/dns/
- **SSL/TLS**: https://developers.cloudflare.com/ssl/

## 🎉 完成後的效果

配置完成後，您的域名將具備：

✅ **安全性**

- 免費 SSL 證書
- DDoS 防護
- WAF 保護
- HSTS 強制 HTTPS

✅ **性能**

- 全球 CDN 加速
- 圖片優化
- 代碼壓縮
- HTTP/2/3 支持

✅ **可用性**

- 99.9% 可用性保證
- 自動故障轉移
- 負載均衡

您的 `cardstrategyapp.com` 將成為一個高性能、安全的生產級域名！
