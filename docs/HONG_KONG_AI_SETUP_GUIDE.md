# 🇭🇰 香港用戶 AI 服務設置指南

## 📋 概述

本指南專門為香港用戶提供在 CardStrategy 專案中使用 AI 服務的解決方案，包括免費替代方案和地區限制的解決方法。

---

## 🚫 香港地區限制說明

### OpenAI 限制

- ❌ **直接註冊限制**：香港 IP 無法直接註冊 OpenAI 帳戶
- ❌ **API 使用限制**：需要美國/其他地區的支付方式
- ❌ **服務可用性**：部分功能在香港可能受限

### Google Gemini 限制

- ❌ **服務地區限制**：Gemini API 在某些地區可能受限
- ❌ **支付方式**：需要支援的支付方式

---

## ✅ 解決方案

### 方案一：使用免費 AI 服務 (推薦) 🆓

#### 1. **Hugging Face (完全免費)**

```bash
# 註冊地址：https://huggingface.co/
# 免費額度：無限制
# 地區限制：無
```

**設置步驟：**

1. 訪問 https://huggingface.co/
2. 使用 GitHub 或 Google 帳戶註冊
3. 進入 Settings → Access Tokens
4. 創建新的 API Token
5. 複製 Token 到環境變量

**環境配置：**

```bash
# .env 文件
HUGGING_FACE_API_KEY=hf_your_token_here
```

**支持的模型：**

- `microsoft/DialoGPT-medium` - 對話生成
- `gpt2` - 文本生成
- `bert-base-chinese` - 中文處理
- `facebook/blenderbot-400M-distill` - 聊天機器人

#### 2. **Cohere (免費額度)**

```bash
# 註冊地址：https://cohere.ai/
# 免費額度：5 requests/minute
# 地區限制：無
```

**設置步驟：**

1. 訪問 https://cohere.ai/
2. 註冊帳戶
3. 進入 API Keys 頁面
4. 創建新的 API Key
5. 複製 Key 到環境變量

**環境配置：**

```bash
# .env 文件
COHERE_API_KEY=your_cohere_api_key_here
```

#### 3. **Replicate (免費額度)**

```bash
# 註冊地址：https://replicate.com/
# 免費額度：500 requests/month
# 地區限制：無
```

**設置步驟：**

1. 訪問 https://replicate.com/
2. 使用 GitHub 帳戶註冊
3. 進入 Account → API Tokens
4. 創建新的 API Token
5. 複製 Token 到環境變量

**環境配置：**

```bash
# .env 文件
REPLICATE_API_KEY=r8_your_token_here
```

### 方案二：使用本地 AI 模型 (完全免費) 🏠

#### 1. **Ollama (推薦)**

```bash
# 下載地址：https://ollama.ai/
# 費用：完全免費
# 地區限制：無
```

**安裝步驟：**

```bash
# macOS
brew install ollama

# Windows
# 下載安裝包：https://ollama.ai/download

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

**使用方法：**

```bash
# 啟動 Ollama
ollama serve

# 下載模型
ollama pull llama2
ollama pull codellama
ollama pull mistral

# 測試模型
ollama run llama2 "Hello, how are you?"
```

**環境配置：**

```bash
# .env 文件
OLLAMA_API_URL=http://localhost:11434/api/generate
```

#### 2. **LM Studio**

```bash
# 下載地址：https://lmstudio.ai/
# 費用：完全免費
# 地區限制：無
```

**安裝步驟：**

1. 下載 LM Studio
2. 安裝並啟動
3. 下載模型 (如 Llama 2, Mistral)
4. 啟動本地 API 服務器

**環境配置：**

```bash
# .env 文件
LM_STUDIO_API_URL=http://localhost:1234/v1/chat/completions
```

### 方案三：使用代理服務器 🌐

#### VPN 解決方案

```bash
# 推薦 VPN 服務：
# 1. ExpressVPN - https://www.expressvpn.com/
# 2. NordVPN - https://nordvpn.com/
# 3. Surfshark - https://surfshark.com/
```

**使用步驟：**

1. 註冊 VPN 服務
2. 連接到美國/歐洲服務器
3. 使用該地區的支付方式註冊 OpenAI/Gemini
4. 獲取 API 密鑰後即可正常使用

---

## 🔧 專案配置

### 1. 更新環境變量

```bash
# backend/.env.production
# AI 服務配置
HUGGING_FACE_API_KEY=hf_your_token_here
COHERE_API_KEY=your_cohere_api_key_here
REPLICATE_API_KEY=r8_your_token_here

# 本地 AI 配置
OLLAMA_API_URL=http://localhost:11434/api/generate
LM_STUDIO_API_URL=http://localhost:1234/v1/chat/completions

# 備用 OpenAI/Gemini (如果使用 VPN)
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_PALM_API_KEY=your-gemini-key-here
```

### 2. 配置 AI 服務優先級

```typescript
// src/services/aiService.ts
const aiConfig: AIConfig = {
  provider: 'huggingface', // 主要使用 Hugging Face
  apiKey: process.env.HUGGING_FACE_API_KEY,
  apiUrl: 'https://api-inference.huggingface.co/models/',
  model: 'microsoft/DialoGPT-medium',
  maxTokens: 1000,
  temperature: 0.7,
};
```

### 3. 設置備用服務

```typescript
// 備用服務配置
const fallbackProviders: AIConfig[] = [
  // 主要：Hugging Face
  {
    provider: 'huggingface',
    apiKey: process.env.HUGGING_FACE_API_KEY,
    model: 'microsoft/DialoGPT-medium',
  },

  // 備用1：Cohere
  {
    provider: 'cohere',
    apiKey: process.env.COHERE_API_KEY,
    model: 'command',
  },

  // 備用2：Replicate
  {
    provider: 'replicate',
    apiKey: process.env.REPLICATE_API_KEY,
    model: 'meta/llama-2-70b-chat',
  },

  // 備用3：本地 Ollama
  {
    provider: 'ollama',
    apiUrl: 'http://localhost:11434/api/generate',
    model: 'llama2',
  },
];
```

---

## 🧪 測試配置

### 1. 測試 Hugging Face

```bash
curl -X POST https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium \
  -H "Authorization: Bearer hf_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello, how are you?"}'
```

### 2. 測試 Cohere

```bash
curl -X POST https://api.cohere.ai/v1/generate \
  -H "Authorization: Bearer your_cohere_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "command",
    "prompt": "Hello, how are you?",
    "max_tokens": 100
  }'
```

### 3. 測試 Ollama

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

---

## 📊 性能比較

| 服務         | 費用     | 速度 | 質量 | 地區限制 | 推薦度     |
| ------------ | -------- | ---- | ---- | -------- | ---------- |
| Hugging Face | 免費     | 中等 | 良好 | 無       | ⭐⭐⭐⭐⭐ |
| Cohere       | 免費額度 | 快   | 優秀 | 無       | ⭐⭐⭐⭐   |
| Replicate    | 免費額度 | 慢   | 優秀 | 無       | ⭐⭐⭐     |
| Ollama       | 免費     | 快   | 良好 | 無       | ⭐⭐⭐⭐⭐ |
| OpenAI       | 付費     | 快   | 優秀 | 有       | ⭐⭐⭐     |
| Gemini       | 付費     | 快   | 優秀 | 有       | ⭐⭐⭐     |

---

## 🚀 部署建議

### 開發環境

```bash
# 使用 Hugging Face + Ollama 組合
# 1. 配置 Hugging Face API
# 2. 安裝並啟動 Ollama
# 3. 設置備用機制
```

### 生產環境

```bash
# 使用多服務商備用方案
# 1. 主要：Hugging Face
# 2. 備用1：Cohere
# 3. 備用2：Replicate
# 4. 備用3：本地 Ollama
```

---

## 🔒 安全注意事項

### 1. API 密鑰安全

```bash
# 永遠不要在代碼中硬編碼 API 密鑰
# 使用環境變量存儲
# 定期輪換密鑰
```

### 2. 本地模型安全

```bash
# Ollama 默認只監聽本地端口
# 不要暴露到公網
# 使用防火牆保護
```

### 3. 數據隱私

```bash
# 本地模型完全保護隱私
# 雲端服務可能存儲數據
# 注意敏感信息處理
```

---

## 📞 技術支持

### 常見問題解決

#### 1. Hugging Face API 錯誤

```bash
# 錯誤：401 Unauthorized
# 解決：檢查 API Token 是否正確

# 錯誤：503 Service Unavailable
# 解決：模型正在加載，等待幾分鐘
```

#### 2. Ollama 連接錯誤

```bash
# 錯誤：Connection refused
# 解決：確保 Ollama 服務正在運行

# 錯誤：Model not found
# 解決：下載模型：ollama pull llama2
```

#### 3. 本地模型性能問題

```bash
# 問題：響應速度慢
# 解決：使用更小的模型或升級硬件

# 問題：內存不足
# 解決：關閉其他應用或使用更小的模型
```

---

## 📚 參考資源

### 官方文檔

- [Hugging Face API 文檔](https://huggingface.co/docs/api-inference)
- [Cohere API 文檔](https://docs.cohere.com/)
- [Replicate API 文檔](https://replicate.com/docs)
- [Ollama 文檔](https://ollama.ai/docs)

### 社區資源

- [Hugging Face 模型庫](https://huggingface.co/models)
- [Ollama 模型庫](https://ollama.ai/library)
- [香港 AI 開發者社區](https://github.com/hk-ai-community)

---

## ✅ 完成檢查清單

- [ ] 註冊 Hugging Face 帳戶並獲取 API Token
- [ ] 註冊 Cohere 帳戶並獲取 API Key
- [ ] 註冊 Replicate 帳戶並獲取 API Token
- [ ] 安裝並配置 Ollama (可選)
- [ ] 更新環境變量配置
- [ ] 測試所有 AI 服務連接
- [ ] 配置備用服務機制
- [ ] 測試專案中的 AI 功能

---

**最後更新**: 2024年12月  
**適用版本**: CardStrategy v3.1.0  
**作者**: CardStrategy 開發團隊
