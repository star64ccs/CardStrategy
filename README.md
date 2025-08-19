# 🎴 卡策 (CardStrategy)

一款結合 AI 與市場分析的卡牌投資與收藏管理手機 App

## 📱 應用概述

卡策是一款專為卡牌收藏家和投資者設計的智能手機應用，提供：

- **📊 智能市場分析** - AI 驅動的價格預測和市場趨勢分析
- **💎 投資組合管理** - 完整的卡片投資追蹤和管理
- **🔍 卡片掃描識別** - 快速掃描和識別卡片信息
- **🤖 AI 投資助手** - 智能投資建議和風險評估
- **📈 實時價格追蹤** - 即時價格更新和變動通知
- **🎯 個性化推薦** - 基於用戶偏好的卡片推薦

## 🚀 技術架構

### 前端技術
- **React Native** - 跨平台手機應用開發
- **Expo** - 開發工具和平台服務
- **TypeScript** - 類型安全的 JavaScript
- **Redux Toolkit** - 狀態管理
- **React Navigation** - 導航管理

### 核心功能
- **認證系統** - JWT 令牌認證
- **API 整合** - RESTful API 通信
- **本地存儲** - AsyncStorage 數據持久化
- **相機整合** - 卡片掃描功能
- **推送通知** - 價格變動提醒

## 📋 功能特色

### 🎯 核心功能
- ✅ 用戶註冊/登錄
- ✅ 卡片瀏覽和搜索
- ✅ 投資組合管理
- ✅ 市場數據分析
- ✅ AI 投資建議
- ✅ 卡片掃描識別
- ✅ 價格追蹤提醒
- ✅ 收藏管理

### 🤖 AI 功能
- ✅ 智能價格預測
- ✅ 投資風險評估
- ✅ 市場趨勢分析
- ✅ 個性化推薦
- ✅ AI 聊天助手

### 📊 數據分析
- ✅ 實時市場數據
- ✅ 投資組合統計
- ✅ 收益分析
- ✅ 風險評估
- ✅ 歷史數據追蹤

## 🛠️ 開發環境設置

### 系統要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Docker**: 20.10 或更高版本（推薦）
- **Docker Compose**: 2.0 或更高版本
- **Expo CLI**: 最新版本
- **Android Studio** (Android 開發)
- **Xcode** (iOS 開發，僅 macOS)

### 🚀 快速開始

#### 方法一：自動化配置（推薦）
```bash
# Windows 用戶
npm run setup:windows

# Linux/macOS 用戶
npm run setup:quick

# 或使用 Node.js 腳本
npm run setup
```

#### 方法二：手動配置
1. **克隆專案**
```bash
git clone https://github.com/your-username/CardStrategy.git
cd CardStrategy
```

2. **安裝依賴**
```bash
npm install
cd backend && npm install && cd ..
```

3. **配置環境變數**
```bash
cp env.example .env
# 編輯 .env 檔案，配置必要的 API 金鑰
```

4. **啟動服務**
```bash
# 啟動數據庫和緩存服務
npm run docker:up

# 初始化數據庫
npm run db:migrate
npm run db:seed
```

5. **啟動應用**
```bash
# 檢查環境配置
npm run check

# 啟動後端服務
npm run dev:backend

# 啟動前端服務（新終端）
npm run start

# 或同時啟動前後端
npm run dev:full
```

### 🌐 訪問地址
- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:3000/api
- **Grafana 監控**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090

### 📱 使用 Expo Go 測試
- 在手機上安裝 Expo Go App
- 掃描終端顯示的 QR 碼
- 開始開發和測試

## 📱 平台支持

### ✅ 支持的平台
- **Android** - Android 8.0+ (API 26+)
- **iOS** - iOS 12.0+

### 🔧 開發工具
- **Expo CLI** - 開發和構建工具
- **Expo Go** - 快速測試應用
- **React Native Debugger** - 調試工具

## 🏗️ 專案結構

```
CardStrategy/
├── src/
│   ├── components/          # 可重用組件
│   │   ├── common/         # 通用組件
│   │   ├── cards/          # 卡片相關組件
│   │   └── navigation/     # 導航組件
│   ├── screens/            # 應用屏幕
│   │   ├── auth/           # 認證相關屏幕
│   │   └── ...             # 其他功能屏幕
│   ├── services/           # API 服務
│   ├── store/              # Redux 狀態管理
│   ├── config/             # 配置文件
│   ├── utils/              # 工具函數
│   └── types/              # TypeScript 類型定義
├── assets/                 # 靜態資源
├── backend/                # 後端 API 服務
└── docs/                   # 文檔
```

## 🔧 開發命令

### 環境配置
```bash
npm run setup          # 自動配置環境
npm run setup:quick    # 快速配置（Linux/macOS）
npm run setup:windows  # 快速配置（Windows）
npm run check          # 檢查環境配置
```

### 服務管理
```bash
npm run docker:up      # 啟動 Docker 服務
npm run docker:down    # 停止 Docker 服務
npm run docker:logs    # 查看 Docker 日誌
npm run dev:backend    # 啟動後端服務
npm run dev:full       # 同時啟動前後端
```

### 數據庫管理
```bash
npm run db:migrate     # 運行數據庫遷移
npm run db:seed        # 運行數據庫種子
npm run db:reset       # 重置數據庫
```

### 基本命令
```bash
npm start              # 啟動前端開發服務器
npm run android        # 啟動 Android 模擬器
npm run ios            # 啟動 iOS 模擬器
npm test               # 運行測試
npm run lint           # 代碼檢查
```

### 構建命令
```bash
npm run build:android  # 構建 Android APK
npm run build:ios      # 構建 iOS App
npm run deploy:mobile  # 部署到應用商店
```

### 開發工具
```bash
npm run lint:check     # ESLint 檢查
npm run lint:fix       # 自動修復代碼
npm run format         # 代碼格式化
npm run clean:cache    # 清理緩存
```

## 📊 API 整合

### 後端服務
- **認證 API** - 用戶註冊/登錄
- **卡片 API** - 卡片數據管理
- **市場 API** - 市場數據分析
- **AI API** - 智能分析服務
- **投資 API** - 投資組合管理

### 數據存儲
- **AsyncStorage** - 本地數據存儲
- **Redux Persist** - 狀態持久化
- **SQLite** - 本地數據庫

## 🎨 UI/UX 設計

### 設計系統
- **Material Design** - Android 設計規範
- **Human Interface Guidelines** - iOS 設計規範
- **自定義主題** - 品牌色彩和字體

### 響應式設計
- **適配不同屏幕尺寸**
- **支持深色模式**
- **無障礙功能支持**

## 🔒 安全性

### 數據安全
- **JWT 令牌認證**
- **API 請求加密**
- **本地數據加密**
- **安全存儲敏感信息**

### 隱私保護
- **用戶數據保護**
- **匿名化分析**
- **可選數據收集**

## 📈 性能優化

### 應用性能
- **代碼分割**
- **圖片優化**
- **緩存策略**
- **懶加載**

### 網絡優化
- **API 請求優化**
- **離線支持**
- **數據同步**

## 🧪 測試

### 測試覆蓋
- **單元測試** - Jest
- **組件測試** - React Native Testing Library
- **E2E 測試** - Detox

### 測試命令
```bash
npm test              # 運行所有測試
npm run test:watch    # 監視模式測試
npm run test:coverage # 測試覆蓋率報告
```

## 🚀 部署

### 開發環境
```bash
npm start  # 使用 Expo Go 測試
```

### 生產環境
```bash
# 構建生產版本
npm run build:android
npm run build:ios

# 部署到應用商店
npm run deploy:mobile
```

## 📚 文檔

### 開發文檔
- [環境配置指南](./ENVIRONMENT_SETUP_GUIDE.md)
- [API 文檔](./API_DOCUMENTATION.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [專案狀態](./PROJECT_STATUS.md)
- [故障排除指南](./TROUBLESHOOTING_GUIDE.md)

### 用戶指南
- [使用說明](./docs/user-guide/user-manual.md)
- [功能介紹](./docs/features.md)
- [常見問題](./docs/faq.md)

## 🤝 貢獻

### 開發流程
1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 發起 Pull Request

### 代碼規範
- 使用 TypeScript
- 遵循 ESLint 規則
- 編寫測試用例
- 更新文檔

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

## 📞 聯繫方式

- **專案維護者**: CardStrategy Team
- **郵箱**: support@cardstrategy.com
- **GitHub**: https://github.com/your-username/CardStrategy
- **文檔**: https://docs.cardstrategy.com

---

**�� 卡策 - 智選卡牌，策略致勝**
