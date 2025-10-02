import { AIServiceManager } from './AIServiceManager';
import { MediaWorker } from './MediaWorker';
import { AccuracyWorker } from './workers/AccuracyWorker';
import { RegulationWorker } from './workers/RegulationWorker';

// AI Worker 角色枚舉
export enum AIWorkerRole {
  Media = 'MediaWorker',
  Regulation = 'RegulationWorker',
  Cost = 'CostWorker',
  Architecture = 'ArchitectureWorker',
  Store = 'StoreWorker',
  Accuracy = 'AccuracyWorker',
  Security = 'SecurityWorker',
  Version = 'VersionWorker',
  Compliance = 'ComplianceWorker',
  Insight = 'InsightWorker',
}

// AI Worker Manage器
export class AIWorkerManager {
  private static instance: AIWorkerManager;
  private readonly workers: Map<AIWorkerRole, any> = new Map();
  private readonly aiService: AIServiceManager;
  private isInitialized = false;

  private constructor() {
    this.aiService = AIServiceManager.getInstance();
  }

  public static getInstance(): AIWorkerManager {
    if (!AIWorkerManager.instance) {
      AIWorkerManager.instance = new AIWorkerManager();
    }
    return AIWorkerManager.instance;
  }

  /**
   * Initialize所有 AI Worker
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('🚀 初始化 AI Worker 管理器...');

      // Initialize AI ServiceManage器
      await this.initializeAIService();

      // Initialize各個 Worker
      await this.initializeWorkers();

      this.isInitialized = true;
      console.log('✅ AI Worker 管理器初始化完成');
      return true;
    } catch (error) {
      console.error('❌ AI Worker 管理器InitializeFailed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Get指定的 Worker
   */
  public getWorker(role: AIWorkerRole): unknown {
    if (!this.isInitialized) {
      throw new Error('AI Worker 管理器尚未初始化');
    }

    const _worker = this.workers.get(role);
    if (!worker) {
      throw new Error(`Worker ${role} 不存在`);
    }

    return worker;
  }

  /**
   * Get所有 Worker Status
   */
  public getAllWorkerStatus(): Map<AIWorkerRole, any> {
    const _status = new Map<AIWorkerRole, any>();

    this.workers.forEach((worker, role) => {
      status.set(role, worker.getStatus());
    });

    return status;
  }

  /**
   * 執Row Worker Task
   */
  public async executeWorkerTask(
    role: AIWorkerRole,
    task: unknown
  ): Promise<any> {
    const _worker = this.getWorker(role);
    return await worker.execute(task);
  }

  /**
   * Get AI ServiceStatistics
   */
  public getAIServiceStats(): unknown {
    return this.aiService.getStats();
  }

  /**
   * Update AI ServiceConfigure
   */
  public updateAIServiceConfig(config: unknown): void {
    this.aiService.updateConfig(config);
  }

  // PrivateMethod

  /**
   * Initialize AI Service
   */
  private async initializeAIService(): Promise<void> {
    console.log('📊 Initialize AI Service管理器...');

    // 這裡可以SettingsDefaultConfigure
    const _defaultConfig = {
      maxMonthlyBudget: 30,
      preferredProviders: ['ollama', 'alibaba', 'baidu'],
      fallbackProviders: ['zhipu', 'azure'],
      costOptimization: {
        enableModelSwitching: true,
        enableBatchProcessing: true,
        enableCaching: true,
        enableCompression: true,
      },
      usageLimits: {
        dailyRequests: 500,
        monthlyTokens: 500000,
        maxConcurrentRequests: 5,
      },
    };

    this.aiService.updateConfig(defaultConfig);
    console.log('✅ AI Service管理器Initialize完成');
  }

  /**
   * Initialize各個 Worker
   */
  private async initializeWorkers(): Promise<void> {
    console.log('🤖 初始化 AI Workers...');

    // Initialize MediaWorker
    const _mediaWorkerConfig = {
      enabled: true,
      schedule: '0 9 * * *', // 每天上午9點執Row
      contentGeneration: {
        enableAutoGeneration: true,
        maxArticlesPerDay: 3,
        maxSocialPostsPerDay: 12,
        preferredTopics: ['卡片遊戲', '策略分析', '市場趨勢'],
        excludedTopics: ['政治', '宗教', '敏感話題'],
      },
      publishing: {
        enableAutoPublish: false,
        publishTime: '10:00',
        platforms: ['facebook', 'twitter', 'instagram'],
        approvalRequired: true,
      },
      costControl: {
        maxDailyBudget: 5,
        preferredAIProvider: 'ollama',
        enableCostOptimization: true,
      },
    };

    const _mediaWorker = new MediaWorker(mediaWorkerConfig);
    this.workers.set(AIWorkerRole.Media, mediaWorker);

    // Initialize RegulationWorker
    const _regulationWorkerConfig = {
      enabled: true,
      schedule: '0 */6 * * *', // 每6Hour執Row
      monitoring: {
        jurisdictions: ['EU', 'US', 'China', 'Global'],
        categories: ['data-protection', 'ai-governance', 'privacy', 'security'],
        sources: ['official', 'news', 'legal'],
        checkInterval: 360, // 6Hour
      },
      compliance: {
        enableAutoCheck: true,
        checkThreshold: 80,
        autoAlert: true,
        alertThreshold: 70,
      },
      costControl: {
        maxDailyBudget: 3,
        preferredAIProvider: 'ollama',
        enableCostOptimization: true,
      },
    };

    const _regulationWorker = new RegulationWorker(regulationWorkerConfig);
    this.workers.set(AIWorkerRole.Regulation, regulationWorker);

    // Initialize AccuracyWorker
    const _accuracyWorkerConfig = {
      enabled: true,
      schedule: '0 */4 * * *', // 每4Hour執Row
      monitoring: {
        accuracyThreshold: 85,
        checkInterval: 240, // 4Hour
        enableRealTimeMonitoring: true,
        enableErrorTracking: true,
      },
      optimization: {
        enableModelFusion: true,
        enableAutoRetraining: false,
        enablePromptOptimization: true,
        enableContextEnhancement: true,
        fusionThreshold: 0.8,
      },
      evaluation: {
        enableABTesting: true,
        enableCrossValidation: true,
        testDatasetSize: 100,
        evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1'],
      },
      costControl: {
        maxDailyBudget: 4,
        preferredAIProvider: 'ollama',
        enableCostOptimization: true,
      },
    };

    const _accuracyWorker = new AccuracyWorker(accuracyWorkerConfig);
    this.workers.set(AIWorkerRole.Accuracy, accuracyWorker);

    // Initialize其他 Worker（待實現）
    await this.initializePlaceholderWorkers();

    console.log(`✅ 已初始化 ${this.workers.size} 個 AI Workers`);
  }

  /**
   * Initialize佔位 Worker（待實現的 Worker）
   */
  private async initializePlaceholderWorkers(): Promise<void> {
    const _placeholderConfig = {
      enabled: false,
      schedule: '0 0 * * *',
      costControl: {
        maxDailyBudget: 2,
        preferredAIProvider: 'ollama',
        enableCostOptimization: true,
      },
    };

    // Create佔位 Worker
    const _placeholderWorker = {
      role: 'placeholder',
      status: 'idle',
      config: placeholderConfig,
      metrics: { lastRun: new Date(), successRate: 0 },
      getStatus: () => ({ isRunning: false, config: placeholderConfig }),
      updateConfig: (config: unknown) =>
        Object.assign(placeholderConfig, config),
      execute: async (task: unknown) => ({
        success: false,
        error: 'Worker 尚未實現',
      }),
    };

    // Settings佔位 Worker
    const _placeholderRoles = [
      AIWorkerRole.Cost,
      AIWorkerRole.Architecture,
      AIWorkerRole.Store,
      AIWorkerRole.Security,
      AIWorkerRole.Version,
      AIWorkerRole.Compliance,
      AIWorkerRole.Insight,
    ];

    placeholderRoles.forEach(role => {
      this.workers.set(role, { ...placeholderWorker, role });
    });
  }
}

// Export便捷Function
export const _getAIWorkerManager = (): AIWorkerManager => {
  return AIWorkerManager.getInstance();
};

export const _getMediaWorker = (): MediaWorker => {
  return getAIWorkerManager().getWorker(AIWorkerRole.Media);
};

export const _getRegulationWorker = (): RegulationWorker => {
  return getAIWorkerManager().getWorker(AIWorkerRole.Regulation);
};

export const _getAccuracyWorker = (): AccuracyWorker => {
  return getAIWorkerManager().getWorker(AIWorkerRole.Accuracy);
};

// ExportClass型
export type { AIRequest, AIResponse, AIServiceStats } from './AIServiceManager';

export type { Article, MediaWorkerConfig, SocialPost } from './MediaWorker';

export type {
  ComplianceReport,
  RegulationUpdate,
  RegulationWorkerConfig,
} from './workers/RegulationWorker';

export type {
  AccuracyReport,
  AccuracyWorkerConfig,
  ErrorAnalysis,
  FusionResult,
  ModelAccuracy,
  RetrainJob,
  TaskAccuracy,
} from './workers/AccuracyWorker';
