# 卡策 CardStrategy

<div align="center">

![Card Strategy Logo](assets/tcg-logo.svg)

**🎮 專業的 TCG 卡牌分析、投資建議與收藏管理平台**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.0-blue.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## 📋 目錄

- [✨ 功能特色](#-功能特色)
- [🏗️ 技術架構](#️-技術架構)
- [🚀 快速開始](#-快速開始)
- [📱 主要功能](#-主要功能)
- [🔧 開發指南](#-開發指南)
- [📊 專案結構](#-專案結構)
- [🧪 測試與品質](#-測試與品質)
- [🚀 部署指南](#-部署指南)
- [📚 文檔](#-文檔)
- [💎 會員制度](#-會員制度)
- [🤝 貢獻指南](#-貢獻指南)

## ✨ 功能特色

### 🎯 核心功能
- **📸 智能卡牌辨識** - AI 驅動的卡牌自動識別與分析
- **💰 投資建議系統** - 基於機器學習的價格預測與投資建議
- **🔍 真偽檢測** - 高精度卡牌真偽判斷與品質評估
- **📊 市場分析** - 即時市場趨勢分析與價格追蹤
- **📚 收藏管理** - 完整的個人收藏管理系統
- **🤖 AI 聊天助手** - 智能 TCG 諮詢與建議

### 🛡️ 隱私與合規
- **🔒 數據保護** - 完整的 GDPR 合規與數據加密
- **📋 隱私管理** - 用戶數據權利管理與透明度
- **🛡️ 安全監控** - 實時安全監控與威脅檢測
- **📊 合規報告** - 自動化隱私合規檢查與報告

### 📈 進階功能
- **🎯 置中度評估** - 專業的卡牌置中度分析
- **📊 評級數據** - 整合多平台評級數據
- **🔄 數據同步** - 跨平台數據同步與備份
- **📱 多平台支援** - iOS、Android、Web 全平台支援

## 🏗️ 技術架構

### 前端技術棧
- **React Native 0.79.5** - 跨平台移動應用開發
- **Expo 53.0.0** - 開發工具與平台服務
- **React 19.0.0** - 用戶界面框架
- **Redux Toolkit 2.0.1** - 狀態管理
- **React Navigation 6.x** - 導航系統
- **i18next** - 國際化支援

### 後端技術棧
- **Node.js** - 服務器運行環境
- **Express.js** - Web 應用框架
- **Sequelize** - ORM 數據庫管理
- **SQLite/PostgreSQL** - 數據庫
- **Redis** - 快取與會話管理
- **JWT** - 身份驗證

### AI 與機器學習
- **TensorFlow.js** - 客戶端機器學習
- **OpenAI API** - 自然語言處理
- **Google PaLM** - AI 對話系統
- **Azure OpenAI** - 雲端 AI 服務

### 開發工具(嚴格)
- **ESLint** - 代碼品質檢查
- **Prettier** - 代碼格式化
- **Jest** - 單元測試
- **TypeScript** - 類型安全

## 🚀 快速開始

### 環境要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Expo CLI** (全局安裝)
- **React Native 開發環境**

### 安裝步驟

```bash
# 1. 克隆專案
git clone https://github.com/your-username/CardStrategy.git
cd CardStrategy

# 2. 安裝依賴
npm install

# 3. 設置環境變量
cp env.example .env

# 4. 啟動開發服務器
npm start
```

### 開發命令

```bash
# 啟動開發服務器
npm start                    # Expo 開發服務器
npm run start:optimized     # 優化模式啟動
npm run start:clear         # 清除快取啟動

# 平台特定啟動
npm run android             # Android 模擬器
npm run ios                 # iOS 模擬器
npm run web                 # Web 瀏覽器

# 代碼品質
npm run lint:check          # ESLint 檢查
npm run lint:fix            # 自動修復
npm run format              # Prettier 格式化

# 測試
npm test                    # 單元測試
npm run test:coverage       # 測試覆蓋率
npm run test:watch          # 監視模式測試
```

## 📱 主要功能

### 🎯 卡牌管理
- **智能辨識** - 拍照或上傳圖片自動識別卡牌
- **收藏管理** - 個人收藏分類與管理
- **品質評估** - 卡牌狀況與置中度分析
- **真偽檢測** - AI 驅動的真偽判斷

### 💰 投資分析
- **價格預測** - 基於歷史數據的價格趨勢預測
- **市場分析** - 即時市場數據與趨勢分析
- **投資建議** - 個性化投資策略建議
- **風險評估** - 投資風險分析與管理

### 🤖 AI 助手
- **智能諮詢** - TCG 相關問題智能回答
- **投資建議** - 基於 AI 的投資決策支援
- **市場洞察** - 深度市場分析與洞察
- **個性化推薦** - 基於用戶偏好的推薦

### 🛡️ 隱私保護
- **數據加密** - 端到端數據加密
- **隱私控制** - 用戶數據權利管理
- **合規檢查** - 自動化隱私合規檢查
- **安全監控** - 實時安全威脅檢測

## 🔧 開發指南

### 代碼品質

```bash
# 代碼檢查
npm run lint:check          # ESLint 檢查
npm run lint:fix            # 自動修復
npm run format              # Prettier 格式化

# 測試
npm test                    # 單元測試
npm run test:coverage       # 測試覆蓋率
npm run test:watch          # 監視模式測試
```

### 專案清理

```bash
# 清理專案
npm run clean:project       # 自動清理重複檔案
npm run clean:cache         # 清理快取
npm run clean               # 重新安裝依賴

# 安全檢查
npm audit                   # 安全漏洞檢查
npm run monitor:security    # 安全監控
```

### 監控與報告

```bash
# 性能監控
npm run monitor:health      # 健康檢查
npm run monitor:performance # 性能監控

# 報告生成
npm run report:coverage     # 測試覆蓋率報告
npm run report:performance  # 性能分析報告
npm run report:security     # 安全報告
```

## 📊 專案結構

```
CardStrategy/
├── 📱 前端應用 (React Native + Expo)
│   ├── src/
│   │   ├── components/          # 可重用組件
│   │   │   ├── enhanced/        # 增強組件
│   │   │   └── ...
│   │   ├── screens/             # 應用畫面
│   │   │   ├── auth/           # 認證相關畫面
│   │   │   └── ...
│   │   ├── services/            # 業務邏輯服務
│   │   ├── store/               # Redux 狀態管理
│   │   │   └── slices/         # Redux Toolkit 切片
│   │   ├── utils/               # 工具函數
│   │   ├── config/              # 配置文件
│   │   └── i18n/                # 國際化
│   ├── assets/                  # 靜態資源
│   └── android/                 # Android 原生配置
├── 🔧 後端 API (Node.js + Express)
│   ├── routes/                  # API 路由
│   ├── models/                  # 數據模型
│   ├── middleware/              # 中間件
│   ├── services/                # 業務服務
│   ├── utils/                   # 工具函數
│   └── config/                  # 配置文件
├── 📚 文檔
│   ├── docs/                    # 技術文檔
│   └── MAINTENANCE_GUIDE.md     # 維護指南
├── 🛠️ 腳本工具
│   ├── scripts/                 # 開發腳本
│   └── scripts/cleanup-project.js # 專案清理
└── 📋 配置文件
    ├── package.json             # 前端依賴
    ├── backend/package.json     # 後端依賴
    ├── app.json                 # Expo 配置
    └── .gitignore               # Git 忽略
```

## 🧪 測試與品質

### 測試策略

- **單元測試** - Jest 框架，覆蓋核心業務邏輯
- **集成測試** - API 端點與數據庫操作測試
- **端到端測試** - 用戶流程測試
- **性能測試** - 應用性能與響應時間測試

### 代碼品質(嚴格)

- **ESLint** - 代碼風格與品質檢查
- **Prettier** - 代碼格式化
- **TypeScript** - 類型安全檢查
- **Husky** - Git hooks 自動化

### 安全檢查

- **npm audit** - 依賴安全漏洞檢查
- **OWASP ZAP** - 安全掃描
- **代碼審查** - 手動安全代碼審查

## 🚀 部署指南

### 平台支援

#### 前端部署
- **Vercel** - Web 應用部署
- **Netlify** - 靜態網站部署
- **Firebase** - Google 雲端部署

#### 後端部署
- **Heroku** - 雲端平台部署
- **Railway** - 現代化部署平台
- **Render** - 全棧應用部署
- **Docker** - 容器化部署

#### 移動應用
- **EAS Build** - Expo 應用構建
- **App Store** - iOS 應用商店
- **Google Play** - Android 應用商店

### 部署命令

```bash
# 快速部署
npm run deploy:staging       # 測試環境部署
npm run deploy:production    # 生產環境部署

# 平台特定部署
npm run deploy:vercel        # Vercel 部署
npm run deploy:heroku        # Heroku 部署
npm run deploy:docker        # Docker 部署

# 類型特定部署
npm run deploy:frontend      # 前端部署
npm run deploy:backend       # 後端部署
npm run deploy:mobile        # 移動應用部署
```

### 環境配置

```bash
# 必需環境變量
EXPO_PUBLIC_API_URL=https://api.CardStrategy.com
NODE_ENV=production
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

# AI 服務配置
OPENAI_API_KEY=your_openai_key
GOOGLE_PALM_API_KEY=your_google_palm_key
AZURE_OPENAI_API_KEY=your_azure_key
```

## 📚 文檔

### 技術文檔
- [🔧 維護指南](MAINTENANCE_GUIDE.md) - 專案維護與清理指南
- [📊 CI/CD 部署報告](docs/CICD_Deployment_Report.md) - 持續集成部署報告
- [🏗️ 統一架構設計報告](docs/統一架構設計優化報告.md) - 架構優化報告
- [🔒 隱私合規報告](docs/Privacy_Compliance_Report.md) - 隱私保護合規報告

### 開發文檔
- [🚀 部署指南](部署指南.md) - 詳細部署說明
- [🔗 前後端連接指南](前後端連接指南.md) - API 集成指南
- [⚙️ 前端配置更新指南](前端配置更新指南.md) - 配置管理指南

### 用戶文檔
- [📱 產品描述](PRODUCT_DESCRIPTION.md) - 產品功能介紹
- [🏪 應用商店描述](APP_STORE_DESCRIPTION.md) - 商店頁面描述

## 💎 會員制度

### 🆓 免費會員
- 卡牌識別（每日限制）
- 置中評估（每日限制）
- 基本價格查詢
- 收藏管理

### ⭐ VIP 試用會員 (7天免費)
- 每日 1 次 VIP 功能體驗
- 完整功能試用
- 優先客服支援

### 💎 付費 VIP 會員
- 無限制使用所有功能
- 優先客服支援
- 獨家功能預覽
- 高級分析工具

## 🤝 貢獻指南

### 開發流程

1. **Fork 專案** - 複製專案到個人帳戶
2. **創建分支** - `git checkout -b feature/AmazingFeature`
3. **開發功能** - 實現新功能或修復問題
4. **測試驗證** - 運行測試確保品質
5. **提交代碼** - `git commit -m 'Add some AmazingFeature'`
6. **推送分支** - `git push origin feature/AmazingFeature`
7. **創建 PR** - 開啟 Pull Request

### 代碼規範

- **命名規範** - 使用清晰的變量與函數命名
- **註釋規範** - 重要邏輯需要適當註釋
- **格式規範** - 遵循 Prettier 格式化規則
- **測試規範** - 新功能需要對應測試

### 提交規範

```
feat: 新功能
fix: 錯誤修復
docs: 文檔更新
style: 代碼格式調整
refactor: 代碼重構
test: 測試相關
chore: 構建過程或輔助工具的變動
```

## 📄 許可證

本專案採用 [MIT 許可證](LICENSE) - 查看 LICENSE 文件了解詳情。

## 📞 支援與聯繫

### 問題回報
- [GitHub Issues](https://github.com/your-username/CardStrategy/issues) - 問題回報與討論
- [GitHub Discussions](https://github.com/your-username/CardStrategy/discussions) - 功能討論

### 技術支援
- **文檔** - 查看專案文檔與指南
- **Issues** - 搜尋現有問題與解決方案
- **Discussions** - 參與技術討論

### 功能建議
- **Feature Request** - 新功能建議
- **Bug Report** - 錯誤回報
- **Improvement** - 改進建議

---

<div align="center">

**🎮 CardStrategy** - 您的智能交易卡牌遊戲助手

*讓每一張卡牌都發揮最大價值*

[![GitHub stars](https://img.shields.io/github/stars/your-username/CardStrategy?style=social)](https://github.com/your-username/CardStrategy)
[![GitHub forks](https://img.shields.io/github/forks/your-username/CardStrategy?style=social)](https://github.com/your-username/CardStrategy)
[![GitHub issues](https://img.shields.io/github/issues/your-username/CardStrategy)](https://github.com/your-username/CardStrategy/issues)

</div>
