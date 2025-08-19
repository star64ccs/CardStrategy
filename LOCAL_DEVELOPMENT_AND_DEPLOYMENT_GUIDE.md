# 🚀 CardStrategy 本地開發與部署指南

## 📋 概述

本指南將幫助您在本地環境中完成所有開發、測試和優化工作，然後再將完整的專案部署到生產服務器。這是一個安全且高效的工作流程。

---

## 🎯 本地開發環境設置

### 1. 環境要求

#### 系統要求
- **操作系統**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本
- **Git**: 2.30+ 版本

#### 開發工具
- **IDE**: VS Code (推薦) 或 WebStorm
- **數據庫**: PostgreSQL 15+ (本地安裝)
- **緩存**: Redis 7+ (本地安裝)
- **容器**: Docker Desktop (可選)

### 2. 本地環境安裝

#### 安裝 Node.js 和 npm
```bash
# 使用 nvm 安裝 Node.js (推薦)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 驗證安裝
node --version
npm --version
```

#### 安裝 PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# 下載並安裝 PostgreSQL 官方安裝包
```

#### 安裝 Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Windows
# 下載並安裝 Redis for Windows
```

### 3. 專案本地設置

#### 克隆專案
```bash
git clone https://github.com/your-username/CardStrategy.git
cd CardStrategy
```

#### 安裝依賴
```bash
# 安裝前端依賴
npm install

# 安裝後端依賴
cd backend
npm install
cd ..
```

#### 環境變數配置
```bash
# 複製環境變數模板
cp env.example .env
cp backend/env.example backend/.env

# 編輯本地環境變數
nano .env
nano backend/.env
```

#### 本地環境變數配置示例
```env
# 前端環境變數 (.env)
NODE_ENV=development
API_BASE_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development

# 後端環境變數 (backend/.env)
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/cardstrategy_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-local-jwt-secret
```

---

## 🔧 本地開發流程

### 1. 數據庫設置

#### 創建本地數據庫
```bash
# 登錄 PostgreSQL
sudo -u postgres psql

# 創建數據庫和用戶
CREATE DATABASE cardstrategy_dev;
CREATE USER cardstrategy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cardstrategy_dev TO cardstrategy_user;
\q
```

#### 運行數據庫遷移
```bash
cd backend
npm run migrate
npm run seed
```

### 2. 啟動本地服務

#### 啟動後端服務
```bash
cd backend
npm run dev
# 服務將在 http://localhost:5000 運行
```

#### 啟動前端服務
```bash
# 新終端窗口
npm start
# 應用將在 http://localhost:3000 運行
```

#### 啟動 Redis 服務
```bash
# 如果 Redis 未運行
redis-server
```

### 3. 本地開發工作流程

#### 功能開發流程
1. **創建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **開發功能**
   - 在本地進行功能開發
   - 使用本地數據庫進行測試
   - 確保所有功能正常工作

3. **本地測試**
   ```bash
   # 運行單元測試
   npm test
   
   # 運行集成測試
   npm run test:integration
   
   # 運行端到端測試
   npm run test:e2e
   ```

4. **代碼審查**
   ```bash
   # 代碼格式化
   npm run lint
   npm run format
   
   # 提交代碼
   git add .
   git commit -m "feat: add your feature description"
   ```

---

## 🧪 本地測試策略

### 1. 單元測試
```bash
# 運行所有單元測試
npm test

# 運行特定測試文件
npm test -- --testPathPattern=CardService

# 生成測試覆蓋率報告
npm run test:coverage
```

### 2. 集成測試
```bash
# 運行 API 集成測試
npm run test:integration

# 運行數據庫集成測試
npm run test:db
```

### 3. 端到端測試
```bash
# 運行 E2E 測試
npm run test:e2e

# 運行特定 E2E 測試
npm run test:e2e -- --spec="card-scanning-flow.test.ts"
```

### 4. 性能測試
```bash
# 運行性能測試
npm run test:performance

# 生成性能報告
npm run test:performance:report
```

### 5. 安全測試
```bash
# 運行安全掃描
npm run test:security

# 運行依賴漏洞檢查
npm audit
npm audit fix
```

---

## 🔄 本地優化實施

### 1. 微前端架構實施

#### 本地微前端設置
```bash
# 創建微前端模組目錄
mkdir -p micro-frontends
cd micro-frontends

# 創建各個模組
mkdir card-management
mkdir market-analysis
mkdir ai-ecosystem
```

#### 模組配置示例
```typescript
// micro-frontends/card-management/webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'cardManagement',
      filename: 'remoteEntry.js',
      exposes: {
        './CardList': './src/components/CardList',
        './CardDetail': './src/components/CardDetail',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

### 2. SSR 優化實施

#### Next.js 集成
```bash
# 安裝 Next.js
npm install next react react-dom

# 創建 Next.js 配置
npx create-next-app@latest cardstrategy-ssr --typescript
```

#### SSR 配置示例
```typescript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};
```

### 3. PWA 功能實施

#### Service Worker 設置
```typescript
// public/sw.js
const CACHE_NAME = 'cardstrategy-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

---

## 📊 本地性能監控

### 1. 性能監控工具

#### 安裝監控工具
```bash
# 安裝性能監控工具
npm install --save-dev lighthouse webpack-bundle-analyzer

# 安裝開發工具
npm install --save-dev @types/node nodemon
```

#### 性能監控配置
```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  static measurePageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    };
  }

  static measureApiCall(url: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`API Call to ${url}: ${duration}ms`);
    return duration;
  }
}
```

### 2. 本地性能測試

#### 運行性能測試
```bash
# 運行 Lighthouse 測試
npm run lighthouse

# 運行 Bundle 分析
npm run analyze

# 運行性能基準測試
npm run benchmark
```

---

## 🚀 本地到生產部署流程

### 1. 本地驗證清單

#### 功能驗證
- [ ] 所有核心功能正常工作
- [ ] 用戶認證流程完整
- [ ] 卡片掃描功能正常
- [ ] AI 生態系統運行正常
- [ ] 數據質量管理功能完整
- [ ] 支付系統集成正常
- [ ] 社交功能運行正常

#### 性能驗證
- [ ] 頁面加載時間 < 2秒
- [ ] API 響應時間 < 500ms
- [ ] 數據庫查詢時間 < 200ms
- [ ] 記憶體使用量 < 512MB
- [ ] Bundle 大小 < 2MB

#### 安全驗證
- [ ] 所有安全測試通過
- [ ] 依賴漏洞檢查完成
- [ ] 代碼安全掃描通過
- [ ] 認證授權測試通過

#### 測試驗證
- [ ] 單元測試覆蓋率 > 90%
- [ ] 集成測試全部通過
- [ ] E2E 測試全部通過
- [ ] 性能測試達到標準

### 2. 生產環境準備

#### 環境變數準備
```bash
# 生產環境變數模板
cp env.example .env.production
cp backend/env.example backend/.env.production

# 編輯生產環境變數
nano .env.production
nano backend/.env.production
```

#### 生產環境變數示例
```env
# 生產環境變數 (.env.production)
NODE_ENV=production
API_BASE_URL=https://api.cardstrategyapp.com
REACT_APP_API_URL=https://api.cardstrategyapp.com
REACT_APP_ENVIRONMENT=production

# 後端生產環境變數 (backend/.env.production)
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@your-db-host:5432/cardstrategy_prod
REDIS_URL=redis://your-redis-host:6379
JWT_SECRET=your-production-jwt-secret
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-new-relic-key
```

### 3. 部署腳本準備

#### 創建部署腳本
```bash
# scripts/deploy-production.sh
#!/bin/bash

echo "🚀 開始部署 CardStrategy 到生產環境..."

# 1. 構建前端
echo "📦 構建前端應用..."
npm run build

# 2. 構建後端
echo "🔧 構建後端應用..."
cd backend
npm run build
cd ..

# 3. 運行測試
echo "🧪 運行測試..."
npm test
npm run test:integration
npm run test:e2e

# 4. 安全檢查
echo "🔒 安全檢查..."
npm audit
npm run test:security

# 5. 上傳到服務器
echo "📤 上傳到服務器..."
rsync -avz --exclude 'node_modules' --exclude '.git' ./ user@your-server:/var/www/cardstrategy/

# 6. 重啟服務
echo "🔄 重啟服務..."
ssh user@your-server "cd /var/www/cardstrategy && pm2 restart all"

echo "✅ 部署完成！"
```

#### 設置部署權限
```bash
chmod +x scripts/deploy-production.sh
```

### 4. 部署執行

#### 執行部署
```bash
# 執行部署腳本
./scripts/deploy-production.sh

# 或手動部署
npm run deploy:production
```

#### 部署後驗證
```bash
# 檢查服務狀態
curl -I https://cardstrategyapp.com

# 檢查 API 狀態
curl -I https://api.cardstrategyapp.com/health

# 檢查數據庫連接
curl https://api.cardstrategyapp.com/api/health/db
```

---

## 🔄 持續集成/持續部署 (CI/CD)

### 1. GitHub Actions 配置

#### 創建 CI/CD 工作流
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: |
        npm ci
        cd backend && npm ci
    - name: Run tests
      run: |
        npm test
        npm run test:integration
        npm run test:e2e
    - name: Security audit
      run: npm audit

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to server
      run: |
        chmod 600 ~/.ssh/id_rsa
        ./scripts/deploy-production.sh
```

### 2. 自動化部署觸發

#### 部署觸發條件
- 推送到 `main` 分支
- 所有測試通過
- 安全檢查通過
- 代碼審查通過

---

## 📈 監控和維護

### 1. 生產環境監控

#### 監控工具設置
```bash
# 安裝監控工具
npm install pm2 pm2-logrotate

# 配置 PM2
pm2 ecosystem
```

#### PM2 配置示例
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cardstrategy-api',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 2. 日誌管理

#### 日誌配置
```bash
# 創建日誌目錄
mkdir -p logs

# 配置日誌輪轉
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🎯 最佳實踐建議

### 1. 開發流程
- **功能分支**: 每個功能使用獨立分支
- **代碼審查**: 所有代碼必須經過審查
- **測試驅動**: 先寫測試，再寫代碼
- **持續集成**: 自動化測試和部署

### 2. 部署策略
- **藍綠部署**: 零停機部署
- **回滾機制**: 快速回滾到上一個版本
- **健康檢查**: 部署後自動健康檢查
- **監控警報**: 即時監控和警報

### 3. 安全措施
- **環境隔離**: 開發、測試、生產環境分離
- **密鑰管理**: 安全的密鑰管理
- **訪問控制**: 嚴格的訪問權限控制
- **安全掃描**: 定期安全掃描

---

## 📝 總結

這個本地開發和部署流程提供了：

✅ **完整的本地開發環境**  
✅ **全面的測試策略**  
✅ **系統的優化實施**  
✅ **安全的部署流程**  
✅ **持續的監控維護**  

**建議**: 在本地完成所有開發、測試和優化工作後，再進行生產環境部署，確保系統的穩定性和可靠性。

---

*本指南將幫助您建立一個完整的本地開發到生產部署的工作流程。*
