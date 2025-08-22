# 🚀 CardStrategy 快速行動指南

## 🎯 立即開始的任務 (今天就可以做)

### 1. 配置環境變量 (30 分鐘)

```bash
# 在 backend 目錄創建 .env 文件
cd backend
cp env.example .env
```

**需要配置的變量**:

- `NODE_ENV=development`
- `PORT=3000`
- `MONGODB_URI=mongodb://localhost:27017/cardstrategy`
- `JWT_SECRET=your-super-secret-jwt-key-here`
- `JWT_REFRESH_SECRET=your-super-secret-refresh-key-here`

### 2. 修復投資組合統計錯誤 (15 分鐘)

**文件**: `src/services/portfolioService.ts`
**問題**: 第 130 行 `getPortfolioSync()` 返回空數組

**修復方法**:

```typescript
private getPortfolioSync(): PortfolioItem[] {
  try {
    // 從 AsyncStorage 同步讀取數據
    const portfolioData = AsyncStorage.getItem(this.PORTFOLIO_KEY);
    return portfolioData ? JSON.parse(portfolioData) : [];
  } catch (error) {
    return [];
  }
}
```

### 3. 測試後端 API 連接 (20 分鐘)

```bash
# 啟動後端服務器
cd backend
npm install
npm start

# 測試健康檢查端點
curl http://localhost:3000/health
```

### 4. 檢查前端 API 連接 (15 分鐘)

**文件**: `src/config/environment.ts`
**確認**: API 基礎 URL 設置正確

```typescript
const development: Environment = {
  apiBaseUrl: 'http://localhost:3000/api', // 確認這個地址
  // ... 其他配置
};
```

---

## 🔧 本週需要完成的任務

### 週一: 後端基礎設置

- [ ] 配置數據庫連接
- [ ] 實現基本的認證 API
- [ ] 設置數據庫模型

### 週二: 前端 API 集成

- [ ] 移除模擬登錄邏輯
- [ ] 連接真實認證 API
- [ ] 測試登錄/註冊功能

### 週三: 錯誤處理

- [ ] 實現統一錯誤處理
- [ ] 添加 API 錯誤重試
- [ ] 測試錯誤場景

### 週四: 數據驗證

- [ ] 添加輸入驗證
- [ ] 實現響應數據驗證
- [ ] 完善 TypeScript 類型

### 週五: 測試與優化

- [ ] 測試所有 API 端點
- [ ] 修復發現的問題
- [ ] 準備下週計劃

---

## 🛠️ 開發環境設置

### 必需工具

```bash
# 檢查 Node.js 版本
node --version  # 需要 18+

# 檢查 npm 版本
npm --version   # 需要 8+

# 安裝 Expo CLI
npm install -g @expo/cli

# 安裝項目依賴
npm install
cd backend && npm install
```

### 開發命令

```bash
# 啟動前端開發服務器
npm start

# 啟動後端服務器
cd backend && npm run dev

# 檢查代碼質量
npm run lint

# 修復代碼格式
npm run lint:fix
```

---

## 📱 測試流程

### 1. 後端 API 測試

```bash
# 健康檢查
curl http://localhost:3000/health

# 註冊用戶
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!","displayName":"Test User"}'

# 登錄
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 2. 前端功能測試

- [ ] 啟動 Expo 開發服務器
- [ ] 在手機上安裝 Expo Go
- [ ] 掃描 QR 碼連接
- [ ] 測試登錄/註冊功能
- [ ] 測試卡片瀏覽功能
- [ ] 測試掃描功能

---

## 🚨 常見問題解決

### 1. 後端無法啟動

**問題**: 端口被佔用
**解決**:

```bash
# 查找佔用端口的進程
lsof -i :3000
# 殺死進程
kill -9 <PID>
```

### 2. 前端無法連接後端

**問題**: CORS 錯誤
**解決**: 檢查 `backend/src/server.js` 中的 CORS 配置

### 3. 數據庫連接失敗

**問題**: MongoDB 未啟動
**解決**:

```bash
# 啟動 MongoDB
mongod
# 或使用 Docker
docker run -d -p 27017:27017 mongo
```

### 4. 模擬數據仍然顯示

**問題**: API 調用失敗，回退到模擬數據
**解決**: 檢查網絡連接和 API 端點配置

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

- **React Native Debugger**: 調試前端代碼
- **Postman**: 測試 API 端點
- **MongoDB Compass**: 查看數據庫

### 3. 文檔參考

- [TODO.md](./TODO.md): 詳細任務清單
- [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md): 進度追蹤
- [README.md](./README.md): 專案概述

---

## 🎯 成功指標

### 本週目標

- [ ] 後端 API 可以正常啟動
- [ ] 前端可以連接到後端
- [ ] 用戶可以成功註冊和登錄
- [ ] 基本的錯誤處理已實現
- [ ] 模擬數據已被真實 API 替換

### 下週目標

- [ ] 所有核心 API 端點實現
- [ ] 前端完全集成真實 API
- [ ] 基本的離線功能
- [ ] 推送通知系統優化

---

**開始時間**: 現在  
**預計完成**: 本週五  
**負責人**: [您的姓名]
