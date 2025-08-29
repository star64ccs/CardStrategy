import {
  multiAIService,
  AIProvider,
  AIModelType,
  AITaskType,
  AIRequestConfig,
  AIResponse,
  BatchAIResponse,
} from './multiAIService';
import {
  aiModelManager,
  AIModelCapability,
  CardAITask,
} from './aiModelManager';
import { dataQualityService } from './dataQualityService';
import { enhancedAIService } from './enhancedAIService';
import { predictionService } from './predictionService';
import { enhancedPredictionService } from './enhancedPredictionService';
import { aiRecognitionService } from './aiRecognitionService';
import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// ==================== AI生態系統核心接口 ====================

export interface AIEcosystemConfig {
  // 基礎配置
  enableAutoScaling: boolean;
  enableLoadBalancing: boolean;
  enableCostOptimization: boolean;
  enablePerformanceMonitoring: boolean;

  // 模型配置
  defaultModels: {
    recognition: AIModelType;
    analysis: AIModelType;
    prediction: AIModelType;
    generation: AIModelType;
  };

  // 性能配置
  maxConcurrentRequests: number;
  requestTimeout: number;
  retryAttempts: number;

  // 成本配置
  monthlyBudget: number;
  costAlertThreshold: number;

  // 監控配置
  enableRealTimeMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface AIEcosystemStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalCost: number;
  monthlyCost: number;
  providerUsage: Record<
    AIProvider,
    {
      requests: number;
      cost: number;
      successRate: number;
      averageResponseTime: number;
    }
  >;
  modelUsage: Record<
    AIModelType,
    {
      requests: number;
      cost: number;
      successRate: number;
    }
  >;
  taskUsage: Record<
    AITaskType,
    {
      requests: number;
      averageResponseTime: number;
    }
  >;
}

export interface AIEcosystemHealth {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  providers: Record<
    AIProvider,
    {
      status: 'online' | 'offline' | 'degraded';
      responseTime: number;
      errorRate: number;
      lastCheck: Date;
    }
  >;
  models: Record<
    AIModelType,
    {
      availability: number;
      performance: number;
      cost: number;
    }
  >;
  system: {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    queueLength: number;
  };
}

export interface AIEcosystemTask {
  id: string;
  type: AITaskType;
  prompt: string;
  config: AIRequestConfig;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AIResponse;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  cost?: number;
  provider?: AIProvider;
  model?: AIModelType;
}

// ==================== AI生態系統核心類 ====================

class AIEcosystem {
  private config: AIEcosystemConfig;
  private taskQueue: AIEcosystemTask[] = [];
  private activeTasks: Map<string, AIEcosystemTask> = new Map();
  private stats: AIEcosystemStats;
  private health: AIEcosystemHealth;
  private isInitialized = false;

  constructor(config: Partial<AIEcosystemConfig> = {}) {
    this.config = {
      enableAutoScaling: true,
      enableLoadBalancing: true,
      enableCostOptimization: true,
      enablePerformanceMonitoring: true,
      defaultModels: {
        recognition: 'gpt-4',
        analysis: 'claude-3',
        prediction: 'gemini-pro',
        generation: 'gpt-4',
      },
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      retryAttempts: 3,
      monthlyBudget: 1000,
      costAlertThreshold: 0.8,
      enableRealTimeMonitoring: true,
      logLevel: 'info',
      ...config,
    };

    this.stats = this.initializeStats();
    this.health = this.initializeHealth();
  }

  // ==================== 初始化方法 ====================

  async initialize(): Promise<void> {
    try {
      logger.info('🚀 初始化AI生態系統...');

      // 初始化多AI服務
      await this.initializeMultiAIService();

      // 初始化模型管理器
      await this.initializeModelManager();

      // 初始化監控系統
      await this.initializeMonitoring();

      // 啟動健康檢查
      this.startHealthCheck();

      // 啟動任務處理器
      this.startTaskProcessor();

      this.isInitialized = true;
      logger.info('✅ AI生態系統初始化完成');
    } catch (error) {
      logger.error('❌ AI生態系統初始化失敗:', error);
      throw error;
    }
  }

  private async initializeMultiAIService(): Promise<void> {
    // 配置多AI服務
    multiAIService.updateConfig({
      enableLoadBalancing: this.config.enableLoadBalancing,
      enableCostOptimization: this.config.enableCostOptimization,
      maxConcurrentRequests: this.config.maxConcurrentRequests,
      requestTimeout: this.config.requestTimeout,
    });
  }

  private async initializeModelManager(): Promise<void> {
    // 初始化模型能力
    await aiModelManager.initializeModelCapabilities();
    await aiModelManager.initializeCardTasks();
  }

  private async initializeMonitoring(): Promise<void> {
    // 初始化實時監控
    if (this.config.enableRealTimeMonitoring) {
      setInterval(() => {
        this.updateHealth();
      }, 30000); // 每30秒更新一次健康狀態
    }
  }

  // ==================== 核心功能方法 ====================

  /**
   * 執行AI任務
   */
  async executeTask(
    taskType: AITaskType,
    prompt: string,
    config: Partial<AIRequestConfig> = {},
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('AI生態系統尚未初始化');
    }

    const task: AIEcosystemTask = {
      id: this.generateTaskId(),
      type: taskType,
      prompt,
      config: {
        model:
          config.model ||
          this.config.defaultModels[
            taskType as keyof typeof this.config.defaultModels
          ],
        provider: config.provider,
        maxTokens: config.maxTokens || 1000,
        temperature: config.temperature || 0.7,
        ...config,
      },
      priority,
      status: 'pending',
      createdAt: new Date(),
    };

    // 添加到任務隊列
    this.addTaskToQueue(task);

    // 等待任務完成
    return this.waitForTaskCompletion(task.id);
  }

  /**
   * 批量執行AI任務
   */
  async executeBatchTasks(
    tasks: {
      taskType: AITaskType;
      prompt: string;
      config?: Partial<AIRequestConfig>;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    }[]
  ): Promise<BatchAIResponse> {
    const batchTasks = tasks.map(task => ({
      id: this.generateTaskId(),
      type: task.taskType,
      prompt: task.prompt,
      config: {
        model:
          task.config?.model ||
          this.config.defaultModels[
            task.taskType as keyof typeof this.config.defaultModels
          ],
        provider: task.config?.provider,
        maxTokens: task.config?.maxTokens || 1000,
        temperature: task.config?.temperature || 0.7,
        ...task.config,
      },
      priority: task.priority || 'medium',
      status: 'pending' as const,
      createdAt: new Date(),
    }));

    // 添加到任務隊列
    batchTasks.forEach(task => this.addTaskToQueue(task));

    // 等待所有任務完成
    const results = await Promise.all(
      batchTasks.map(task => this.waitForTaskCompletion(task.id))
    );

    return {
      results,
      totalRequests: results.length,
      successfulRequests: results.filter(r => r.success).length,
      failedRequests: results.filter(r => !r.success).length,
      totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0),
      averageResponseTime:
        results.reduce((sum, r) => sum + (r.responseTime || 0), 0) /
        results.length,
    };
  }

  /**
   * 卡片識別任務
   */
  async recognizeCard(
    imageData: string,
    options?: {
      model?: AIModelType;
      provider?: AIProvider;
      enableConditionAnalysis?: boolean;
      enablePriceEstimation?: boolean;
    }
  ): Promise<AIResponse> {
    const prompt = this.buildCardRecognitionPrompt(imageData, options);

    return this.executeTask(
      'recognition',
      prompt,
      {
        model: options?.model || 'gpt-4',
        provider: options?.provider,
        maxTokens: 2000,
        temperature: 0.3,
      },
      'high'
    );
  }

  /**
   * 卡片條件分析任務
   */
  async analyzeCardCondition(
    imageData: string,
    options?: {
      model?: AIModelType;
      provider?: AIProvider;
      detailedAnalysis?: boolean;
    }
  ): Promise<AIResponse> {
    const prompt = this.buildConditionAnalysisPrompt(imageData, options);

    return this.executeTask(
      'analysis',
      prompt,
      {
        model: options?.model || 'claude-3',
        provider: options?.provider,
        maxTokens: 1500,
        temperature: 0.2,
      },
      'medium'
    );
  }

  /**
   * 價格預測任務
   */
  async predictCardPrice(
    cardData: any,
    options?: {
      model?: AIModelType;
      provider?: AIProvider;
      marketData?: any;
      historicalData?: any;
    }
  ): Promise<AIResponse> {
    const prompt = this.buildPricePredictionPrompt(cardData, options);

    return this.executeTask(
      'prediction',
      prompt,
      {
        model: options?.model || 'gemini-pro',
        provider: options?.provider,
        maxTokens: 1000,
        temperature: 0.1,
      },
      'medium'
    );
  }

  /**
   * 市場分析任務
   */
  async analyzeMarket(
    marketData: any,
    options?: {
      model?: AIModelType;
      provider?: AIProvider;
      analysisType?: 'trend' | 'sentiment' | 'opportunity';
    }
  ): Promise<AIResponse> {
    const prompt = this.buildMarketAnalysisPrompt(marketData, options);

    return this.executeTask(
      'analysis',
      prompt,
      {
        model: options?.model || 'claude-3',
        provider: options?.provider,
        maxTokens: 2000,
        temperature: 0.3,
      },
      'medium'
    );
  }

  // ==================== 任務管理方法 ====================

  private addTaskToQueue(task: AIEcosystemTask): void {
    // 根據優先級插入任務
    const insertIndex = this.taskQueue.findIndex(
      t => t.priority < task.priority
    );
    if (insertIndex === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(insertIndex, 0, task);
    }
  }

  private async waitForTaskCompletion(taskId: string): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        const task = this.activeTasks.get(taskId);
        if (!task) {
          reject(new Error(`任務 ${taskId} 不存在`));
          return;
        }

        if (task.status === 'completed' && task.result) {
          resolve(task.result);
        } else if (task.status === 'failed' && task.error) {
          reject(new Error(task.error));
        } else {
          setTimeout(checkCompletion, 100);
        }
      };

      checkCompletion();
    });
  }

  private startTaskProcessor(): void {
    setInterval(async () => {
      if (
        this.activeTasks.size < this.config.maxConcurrentRequests &&
        this.taskQueue.length > 0
      ) {
        const task = this.taskQueue.shift();
        if (task) {
          this.processTask(task);
        }
      }
    }, 100);
  }

  private async processTask(task: AIEcosystemTask): Promise<void> {
    try {
      task.status = 'processing';
      task.startedAt = new Date();
      this.activeTasks.set(task.id, task);

      // 執行AI請求
      const response = await multiAIService.executeRequest(
        task.prompt,
        task.config
      );

      task.status = 'completed';
      task.completedAt = new Date();
      task.result = response;
      task.cost = response.cost;
      task.provider = response.provider;
      task.model = response.model;

      // 更新統計信息
      this.updateStats(response);
    } catch (error) {
      task.status = 'failed';
      task.completedAt = new Date();
      task.error = error instanceof Error ? error.message : '未知錯誤';

      logger.error(`任務 ${task.id} 執行失敗:`, error);
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  // ==================== 監控和統計方法 ====================

  private initializeStats(): AIEcosystemStats {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalCost: 0,
      monthlyCost: 0,
      providerUsage: {} as any,
      modelUsage: {} as any,
      taskUsage: {} as any,
    };
  }

  private initializeHealth(): AIEcosystemHealth {
    return {
      overallHealth: 'good',
      providers: {} as any,
      models: {} as any,
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        networkLatency: 0,
        queueLength: 0,
      },
    };
  }

  private updateStats(response: AIResponse): void {
    this.stats.totalRequests++;

    if (response.success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // 更新平均響應時間
    const totalTime =
      this.stats.averageResponseTime * (this.stats.totalRequests - 1) +
      (response.responseTime || 0);
    this.stats.averageResponseTime = totalTime / this.stats.totalRequests;

    // 更新成本
    this.stats.totalCost += response.cost || 0;
    this.stats.monthlyCost += response.cost || 0;

    // 更新提供商使用統計
    if (response.provider) {
      if (!this.stats.providerUsage[response.provider]) {
        this.stats.providerUsage[response.provider] = {
          requests: 0,
          cost: 0,
          successRate: 0,
          averageResponseTime: 0,
        };
      }

      const provider = this.stats.providerUsage[response.provider];
      provider.requests++;
      provider.cost += response.cost || 0;
      provider.successRate =
        provider.requests > 0
          ? (provider.requests - (response.success ? 0 : 1)) / provider.requests
          : 0;
    }

    // 更新模型使用統計
    if (response.model) {
      if (!this.stats.modelUsage[response.model]) {
        this.stats.modelUsage[response.model] = {
          requests: 0,
          cost: 0,
          successRate: 0,
        };
      }

      const model = this.stats.modelUsage[response.model];
      model.requests++;
      model.cost += response.cost || 0;
      model.successRate =
        model.requests > 0
          ? (model.requests - (response.success ? 0 : 1)) / model.requests
          : 0;
    }
  }

  private async updateHealth(): Promise<void> {
    try {
      // 更新提供商健康狀態
      const providers = multiAIService.getProviderStatus();
      for (const provider of providers) {
        this.health.providers[provider.provider] = {
          status: provider.isActive ? 'online' : 'offline',
          responseTime: 0, // 需要實際測試
          errorRate: 0, // 需要計算
          lastCheck: new Date(),
        };
      }

      // 更新模型健康狀態
      const modelCapabilities = aiModelManager.getAllModelCapabilities();
      for (const capability of modelCapabilities) {
        this.health.models[capability.model] = {
          availability: 1.0, // 需要實際測試
          performance: 0.8, // 需要計算
          cost:
            capability.performance.cost === 'low'
              ? 0.3
              : capability.performance.cost === 'medium'
                ? 0.6
                : 1.0,
        };
      }

      // 更新系統健康狀態
      this.health.system.queueLength = this.taskQueue.length;

      // 計算整體健康狀態
      const providerHealth =
        Object.values(this.health.providers).filter(p => p.status === 'online')
          .length / Object.keys(this.health.providers).length;

      if (providerHealth >= 0.8) {
        this.health.overallHealth = 'excellent';
      } else if (providerHealth >= 0.6) {
        this.health.overallHealth = 'good';
      } else if (providerHealth >= 0.4) {
        this.health.overallHealth = 'fair';
      } else {
        this.health.overallHealth = 'poor';
      }
    } catch (error) {
      logger.error('更新健康狀態失敗:', error);
    }
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      await this.updateHealth();
    }, 60000); // 每分鐘檢查一次
  }

  // ==================== 工具方法 ====================

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildCardRecognitionPrompt(imageData: string, options?: any): string {
    return `請分析這張卡片圖片並提供以下信息：
1. 卡片名稱
2. 系列/版本
3. 稀有度
4. 卡片類型
5. 基本屬性（攻擊力、防禦力等，如果適用）
6. 卡片效果描述
7. 發行年份
8. 其他相關信息

${options?.enableConditionAnalysis ? '請同時評估卡片條件（新舊程度、磨損情況等）' : ''}
${options?.enablePriceEstimation ? '請提供價格範圍估計' : ''}

圖片數據：${imageData.substring(0, 100)}...`;
  }

  private buildConditionAnalysisPrompt(
    imageData: string,
    options?: any
  ): string {
    return `請詳細分析這張卡片的條件：

1. 表面狀況：
   - 是否有劃痕、污漬、褪色
   - 邊緣是否完整
   - 角落是否有磨損

2. 印刷質量：
   - 顏色是否鮮豔
   - 文字是否清晰
   - 是否有印刷缺陷

3. 整體評分（1-10分）：
   - 10分：完美無瑕
   - 9分：極佳
   - 8分：優秀
   - 7分：良好
   - 6分：一般
   - 5分及以下：較差

4. 建議：
   - 是否適合收藏
   - 是否需要保護措施
   - 價格影響評估

${options?.detailedAnalysis ? '請提供更詳細的分析，包括具體的缺陷位置和程度描述。' : ''}

圖片數據：${imageData.substring(0, 100)}...`;
  }

  private buildPricePredictionPrompt(cardData: any, options?: any): string {
    return `基於以下信息預測卡片價格：

卡片信息：
- 名稱：${cardData.name}
- 系列：${cardData.series}
- 稀有度：${cardData.rarity}
- 條件：${cardData.condition}
- 發行年份：${cardData.year}

${options?.marketData ? `市場數據：${JSON.stringify(options.marketData)}` : ''}
${options?.historicalData ? `歷史價格：${JSON.stringify(options.historicalData)}` : ''}

請提供：
1. 當前市場價格範圍
2. 價格趨勢分析
3. 影響價格的因素
4. 投資建議
5. 風險評估`;
  }

  private buildMarketAnalysisPrompt(marketData: any, options?: any): string {
    const analysisType = options?.analysisType || 'trend';

    let prompt = '請分析卡片市場數據：\n\n';
    prompt += `市場數據：${JSON.stringify(marketData)}\n\n`;

    switch (analysisType) {
      case 'trend':
        prompt += `請分析市場趨勢：
1. 整體市場走向
2. 熱門卡片類別
3. 價格變化趨勢
4. 未來預測`;
        break;
      case 'sentiment':
        prompt += `請分析市場情緒：
1. 投資者信心指數
2. 市場活躍度
3. 交易量分析
4. 情緒指標`;
        break;
      case 'opportunity':
        prompt += `請分析投資機會：
1. 被低估的卡片
2. 潛在投資機會
3. 風險警告
4. 建議策略`;
        break;
    }

    return prompt;
  }

  // ==================== 公共接口方法 ====================

  getStats(): AIEcosystemStats {
    return { ...this.stats };
  }

  getHealth(): AIEcosystemHealth {
    return { ...this.health };
  }

  getConfig(): AIEcosystemConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AIEcosystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getActiveTasks(): AIEcosystemTask[] {
    return Array.from(this.activeTasks.values());
  }

  getQueuedTasks(): AIEcosystemTask[] {
    return [...this.taskQueue];
  }

  cancelTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId);
    if (task && task.status === 'pending') {
      this.activeTasks.delete(taskId);
      return true;
    }
    return false;
  }

  async testConnection(): Promise<Record<AIProvider, boolean>> {
    const providers = multiAIService.getProviderStatus();
    const results: Record<AIProvider, boolean> = {} as any;

    for (const provider of providers) {
      try {
        const isConnected = await multiAIService.testProviderConnection(
          provider.provider
        );
        results[provider.provider] = isConnected;
      } catch (error) {
        results[provider.provider] = false;
      }
    }

    return results;
  }

  getRecommendedModels(useCase: string): AIModelType[] {
    return aiModelManager.getRecommendedModels(useCase);
  }

  compareModels(
    models: AIModelType[]
  ): { model: AIModelType; capability: AIModelCapability; score: number }[] {
    return aiModelManager.compareModels(models);
  }
}

// ==================== 導出實例 ====================

export const aiEcosystem = new AIEcosystem();
export default aiEcosystem;
