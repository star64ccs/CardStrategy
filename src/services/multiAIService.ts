import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// AI提供商類型
export type AIProvider =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'azure'
  | 'anthropic'
  | 'cohere'
  | 'huggingface'
  | 'local';

// AI模型類型
export type AIModelType =
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3'
  | 'claude-2'
  | 'gemini-pro'
  | 'gemini-vision'
  | 'llama-2'
  | 'mistral'
  | 'custom';

// AI任務類型
export type AITaskType =
  | 'recognition'
  | 'analysis'
  | 'prediction'
  | 'generation'
  | 'translation'
  | 'summarization'
  | 'classification'
  | 'sentiment';

// AI提供商配置
export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  endpoint?: string;
  models: AIModelType[];
  capabilities: AITaskType[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    tokensPerMinute: number;
  };
  cost: {
    inputTokensPerDollar: number;
    outputTokensPerDollar: number;
  };
  priority: number; // 1-10，數字越小優先級越高
  isActive: boolean;
}

// AI請求配置
export interface AIRequestConfig {
  provider?: AIProvider;
  model?: AIModelType;
  task: AITaskType;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  retryAttempts?: number;
  fallbackProviders?: AIProvider[];
}

// AI響應結果
export interface AIResponse {
  success: boolean;
  data: any;
  metadata: {
    provider: AIProvider;
    model: AIModelType;
    task: AITaskType;
    processingTime: number;
    tokensUsed: {
      input: number;
      output: number;
      total: number;
    };
    cost: number;
    confidence?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// 批量AI請求結果
export interface BatchAIResponse {
  results: AIResponse[];
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalProcessingTime: number;
    totalCost: number;
    averageConfidence: number;
  };
}

// 多AI服務配置
export interface MultiAIServiceConfig {
  providers: AIProviderConfig[];
  defaultProvider: AIProvider;
  loadBalancing:
    | 'round-robin'
    | 'priority'
    | 'cost-optimized'
    | 'performance-optimized';
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  monitoring: {
    enabled: boolean;
    logRequests: boolean;
    trackCosts: boolean;
    performanceMetrics: boolean;
  };
}

// 多AI服務類
class MultiAIService {
  private config: MultiAIServiceConfig;
  private activeProviders: AIProviderConfig[];
  private requestQueue: {
    id: string;
    config: AIRequestConfig;
    resolve: (value: AIResponse) => void;
    reject: (reason: any) => void;
    timestamp: number;
  }[] = [];
  private isProcessing = false;

  constructor() {
    this.config = {
      providers: [],
      defaultProvider: 'openai',
      loadBalancing: 'priority',
      caching: {
        enabled: true,
        ttl: 300000, // 5分鐘
        maxSize: 1000,
      },
      monitoring: {
        enabled: true,
        logRequests: true,
        trackCosts: true,
        performanceMetrics: true,
      },
    };
    this.activeProviders = [];
    this.initializeProviders();
  }

  // 初始化AI提供商
  private initializeProviders(): void {
    const defaultProviders: AIProviderConfig[] = [
      {
        provider: 'openai',
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
        models: ['gpt-4', 'gpt-3.5-turbo'],
        capabilities: [
          'recognition',
          'analysis',
          'prediction',
          'generation',
          'translation',
          'summarization',
          'classification',
          'sentiment',
        ],
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 3500,
          tokensPerMinute: 90000,
        },
        cost: {
          inputTokensPerDollar: 15000, // GPT-4 8K
          outputTokensPerDollar: 30000,
        },
        priority: 1,
        isActive: true,
      },
      {
        provider: 'claude',
        apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
        models: ['claude-3', 'claude-2'],
        capabilities: [
          'recognition',
          'analysis',
          'prediction',
          'generation',
          'translation',
          'summarization',
          'classification',
          'sentiment',
        ],
        rateLimit: {
          requestsPerMinute: 50,
          requestsPerHour: 3000,
          tokensPerMinute: 80000,
        },
        cost: {
          inputTokensPerDollar: 20000, // Claude-3 Sonnet
          outputTokensPerDollar: 40000,
        },
        priority: 2,
        isActive: true,
      },
      {
        provider: 'gemini',
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY || '',
        models: ['gemini-pro', 'gemini-vision'],
        capabilities: [
          'recognition',
          'analysis',
          'prediction',
          'generation',
          'translation',
          'summarization',
          'classification',
          'sentiment',
        ],
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 3600,
          tokensPerMinute: 100000,
        },
        cost: {
          inputTokensPerDollar: 25000, // Gemini Pro
          outputTokensPerDollar: 50000,
        },
        priority: 3,
        isActive: true,
      },
      {
        provider: 'azure',
        apiKey: process.env.EXPO_PUBLIC_AZURE_OPENAI_API_KEY || '',
        endpoint: process.env.EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
        models: ['gpt-4', 'gpt-3.5-turbo'],
        capabilities: [
          'recognition',
          'analysis',
          'prediction',
          'generation',
          'translation',
          'summarization',
          'classification',
          'sentiment',
        ],
        rateLimit: {
          requestsPerMinute: 40,
          requestsPerHour: 2400,
          tokensPerMinute: 60000,
        },
        cost: {
          inputTokensPerDollar: 12000,
          outputTokensPerDollar: 24000,
        },
        priority: 4,
        isActive: true,
      },
      {
        provider: 'cohere',
        apiKey: process.env.EXPO_PUBLIC_COHERE_API_KEY || '',
        models: ['command', 'command-light'],
        capabilities: [
          'generation',
          'translation',
          'summarization',
          'classification',
          'sentiment',
        ],
        rateLimit: {
          requestsPerMinute: 30,
          requestsPerHour: 1800,
          tokensPerMinute: 50000,
        },
        cost: {
          inputTokensPerDollar: 30000,
          outputTokensPerDollar: 60000,
        },
        priority: 5,
        isActive: true,
      },
    ];

    this.config.providers = defaultProviders;
    this.activeProviders = defaultProviders.filter(
      (p) => p.isActive && p.apiKey
    );
    this.sortProvidersByPriority();
  }

  // 按優先級排序提供商
  private sortProvidersByPriority(): void {
    this.activeProviders.sort((a, b) => a.priority - b.priority);
  }

  // 獲取配置
  getConfig(): MultiAIServiceConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(newConfig: Partial<MultiAIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.activeProviders = this.config.providers.filter(
      (p) => p.isActive && p.apiKey
    );
    this.sortProvidersByPriority();
    logger.info('多AI服務配置已更新:', this.config);
  }

  // 添加新的AI提供商
  addProvider(provider: AIProviderConfig): void {
    const existingIndex = this.config.providers.findIndex(
      (p) => p.provider === provider.provider
    );
    if (existingIndex >= 0) {
      this.config.providers[existingIndex] = provider;
    } else {
      this.config.providers.push(provider);
    }
    this.activeProviders = this.config.providers.filter(
      (p) => p.isActive && p.apiKey
    );
    this.sortProvidersByPriority();
    logger.info(`AI提供商已添加/更新: ${provider.provider}`);
  }

  // 移除AI提供商
  removeProvider(providerName: AIProvider): void {
    this.config.providers = this.config.providers.filter(
      (p) => p.provider !== providerName
    );
    this.activeProviders = this.activeProviders.filter(
      (p) => p.provider !== providerName
    );
    logger.info(`AI提供商已移除: ${providerName}`);
  }

  // 選擇最佳提供商
  private selectProvider(
    task: AITaskType,
    preferredProvider?: AIProvider
  ): AIProviderConfig | null {
    if (preferredProvider) {
      const provider = this.activeProviders.find(
        (p) => p.provider === preferredProvider
      );
      if (provider && provider.capabilities.includes(task)) {
        return provider;
      }
    }

    // 根據負載平衡策略選擇提供商
    switch (this.config.loadBalancing) {
      case 'priority':
        return (
          this.activeProviders.find((p) => p.capabilities.includes(task)) ||
          null
        );

      case 'cost-optimized':
        return (
          this.activeProviders
            .filter((p) => p.capabilities.includes(task))
            .sort(
              (a, b) =>
                a.cost.inputTokensPerDollar - b.cost.inputTokensPerDollar
            )[0] || null
        );

      case 'performance-optimized':
        return (
          this.activeProviders
            .filter((p) => p.capabilities.includes(task))
            .sort(
              (a, b) =>
                a.rateLimit.requestsPerMinute - b.rateLimit.requestsPerMinute
            )[0] || null
        );

      case 'round-robin':
        const availableProviders = this.activeProviders.filter((p) =>
          p.capabilities.includes(task)
        );
        if (availableProviders.length === 0) return null;
        const index = Math.floor(Math.random() * availableProviders.length);
        return availableProviders[index];

      default:
        return (
          this.activeProviders.find((p) => p.capabilities.includes(task)) ||
          null
        );
    }
  }

  // 執行AI請求
  async executeRequest(
    prompt: string,
    config: AIRequestConfig
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // 驗證輸入
      const validationResult = validateInput(
        z.object({
          prompt: z
            .string()
            .min(1, '提示不能為空')
            .max(10000, '提示不能超過10000個字元'),
          config: z.object({
            provider: z
              .enum([
                'openai',
                'claude',
                'gemini',
                'azure',
                'anthropic',
                'cohere',
                'huggingface',
                'local',
              ])
              .optional(),
            model: z.string().optional(),
            task: z.enum([
              'recognition',
              'analysis',
              'prediction',
              'generation',
              'translation',
              'summarization',
              'classification',
              'sentiment',
            ]),
            temperature: z.number().min(0).max(2).optional(),
            maxTokens: z.number().positive().optional(),
            timeout: z.number().positive().optional(),
            retryAttempts: z.number().min(0).max(5).optional(),
          }),
        }),
        { prompt, config }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || 'AI請求參數驗證失敗');
      }

      // 選擇提供商
      const provider = this.selectProvider(config.task, config.provider);
      if (!provider) {
        throw new Error(`沒有可用的AI提供商支持任務: ${config.task}`);
      }

      // 構建請求
      const requestData = {
        provider: provider.provider,
        model: config.model || provider.models[0],
        task: config.task,
        prompt,
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 1000,
        topP: config.topP || 1.0,
        frequencyPenalty: config.frequencyPenalty || 0.0,
        presencePenalty: config.presencePenalty || 0.0,
      };

      // 發送請求
      const response = await apiService.post<any>(
        '/ai/multi-provider/execute',
        requestData
      );

      const processingTime = Date.now() - startTime;

      // 構建響應
      const aiResponse: AIResponse = {
        success: true,
        data: response.data.result,
        metadata: {
          provider: provider.provider,
          model: requestData.model as AIModelType,
          task: config.task,
          processingTime,
          tokensUsed: response.data.tokensUsed || {
            input: 0,
            output: 0,
            total: 0,
          },
          cost: response.data.cost || 0,
          confidence: response.data.confidence,
        },
      };

      // 記錄監控數據
      if (this.config.monitoring.enabled) {
        this.logRequest(aiResponse);
      }

      return aiResponse;
    } catch (error: any) {
      const processingTime = Date.now() - startTime;

      // 嘗試使用備用提供商
      if (config.fallbackProviders && config.fallbackProviders.length > 0) {
        for (const fallbackProvider of config.fallbackProviders) {
          try {
            const fallbackConfig = { ...config, provider: fallbackProvider };
            return await this.executeRequest(prompt, fallbackConfig);
          } catch (fallbackError) {
            logger.warn(
              `備用提供商 ${fallbackProvider} 也失敗:`,
              fallbackError
            );
            continue;
          }
        }
      }

      const errorResponse: AIResponse = {
        success: false,
        data: null,
        metadata: {
          provider: config.provider || 'unknown',
          model: config.model || 'unknown',
          task: config.task,
          processingTime,
          tokensUsed: { input: 0, output: 0, total: 0 },
          cost: 0,
        },
        error: {
          code: 'AI_REQUEST_FAILED',
          message: error.message,
          details: error,
        },
      };

      logger.error('❌ AI請求失敗:', errorResponse);
      throw error;
    }
  }

  // 批量執行AI請求
  async executeBatchRequests(
    requests: { prompt: string; config: AIRequestConfig }[]
  ): Promise<BatchAIResponse> {
    const startTime = Date.now();
    const results: AIResponse[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalCost = 0;
    let totalConfidence = 0;

    for (const request of requests) {
      try {
        const result = await this.executeRequest(
          request.prompt,
          request.config
        );
        results.push(result);
        successfulRequests++;
        totalCost += result.metadata.cost;
        if (result.metadata.confidence) {
          totalConfidence += result.metadata.confidence;
        }
      } catch (error) {
        const errorResponse: AIResponse = {
          success: false,
          data: null,
          metadata: {
            provider: request.config.provider || 'unknown',
            model: request.config.model || 'unknown',
            task: request.config.task,
            processingTime: 0,
            tokensUsed: { input: 0, output: 0, total: 0 },
            cost: 0,
          },
          error: {
            code: 'BATCH_REQUEST_FAILED',
            message: error instanceof Error ? error.message : '未知錯誤',
            details: error,
          },
        };
        results.push(errorResponse);
        failedRequests++;
      }
    }

    const totalProcessingTime = Date.now() - startTime;
    const averageConfidence =
      successfulRequests > 0 ? totalConfidence / successfulRequests : 0;

    return {
      results,
      summary: {
        totalRequests: requests.length,
        successfulRequests,
        failedRequests,
        totalProcessingTime,
        totalCost,
        averageConfidence,
      },
    };
  }

  // 記錄請求
  private logRequest(response: AIResponse): void {
    if (this.config.monitoring.logRequests) {
      logger.info('AI請求完成:', {
        provider: response.metadata.provider,
        model: response.metadata.model,
        task: response.metadata.task,
        processingTime: response.metadata.processingTime,
        tokensUsed: response.metadata.tokensUsed,
        cost: response.metadata.cost,
        success: response.success,
      });
    }
  }

  // 獲取提供商狀態
  getProviderStatus(): {
    provider: AIProvider;
    isActive: boolean;
    capabilities: AITaskType[];
    rateLimit: AIProviderConfig['rateLimit'];
    priority: number;
  }[] {
    return this.activeProviders.map((p) => ({
      provider: p.provider,
      isActive: p.isActive,
      capabilities: p.capabilities,
      rateLimit: p.rateLimit,
      priority: p.priority,
    }));
  }

  // 獲取使用統計
  async getUsageStats(): Promise<{
    totalRequests: number;
    totalCost: number;
    averageProcessingTime: number;
    providerBreakdown: Record<
      AIProvider,
      {
        requests: number;
        cost: number;
        averageProcessingTime: number;
      }
    >;
  }> {
    try {
      const response = await apiService.get('/ai/multi-provider/stats');
      return response.data;
    } catch (error: any) {
      logger.error('❌ 獲取使用統計失敗:', error);
      throw error;
    }
  }

  // 測試提供商連接
  async testProviderConnection(provider: AIProvider): Promise<boolean> {
    try {
      const response = await apiService.post('/ai/multi-provider/test', {
        provider,
      });
      return response.data.success;
    } catch (error: any) {
      logger.error(`❌ 測試提供商 ${provider} 連接失敗:`, error);
      return false;
    }
  }

  // 獲取支持的模型列表
  getSupportedModels(provider?: AIProvider): Record<AIProvider, AIModelType[]> {
    const models: Record<AIProvider, AIModelType[]> = {} as any;

    const providers = provider
      ? this.activeProviders.filter((p) => p.provider === provider)
      : this.activeProviders;

    providers.forEach((p) => {
      models[p.provider] = p.models;
    });

    return models;
  }

  // 獲取任務能力
  getTaskCapabilities(task: AITaskType): AIProvider[] {
    return this.activeProviders
      .filter((p) => p.capabilities.includes(task))
      .map((p) => p.provider);
  }
}

// 導出多AI服務實例
export { MultiAIService };
export const multiAIService = new MultiAIService();
export default multiAIService;
