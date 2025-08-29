# 🤖 AI Worker 低成本設置指南

## 📋 概述

本指南詳細說明如何在 CardStrategy 專案中設置和使用低成本 AI Worker 系統，支援多種 AI 服務提供商，包括免費的本地部署方案。

## 🎯 推薦方案

### 1. **Ollama（免費本地部署）** ⭐⭐⭐⭐⭐

#### 優點
- ✅ 完全免費
- ✅ 本地部署，數據安全
- ✅ 無 API 限制
- ✅ 支援多種模型
- ✅ 離線使用

#### 安裝步驟

**Windows 安裝：**
```bash
# 下載並安裝 Ollama
# 訪問 https://ollama.ai/download 下載 Windows 版本

# 安裝後啟動服務
ollama serve

# 下載模型（選擇一個）
ollama pull llama2        # Meta Llama 2 (7B)
ollama pull mistral       # Mistral 7B
ollama pull codellama     # Code Llama (適合代碼生成)
ollama pull qwen          # Qwen 2.5
ollama pull gemma         # Google Gemma
```

**Docker 安裝：**
```bash
# 使用 Docker 運行
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# 下載模型
docker exec -it ollama ollama pull llama2
```

#### 環境變數配置
```bash
# .env 文件
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 2. **百度文心一言** ⭐⭐⭐⭐

#### 優點
- ✅ 中文優化
- ✅ 成本較低 ($0.012/1K tokens)
- ✅ 企業級服務
- ✅ 穩定可靠

#### 註冊步驟
1. 訪問 [百度智能雲](https://cloud.baidu.com/)
2. 註冊帳號並實名認證
3. 開通文心一言服務
4. 創建應用獲取 API Key

#### 環境變數配置
```bash
# .env 文件
BAIDU_API_KEY=your_api_key_here
BAIDU_SECRET_KEY=your_secret_key_here
```

### 3. **阿里通義千問** ⭐⭐⭐⭐

#### 優點
- ✅ 中文優化
- ✅ 成本最低 ($0.01/1K tokens)
- ✅ 代碼生成能力強
- ✅ 多模態支援

#### 註冊步驟
1. 訪問 [阿里雲 DashScope](https://dashscope.aliyun.com/)
2. 註冊阿里雲帳號
3. 開通通義千問服務
4. 獲取 API Key

#### 環境變數配置
```bash
# .env 文件
ALIBABA_API_KEY=your_api_key_here
```

### 4. **智譜AI** ⭐⭐⭐

#### 優點
- ✅ 中文優化
- ✅ 知識庫豐富
- ✅ 企業級服務

#### 註冊步驟
1. 訪問 [智譜AI開放平台](https://open.bigmodel.cn/)
2. 註冊帳號
3. 開通服務
4. 獲取 API Key

#### 環境變數配置
```bash
# .env 文件
ZHIPU_API_KEY=your_api_key_here
```

## 🛠️ 安裝和配置

### 1. **安裝依賴**

```bash
# 安裝必要的 npm 包
npm install node-cron
npm install @types/node-cron --save-dev

# 如果使用 Docker
docker-compose up -d ollama
```

### 2. **配置 AI Worker**

創建配置文件 `src/config/aiWorker.config.ts`：

```typescript
import { AIWorkerCostConfig } from '../core/aiWorkers/AIWorkerConfig';

export const aiWorkerConfig: AIWorkerCostConfig = {
  maxMonthlyBudget: 50, // 每月最大預算 $50
  preferredProviders: ['ollama', 'baidu', 'alibaba'], // 首選提供商
  fallbackProviders: ['zhipu'], // 備用提供商
  costOptimization: {
    enableModelSwitching: true,
    enableBatchProcessing: true,
    enableCaching: true,
    enableCompression: true
  },
  usageLimits: {
    dailyRequests: 500,
    monthlyTokens: 500000,
    maxConcurrentRequests: 5
  }
};
```

### 3. **初始化 AI Worker**

在 `src/core/aiWorkers/index.ts` 中：

```typescript
import { AIServiceManager } from './AIServiceManager';
import { MediaWorker } from './MediaWorker';
import { aiWorkerConfig } from '../../config/aiWorker.config';

// 初始化 AI 服務管理器
const aiServiceManager = AIServiceManager.getInstance();
aiServiceManager.updateConfig(aiWorkerConfig);

// 初始化 MediaWorker
const mediaWorkerConfig = {
  enabled: true,
  schedule: '0 9 * * *', // 每天上午9點執行
  contentGeneration: {
    enableAutoGeneration: true,
    maxArticlesPerDay: 3,
    maxSocialPostsPerDay: 12,
    preferredTopics: ['卡片遊戲', '策略分析', '市場趨勢'],
    excludedTopics: ['政治', '宗教', '敏感話題']
  },
  publishing: {
    enableAutoPublish: false, // 手動審核
    publishTime: '10:00',
    platforms: ['facebook', 'twitter', 'instagram'],
    approvalRequired: true
  },
  costControl: {
    maxDailyBudget: 5, // 每日最大預算 $5
    preferredAIProvider: 'ollama',
    enableCostOptimization: true
  }
};

export const mediaWorker = new MediaWorker(mediaWorkerConfig);
```

## 📊 成本對比分析

### 月度成本預估（基於 10,000 tokens/月）

| 提供商 | 成本/1K tokens | 月度成本 | 優缺點 |
|--------|---------------|----------|--------|
| **Ollama** | $0 | $0 | ✅ 免費，本地部署 |
| **阿里通義千問** | $0.01 | $0.10 | ✅ 成本低，中文優化 |
| **百度文心一言** | $0.012 | $0.12 | ✅ 穩定，企業級 |
| **智譜AI** | $0.015 | $0.15 | ✅ 知識庫豐富 |
| **Azure OpenAI** | $0.0015 | $0.015 | ✅ 成本極低 |
| **Google AI** | $0.0015 | $0.015 | ✅ 多模態支援 |

### 推薦配置

```typescript
// 成本優化配置
const costOptimizedConfig = {
  maxMonthlyBudget: 30, // 每月預算 $30
  preferredProviders: ['ollama', 'alibaba', 'baidu'], // 優先使用免費和低成本服務
  fallbackProviders: ['azure', 'google'], // 備用服務
  costOptimization: {
    enableModelSwitching: true, // 自動切換到成本更低的模型
    enableBatchProcessing: true, // 批量處理減少API調用
    enableCaching: true, // 緩存重複請求
    enableCompression: true // 壓縮請求內容
  }
};
```

## 🚀 使用示例

### 1. **生成文章**

```typescript
import { mediaWorker } from './core/aiWorkers';

// 生成單篇文章
const article = await mediaWorker.generateArticle(
  '卡片遊戲市場分析',
  'market-analysis'
);

console.log('生成的文章:', {
  title: article.title,
  wordCount: article.metadata.wordCount,
  cost: article.metadata.cost,
  aiProvider: article.metadata.aiProvider
});
```

### 2. **批量生成內容**

```typescript
// 批量生成內容
const topics = [
  '卡片遊戲策略指南',
  '市場趨勢分析',
  '新手指南',
  '進階技巧分享',
  '競賽策略'
];

const { articles, posts } = await mediaWorker.generateBatchContent(topics, 3);

console.log(`生成了 ${articles.length} 篇文章和 ${posts.length} 個社群貼文`);
```

### 3. **成本監控**

```typescript
import { AIServiceManager } from './core/aiWorkers/AIServiceManager';

const aiService = AIServiceManager.getInstance();
const stats = aiService.getStats();

console.log('AI 服務統計:', {
  totalRequests: stats.totalRequests,
  totalTokens: stats.totalTokens,
  totalCost: stats.totalCost,
  successRate: stats.successRate,
  providerUsage: stats.providerUsage
});
```

## 🔧 故障排除

### 常見問題

#### 1. **Ollama 連接失敗**

```bash
# 檢查 Ollama 服務狀態
curl http://localhost:11434/api/tags

# 重啟 Ollama 服務
ollama serve

# 檢查防火牆設置
# Windows: 確保端口 11434 未被阻擋
# Linux: sudo ufw allow 11434
```

#### 2. **API 密鑰錯誤**

```bash
# 檢查環境變數
echo $BAIDU_API_KEY
echo $ALIBABA_API_KEY

# 重新設置環境變數
export BAIDU_API_KEY=your_new_api_key
export ALIBABA_API_KEY=your_new_api_key
```

#### 3. **成本超限**

```typescript
// 檢查當前使用量
const stats = aiService.getStats();
const config = aiService.getConfig();

if (stats.totalCost >= config.maxMonthlyBudget) {
  console.warn('已達到月度預算限制，建議切換到免費服務');

  // 更新配置，優先使用免費服務
  aiService.updateConfig({
    preferredProviders: ['ollama'] // 只使用免費服務
  });
}
```

#### 4. **模型切換**

```typescript
// 動態切換到更便宜的模型
const request = {
  prompt: '生成文章標題',
  model: 'llama2', // 使用免費的 Llama 2 模型
  provider: 'ollama', // 指定使用 Ollama
  maxTokens: 100,
  useCache: true // 啟用緩存
};

const response = await aiService.callAI(request);
```

## 📈 性能優化建議

### 1. **緩存策略**

```typescript
// 啟用智能緩存
const cacheConfig = {
  enableCaching: true,
  cacheExpiration: 24 * 60 * 60 * 1000, // 24小時
  maxCacheSize: 1000 // 最大緩存條目數
};
```

### 2. **批量處理**

```typescript
// 批量處理請求
const batchRequests = [
  { prompt: '生成標題1', useCache: true },
  { prompt: '生成標題2', useCache: true },
  { prompt: '生成標題3', useCache: true }
];

// 並行處理
const responses = await Promise.all(
  batchRequests.map(req => aiService.callAI(req))
);
```

### 3. **成本監控儀表板**

```typescript
// 創建成本監控
const costMonitor = {
  dailyBudget: 5,
  monthlyBudget: 100,
  alerts: {
    dailyThreshold: 0.8, // 達到80%時警報
    monthlyThreshold: 0.9 // 達到90%時警報
  }
};
```

## 🎯 最佳實踐

### 1. **分階段實施**

1. **第一階段**：設置 Ollama 本地部署
2. **第二階段**：集成國內 AI 服務
3. **第三階段**：實現成本優化和監控

### 2. **成本控制**

- 優先使用免費的本地部署
- 設置合理的預算限制
- 啟用緩存和批量處理
- 監控使用量並及時調整

### 3. **質量保證**

- 實現內容審核機制
- 設置質量評分系統
- 定期評估 AI 生成內容
- 建立人工審核流程

## 📞 技術支援

### 獲取幫助

1. **Ollama 文檔**：https://ollama.ai/docs
2. **百度文心一言**：https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html
3. **阿里通義千問**：https://help.aliyun.com/zh/dashscope/
4. **智譜AI**：https://open.bigmodel.cn/doc/api

### 社群支援

- GitHub Issues：報告問題和建議
- Discord：技術討論和支援
- 文檔更新：定期更新配置指南

---

**總結**：通過本指南，您可以以最低成本建立完整的 AI Worker 系統，優先使用免費的 Ollama 本地部署，並在需要時使用低成本的雲端服務作為備用方案。
