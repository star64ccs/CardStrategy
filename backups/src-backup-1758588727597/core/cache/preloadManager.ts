/**
 * 預加載管理器
 * 智能預測和預加載用戶可能需要的資源
 */

import { logger } from '../../utils/logger';
import CDNCache, { PreloadOptions } from './cdnCache';

export interface PreloadStrategy {
  name: string;
  priority: number;
  enabled: boolean;
  conditions: PreloadCondition[];
  actions: PreloadAction[];
}

export interface PreloadCondition {
  type:
    | 'userBehavior'
    | 'timeBased'
    | 'locationBased'
    | 'deviceBased'
    | 'networkBased';
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'in';
  value: any;
  weight: number;
}

export interface PreloadAction {
  type: 'asset' | 'route' | 'data' | 'api';
  resource: string;
  options?: PreloadOptions;
  priority: 'high' | 'medium' | 'low';
  condition?: string;
}

export interface UserBehavior {
  currentRoute: string;
  navigationHistory: string[];
  timeSpent: number;
  interactions: string[];
  preferences: Record<string, any>;
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    connection: 'slow' | 'medium' | 'fast';
    memory: number;
  };
}

export interface PreloadStats {
  totalPreloads: number;
  successfulPreloads: number;
  failedPreloads: number;
  hitRate: number;
  bandwidthUsed: number;
  timeSaved: number;
  strategies: Record<
    string,
    {
      executions: number;
      hits: number;
      efficiency: number;
    }
  >;
}

class PreloadManager {
  private static instance: PreloadManager;
  private cdnCache: CDNCache;
  private strategies: Map<string, PreloadStrategy> = new Map();
  private userBehavior: UserBehavior;
  private stats: PreloadStats;
  private isInitialized: boolean = false;

  private constructor(cdnCache: CDNCache) {
    this.cdnCache = cdnCache;
    this.userBehavior = {
      currentRoute: '/',
      navigationHistory: [],
      timeSpent: 0,
      interactions: [],
      preferences: {},
      deviceInfo: {
        type: 'desktop',
        connection: 'medium',
        memory: 4096,
      },
    };

    this.stats = {
      totalPreloads: 0,
      successfulPreloads: 0,
      failedPreloads: 0,
      hitRate: 0,
      bandwidthUsed: 0,
      timeSaved: 0,
      strategies: {},
    };

    this.initializeDefaultStrategies();
  }

  public static getInstance(cdnCache?: CDNCache): PreloadManager {
    if (!PreloadManager.instance) {
      if (!cdnCache) {
        throw new Error('CDN cache is required for first initialization');
      }
      PreloadManager.instance = new PreloadManager(cdnCache);
    }
    return PreloadManager.instance;
  }

  /**
   * 初始化預加載管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.cdnCache.initialize();

      this.isInitialized = true;
      logger.info('Preload manager initialized successfully', {
        strategies: this.strategies.size,
      });

      // 開始監聽用戶行為
      this.startBehaviorTracking();
    } catch (error) {
      logger.error('Failed to initialize preload manager', error);
      throw error;
    }
  }

  /**
   * 更新用戶行為
   */
  public updateUserBehavior(behavior: Partial<UserBehavior>): void {
    this.userBehavior = { ...this.userBehavior, ...behavior };

    // 觸發預加載策略評估
    this.evaluateStrategies();

    logger.debug('User behavior updated', { behavior });
  }

  /**
   * 添加預加載策略
   */
  public addStrategy(strategy: PreloadStrategy): void {
    this.strategies.set(strategy.name, strategy);
    logger.info('Preload strategy added', {
      name: strategy.name,
      priority: strategy.priority,
    });
  }

  /**
   * 移除預加載策略
   */
  public removeStrategy(name: string): void {
    if (this.strategies.delete(name)) {
      logger.info('Preload strategy removed', { name });
    }
  }

  /**
   * 手動觸發預加載
   */
  public async preloadResource(
    resource: string,
    type: PreloadAction['type'] = 'asset',
    priority: PreloadAction['priority'] = 'medium'
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      this.stats.totalPreloads++;

      let success = false;

      switch (type) {
        case 'asset':
          success = await this.cdnCache.preloadAsset(resource, {
            priority,
            prefetch: true,
          });
          break;
        case 'route':
          success = await this.preloadRoute(resource, priority);
          break;
        case 'data':
          success = await this.preloadData(resource, priority);
          break;
        case 'api':
          success = await this.preloadAPI(resource, priority);
          break;
      }

      if (success) {
        this.stats.successfulPreloads++;
        const timeSaved = Date.now() - startTime;
        this.stats.timeSaved += timeSaved;
      } else {
        this.stats.failedPreloads++;
      }

      logger.debug('Manual preload completed', {
        resource,
        type,
        priority,
        success,
        timeSaved: Date.now() - startTime,
      });

      return success;
    } catch (error) {
      logger.error('Manual preload error', { resource, type, error });
      this.stats.failedPreloads++;
      return false;
    }
  }

  /**
   * 批量預加載
   */
  public async batchPreload(
    resources: Array<{
      resource: string;
      type: PreloadAction['type'];
      priority: PreloadAction['priority'];
    }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = resources.map(async ({ resource, type, priority }) => {
      try {
        const result = await this.preloadResource(resource, type, priority);
        return result ? 'success' : 'failed';
      } catch (error) {
        logger.error('Batch preload item error', { resource, type, error });
        return 'failed';
      }
    });

    const results = await Promise.all(promises);

    results.forEach(result => {
      if (result === 'success') {
        success++;
      } else {
        failed++;
      }
    });

    logger.info('Batch preload completed', {
      total: resources.length,
      success,
      failed,
    });

    return { success, failed };
  }

  /**
   * 獲取預加載統計信息
   */
  public getStats(): PreloadStats {
    const totalPreloads = this.stats.totalPreloads;
    this.stats.hitRate =
      totalPreloads > 0
        ? (this.stats.successfulPreloads / totalPreloads) * 100
        : 0;

    return { ...this.stats };
  }

  /**
   * 獲取活躍策略
   */
  public getActiveStrategies(): PreloadStrategy[] {
    return Array.from(this.strategies.values())
      .filter(strategy => strategy.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const cdnHealth = await this.cdnCache.healthCheck();

      return {
        healthy: cdnHealth.healthy && this.isInitialized,
        details: {
          initialized: this.isInitialized,
          strategies: this.strategies.size,
          activeStrategies: this.getActiveStrategies().length,
          stats: this.getStats(),
          userBehavior: {
            currentRoute: this.userBehavior.currentRoute,
            timeSpent: this.userBehavior.timeSpent,
            interactions: this.userBehavior.interactions.length,
          },
          cdnHealth: cdnHealth.details,
        },
      };
    } catch (error) {
      logger.error('Preload manager health check failed', error);
      return {
        healthy: false,
        details: {
          initialized: this.isInitialized,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private initializeDefaultStrategies(): void {
    // 基於路由的預加載策略
    this.addStrategy({
      name: 'route-based-preload',
      priority: 100,
      enabled: true,
      conditions: [
        {
          type: 'userBehavior',
          operator: 'contains',
          value: '/cards',
          weight: 0.8,
        },
      ],
      actions: [
        {
          type: 'asset',
          resource: '/images/cards/thumbnails',
          priority: 'high',
        },
        {
          type: 'api',
          resource: '/api/cards/popular',
          priority: 'medium',
        },
      ],
    });

    // 基於時間的預加載策略
    this.addStrategy({
      name: 'time-based-preload',
      priority: 80,
      enabled: true,
      conditions: [
        {
          type: 'timeBased',
          operator: 'in',
          value: ['morning', 'evening'],
          weight: 0.6,
        },
      ],
      actions: [
        {
          type: 'asset',
          resource: '/images/backgrounds',
          priority: 'low',
        },
      ],
    });

    // 基於設備的預加載策略
    this.addStrategy({
      name: 'device-based-preload',
      priority: 90,
      enabled: true,
      conditions: [
        {
          type: 'deviceBased',
          operator: 'equals',
          value: 'mobile',
          weight: 0.7,
        },
      ],
      actions: [
        {
          type: 'asset',
          resource: '/images/mobile-optimized',
          priority: 'high',
        },
      ],
    });

    // 基於網絡的預加載策略
    this.addStrategy({
      name: 'network-based-preload',
      priority: 70,
      enabled: true,
      conditions: [
        {
          type: 'networkBased',
          operator: 'equals',
          value: 'fast',
          weight: 0.9,
        },
      ],
      actions: [
        {
          type: 'asset',
          resource: '/images/high-quality',
          priority: 'medium',
        },
      ],
    });
  }

  private async evaluateStrategies(): Promise<void> {
    const activeStrategies = this.getActiveStrategies();

    for (const strategy of activeStrategies) {
      try {
        const shouldExecute = await this.shouldExecuteStrategy(strategy);

        if (shouldExecute) {
          await this.executeStrategy(strategy);

          // 更新策略統計
          if (!this.stats.strategies[strategy.name]) {
            this.stats.strategies[strategy.name] = {
              executions: 0,
              hits: 0,
              efficiency: 0,
            };
          }

          this.stats.strategies[strategy.name].executions++;
        }
      } catch (error) {
        logger.error('Strategy evaluation error', {
          strategy: strategy.name,
          error,
        });
      }
    }
  }

  private async shouldExecuteStrategy(
    strategy: PreloadStrategy
  ): Promise<boolean> {
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of strategy.conditions) {
      totalWeight += condition.weight;

      if (await this.evaluateCondition(condition)) {
        matchedWeight += condition.weight;
      }
    }

    // 如果匹配的權重超過總權重的50%，則執行策略
    return matchedWeight / totalWeight > 0.5;
  }

  private async evaluateCondition(
    condition: PreloadCondition
  ): Promise<boolean> {
    switch (condition.type) {
      case 'userBehavior':
        return this.evaluateUserBehaviorCondition(condition);
      case 'timeBased':
        return this.evaluateTimeBasedCondition(condition);
      case 'locationBased':
        return this.evaluateLocationBasedCondition(condition);
      case 'deviceBased':
        return this.evaluateDeviceBasedCondition(condition);
      case 'networkBased':
        return this.evaluateNetworkBasedCondition(condition);
      default:
        return false;
    }
  }

  private evaluateUserBehaviorCondition(condition: PreloadCondition): boolean {
    const { operator, value } = condition;

    switch (operator) {
      case 'contains':
        return (
          this.userBehavior.currentRoute.includes(value) ||
          this.userBehavior.navigationHistory.some(route =>
            route.includes(value)
          )
        );
      case 'equals':
        return this.userBehavior.currentRoute === value;
      default:
        return false;
    }
  }

  private evaluateTimeBasedCondition(condition: PreloadCondition): boolean {
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    return condition.value.includes(timeOfDay);
  }

  private evaluateLocationBasedCondition(condition: PreloadCondition): boolean {
    // 模擬位置檢查
    return Math.random() > 0.5;
  }

  private evaluateDeviceBasedCondition(condition: PreloadCondition): boolean {
    return this.userBehavior.deviceInfo.type === condition.value;
  }

  private evaluateNetworkBasedCondition(condition: PreloadCondition): boolean {
    return this.userBehavior.deviceInfo.connection === condition.value;
  }

  private async executeStrategy(strategy: PreloadStrategy): Promise<void> {
    logger.debug('Executing preload strategy', { name: strategy.name });

    for (const action of strategy.actions) {
      try {
        await this.preloadResource(
          action.resource,
          action.type,
          action.priority
        );

        // 更新命中統計
        if (this.stats.strategies[strategy.name]) {
          this.stats.strategies[strategy.name].hits++;
        }
      } catch (error) {
        logger.error('Strategy action execution error', {
          strategy: strategy.name,
          action: action.type,
          error,
        });
      }
    }
  }

  private async preloadRoute(
    route: string,
    priority: string
  ): Promise<boolean> {
    // 模擬路由預加載
    logger.debug('Route preloaded', { route, priority });
    return true;
  }

  private async preloadData(
    dataKey: string,
    priority: string
  ): Promise<boolean> {
    // 模擬數據預加載
    logger.debug('Data preloaded', { dataKey, priority });
    return true;
  }

  private async preloadAPI(
    apiEndpoint: string,
    priority: string
  ): Promise<boolean> {
    // 模擬API預加載
    logger.debug('API preloaded', { apiEndpoint, priority });
    return true;
  }

  private startBehaviorTracking(): void {
    // 定期更新用戶行為統計
    setInterval(() => {
      this.userBehavior.timeSpent += 1; // 每秒增加1
    }, 1000);

    // 定期評估策略
    setInterval(() => {
      this.evaluateStrategies();
    }, 30000); // 每30秒評估一次
  }
}

export default PreloadManager;
