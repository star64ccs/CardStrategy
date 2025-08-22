# 多AI模型支持系統使用指南

## 📋 概述

CardStrategy 的多AI模型支持系統提供了強大的AI功能，支持多個主流AI提供商（OpenAI、Claude、Gemini、Azure等），並提供智能的模型選擇、負載平衡和成本優化功能。

## 🎯 核心特性

### ✅ 支持的AI提供商

- **OpenAI** - GPT-4, GPT-3.5-turbo
- **Anthropic Claude** - Claude-3, Claude-2
- **Google Gemini** - Gemini Pro, Gemini Vision
- **Microsoft Azure** - Azure OpenAI
- **Cohere** - Command, Command Light
- **Hugging Face** - 開源模型
- **本地模型** - Llama-2, Mistral
- **自定義模型** - 支持添加自定義AI提供商

### ✅ 智能功能

- **自動模型選擇** - 根據任務類型自動選擇最佳模型
- **負載平衡** - 多種負載平衡策略（優先級、成本優化、性能優化、輪詢）
- **故障轉移** - 自動備用提供商切換
- **成本優化** - 智能成本控制和優化
- **性能監控** - 實時性能指標追蹤
- **批量處理** - 支持批量AI請求處理

## 🚀 快速開始

### 1. 基本使用

```typescript
import { multiAIService } from '../services/multiAIService';

// 基本AI請求
const response = await multiAIService.executeRequest(
  '請分析這張卡片的投資價值',
  {
    task: 'analysis',
    temperature: 0.3,
    maxTokens: 1000,
  }
);

console.log('AI響應:', response.data);
console.log('使用模型:', response.metadata.model);
console.log('處理時間:', response.metadata.processingTime);
console.log('成本:', response.metadata.cost);
```

### 2. 指定AI提供商

```typescript
// 指定使用OpenAI的GPT-4
const response = await multiAIService.executeRequest(
  '請詳細分析這張卡片的稀有度',
  {
    provider: 'openai',
    model: 'gpt-4',
    task: 'analysis',
    temperature: 0.2,
  }
);
```

### 3. 使用AI模型管理器

```typescript
import { aiModelManager } from '../services/aiModelManager';

// 執行卡片識別任務
const response = await aiModelManager.executeCardTask(
  'card_recognition',
  '請識別這張卡片的基本信息',
  {
    imageData: 'base64-image-data',
    preferences: {
      prioritizeAccuracy: true,
      requireVision: true,
    },
  }
);
```

## 📚 API 參考

### MultiAIService 類

#### 主要方法

##### `executeRequest(prompt, config)`

執行單個AI請求

**參數:**

- `prompt: string` - AI提示文本
- `config: AIRequestConfig` - 請求配置

**返回:** `Promise<AIResponse>`

**配置選項:**

```typescript
interface AIRequestConfig {
  provider?: AIProvider; // 指定AI提供商
  model?: AIModelType; // 指定模型
  task: AITaskType; // 任務類型
  temperature?: number; // 創造性 (0-2)
  maxTokens?: number; // 最大輸出token數
  topP?: number; // 核採樣參數
  frequencyPenalty?: number; // 頻率懲罰
  presencePenalty?: number; // 存在懲罰
  timeout?: number; // 超時時間
  retryAttempts?: number; // 重試次數
  fallbackProviders?: AIProvider[]; // 備用提供商
}
```

##### `executeBatchRequests(requests)`

批量執行AI請求

**參數:**

- `requests: Array<{prompt: string, config: AIRequestConfig}>`

**返回:** `Promise<BatchAIResponse>`

##### `getProviderStatus()`

獲取所有提供商狀態

**返回:** `Array<ProviderStatus>`

##### `getUsageStats()`

獲取使用統計

**返回:** `Promise<UsageStats>`

##### `testProviderConnection(provider)`

測試提供商連接

**參數:**

- `provider: AIProvider`

**返回:** `Promise<boolean>`

### AIModelManager 類

#### 主要方法

##### `executeCardTask(taskType, prompt, options)`

執行卡片相關AI任務

**參數:**

- `taskType: string` - 任務類型
- `prompt: string` - 提示文本
- `options?: CardTaskOptions` - 任務選項

**支持的任務類型:**

- `card_recognition` - 卡片識別
- `condition_analysis` - 條件分析
- `authenticity_check` - 真偽驗證
- `price_prediction` - 價格預測
- `market_analysis` - 市場分析
- `investment_advice` - 投資建議

##### `selectBestModelForTask(taskType, preferences)`

為任務選擇最佳模型

**參數:**

- `taskType: string` - 任務類型
- `preferences?: ModelPreferences` - 模型偏好

**偏好選項:**

```typescript
interface ModelPreferences {
  prioritizeSpeed?: boolean; // 優先速度
  prioritizeAccuracy?: boolean; // 優先準確性
  prioritizeCost?: boolean; // 優先成本
  requireVision?: boolean; // 需要視覺能力
  maxCost?: 'low' | 'medium' | 'high'; // 最大成本
}
```

##### `compareModels(models)`

比較多個模型

**參數:**

- `models: AIModelType[]` - 要比較的模型列表

**返回:** `Array<ModelComparison>`

##### `getRecommendedModels(useCase)`

獲取推薦模型

**參數:**

- `useCase: string` - 使用場景

**支持的場景:**

- `card-scanning` - 卡片掃描
- `price-analysis` - 價格分析
- `market-research` - 市場研究
- `investment-advice` - 投資建議
- `cost-effective` - 成本效益
- `high-accuracy` - 高準確性
- `fast-processing` - 快速處理

## 🎨 使用場景

### 1. 卡片掃描和識別

```typescript
// 使用視覺模型進行卡片識別
const recognitionResult = await aiModelManager.executeCardTask(
  'card_recognition',
  '請識別這張卡片的名稱、系列、稀有度等信息',
  {
    imageData: base64ImageData,
    preferences: {
      prioritizeAccuracy: true,
      requireVision: true,
    },
  }
);
```

### 2. 條件分析和評級

```typescript
// 分析卡片狀況
const conditionResult = await aiModelManager.executeCardTask(
  'condition_analysis',
  '請詳細分析這張卡片的狀況，包括磨損程度、邊緣狀況等',
  {
    imageData: base64ImageData,
    preferences: {
      prioritizeAccuracy: true,
      requireVision: true,
    },
  }
);
```

### 3. 價格預測和市場分析

```typescript
// 預測價格趨勢
const predictionResult = await aiModelManager.executeCardTask(
  'price_prediction',
  `基於以下數據預測價格趨勢：
  - 當前價格: $500
  - 歷史最高: $800
  - 交易量: 150張/月
  - 需求趨勢: 上升`,
  {
    preferences: {
      prioritizeAccuracy: true,
      maxCost: 'medium',
    },
  }
);
```

### 4. 批量處理

```typescript
// 批量分析多張卡片
const batchRequests = [
  {
    prompt: '分析卡片A的投資價值',
    config: { task: 'analysis', temperature: 0.3 },
  },
  {
    prompt: '預測卡片B的價格趨勢',
    config: { task: 'prediction', temperature: 0.2 },
  },
  {
    prompt: '生成卡片C的收藏建議',
    config: { task: 'generation', temperature: 0.7 },
  },
];

const batchResult = await multiAIService.executeBatchRequests(batchRequests);
```

### 5. 成本優化

```typescript
// 使用成本優化的負載平衡
multiAIService.updateConfig({
  loadBalancing: 'cost-optimized',
});

// 或者指定低成本模型
const response = await multiAIService.executeRequest('簡單的文本分析', {
  task: 'analysis',
  preferences: {
    prioritizeCost: true,
    maxCost: 'low',
  },
});
```

## ⚙️ 配置管理

### 1. 更新服務配置

```typescript
// 更新負載平衡策略
multiAIService.updateConfig({
  loadBalancing: 'performance-optimized',
  caching: {
    enabled: true,
    ttl: 600000, // 10分鐘
    maxSize: 2000,
  },
});
```

### 2. 添加自定義提供商

```typescript
const customProvider = {
  provider: 'custom' as AIProvider,
  apiKey: 'your-api-key',
  endpoint: 'https://your-api-endpoint.com',
  models: ['custom-model'] as AIModelType[],
  capabilities: ['analysis', 'generation'] as AITaskType[],
  rateLimit: {
    requestsPerMinute: 30,
    requestsPerHour: 1800,
    tokensPerMinute: 50000,
  },
  cost: {
    inputTokensPerDollar: 40000,
    outputTokensPerDollar: 80000,
  },
  priority: 5,
  isActive: true,
};

multiAIService.addProvider(customProvider);
```

### 3. 添加自定義模型

```typescript
const customModel = {
  model: 'custom-advanced' as AIModelType,
  provider: 'custom',
  capabilities: {
    vision: true,
    code: true,
    math: true,
    reasoning: true,
    creativity: true,
    analysis: true,
    multilingual: true,
    contextLength: 16384,
    maxTokens: 8192,
  },
  performance: {
    speed: 'fast',
    accuracy: 'high',
    cost: 'low',
  },
  specializations: ['domain-specific', 'custom-analysis'],
};

aiModelManager.addCustomModel(customModel);
```

## 📊 監控和分析

### 1. 獲取使用統計

```typescript
const stats = await multiAIService.getUsageStats();
console.log('總請求數:', stats.totalRequests);
console.log('總成本:', stats.totalCost);
console.log('平均處理時間:', stats.averageProcessingTime);
console.log('提供商分析:', stats.providerBreakdown);
```

### 2. 檢查提供商狀態

```typescript
const status = multiAIService.getProviderStatus();
status.forEach((provider) => {
  console.log(`${provider.provider}:`, {
    isActive: provider.isActive,
    capabilities: provider.capabilities,
    rateLimit: provider.rateLimit,
    priority: provider.priority,
  });
});
```

### 3. 測試連接

```typescript
const providers = ['openai', 'claude', 'gemini', 'azure'];
for (const provider of providers) {
  const isConnected = await multiAIService.testProviderConnection(provider);
  console.log(`${provider}: ${isConnected ? '✅ 連接正常' : '❌ 連接失敗'}`);
}
```

## 🔧 故障排除

### 常見問題

#### 1. 提供商連接失敗

```typescript
// 檢查API密鑰是否正確設置
console.log(
  'OpenAI API Key:',
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ? '已設置' : '未設置'
);

// 測試連接
const isConnected = await multiAIService.testProviderConnection('openai');
if (!isConnected) {
  console.log('OpenAI連接失敗，請檢查API密鑰和網絡連接');
}
```

#### 2. 模型不支持特定任務

```typescript
// 檢查模型能力
const modelCapability = aiModelManager.getModelCapability('gpt-3.5-turbo');
if (!modelCapability?.capabilities.vision) {
  console.log('GPT-3.5-turbo不支持視覺任務，請使用GPT-4或Gemini Vision');
}
```

#### 3. 成本超標

```typescript
// 設置成本限制
const response = await multiAIService.executeRequest('分析任務', {
  task: 'analysis',
  preferences: {
    prioritizeCost: true,
    maxCost: 'low',
  },
});
```

#### 4. 處理超時

```typescript
// 設置超時和重試
const response = await multiAIService.executeRequest('複雜分析任務', {
  task: 'analysis',
  timeout: 30000, // 30秒超時
  retryAttempts: 3,
  fallbackProviders: ['claude', 'gemini'],
});
```

## 🚀 性能優化

### 1. 緩存策略

```typescript
// 啟用緩存
multiAIService.updateConfig({
  caching: {
    enabled: true,
    ttl: 300000, // 5分鐘
    maxSize: 1000,
  },
});
```

### 2. 負載平衡優化

```typescript
// 根據需求選擇負載平衡策略
const strategies = {
  priority: '優先級策略 - 按配置的優先級選擇',
  'cost-optimized': '成本優化 - 選擇成本最低的提供商',
  'performance-optimized': '性能優化 - 選擇處理速度最快的',
  'round-robin': '輪詢策略 - 輪流使用所有提供商',
};

// 設置為成本優化
multiAIService.updateConfig({
  loadBalancing: 'cost-optimized',
});
```

### 3. 批量處理優化

```typescript
// 將多個請求合併為批量請求以提高效率
const batchRequests = cards.map((card) => ({
  prompt: `分析卡片: ${card.name}`,
  config: { task: 'analysis' },
}));

const results = await multiAIService.executeBatchRequests(batchRequests);
```

## 🔒 安全考慮

### 1. API密鑰管理

```typescript
// 使用環境變量管理API密鑰
const config = {
  openai: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  claude: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  gemini: process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY,
};
```

### 2. 請求驗證

```typescript
// 驗證輸入數據
const validationResult = validateInput(
  z.object({
    prompt: z.string().min(1).max(10000),
    task: z.enum(['analysis', 'prediction', 'generation']),
  }),
  { prompt, task }
);

if (!validationResult.isValid) {
  throw new Error(validationResult.errorMessage);
}
```

### 3. 錯誤處理

```typescript
try {
  const response = await multiAIService.executeRequest(prompt, config);
  return response;
} catch (error) {
  logger.error('AI請求失敗:', error);
  // 實現適當的錯誤處理邏輯
  throw new Error('AI服務暫時不可用，請稍後重試');
}
```

## 📈 最佳實踐

### 1. 模型選擇策略

- **視覺任務**: 優先使用 Gemini Vision 或 GPT-4
- **分析任務**: 使用 Claude-3 或 GPT-4
- **成本敏感**: 使用 Gemini Pro 或 GPT-3.5-turbo
- **高準確性**: 使用 GPT-4 或 Claude-3

### 2. 提示工程

```typescript
// 好的提示示例
const goodPrompt = `
請分析這張寶可夢卡片的投資價值：

卡片信息：
- 名稱: 皮卡丘
- 系列: 基礎系列
- 稀有度: 稀有
- 當前價格: $50

請從以下角度分析：
1. 市場需求趨勢
2. 供應量分析
3. 投資風險評估
4. 價格預測
5. 投資建議
`;

// 避免過於簡短的提示
const badPrompt = '分析這張卡片'; // 太簡短，缺乏上下文
```

### 3. 錯誤處理策略

```typescript
// 實現健壯的錯誤處理
async function robustAIRequest(prompt: string, config: AIRequestConfig) {
  try {
    return await multiAIService.executeRequest(prompt, config);
  } catch (error) {
    // 嘗試備用提供商
    if (config.fallbackProviders && config.fallbackProviders.length > 0) {
      for (const fallback of config.fallbackProviders) {
        try {
          const fallbackConfig = { ...config, provider: fallback };
          return await multiAIService.executeRequest(prompt, fallbackConfig);
        } catch (fallbackError) {
          logger.warn(`備用提供商 ${fallback} 也失敗:`, fallbackError);
          continue;
        }
      }
    }

    // 所有提供商都失敗，拋出錯誤
    throw new Error('所有AI提供商都不可用');
  }
}
```

## 🔄 更新日誌

### v1.0.0 (2024-01-XX)

- ✅ 初始版本發布
- ✅ 支持 OpenAI、Claude、Gemini 等主流提供商
- ✅ 實現智能模型選擇和負載平衡
- ✅ 添加批量處理功能
- ✅ 實現成本優化和監控

### 計劃功能

- 🔄 支持更多AI提供商
- 🔄 實現更智能的模型選擇算法
- 🔄 添加A/B測試功能
- 🔄 實現更詳細的性能分析
- 🔄 支持模型微調和自定義訓練

## 🤝 貢獻

歡迎貢獻代碼、報告問題或提出改進建議！

## 📄 授權

本項目採用 MIT 授權條款。
