import { multiAIService, AIProvider, AIModelType, AITaskType, AIRequestConfig, AIResponse } from './multiAIService';
import { logger } from '../utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// AI模型功能配置
export interface AIModelCapability {
  model: AIModelType;
  provider: AIProvider;
  capabilities: {
    vision: boolean;
    code: boolean;
    math: boolean;
    reasoning: boolean;
    creativity: boolean;
    analysis: boolean;
    multilingual: boolean;
    contextLength: number;
    maxTokens: number;
  };
  performance: {
    speed: 'fast' | 'medium' | 'slow';
    accuracy: 'high' | 'medium' | 'low';
    cost: 'low' | 'medium' | 'high';
  };
  specializations: string[];
}

// 卡片相關AI任務
export interface CardAITask {
  taskType: 'card_recognition' | 'condition_analysis' | 'authenticity_check' | 'price_prediction' | 'market_analysis' | 'investment_advice';
  description: string;
  requiredCapabilities: string[];
  preferredModels: AIModelType[];
  fallbackModels: AIModelType[];
}

// AI模型管理器類
class AIModelManager {
  private modelCapabilities: Map<AIModelType, AIModelCapability> = new Map();
  private cardTasks: Map<string, CardAITask> = new Map();

  constructor() {
    this.initializeModelCapabilities();
    this.initializeCardTasks();
  }

  // 初始化模型能力
  private initializeModelCapabilities(): void {
    const capabilities: AIModelCapability[] = [
      // OpenAI 模型
      {
        model: 'gpt-4',
        provider: 'openai',
        capabilities: {
          vision: true,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 8192,
          maxTokens: 4096
        },
        performance: {
          speed: 'medium',
          accuracy: 'high',
          cost: 'high'
        },
        specializations: ['complex-analysis', 'creative-writing', 'code-generation', 'mathematical-reasoning']
      },
      {
        model: 'gpt-3.5-turbo',
        provider: 'openai',
        capabilities: {
          vision: false,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 4096,
          maxTokens: 4096
        },
        performance: {
          speed: 'fast',
          accuracy: 'medium',
          cost: 'medium'
        },
        specializations: ['general-purpose', 'chat', 'content-generation']
      },

      // Claude 模型
      {
        model: 'claude-3',
        provider: 'claude',
        capabilities: {
          vision: true,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 200000,
          maxTokens: 4096
        },
        performance: {
          speed: 'medium',
          accuracy: 'high',
          cost: 'high'
        },
        specializations: ['long-context', 'detailed-analysis', 'safety-focused', 'constitutional-ai']
      },
      {
        model: 'claude-2',
        provider: 'claude',
        capabilities: {
          vision: false,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 100000,
          maxTokens: 4096
        },
        performance: {
          speed: 'medium',
          accuracy: 'high',
          cost: 'medium'
        },
        specializations: ['analysis', 'writing', 'reasoning']
      },

      // Gemini 模型
      {
        model: 'gemini-pro',
        provider: 'gemini',
        capabilities: {
          vision: false,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 32768,
          maxTokens: 2048
        },
        performance: {
          speed: 'fast',
          accuracy: 'high',
          cost: 'low'
        },
        specializations: ['multimodal', 'creative-tasks', 'code-generation', 'multilingual']
      },
      {
        model: 'gemini-vision',
        provider: 'gemini',
        capabilities: {
          vision: true,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 32768,
          maxTokens: 2048
        },
        performance: {
          speed: 'fast',
          accuracy: 'high',
          cost: 'low'
        },
        specializations: ['image-analysis', 'visual-understanding', 'multimodal-tasks']
      },

      // 其他模型
      {
        model: 'llama-2',
        provider: 'local',
        capabilities: {
          vision: false,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 4096,
          maxTokens: 4096
        },
        performance: {
          speed: 'medium',
          accuracy: 'medium',
          cost: 'low'
        },
        specializations: ['open-source', 'customizable', 'offline-capable']
      },
      {
        model: 'mistral',
        provider: 'local',
        capabilities: {
          vision: false,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 8192,
          maxTokens: 4096
        },
        performance: {
          speed: 'fast',
          accuracy: 'high',
          cost: 'low'
        },
        specializations: ['efficient', 'multilingual', 'reasoning']
      }
    ];

    capabilities.forEach(cap => {
      this.modelCapabilities.set(cap.model, cap);
    });
  }

  // 初始化卡片任務
  private initializeCardTasks(): void {
    const tasks: CardAITask[] = [
      {
        taskType: 'card_recognition',
        description: '識別卡片圖像並提取基本信息',
        requiredCapabilities: ['vision', 'analysis'],
        preferredModels: ['gemini-vision', 'gpt-4', 'claude-3'],
        fallbackModels: ['gemini-pro', 'gpt-3.5-turbo', 'claude-2']
      },
      {
        taskType: 'condition_analysis',
        description: '分析卡片狀況和評級',
        requiredCapabilities: ['vision', 'analysis', 'reasoning'],
        preferredModels: ['gemini-vision', 'gpt-4', 'claude-3'],
        fallbackModels: ['gemini-pro', 'gpt-3.5-turbo', 'claude-2']
      },
      {
        taskType: 'authenticity_check',
        description: '驗證卡片真偽',
        requiredCapabilities: ['vision', 'analysis', 'reasoning'],
        preferredModels: ['gemini-vision', 'gpt-4', 'claude-3'],
        fallbackModels: ['gemini-pro', 'gpt-3.5-turbo', 'claude-2']
      },
      {
        taskType: 'price_prediction',
        description: '預測卡片價格趨勢',
        requiredCapabilities: ['analysis', 'reasoning', 'math'],
        preferredModels: ['gpt-4', 'claude-3', 'gemini-pro'],
        fallbackModels: ['gpt-3.5-turbo', 'claude-2', 'mistral']
      },
      {
        taskType: 'market_analysis',
        description: '分析市場趨勢和機會',
        requiredCapabilities: ['analysis', 'reasoning'],
        preferredModels: ['gpt-4', 'claude-3', 'gemini-pro'],
        fallbackModels: ['gpt-3.5-turbo', 'claude-2', 'mistral']
      },
      {
        taskType: 'investment_advice',
        description: '提供投資建議',
        requiredCapabilities: ['analysis', 'reasoning', 'creativity'],
        preferredModels: ['gpt-4', 'claude-3', 'gemini-pro'],
        fallbackModels: ['gpt-3.5-turbo', 'claude-2', 'mistral']
      }
    ];

    tasks.forEach(task => {
      this.cardTasks.set(task.taskType, task);
    });
  }

  // 獲取模型能力
  getModelCapability(model: AIModelType): AIModelCapability | undefined {
    return this.modelCapabilities.get(model);
  }

  // 獲取所有模型能力
  getAllModelCapabilities(): AIModelCapability[] {
    return Array.from(this.modelCapabilities.values());
  }

  // 根據能力篩選模型
  getModelsByCapability(capability: string): AIModelCapability[] {
    return Array.from(this.modelCapabilities.values()).filter(model => {
      return Object.entries(model.capabilities).some(([key, value]) => {
        if (key === capability) return value === true;
        return false;
      });
    });
  }

  // 根據性能篩選模型
  getModelsByPerformance(criteria: {
    speed?: 'fast' | 'medium' | 'slow';
    accuracy?: 'high' | 'medium' | 'low';
    cost?: 'low' | 'medium' | 'high';
  }): AIModelCapability[] {
    return Array.from(this.modelCapabilities.values()).filter(model => {
      if (criteria.speed && model.performance.speed !== criteria.speed) return false;
      if (criteria.accuracy && model.performance.accuracy !== criteria.accuracy) return false;
      if (criteria.cost && model.performance.cost !== criteria.cost) return false;
      return true;
    });
  }

  // 獲取卡片任務配置
  getCardTask(taskType: string): CardAITask | undefined {
    return this.cardTasks.get(taskType);
  }

  // 獲取所有卡片任務
  getAllCardTasks(): CardAITask[] {
    return Array.from(this.cardTasks.values());
  }

  // 為特定任務選擇最佳模型
  selectBestModelForTask(taskType: string, preferences?: {
    prioritizeSpeed?: boolean;
    prioritizeAccuracy?: boolean;
    prioritizeCost?: boolean;
    requireVision?: boolean;
    maxCost?: 'low' | 'medium' | 'high';
  }): AIModelType | null {
    const task = this.cardTasks.get(taskType);
    if (!task) return null;

    let availableModels = task.preferredModels.concat(task.fallbackModels);

    // 篩選有視覺能力的模型（如果需要）
    if (preferences?.requireVision) {
      availableModels = availableModels.filter(model => {
        const capability = this.modelCapabilities.get(model);
        return capability?.capabilities.vision === true;
      });
    }

    // 根據偏好篩選模型
    if (preferences) {
      availableModels = availableModels.filter(model => {
        const capability = this.modelCapabilities.get(model);
        if (!capability) return false;

        if (preferences.maxCost && capability.performance.cost === 'high' && preferences.maxCost === 'low') {
          return false;
        }
        if (preferences.maxCost && capability.performance.cost === 'high' && preferences.maxCost === 'medium') {
          return false;
        }

        return true;
      });
    }

    // 根據偏好排序
    if (availableModels.length > 0) {
      availableModels.sort((a, b) => {
        const capA = this.modelCapabilities.get(a);
        const capB = this.modelCapabilities.get(b);
        if (!capA || !capB) return 0;

        if (preferences?.prioritizeSpeed) {
          const speedOrder = { fast: 0, medium: 1, slow: 2 };
          return speedOrder[capA.performance.speed] - speedOrder[capB.performance.speed];
        }
        if (preferences?.prioritizeAccuracy) {
          const accuracyOrder = { high: 0, medium: 1, low: 2 };
          return accuracyOrder[capA.performance.accuracy] - accuracyOrder[capB.performance.accuracy];
        }
        if (preferences?.prioritizeCost) {
          const costOrder = { low: 0, medium: 1, high: 2 };
          return costOrder[capA.performance.cost] - costOrder[capB.performance.cost];
        }

        return 0;
      });
    }

    return availableModels[0] || null;
  }

  // 執行卡片相關AI任務
  async executeCardTask(
    taskType: string,
    prompt: string,
    options?: {
      imageData?: string; // base64 image data
      preferences?: {
        prioritizeSpeed?: boolean;
        prioritizeAccuracy?: boolean;
        prioritizeCost?: boolean;
        maxCost?: 'low' | 'medium' | 'high';
      };
      customModel?: AIModelType;
    }
  ): Promise<AIResponse> {
    try {
      // 獲取任務配置
      const task = this.cardTasks.get(taskType);
      if (!task) {
        throw new Error(`未知的任務類型: ${taskType}`);
      }

      // 選擇最佳模型
      const selectedModel = options?.customModel ||
        this.selectBestModelForTask(taskType, options?.preferences);

      if (!selectedModel) {
        throw new Error(`沒有可用的模型支持任務: ${taskType}`);
      }

      // 獲取模型能力
      const modelCapability = this.modelCapabilities.get(selectedModel);
      if (!modelCapability) {
        throw new Error(`未知的模型: ${selectedModel}`);
      }

      // 檢查是否需要視覺能力
      const requiresVision = options?.imageData && task.requiredCapabilities.includes('vision');
      if (requiresVision && !modelCapability.capabilities.vision) {
        throw new Error(`模型 ${selectedModel} 不支持視覺任務`);
      }

      // 構建AI請求配置
      const aiConfig: AIRequestConfig = {
        provider: modelCapability.provider,
        model: selectedModel,
        task: this.mapTaskTypeToAITask(taskType),
        temperature: 0.3, // 較低的溫度用於分析任務
        maxTokens: Math.min(modelCapability.capabilities.maxTokens, 2000),
        fallbackProviders: task.fallbackModels.map(model => {
          const fallbackCap = this.modelCapabilities.get(model);
          return fallbackCap?.provider;
        }).filter(Boolean) as AIProvider[]
      };

      // 如果有圖像數據，添加到提示中
      let finalPrompt = prompt;
      if (options?.imageData) {
        finalPrompt = `圖像數據: ${options.imageData}\n\n任務: ${prompt}`;
      }

      // 執行AI請求
      const response = await multiAIService.executeRequest(finalPrompt, aiConfig);

      logger.info(`卡片任務執行完成: ${taskType}`, {
        model: selectedModel,
        provider: modelCapability.provider,
        processingTime: response.metadata.processingTime,
        cost: response.metadata.cost
      });

      return response;

    } catch (error: any) {
      logger.error(`❌ 卡片任務執行失敗: ${taskType}`, error);
      throw error;
    }
  }

  // 將卡片任務類型映射到AI任務類型
  private mapTaskTypeToAITask(taskType: string): AITaskType {
    const taskMapping: Record<string, AITaskType> = {
      'card_recognition': 'recognition',
      'condition_analysis': 'analysis',
      'authenticity_check': 'analysis',
      'price_prediction': 'prediction',
      'market_analysis': 'analysis',
      'investment_advice': 'generation'
    };

    return taskMapping[taskType] || 'analysis';
  }

  // 獲取模型比較信息
  compareModels(models: AIModelType[]): {
    model: AIModelType;
    capability: AIModelCapability;
    score: number;
  }[] {
    return models.map(model => {
      const capability = this.modelCapabilities.get(model);
      if (!capability) return { model, capability: null as any, score: 0 };

      // 計算綜合評分
      let score = 0;

      // 能力評分
      const {capabilities} = capability;
      if (capabilities.vision) score += 20;
      if (capabilities.code) score += 15;
      if (capabilities.math) score += 15;
      if (capabilities.reasoning) score += 20;
      if (capabilities.creativity) score += 10;
      if (capabilities.analysis) score += 20;
      if (capabilities.multilingual) score += 10;

      // 性能評分
      const {performance} = capability;
      if (performance.speed === 'fast') score += 15;
      else if (performance.speed === 'medium') score += 10;
      else score += 5;

      if (performance.accuracy === 'high') score += 25;
      else if (performance.accuracy === 'medium') score += 15;
      else score += 5;

      if (performance.cost === 'low') score += 20;
      else if (performance.cost === 'medium') score += 10;
      else score += 5;

      // 上下文長度評分
      score += Math.min(capability.capabilities.contextLength / 1000, 20);

      return { model, capability, score };
    }).sort((a, b) => b.score - a.score);
  }

  // 獲取推薦模型
  getRecommendedModels(useCase: string): AIModelType[] {
    const recommendations: Record<string, AIModelType[]> = {
      'card-scanning': ['gemini-vision', 'gpt-4', 'claude-3'],
      'price-analysis': ['gpt-4', 'claude-3', 'gemini-pro'],
      'market-research': ['gpt-4', 'claude-3', 'gemini-pro'],
      'investment-advice': ['gpt-4', 'claude-3', 'gemini-pro'],
      'cost-effective': ['gemini-pro', 'gpt-3.5-turbo', 'mistral'],
      'high-accuracy': ['gpt-4', 'claude-3', 'gemini-vision'],
      'fast-processing': ['gemini-pro', 'gpt-3.5-turbo', 'mistral']
    };

    return recommendations[useCase] || ['gpt-4', 'claude-3', 'gemini-pro'];
  }

  // 更新模型能力
  updateModelCapability(model: AIModelType, updates: Partial<AIModelCapability>): void {
    const existing = this.modelCapabilities.get(model);
    if (existing) {
      this.modelCapabilities.set(model, { ...existing, ...updates });
      logger.info(`模型能力已更新: ${model}`);
    }
  }

  // 添加自定義模型
  addCustomModel(capability: AIModelCapability): void {
    this.modelCapabilities.set(capability.model, capability);
    logger.info(`自定義模型已添加: ${capability.model}`);
  }
}

// 導出AI模型管理器實例
export const aiModelManager = new AIModelManager();
export default aiModelManager;
