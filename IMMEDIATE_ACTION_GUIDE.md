# 🚀 CardStrategy 立即行動指南

## 🎯 今天就可以開始的任務

### 第一步：環境變量配置 (30分鐘)

#### 1. 創建生產環境配置文件
```bash
# 在 backend 目錄
cd backend
cp env.example .env.production

# 在 frontend 目錄 (如果有的話)
cd ../src
cp .env.example .env.production
```

#### 2. 配置最基本的環境變量
編輯 `backend/.env.production`，設置以下變量：

```bash
# 服務器配置
NODE_ENV=production
PORT=3000

# 數據庫配置 (使用本地數據庫進行測試)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cardstrategy_production
POSTGRES_USER=cardstrategy_user
POSTGRES_PASSWORD=your-secure-password

# JWT 配置 (生成安全的密鑰)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=30d
JWT_REFRESH_EXPIRE=7d

# 跨域配置
ALLOWED_ORIGINS=http://localhost:3000,https://cardstrategy.com
```

#### 3. 生成安全的 JWT 密鑰
```bash
# 在終端中運行以下命令生成安全密鑰
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

將生成的密鑰分別替換 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`。

### 第二步：設置本地數據庫 (20分鐘)

#### 1. 安裝 PostgreSQL (如果還沒安裝)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# 下載並安裝 PostgreSQL: https://www.postgresql.org/download/windows/
```

#### 2. 創建數據庫和用戶
```bash
# 連接到 PostgreSQL
sudo -u postgres psql

# 在 PostgreSQL 中執行以下命令
CREATE USER cardstrategy_user WITH PASSWORD 'your-secure-password';
CREATE DATABASE cardstrategy_production;
GRANT ALL PRIVILEGES ON DATABASE cardstrategy_production TO cardstrategy_user;
\q
```

#### 3. 運行數據庫遷移
```bash
cd backend
npm run migrate:production
```

### 第三步：測試後端連接 (15分鐘)

#### 1. 啟動後端服務器
```bash
cd backend
npm install
npm start
```

#### 2. 測試健康檢查端點
```bash
curl http://localhost:3000/health
```

應該返回類似以下的響應：
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX",
  "version": "1.0.0"
}
```

### 第四步：移除一個模擬數據 (20分鐘)

#### 1. 修改 CardsScreen.tsx
打開 `src/screens/CardsScreen.tsx`，找到以下代碼：

```typescript
// 找到這行
const mockCards = cardService.getMockCards();
setCards(mockCards);
```

替換為：

```typescript
try {
  const response = await cardService.getCards();
  setCards(response.data.cards);
} catch (error) {
  logger.error('載入卡片失敗:', { error });
  // 顯示錯誤信息給用戶
}
```

#### 2. 測試修改
重新啟動前端應用，測試卡片列表是否正常加載。

---

## 📅 本週行動計劃

### 週一：基礎設置
- [x] 配置環境變量
- [x] 設置數據庫
- [x] 測試後端連接
- [x] 移除一個模擬數據

### 週二：第三方服務配置
- [ ] **OpenAI API 配置**
  - [ ] 註冊 OpenAI 帳戶
  - [ ] 獲取 API 密鑰
  - [ ] 添加到環境變量
  - [ ] 測試 API 連接

- [ ] **郵件服務配置**
  - [ ] 設置 Gmail 應用密碼
  - [ ] 配置 SMTP 設置
  - [ ] 測試郵件發送

### 週三：移除更多模擬數據
- [ ] 修改 `HomeScreen.tsx`
- [ ] 修改 `SearchScreen.tsx`
- [ ] 修改 `Portfolio.tsx`
- [ ] 測試所有修改

### 週四：支付系統配置
- [ ] **Stripe 配置**
  - [ ] 註冊 Stripe 帳戶
  - [ ] 獲取 API 密鑰
  - [ ] 配置 Webhook
  - [ ] 測試支付流程

### 週五：測試和優化
- [ ] 全面測試所有功能
- [ ] 修復發現的問題
- [ ] 優化性能
- [ ] 準備下週計劃

---

## 🔧 常見問題解決

### 問題 1: 數據庫連接失敗
**錯誤信息**: `ECONNREFUSED` 或 `password authentication failed`

**解決方案**:
```bash
# 檢查 PostgreSQL 是否運行
sudo systemctl status postgresql

# 如果沒有運行，啟動服務
sudo systemctl start postgresql

# 檢查用戶權限
sudo -u postgres psql -c "\du"
```

### 問題 2: JWT 錯誤
**錯誤信息**: `jwt malformed` 或 `invalid signature`

**解決方案**:
```bash
# 重新生成 JWT 密鑰
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 確保環境變量正確設置
echo $JWT_SECRET
```

### 問題 3: CORS 錯誤
**錯誤信息**: `Access to fetch at 'http://localhost:3000/api/cards' from origin 'http://localhost:19006' has been blocked by CORS policy`

**解決方案**:
在 `backend/.env.production` 中添加：
```bash
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:3000,https://cardstrategy.com
```

### 問題 4: API 調用失敗
**錯誤信息**: `Network Error` 或 `404 Not Found`

**解決方案**:
1. 檢查後端服務器是否運行
2. 檢查 API 端點是否正確
3. 檢查環境變量配置

---

## 📞 需要幫助時

### 1. 檢查日誌
```bash
# 後端日誌
cd backend && npm run dev

# 前端日誌
# 在 Expo 開發工具中查看
```

### 2. 調試工具
- **Postman**: 測試 API 端點
- **pgAdmin**: 查看數據庫
- **React Native Debugger**: 調試前端代碼

### 3. 文檔參考
- `PRODUCTION_ISSUES_AND_RESOLUTION_PLAN.md`: 詳細問題分析
- `TASK_TRACKING_CHECKLIST.md`: 完整任務清單
- `README.md`: 專案概述

---

## 🎯 成功指標

### 今天的目標
- [ ] 後端可以正常啟動
- [ ] 數據庫連接正常
- [ ] 至少一個模擬數據已移除
- [ ] 基本功能可以正常使用

### 本週目標
- [ ] 所有環境變量已配置
- [ ] 所有模擬數據已移除
- [ ] 第三方服務已配置
- [ ] 系統可以正常運行

---

## ⚠️ 注意事項

### 安全提醒
1. **不要將真實的 API 密鑰提交到 Git**
2. **使用強密碼保護數據庫**
3. **定期更新 JWT 密鑰**
4. **監控系統日誌**

### 備份提醒
1. **定期備份數據庫**
2. **保存重要的配置文件**
3. **記錄所有配置變更**

---

**開始時間**: 現在  
**預計完成**: 本週五  
**負責人**: [您的姓名]  
**緊急聯繫**: [您的聯繫方式]
