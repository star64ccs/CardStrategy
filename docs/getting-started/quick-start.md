# 快速開始指南

## 🚀 5分鐘內開始使用 CardStrategy

本指南將幫助您在5分鐘內快速設置和運行 CardStrategy 項目。

### 📋 前置要求

在開始之前，請確保您的系統已安裝：

- **Node.js** (版本 18.0.0 或更高)
- **npm** (版本 8.0.0 或更高)
- **Git** (版本 2.0.0 或更高)
- **Expo CLI** (用於移動端開發)

### 🔧 快速安裝

#### 1. 克隆項目

```bash
git clone https://github.com/your-username/cardstrategy.git
cd cardstrategy
```

#### 2. 安裝依賴

```bash
# 安裝前端依賴
npm install

# 安裝後端依賴
cd backend
npm install
cd ..
```

#### 3. 環境配置

```bash
# 複製環境變量模板
cp env.example .env

# 編輯環境變量
# 請根據您的配置修改 .env 文件
```

#### 4. 啟動開發服務器

```bash
# 啟動前端開發服務器
npm start

# 在另一個終端啟動後端服務器
cd backend
npm run dev
```

### 📱 移動端開發

#### 1. 安裝 Expo CLI

```bash
npm install -g @expo/cli
```

#### 2. 啟動移動端開發

```bash
# 啟動 Expo 開發服務器
npx expo start

# 掃描 QR 碼在真機上運行
# 或按 'a' 在 Android 模擬器上運行
# 或按 'i' 在 iOS 模擬器上運行
```

### 🌐 Web 端開發

#### 1. 啟動 Web 服務器

```bash
# 啟動 Web 開發服務器
npm run web
```

#### 2. 訪問應用

打開瀏覽器訪問 `http://localhost:3000`

### 🧪 運行測試

```bash
# 運行所有測試
npm test

# 運行測試並生成覆蓋率報告
npm run test:coverage

# 運行特定類型的測試
npm run test:unit
npm run test:integration
npm run test:components
```

### 📦 構建應用

#### 移動端構建

```bash
# 構建 Android APK
npx expo build:android

# 構建 iOS IPA
npx expo build:ios

# 構建 Web 版本
npm run build:web
```

#### 後端構建

```bash
cd backend
npm run build
```

### 🚀 部署

#### 快速部署到 Render

```bash
# 使用自動化部署腳本
./scripts/deploy.sh
```

#### 手動部署

```bash
# 部署後端到 Render
cd backend
npm run deploy

# 部署前端到 Vercel
npm run deploy:web
```

### 🔍 驗證安裝

#### 1. 檢查服務狀態

```bash
# 檢查前端服務
curl http://localhost:3000/health

# 檢查後端服務
curl http://localhost:5000/api/health
```

#### 2. 運行健康檢查

```bash
# 運行完整的健康檢查
npm run health-check
```

### 📚 下一步

現在您已經成功設置了 CardStrategy 項目！接下來可以：

1. **閱讀用戶手冊** - 了解如何使用應用
2. **查看開發者文檔** - 了解如何開發新功能
3. **運行測試** - 確保一切正常工作
4. **探索代碼** - 了解項目結構

### 🆘 遇到問題？

如果遇到任何問題，請：

1. 查看 [故障排除指南](../user-guide/troubleshooting.md)
2. 檢查 [常見問題](../user-guide/faq.md)
3. 提交 Issue 到 GitHub
4. 聯繫技術支持團隊

### 📞 獲取幫助

- **文檔**: [完整文檔](../README.md)
- **GitHub**: [項目倉庫](https://github.com/your-username/cardstrategy)
- **Discord**: [開發者社區](https://discord.gg/cardstrategy)
- **郵箱**: support@cardstrategy.com

---

**完成時間**: 5分鐘  
**難度**: ⭐⭐☆☆☆  
**狀態**: 快速開始指南完成 ✅
