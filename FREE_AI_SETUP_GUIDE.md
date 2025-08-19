# 🆓 免費AI服務設置指南

## 📋 概述

本指南將幫助您設置免費的開源AI服務來替代OpenAI和Gemini，讓您的CardStrategy專案能夠在無法使用這些服務的地區正常運行。

## 🎯 支持的免費AI服務

### 1. **Ollama** (推薦)
- **類型**: 本地運行的大語言模型
- **優點**: 完全免費、離線運行、隱私保護
- **支持的模型**: Llama 2, Mistral, CodeLlama
- **系統要求**: 8GB+ RAM, 4GB+ 硬碟空間

### 2. **Hugging Face** (免費API)
- **類型**: 雲端免費API
- **優點**: 無需本地部署、每月免費額度
- **支持的模型**: GPT-2, DialoGPT, GPT-Neo
- **限制**: 每月1000次請求

### 3. **OpenAI兼容服務** (本地部署)
- **類型**: 本地部署的OpenAI API兼容服務
- **優點**: 與現有代碼完全兼容
- **支持的模型**: 任何本地模型

## 🚀 快速設置

### 選項1: Ollama (推薦)

#### 1. 安裝Ollama

**Windows:**
```bash
# 下載並安裝
# 訪問 https://ollama.ai/download
# 或使用 winget
winget install Ollama.Ollama
```

**macOS:**
```bash
# 使用 Homebrew
brew install ollama

# 或下載安裝包
# https://ollama.ai/download
```

**Linux:**
```bash
# 使用 curl
curl -fsSL https://ollama.ai/install.sh | sh
```

#### 2. 啟動Ollama服務
```bash
ollama serve
```

#### 3. 下載模型
```bash
# 下載 Llama 2 (推薦)
ollama pull llama2

# 下載 Mistral (更高效)
ollama pull mistral

# 下載 CodeLlama (代碼生成)
ollama pull codellama
```

#### 4. 測試模型
```bash
# 測試 Llama 2
ollama run llama2 "你好，請介紹一下卡片投資"

# 測試 Mistral
ollama run mistral "分析一下青眼白龍這張卡片的投資價值"
```

#### 5. 配置環境變量
```bash
# 在 .env 文件中添加
OLLAMA_BASE_URL=http://localhost:11434
```

### 選項2: Hugging Face (免費API)

#### 1. 註冊Hugging Face帳號
- 訪問 https://huggingface.co/
- 註冊免費帳號

#### 2. 獲取API密鑰
- 登錄後進入 Settings > Access Tokens
- 創建新的API密鑰

#### 3. 配置環境變量
```bash
# 在 .env 文件中添加
HUGGING_FACE_API_KEY=your-hugging-face-api-key
```

### 選項3: OpenAI兼容服務

#### 1. 安裝OpenAI兼容服務
```bash
# 使用 Docker
docker run -d --name openai-compatible \
  -p 8080:8080 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  ghcr.io/ollama/ollama-openai:latest
```

#### 2. 配置環境變量
```bash
# 在 .env 文件中添加
OPENAI_COMPATIBLE_URL=http://localhost:8080
```

## 🔧 專案配置

### 1. 更新環境變量

在 `backend/env.example` 中添加：

```bash
# ==================== 免費AI服務配置 ====================
# Ollama配置
OLLAMA_BASE_URL=http://localhost:11434

# Hugging Face配置
HUGGING_FACE_API_KEY=your-hugging-face-api-key

# OpenAI兼容服務配置
OPENAI_COMPATIBLE_URL=http://localhost:8080

# 禁用付費AI服務 (可選)
DISABLE_PAID_AI_SERVICES=true
```

### 2. 註冊新的API路由

在 `backend/src/app.js` 中添加：

```javascript
const localAIRouter = require('./routes/localAI');

// 註冊本地AI路由
app.use('/api/local-ai', localAIRouter);
```

### 3. 測試AI服務

```bash
# 啟動後端服務
cd backend
npm run dev

# 測試AI健康檢查
curl http://localhost:3000/api/local-ai/health

# 測試AI生成
curl -X POST http://localhost:3000/api/local-ai/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{}'
```

## 📊 性能對比

| 服務 | 響應時間 | 準確度 | 成本 | 隱私性 |
|------|----------|--------|------|--------|
| Ollama | 2-5秒 | 高 | 免費 | 完全私有 |
| Hugging Face | 1-3秒 | 中等 | 免費 | 雲端 |
| OpenAI兼容 | 2-5秒 | 高 | 免費 | 完全私有 |

## 🔄 遷移現有代碼

### 1. 更新AI服務調用

將現有的AI調用從：
```javascript
// 舊的調用方式
const result = await multiAIService.executeRequest(prompt, options);
```

改為：
```javascript
// 新的調用方式
const localAIService = require('../services/localAIService');
const result = await localAIService.generateText(prompt, taskType, options);
```

### 2. 更新前端配置

在 `src/services/multiAIService.ts` 中添加本地AI支持：

```typescript
// 添加本地AI提供商
{
  provider: 'local',
  apiKey: '', // 不需要API密鑰
  models: ['llama2', 'mistral'],
  capabilities: ['recognition', 'analysis', 'prediction'],
  priority: 1, // 最高優先級
  isActive: true
}
```

## 🛠️ 故障排除

### 常見問題

#### 1. Ollama服務無法啟動
```bash
# 檢查Ollama是否正確安裝
ollama --version

# 重新啟動服務
ollama serve

# 檢查端口是否被佔用
netstat -an | grep 11434
```

#### 2. 模型下載失敗
```bash
# 清理緩存
ollama rm llama2
ollama pull llama2

# 檢查網路連接
curl -I https://ollama.ai
```

#### 3. Hugging Face API限制
```bash
# 檢查API密鑰
curl -H "Authorization: Bearer your-api-key" \
  https://api-inference.huggingface.co/models/gpt2
```

#### 4. 記憶體不足
```bash
# 使用較小的模型
ollama pull llama2:7b
ollama pull mistral:7b

# 或增加虛擬記憶體
```

## 📈 最佳實踐

### 1. 模型選擇
- **一般用途**: Llama 2 7B
- **高效能**: Mistral 7B
- **代碼生成**: CodeLlama
- **中文優化**: Chinese-Llama-2

### 2. 性能優化
```bash
# 使用GPU加速 (如果可用)
export CUDA_VISIBLE_DEVICES=0
ollama run llama2:7b

# 調整記憶體使用
export OLLAMA_HOST=0.0.0.0:11434
```

### 3. 監控和日誌
```bash
# 查看Ollama日誌
ollama logs

# 監控資源使用
htop
nvidia-smi  # 如果使用GPU
```

## 🔒 安全考慮

### 1. 本地部署安全
- 確保Ollama服務只在本機運行
- 使用防火牆限制端口訪問
- 定期更新模型和服務

### 2. API安全
- 保護Hugging Face API密鑰
- 使用環境變量存儲敏感信息
- 實施速率限制

## 📞 支援

如果遇到問題，可以：

1. 查看 [Ollama文檔](https://ollama.ai/docs)
2. 訪問 [Hugging Face論壇](https://discuss.huggingface.co/)
3. 檢查專案的GitHub Issues

## 🎉 完成設置

設置完成後，您的專案將能夠：

✅ 使用免費的本地AI服務  
✅ 完全離線運行AI功能  
✅ 保護用戶隱私  
✅ 無需支付API費用  
✅ 支持多種AI模型  

現在您可以開始使用免費的AI服務來替代OpenAI和Gemini了！
