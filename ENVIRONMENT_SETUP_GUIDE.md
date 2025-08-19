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
