# 開發工作流程指南

## 🚀 快速開始

### 1. 環境設置

```bash
# 克隆項目
git clone <repository-url>
cd CardStrategy

# 安裝依賴
npm install

# 設置開發環境
npm run dev:setup
```

### 2. 啟動開發服務器

```bash
# 啟動 Expo 開發服務器
npm start

# 啟動後端服務器
npm run dev:backend

# 同時啟動前後端
npm run dev:full
```

## 📝 代碼規範

### TypeScript 配置

- 使用嚴格模式 (`strict: true`)
- 禁止隱式 any 類型
- 要求明確的返回類型
- 使用相對路徑導入

### ESLint 規則

- 使用 TypeScript ESLint 規則
- React Hooks 規則
- 導入排序規則
- 代碼風格一致性

### Prettier 配置

- 單引號
- 2 空格縮進
- 80 字符行寬
- 尾隨逗號

## 🔧 開發工具

### VS Code 擴展

推薦安裝以下擴展：

- Prettier - Code formatter
- ESLint
- TypeScript Importer
- Auto Rename Tag
- Path Intellisense
- GitLens

### 工作區設置

VS Code 會自動應用項目中的 `.vscode/settings.json` 配置：

- 保存時自動格式化
- 自動修復 ESLint 問題
- 自動整理導入
- TypeScript 智能提示

## 🏗️ 代碼生成

### 生成組件

```bash
# 生成函數式組件
npm run generate:component MyComponent

# 生成類組件
npm run generate:component MyComponent class
```

### 生成服務

```bash
# 生成 API 服務
npm run generate:service MyService api

# 生成工具服務
npm run generate:service MyService utility

# 生成存儲服務
npm run generate:service MyService storage
```

## 🧪 測試

### 運行測試

```bash
# 運行所有測試
npm test

# 監視模式
npm run test:watch

# 快速測試
npm run test:fast

# 測試覆蓋率
npm run test:coverage
```

### 測試規範

- 每個組件和服務都應該有對應的測試文件
- 使用描述性的測試名稱
- 測試應該覆蓋主要功能和邊界情況
- 使用 Jest 和 React Native Testing Library

## 📦 Git 工作流程

### 提交規範

使用 Conventional Commits 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

類型：
- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文檔更新
- `style`: 代碼格式調整
- `refactor`: 重構
- `test`: 測試相關
- `chore`: 構建過程或輔助工具的變動

### Git Hooks

項目配置了以下 Git hooks：

- `pre-commit`: 運行 lint、type-check 和測試
- `commit-msg`: 檢查提交信息格式

### 分支策略

- `main`: 主分支，包含生產就緒的代碼
- `develop`: 開發分支，包含最新的開發功能
- `feature/*`: 功能分支
- `hotfix/*`: 熱修復分支

## 🔍 代碼檢查

### 手動檢查

```bash
# ESLint 檢查
npm run lint

# 自動修復 ESLint 問題
npm run lint:fix

# TypeScript 類型檢查
npm run type-check

# 代碼格式化
npm run format
```

### 自動檢查

- 保存時自動格式化
- 提交前自動運行檢查
- CI/CD 流水線中的自動檢查

## 📚 項目結構

```
src/
├── components/          # React 組件
├── screens/            # 頁面組件
├── services/           # 業務邏輯服務
├── store/              # 狀態管理
├── utils/              # 工具函數
├── types/              # TypeScript 類型定義
├── config/             # 配置文件
├── hooks/              # 自定義 Hooks
├── i18n/               # 國際化
└── assets/             # 靜態資源
```

## 🚨 常見問題

### 依賴衝突

如果遇到依賴衝突，可以嘗試：

```bash
# 使用 legacy peer deps
npm install --legacy-peer-deps

# 清理並重新安裝
npm run clean
npm install
```

### TypeScript 錯誤

- 確保所有導入都有正確的類型
- 使用 `any` 類型時要謹慎
- 檢查 tsconfig.json 配置

### ESLint 錯誤

- 運行 `npm run lint:fix` 自動修復
- 檢查 ESLint 配置文件
- 確保所有規則都正確配置

## 📖 更多資源

- [TypeScript 官方文檔](https://www.typescriptlang.org/docs/)
- [React Native 文檔](https://reactnative.dev/docs/getting-started)
- [Expo 文檔](https://docs.expo.dev/)
- [Jest 測試文檔](https://jestjs.io/docs/getting-started)
- [ESLint 規則參考](https://eslint.org/docs/rules/)
