# API Key 配置文檔

## 概述
本文檔記錄了 CardStrategy 專案中使用的所有 API 服務配置。

## 已配置的 API 服務

### 1. OpenAI GPT-3.5 Turbo
- **用途**: 主要 AI 對話和文本生成 (試用版)
- **模型**: gpt-3.5-turbo
- **配置位置**: `src/config/ai-keys/openai-config.json`
- **環境變量**: `OPENAI_API_KEY`

### 2. Google Gemini
- **用途**: 備用 AI 模型
- **模型**: gemini-pro
- **配置位置**: `src/config/ai-keys/gemini-config.json`
- **環境變量**: `GEMINI_API_KEY`

### 3. Cohere
- **用途**: 語言模型和文本分析
- **模型**: command
- **配置位置**: `src/config/ai-keys/cohere-config.json`
- **環境變量**: `COHERE_API_KEY`

### 4. Cloudinary
- **用途**: 圖片和媒體文件管理
- **配置位置**: `src/config/ai-keys/cloudinary-config.json`
- **環境變量**: `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 5. Replicate
- **用途**: AI 模型部署和推理
- **配置位置**: `src/config/ai-keys/replicate-config.json`
- **環境變量**: `REPLICATE_API_TOKEN`

### 6. Google Cloud Vision
- **用途**: 圖像識別和分析
- **配置位置**: `src/config/ai-keys/google-cloud-vision-config.json`
- **環境變量**: `GOOGLE_CLOUD_VISION_API_KEY`

### 7. Cloudflare
- **用途**: CDN 和 DNS 管理
- **配置位置**: `src/config/ai-keys/cloudflare-config.json`
- **環境變量**: `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_ACCOUNT_ID`

### 8. AWS S3
- **用途**: 文件存儲和媒體管理
- **配置位置**: `src/config/ai-keys/aws-s3-config.json`
- **環境變量**: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`

### 9. Firebase
- **用途**: 推送通知、身份驗證和用戶分析
- **配置位置**: `src/config/ai-keys/firebase-config.json`
- **環境變量**: `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`

## 安全措施

### 保護機制
1. **Git 忽略**: 所有配置文件都在 .gitignore 中
2. **備份**: 自動創建備份文件
3. **環境變量**: 支持從環境變量讀取

### 使用方式
1. **開發環境**: 使用 `api-keys.env` 文件
2. **生產環境**: 使用環境變量
3. **備份恢復**: 使用 `scripts/protect-api-keys.js --restore`

## 維護說明

### 定期檢查
- 運行 `node scripts/protect-api-keys.js` 檢查保護狀態
- 定期更新 API Key
- 檢查備份文件完整性

### 更新 API Key
1. 更新對應的配置文件
2. 更新 `api-keys.env` 文件
3. 重新創建備份
4. 測試 API 連接

## 注意事項
- 不要將 API Key 提交到 Git
- 定期輪換 API Key
- 監控 API 使用量
- 保持備份文件安全

最後更新: 2025-08-21T14:15:08.511Z
