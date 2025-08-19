# AI生態系統完整使用指南

## 📋 概述

AI生態系統是一個完整的、可擴展的人工智能服務平台，專為卡片策略應用設計。它整合了多個AI提供商、智能負載均衡、實時監控、成本優化等功能，提供一站式AI解決方案。

## 🎯 核心特性

### ✅ 多AI提供商支持
- **OpenAI** - GPT-4, GPT-3.5-turbo
- **Claude (Anthropic)** - Claude-3, Claude-2
- **Google Gemini** - Gemini-pro, Gemini-vision
- **Azure OpenAI** - 企業級OpenAI服務
- **Cohere** - 文本生成和分析
- **Hugging Face** - 開源模型
- **本地模型** - Llama-2, Mistral
- **自定義模型** - 支持自定義API端點

### ✅ 智能功能
- **智能負載均衡** - 自動選擇最佳AI提供商
- **成本優化** - 根據預算選擇最經濟的模型
- **性能監控** - 實時監控各提供商狀態
- **批量處理** - 支持多個AI請求並行處理
- **錯誤處理** - 自動故障轉移和重試機制
- **實時警報** - 系統異常自動通知

### ✅ 專業功能
- **卡片識別** - 智能識別卡片信息
- **條件分析** - 詳細分析卡片狀況
- **價格預測** - 基於市場數據預測價格
- **市場分析** - 深度市場趨勢分析
- **圖片處理** - 圖片轉base64、壓縮等

## 🚀 快速開始

### 1. 初始化AI生態系統

```typescript
import { aiEcosystem } from '../services/aiEcosystem';
import { aiEcosystemMonitor } from '../services/aiEcosystemMonitor';

// 初始化AI生態系統
await aiEcosystem.initialize();

// 啟動監控
await aiEcosystemMonitor.startMonitoring();

// 設置警報處理器
aiEcosystemMonitor.addAlertHandler((alert) => {
  console.log(`警報: ${alert.title} - ${alert.message}`);
});
```

### 2. 基本AI任務執行

```typescript
// 執行單個AI任務
const result = await aiEcosystem.executeTask('analysis', '分析這張卡片', {
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.7
});

// 批量執行任務
const batchResult = await aiEcosystem.executeBatchTasks([
  {
    taskType: 'recognition',
    prompt: '識別卡片',
    config: { model: 'gpt-4' }
  },
  {
    taskType: 'analysis',
    prompt: '分析價值',
    config: { model: 'claude-3' }
  }
]);
```

### 3. 專業卡片功能

```typescript
// 卡片識別
const recognitionResult = await aiEcosystem.recognizeCard(imageData, {
  enableConditionAnalysis: true,
  enablePriceEstimation: true,
  model: 'gpt-4'
});

// 條件分析
const conditionResult = await aiEcosystem.analyzeCardCondition(imageData, {
  detailedAnalysis: true,
  model: 'claude-3'
});

// 價格預測
const priceResult = await aiEcosystem.predictCardPrice(cardData, {
  marketData: marketInfo,
  model: 'gemini-pro'
});

// 市場分析
const marketResult = await aiEcosystem.analyzeMarket(marketData, {
  analysisType: 'trend',
  model: 'claude-3'
});
```

## 📚 API 參考

### AIEcosystem 類

#### 核心方法

##### `initialize(): Promise<void>`
初始化AI生態系統，包括多AI服務、模型管理器、監控系統等。

##### `executeTask(taskType, prompt, config?, priority?): Promise<AIResponse>`
執行單個AI任務。

**參數：**
- `taskType: AITaskType` - 任務類型
- `prompt: string` - 提示文本
- `config?: Partial<AIRequestConfig>` - 配置選項
- `priority?: 'low' | 'medium' | 'high' | 'critical'` - 優先級

**返回：**
- `Promise<AIResponse>` - AI響應結果

##### `executeBatchTasks(tasks): Promise<BatchAIResponse>`
批量執行AI任務。

**參數：**
- `tasks: Array<{taskType, prompt, config?, priority?}>` - 任務列表

**返回：**
- `Promise<BatchAIResponse>` - 批量響應結果

#### 專業方法

##### `recognizeCard(imageData, options?): Promise<AIResponse>`
卡片識別功能。

**參數：**
- `imageData: string` - 圖片base64數據
- `options?: {model?, provider?, enableConditionAnalysis?, enablePriceEstimation?}` - 選項

##### `analyzeCardCondition(imageData, options?): Promise<AIResponse>`
卡片條件分析。

**參數：**
- `imageData: string` - 圖片base64數據
- `options?: {model?, provider?, detailedAnalysis?}` - 選項

##### `predictCardPrice(cardData, options?): Promise<AIResponse>`
價格預測功能。

**參數：**
- `cardData: any` - 卡片數據
- `options?: {model?, provider?, marketData?, historicalData?}` - 選項

##### `analyzeMarket(marketData, options?): Promise<AIResponse>`
市場分析功能。

**參數：**
- `marketData: any` - 市場數據
- `options?: {model?, provider?, analysisType?}` - 選項

#### 配置和管理方法

##### `getConfig(): AIEcosystemConfig`
獲取當前配置。

##### `updateConfig(newConfig): void`
更新配置。

##### `getStats(): AIEcosystemStats`
獲取統計信息。

##### `getHealth(): AIEcosystemHealth`
獲取健康狀態。

##### `testConnection(): Promise<Record<AIProvider, boolean>>`
測試所有提供商連接。

### AIEcosystemMonitor 類

#### 監控方法

##### `startMonitoring(): Promise<void>`
啟動監控系統。

##### `stopMonitoring(): void`
停止監控系統。

##### `getMetrics(): AIEcosystemMetrics`
獲取實時指標。

##### `getDashboard(): AIEcosystemDashboard`
獲取儀表板數據。

##### `getAlerts(): AIEcosystemAlert[]`
獲取警報列表。

##### `generateReport(type, startDate?, endDate?): Promise<AIEcosystemReport>`
生成報告。

#### 警報管理

##### `createAlert(alertData): void`
創建警報。

##### `acknowledgeAlert(alertId, acknowledgedBy): boolean`
確認警報。

##### `addAlertHandler(handler): void`
添加警報處理器。

## 🎨 使用場景

### 1. 卡片識別和分析

```typescript
// 完整的卡片處理流程
const workflow = async (imageData: string) => {
  // 1. 卡片識別
  const recognition = await aiEcosystem.recognizeCard(imageData, {
    enableConditionAnalysis: true,
    enablePriceEstimation: true
  });
  
  // 2. 條件分析
  const condition = await aiEcosystem.analyzeCardCondition(imageData, {
    detailedAnalysis: true
  });
  
  // 3. 價格預測
  const price = await aiEcosystem.predictCardPrice({
    name: recognition.data.name,
    series: recognition.data.series,
    condition: condition.data.condition
  });
  
  return { recognition, condition, price };
};
```

### 2. 市場監控和分析

```typescript
// 市場監控系統
const marketMonitor = async () => {
  // 獲取市場數據
  const marketData = await fetchMarketData();
  
  // 分析市場趨勢
  const trendAnalysis = await aiEcosystem.analyzeMarket(marketData, {
    analysisType: 'trend'
  });
  
  // 分析市場情緒
  const sentimentAnalysis = await aiEcosystem.analyzeMarket(marketData, {
    analysisType: 'sentiment'
  });
  
  // 尋找投資機會
  const opportunityAnalysis = await aiEcosystem.analyzeMarket(marketData, {
    analysisType: 'opportunity'
  });
  
  return { trendAnalysis, sentimentAnalysis, opportunityAnalysis };
};
```

### 3. 批量處理

```typescript
// 批量處理多張卡片
const batchProcessCards = async (cardImages: string[]) => {
  const tasks = cardImages.map((imageData, index) => ({
    taskType: 'recognition' as AITaskType,
    prompt: `識別第${index + 1}張卡片`,
    config: { 
      model: 'gpt-4',
      maxTokens: 1000
    },
    priority: 'medium' as const
  }));
  
  const results = await aiEcosystem.executeBatchTasks(tasks);
  
  return results;
};
```

### 4. 實時監控

```typescript
// 實時監控系統
const realTimeMonitoring = () => {
  // 啟動監控
  aiEcosystemMonitor.startMonitoring();
  
  // 設置警報處理器
  aiEcosystemMonitor.addAlertHandler((alert) => {
    if (alert.severity === 'critical') {
      // 發送緊急通知
      sendEmergencyNotification(alert);
    } else if (alert.severity === 'high') {
      // 發送警告通知
      sendWarningNotification(alert);
    }
  });
  
  // 定期生成報告
  setInterval(async () => {
    const report = await aiEcosystemMonitor.generateReport('daily');
    saveReport(report);
  }, 24 * 60 * 60 * 1000); // 每24小時
};
```

## ⚙️ 配置管理

### 基礎配置

```typescript
const config = {
  // 基礎配置
  enableAutoScaling: true,
  enableLoadBalancing: true,
  enableCostOptimization: true,
  enablePerformanceMonitoring: true,
  
  // 模型配置
  defaultModels: {
    recognition: 'gpt-4',
    analysis: 'claude-3',
    prediction: 'gemini-pro',
    generation: 'gpt-4'
  },
  
  // 性能配置
  maxConcurrentRequests: 10,
  requestTimeout: 30000,
  retryAttempts: 3,
  
  // 成本配置
  monthlyBudget: 1000,
  costAlertThreshold: 0.8,
  
  // 監控配置
  enableRealTimeMonitoring: true,
  logLevel: 'info'
};

aiEcosystem.updateConfig(config);
```

### 提供商配置

```typescript
// 添加自定義提供商
multiAIService.addProvider({
  provider: 'custom',
  apiKey: 'your-api-key',
  endpoint: 'https://your-api-endpoint.com',
  models: ['custom-model'],
  capabilities: ['recognition', 'analysis'],
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    tokensPerMinute: 10000
  },
  cost: {
    inputTokensPerDollar: 1000,
    outputTokensPerDollar: 2000
  },
  priority: 1,
  isActive: true
});
```

## 📊 監控和分析

### 實時指標

```typescript
// 獲取實時指標
const metrics = aiEcosystemMonitor.getMetrics();

console.log('請求/秒:', metrics.requestsPerSecond);
console.log('平均響應時間:', metrics.averageResponseTime);
console.log('成功率:', metrics.successRate * 100 + '%');
console.log('月度成本:', '$' + metrics.monthlyCost);
console.log('隊列長度:', metrics.queueLength);
```

### 健康狀態

```typescript
// 獲取系統健康狀態
const health = aiEcosystem.getHealth();

console.log('整體健康度:', health.overallHealth);
console.log('CPU使用率:', health.system.cpuUsage + '%');
console.log('內存使用率:', health.system.memoryUsage + '%');
console.log('網絡延遲:', health.system.networkLatency + 'ms');
```

### 警報管理

```typescript
// 獲取警報
const alerts = aiEcosystemMonitor.getAlerts();

// 確認警報
alerts.forEach(alert => {
  if (!alert.acknowledged) {
    aiEcosystemMonitor.acknowledgeAlert(alert.id, 'admin');
  }
});

// 自定義警報處理器
aiEcosystemMonitor.addAlertHandler((alert) => {
  switch (alert.severity) {
    case 'critical':
      sendSMS(alert.message);
      break;
    case 'high':
      sendEmail(alert.message);
      break;
    case 'medium':
      sendSlackNotification(alert.message);
      break;
    default:
      logAlert(alert);
  }
});
```

## 🔧 故障排除

### 常見問題

#### 1. 初始化失敗
```typescript
try {
  await aiEcosystem.initialize();
} catch (error) {
  console.error('初始化失敗:', error);
  // 檢查API密鑰配置
  // 檢查網絡連接
  // 檢查服務器狀態
}
```

#### 2. 請求超時
```typescript
// 增加超時時間
aiEcosystem.updateConfig({
  requestTimeout: 60000 // 60秒
});

// 檢查網絡連接
const connectionResults = await aiEcosystem.testConnection();
console.log('連接狀態:', connectionResults);
```

#### 3. 成本超標
```typescript
// 啟用成本優化
aiEcosystem.updateConfig({
  enableCostOptimization: true,
  monthlyBudget: 500 // 降低預算
});

// 使用更經濟的模型
const result = await aiEcosystem.executeTask('analysis', '分析', {
  model: 'gpt-3.5-turbo' // 使用更便宜的模型
});
```

#### 4. 成功率下降
```typescript
// 檢查提供商狀態
const providerStatus = multiAIService.getProviderStatus();
console.log('提供商狀態:', providerStatus);

// 切換到更穩定的提供商
const result = await aiEcosystem.executeTask('recognition', '識別', {
  provider: 'claude' // 使用更穩定的提供商
});
```

### 調試技巧

#### 1. 啟用詳細日誌
```typescript
aiEcosystem.updateConfig({
  logLevel: 'debug'
});
```

#### 2. 監控性能
```typescript
// 性能測試
const startTime = Date.now();
const result = await aiEcosystem.executeTask('analysis', '測試');
const endTime = Date.now();
console.log('執行時間:', endTime - startTime, 'ms');
```

#### 3. 檢查隊列狀態
```typescript
const activeTasks = aiEcosystem.getActiveTasks();
const queuedTasks = aiEcosystem.getQueuedTasks();
console.log('活躍任務:', activeTasks.length);
console.log('隊列任務:', queuedTasks.length);
```

## 🚀 性能優化

### 1. 並發優化
```typescript
// 增加並發請求數
aiEcosystem.updateConfig({
  maxConcurrentRequests: 20
});

// 使用批量處理
const batchResults = await aiEcosystem.executeBatchTasks(tasks);
```

### 2. 緩存策略
```typescript
// 實現結果緩存
const cache = new Map();

const getCachedResult = async (key: string, task: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await task();
  cache.set(key, result);
  return result;
};
```

### 3. 模型選擇優化
```typescript
// 根據任務類型選擇最佳模型
const getOptimalModel = (taskType: string) => {
  switch (taskType) {
    case 'recognition':
      return 'gpt-4'; // 高精度
    case 'analysis':
      return 'claude-3'; // 深度分析
    case 'prediction':
      return 'gemini-pro'; // 快速預測
    default:
      return 'gpt-3.5-turbo'; // 經濟實惠
  }
};
```

## 🔒 安全考慮

### 1. API密鑰管理
```typescript
// 使用環境變量
const config = {
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY
    },
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  }
};
```

### 2. 輸入驗證
```typescript
// 驗證輸入
const validateInput = (prompt: string) => {
  if (!prompt || prompt.length > 10000) {
    throw new Error('無效的輸入');
  }
  
  // 檢查敏感信息
  if (prompt.includes('password') || prompt.includes('token')) {
    throw new Error('包含敏感信息');
  }
};
```

### 3. 速率限制
```typescript
// 實現速率限制
const rateLimiter = new Map();

const checkRateLimit = (userId: string) => {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // 清理過期的請求記錄
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 10) {
    throw new Error('速率限制');
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
};
```

## 📈 最佳實踐

### 1. 錯誤處理
```typescript
const executeWithRetry = async (task: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await task();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // 指數退避
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

### 2. 資源管理
```typescript
// 清理資源
const cleanup = () => {
  aiEcosystemMonitor.stopMonitoring();
  aiEcosystemMonitor.clearHistory();
  aiEcosystemMonitor.clearAlerts();
};

// 在應用關閉時清理
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
```

### 3. 監控和警報
```typescript
// 設置自動警報
aiEcosystemMonitor.addAlertHandler((alert) => {
  if (alert.severity === 'critical') {
    // 自動重啟服務
    restartService();
  }
});
```

## 🔄 更新日誌

### v1.0.0 (2024-01-01)
- 初始版本發布
- 支持多AI提供商
- 基礎監控功能
- 卡片識別和分析

### v1.1.0 (2024-01-15)
- 添加批量處理功能
- 改進錯誤處理
- 優化性能監控
- 添加成本優化

### v1.2.0 (2024-02-01)
- 添加實時警報系統
- 支持自定義模型
- 改進儀表板
- 添加報告生成

## 🤝 貢獻

歡迎貢獻代碼、報告問題或提出建議！

### 開發環境設置
```bash
# 克隆項目
git clone <repository-url>

# 安裝依賴
npm install

# 運行測試
npm test

# 運行示例
npm run example
```

### 代碼規範
- 使用TypeScript
- 遵循ESLint規則
- 添加適當的註釋
- 編寫單元測試

## 📄 授權

本項目採用 MIT 授權條款。

## 📞 支持

如果您需要幫助，請：
1. 查看本文檔
2. 搜索現有問題
3. 創建新問題
4. 聯繫開發團隊

---

**AI生態系統** - 為您的卡片策略應用提供強大的AI支持！
