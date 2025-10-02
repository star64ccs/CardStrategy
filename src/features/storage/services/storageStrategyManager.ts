import { logger } from '../../../core/utils/logger';
import type { StorageConfig, StorageOptions } from '../types/storage';
import { DataPriority, StorageLayer, StorageStrategy } from '../types/storage';

import { MultiLayerStorageService } from './multiLayerStorageService';

// 性能指標Interface
interface PerformanceMetrics {
  readLatency: number;
  writeLatency: number;
  hitRate: number;
  errorRate: number;
  networkSpeed: number;
  storageUsage: number;
  batteryLevel?: number;
  memoryUsage?: number;
}

// Network狀況枚舉
enum NetworkCondition {
  EXCELLENT = 'excellent', // 優秀
  GOOD = 'good', // 良好
  POOR = 'poor', // 差
  OFFLINE = 'offline', // 離線
}

// 設備狀況枚舉
enum DeviceCondition {
  HIGH_PERFORMANCE = 'high_performance',
  BALANCED = 'balanced',
  POWER_SAVING = 'power_saving',
  LOW_STORAGE = 'low_storage',
}

// 自適應ConfigureInterface
interface AdaptiveConfig {
  autoOptimize: boolean;
  monitoringInterval: number;
  strategyChangeThreshold: number;
  performanceTargets: PerformanceTargets;
  constraints: ResourceConstraints;
}

// 性能目標Interface
interface PerformanceTargets {
  maxReadLatency: number;
  maxWriteLatency: number;
  minHitRate: number;
  maxErrorRate: number;
}

// ResourceLimitInterface
interface ResourceConstraints {
  maxMemoryUsage: number;
  maxStorageUsage: number;
  minBatteryLevel?: number;
  networkBandwidthLimit?: number;
}

/**
 * Storage策略Manage器
 * 負責DynamicSelect和調整Storage策略，Root據設備狀況、NetworkCondition和性能指標自適應優化
 */
export class StorageStrategyManager {
  private static instance: StorageStrategyManager;
  private readonly storageService: MultiLayerStorageService;
  private currentStrategy: StorageStrategy;
  private adaptiveConfig: AdaptiveConfig;
  private performanceHistory: PerformanceMetrics[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  private constructor() {
    this.storageService = MultiLayerStorageService.getInstance();
    this.currentStrategy = StorageStrategy.BALANCED;
    this.adaptiveConfig = this.getDefaultAdaptiveConfig();
  }

  /**
   * GetServiceInstance（單例模式）
   */
  public static getInstance(): StorageStrategyManager {
    if (!StorageStrategyManager.instance) {
      StorageStrategyManager.instance = new StorageStrategyManager();
    }
    return StorageStrategyManager.instance;
  }

  /**
   * Initialize策略Manage器
   */
  public async initialize(config?: Partial<AdaptiveConfig>): Promise<boolean> {
    try {
      if (config) {
        this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
      }

      // 評估初始策略
      const _optimalStrategy = await this.evaluateOptimalStrategy();
      await this.setStrategy(optimalStrategy);

      // StartMonitor
      if (this.adaptiveConfig.autoOptimize) {
        this.startPerformanceMonitoring();
      }

      logger.info('StorageStrategyManager InitializeSuccess', {
        strategy: this.currentStrategy,
      });
      return true;
    } catch (error) {
      logger.error('StorageStrategyManager InitializeFailed:', error);
      return false;
    }
  }

  /**
   * SettingsStorage策略
   */
  public async setStrategy(strategy: StorageStrategy): Promise<boolean> {
    try {
      if (this.currentStrategy === strategy) {
        return true;
      }

      const _config = this.generateConfigForStrategy(strategy);
      const _success = await this.storageService.initialize(config);

      if (success) {
        this.currentStrategy = strategy;
        logger.info(`存儲策略已切換到: ${strategy}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Settings存儲策略Failed:', { error, strategy });
      return false;
    }
  }

  /**
   * Get當前策略
   */
  public getCurrentStrategy(): StorageStrategy {
    return this.currentStrategy;
  }

  /**
   * Root據Data特徵推薦StorageOptions
   */
  public recommendStorageOptions(
    dataSize: number,
    accessFrequency: number,
    importance: DataPriority,
    isTemporary = false
  ): StorageOptions {
    const _networkCondition = this.assessNetworkCondition();
    const _deviceCondition = this.assessDeviceCondition();

    const options: StorageOptions = {
      priority: importance,
      sync: true,
      compress: false,
      encrypt: false,
    };

    // Root據Data大小調整
    if (dataSize > 1024 * 1024) {
      // 1MB
      options.compress = true;
      options.layer = StorageLayer.LOCAL;
    } else if (dataSize > 10 * 1024) {
      // 10KB
      options.layer = StorageLayer.CACHE;
    } else {
      options.layer = StorageLayer.MEMORY;
    }

    // Root據訪問頻率調整
    if (accessFrequency > 0.8) {
      // 高頻訪問
      options.layer = StorageLayer.MEMORY;
      options.ttl = 30 * 60 * 1000; // 30Minute
    } else if (accessFrequency > 0.4) {
      // 中頻訪問
      options.layer = StorageLayer.CACHE;
      options.ttl = 2 * 60 * 60 * 1000; // 2Hour
    }

    // Root據重要性調整
    if (importance === DataPriority.CRITICAL) {
      options.sync = true;
      options.encrypt = true;
      // OffKeyData使用多層Storage
      delete options.layer;
    } else if (importance === DataPriority.LOW || isTemporary) {
      options.sync = false;
      options.ttl = 10 * 60 * 1000; // 10Minute
    }

    // Root據Network狀況調整
    if (
      networkCondition === NetworkCondition.POOR ||
      networkCondition === NetworkCondition.OFFLINE
    ) {
      options.sync = false;
      options.layer = StorageLayer.LOCAL;
    }

    // Root據設備狀況調整
    if (deviceCondition === DeviceCondition.LOW_STORAGE) {
      options.compress = true;
      options.ttl = 30 * 60 * 1000; // 30Minute
    } else if (deviceCondition === DeviceCondition.POWER_SAVING) {
      options.sync = false;
      options.layer = StorageLayer.LOCAL;
    }

    return options;
  }

  /**
   * 優化當前策略
   */
  public async optimizeStrategy(): Promise<boolean> {
    try {
      const _currentMetrics = await this.getCurrentPerformanceMetrics();
      const _isPerformanceAcceptable =
        this.isPerformanceAcceptable(currentMetrics);

      if (!isPerformanceAcceptable) {
        const _optimalStrategy = await this.evaluateOptimalStrategy();

        if (optimalStrategy !== this.currentStrategy) {
          logger.info('性能不佳，切換存儲策略', {
            from: this.currentStrategy,
            to: optimalStrategy,
            metrics: currentMetrics,
          });

          return await this.setStrategy(optimalStrategy);
        }
      }

      return true;
    } catch (error) {
      logger.error('優化策略Failed:', error);
      return false;
    }
  }

  /**
   * Get策略性能Report
   */
  public async getPerformanceReport(): Promise<{
    currentStrategy: StorageStrategy;
    metrics: PerformanceMetrics;
    recommendations: string[];
    trendAnalysis: TrendAnalysis;
  }> {
    const _metrics = await this.getCurrentPerformanceMetrics();
    const _recommendations = this.generateRecommendations(metrics);
    const _trendAnalysis = this.analyzeTrends();

    return {
      currentStrategy: this.currentStrategy,
      metrics,
      recommendations,
      trendAnalysis,
    };
  }

  /**
   * 預測Storage需求
   */
  public predictStorageNeeds(
    timeHorizon: number = 7 * 24 * 60 * 60 * 1000 // 7天
  ): {
    predictedSize: number;
    predictedOperations: number;
    recommendedStrategy: StorageStrategy;
    resourceRequirements: ResourceRequirements;
  } {
    const _historicalData = this.performanceHistory.slice(-168); // 最近7天的HourData

    if (historicalData.length === 0) {
      return {
        predictedSize: 0,
        predictedOperations: 0,
        recommendedStrategy: StorageStrategy.BALANCED,
        resourceRequirements: {
          memoryMB: 10,
          storageMB: 50,
          networkMBps: 1,
        },
      };
    }

    // 簡單的線性趨勢預測
    const _avgGrowthRate = this.calculateAverageGrowthRate(historicalData);
    const _currentSize = this.getCurrentStorageSize();
    const _currentOps = this.getCurrentOperationsPerHour();

    const _predictedSize =
      currentSize * (1 + avgGrowthRate * (timeHorizon / (24 * 60 * 60 * 1000)));
    const _predictedOperations =
      currentOps * (1 + avgGrowthRate * (timeHorizon / (24 * 60 * 60 * 1000)));

    const _recommendedStrategy = this.recommendStrategyForLoad(
      predictedSize,
      predictedOperations
    );
    const _resourceRequirements = this.calculateResourceRequirements(
      predictedSize,
      predictedOperations
    );

    return {
      predictedSize,
      predictedOperations,
      recommendedStrategy,
      resourceRequirements,
    };
  }

  /**
   * 銷毀Service
   */
  public async destroy(): Promise<boolean> {
    try {
      this.stopPerformanceMonitoring();
      this.performanceHistory = [];
      logger.info('StorageStrategyManager 已銷毀');
      return true;
    } catch (error) {
      logger.error('銷毀 StorageStrategyManager Failed:', error);
      return false;
    }
  }

  // PrivateMethod實現

  private getDefaultAdaptiveConfig(): AdaptiveConfig {
    return {
      autoOptimize: true,
      monitoringInterval: 60 * 1000, // 1Minute
      strategyChangeThreshold: 0.2, // 20%性能變化觸發策略調整
      performanceTargets: {
        maxReadLatency: 100, // 100ms
        maxWriteLatency: 200, // 200ms
        minHitRate: 0.8, // 80%
        maxErrorRate: 0.05, // 5%
      },
      constraints: {
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        maxStorageUsage: 200 * 1024 * 1024, // 200MB
        minBatteryLevel: 0.2, // 20%
        networkBandwidthLimit: 1024 * 1024, // 1MB/s
      },
    };
  }

  private async evaluateOptimalStrategy(): Promise<StorageStrategy> {
    const _networkCondition = this.assessNetworkCondition();
    const _deviceCondition = this.assessDeviceCondition();
    const _currentLoad = await this.assessCurrentLoad();

    // 優先級：設備狀況 > Network狀況 > 負載情況
    if (deviceCondition === DeviceCondition.POWER_SAVING) {
      return StorageStrategy.OFFLINE_FIRST;
    }

    if (deviceCondition === DeviceCondition.LOW_STORAGE) {
      return StorageStrategy.PERFORMANCE; // 使用Memory減少Storage佔用
    }

    if (
      networkCondition === NetworkCondition.OFFLINE ||
      networkCondition === NetworkCondition.POOR
    ) {
      return StorageStrategy.OFFLINE_FIRST;
    }

    if (currentLoad.isHighLoad) {
      return StorageStrategy.PERFORMANCE;
    }

    if (
      networkCondition === NetworkCondition.EXCELLENT &&
      deviceCondition === DeviceCondition.HIGH_PERFORMANCE
    ) {
      return StorageStrategy.RELIABILITY;
    }

    return StorageStrategy.BALANCED;
  }

  private generateConfigForStrategy(
    strategy: StorageStrategy
  ): Partial<StorageConfig> {
    const _baseConfig = {
      strategy,
      layers: [],
      compression: {
        enabled: false,
        algorithm: 'gzip' as any,
        minSize: 1024,
        level: 6,
        autoCompress: false,
      },
      sync: {
        enabled: true,
        interval: 300000,
        batchSize: 100,
        maxRetries: 3,
        conflictResolution: 'last_modified' as any,
        backgroundSync: true,
        syncOnStartup: true,
        syncOnNetworkChange: true,
      },
      cleanup: {
        enabled: true,
        interval: 3600000,
        maxAge: 604800000,
        maxSize: 104857600,
        strategy: 'lru' as any,
        preserveCritical: true,
      },
    };

    switch (strategy) {
      case StorageStrategy.PERFORMANCE:
        return {
          ...baseConfig,
          layers: [
            {
              layer: StorageLayer.MEMORY,
              enabled: true,
              priority: 1,
              maxSize: 20 * 1024 * 1024,
              maxItems: 2000,
              ttl: 10 * 60 * 1000,
            },
            {
              layer: StorageLayer.CACHE,
              enabled: true,
              priority: 2,
              maxSize: 100 * 1024 * 1024,
              maxItems: 10000,
              ttl: 60 * 60 * 1000,
            },
          ],
          compression: { ...baseConfig.compression, enabled: false },
          sync: { ...baseConfig.sync, enabled: false },
        };

      case StorageStrategy.RELIABILITY:
        return {
          ...baseConfig,
          layers: [
            {
              layer: StorageLayer.LOCAL,
              enabled: true,
              priority: 1,
              maxSize: 500 * 1024 * 1024,
              maxItems: 50000,
              ttl: 7 * 24 * 60 * 60 * 1000,
            },
            {
              layer: StorageLayer.CLOUD,
              enabled: true,
              priority: 2,
              maxSize: 1024 * 1024 * 1024,
              maxItems: 100000,
              ttl: 30 * 24 * 60 * 60 * 1000,
            },
          ],
          compression: { ...baseConfig.compression, enabled: true },
          sync: { ...baseConfig.sync, interval: 60000, backgroundSync: true },
        };

      case StorageStrategy.OFFLINE_FIRST:
        return {
          ...baseConfig,
          layers: [
            {
              layer: StorageLayer.LOCAL,
              enabled: true,
              priority: 1,
              maxSize: 300 * 1024 * 1024,
              maxItems: 30000,
              ttl: 14 * 24 * 60 * 60 * 1000,
            },
            {
              layer: StorageLayer.CACHE,
              enabled: true,
              priority: 2,
              maxSize: 100 * 1024 * 1024,
              maxItems: 10000,
              ttl: 2 * 60 * 60 * 1000,
            },
          ],
          compression: { ...baseConfig.compression, enabled: true },
          sync: { ...baseConfig.sync, enabled: false },
        };

      case StorageStrategy.BALANCED:
      default:
        return {
          ...baseConfig,
          layers: [
            {
              layer: StorageLayer.MEMORY,
              enabled: true,
              priority: 1,
              maxSize: 10 * 1024 * 1024,
              maxItems: 1000,
              ttl: 5 * 60 * 1000,
            },
            {
              layer: StorageLayer.CACHE,
              enabled: true,
              priority: 2,
              maxSize: 50 * 1024 * 1024,
              maxItems: 5000,
              ttl: 30 * 60 * 1000,
            },
            {
              layer: StorageLayer.LOCAL,
              enabled: true,
              priority: 3,
              maxSize: 200 * 1024 * 1024,
              maxItems: 20000,
              ttl: 7 * 24 * 60 * 60 * 1000,
            },
          ],
          compression: {
            ...baseConfig.compression,
            enabled: true,
            autoCompress: true,
          },
          sync: { ...baseConfig.sync, interval: 300000 },
        };
    }
  }

  private assessNetworkCondition(): NetworkCondition {
    // 模擬Network狀況評估
    const _navigator = globalThis.navigator as any;

    if (!navigator.onLine) {
      return NetworkCondition.OFFLINE;
    }

    // 在實際實現中，這裡會檢測Network速度和延遲
    const _connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      const { downlink } = connection; // Mbps

      if (downlink > 10) {
        return NetworkCondition.EXCELLENT;
      } else if (downlink > 1) {
        return NetworkCondition.GOOD;
      } else {
        return NetworkCondition.POOR;
      }
    }

    return NetworkCondition.GOOD; // DefaultFalse設Network良好
  }

  private assessDeviceCondition(): DeviceCondition {
    // 模擬設備狀況評估
    try {
      const _performance = globalThis.performance as any;
      const { memory } = performance;

      if (memory) {
        const _memoryUsageRatio =
          memory.usedJSHeapSize / memory.totalJSHeapSize;

        if (memoryUsageRatio > 0.9) {
          return DeviceCondition.LOW_STORAGE;
        } else if (memoryUsageRatio > 0.7) {
          return DeviceCondition.POWER_SAVING;
        } else if (memoryUsageRatio < 0.3) {
          return DeviceCondition.HIGH_PERFORMANCE;
        }
      }

      return DeviceCondition.BALANCED;
    } catch (error) {
      return DeviceCondition.BALANCED;
    }
  }

  private async assessCurrentLoad(): Promise<{
    isHighLoad: boolean;
    metrics: unknown;
  }> {
    const _stats = await this.storageService.getStats();

    const _isHighLoad =
      stats.averageReadLatency > 50 ||
      stats.averageWriteLatency > 100 ||
      stats.hitRate < 0.7;

    return {
      isHighLoad,
      metrics: {
        readLatency: stats.averageReadLatency,
        writeLatency: stats.averageWriteLatency,
        hitRate: stats.hitRate,
      },
    };
  }

  private startPerformanceMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        const _metrics = await this.getCurrentPerformanceMetrics();
        this.performanceHistory.push(metrics);

        // 保持歷史Record在合理範圍內（最近24Hour）
        if (this.performanceHistory.length > 1440) {
          // 24 * 60 Minute
          this.performanceHistory = this.performanceHistory.slice(-1440);
        }

        // CheckYesNo需要優化策略
        if (this.adaptiveConfig.autoOptimize) {
          await this.optimizeStrategy();
        }
      } catch (error) {
        logger.error('性能監控Failed:', error);
      }
    }, this.adaptiveConfig.monitoringInterval);

    logger.info('性能監控已啟動');
  }

  private stopPerformanceMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    logger.info('性能監控已停止');
  }

  private async getCurrentPerformanceMetrics(): Promise<PerformanceMetrics> {
    const _stats = await this.storageService.getStats();
    const _networkCondition = this.assessNetworkCondition();
    const _deviceCondition = this.assessDeviceCondition();

    return {
      readLatency: stats.averageReadLatency,
      writeLatency: stats.averageWriteLatency,
      hitRate: stats.hitRate,
      errorRate: stats.errorStats.totalErrors / (stats.totalItems || 1),
      networkSpeed: this.getNetworkSpeed(networkCondition),
      storageUsage:
        stats.totalSize /
        (this.adaptiveConfig.constraints.maxStorageUsage || 1),
      batteryLevel: this.getBatteryLevel(),
      memoryUsage: this.getMemoryUsage(),
    };
  }

  private isPerformanceAcceptable(metrics: PerformanceMetrics): boolean {
    const _targets = this.adaptiveConfig.performanceTargets;

    return (
      metrics.readLatency <= targets.maxReadLatency &&
      metrics.writeLatency <= targets.maxWriteLatency &&
      metrics.hitRate >= targets.minHitRate &&
      metrics.errorRate <= targets.maxErrorRate
    );
  }

  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    const _targets = this.adaptiveConfig.performanceTargets;

    if (metrics.readLatency > targets.maxReadLatency) {
      recommendations.push('考慮增加內存緩存大小以降低讀取延遲');
    }

    if (metrics.writeLatency > targets.maxWriteLatency) {
      recommendations.push('考慮啟用壓縮或使用更快的存儲層');
    }

    if (metrics.hitRate < targets.minHitRate) {
      recommendations.push('調整緩存策略或增加緩存容量');
    }

    if (metrics.errorRate > targets.maxErrorRate) {
      recommendations.push('Check網絡Connect或增加重試機制');
    }

    if (metrics.storageUsage > 0.8) {
      recommendations.push('執行清理操作或增加存儲容量');
    }

    if (recommendations.length === 0) {
      recommendations.push('當前性能表現良好，建議保持現有配置');
    }

    return recommendations;
  }

  private analyzeTrends(): TrendAnalysis {
    if (this.performanceHistory.length < 2) {
      return {
        readLatencyTrend: 'stable',
        writeLatencyTrend: 'stable',
        hitRateTrend: 'stable',
        overallTrend: 'stable',
      };
    }

    const _recent = this.performanceHistory.slice(-10); // 最近10個Data點
    const _earlier = this.performanceHistory.slice(-20, -10); // 更早的10個Data點

    if (earlier.length === 0) {
      return {
        readLatencyTrend: 'stable',
        writeLatencyTrend: 'stable',
        hitRateTrend: 'stable',
        overallTrend: 'stable',
      };
    }

    const _recentAvg = this.calculateAverageMetrics(recent);
    const _earlierAvg = this.calculateAverageMetrics(earlier);

    const _readLatencyTrend = this.calculateTrend(
      earlierAvg.readLatency,
      recentAvg.readLatency
    );
    const _writeLatencyTrend = this.calculateTrend(
      earlierAvg.writeLatency,
      recentAvg.writeLatency
    );
    const _hitRateTrend = this.calculateTrend(
      earlierAvg.hitRate,
      recentAvg.hitRate,
      true
    );

    // 計算總體趨勢
    const _trends = [readLatencyTrend, writeLatencyTrend, hitRateTrend];
    const _improvingCount = trends.filter(t => t === 'improving').length;
    const _degradingCount = trends.filter(t => t === 'degrading').length;

    let overallTrend: 'improving' | 'degrading' | 'stable';
    if (improvingCount > degradingCount) {
      overallTrend = 'improving';
    } else if (degradingCount > improvingCount) {
      overallTrend = 'degrading';
    } else {
      overallTrend = 'stable';
    }

    return {
      readLatencyTrend,
      writeLatencyTrend,
      hitRateTrend,
      overallTrend,
    };
  }

  private getNetworkSpeed(condition: NetworkCondition): number {
    switch (condition) {
      case NetworkCondition.EXCELLENT:
        return 10; // 10 Mbps
      case NetworkCondition.GOOD:
        return 2; // 2 Mbps
      case NetworkCondition.POOR:
        return 0.5; // 0.5 Mbps
      case NetworkCondition.OFFLINE:
        return 0; // 0 Mbps
      default:
        return 1;
    }
  }

  private getBatteryLevel(): number {
    try {
      const _navigator = globalThis.navigator as any;
      if (navigator.battery || navigator.getBattery) {
        // 實際實現中會從電池APIGet
        return 0.8; // 模擬80%電量
      }
      return 1; // False設桌面設備
    } catch {
      return 1;
    }
  }

  private getMemoryUsage(): number {
    try {
      const _performance = globalThis.performance as any;
      if (performance.memory) {
        return (
          performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize
        );
      }
      return 0.5; // False設50%使用率
    } catch {
      return 0.5;
    }
  }

  private calculateAverageGrowthRate(data: PerformanceMetrics[]): number {
    if (data.length < 2) return 0;

    let totalGrowth = 0;
    for (let i = 1; i < data.length; i++) {
      const _growth =
        (data[i].storageUsage - data[i - 1].storageUsage) /
        data[i - 1].storageUsage;
      totalGrowth += growth;
    }

    return totalGrowth / (data.length - 1);
  }

  private getCurrentStorageSize(): number {
    // 模擬當前Storage大小
    return 50 * 1024 * 1024; // 50MB
  }

  private getCurrentOperationsPerHour(): number {
    // 模擬當前每HourOperation數
    return 1000;
  }

  private recommendStrategyForLoad(
    size: number,
    operations: number
  ): StorageStrategy {
    if (operations > 10000) {
      // 高負載
      return StorageStrategy.PERFORMANCE;
    } else if (size > 500 * 1024 * 1024) {
      // 大Storage
      return StorageStrategy.RELIABILITY;
    } else {
      return StorageStrategy.BALANCED;
    }
  }

  private calculateResourceRequirements(
    size: number,
    operations: number
  ): ResourceRequirements {
    return {
      memoryMB: Math.max(10, operations / 100), // 基於Operation數計算Memory需求
      storageMB: Math.max(50, (size / (1024 * 1024)) * 1.2), // Storage需求+20%緩衝
      networkMBps: Math.max(1, operations / 1000), // 基於Operation數計算Network需求
    };
  }

  private calculateAverageMetrics(
    metrics: PerformanceMetrics[]
  ): PerformanceMetrics {
    if (metrics.length === 0) {
      return {
        readLatency: 0,
        writeLatency: 0,
        hitRate: 0,
        errorRate: 0,
        networkSpeed: 0,
        storageUsage: 0,
      };
    }

    const _sum = metrics.reduce((acc, metric) => ({
      readLatency: acc.readLatency + metric.readLatency,
      writeLatency: acc.writeLatency + metric.writeLatency,
      hitRate: acc.hitRate + metric.hitRate,
      errorRate: acc.errorRate + metric.errorRate,
      networkSpeed: acc.networkSpeed + metric.networkSpeed,
      storageUsage: acc.storageUsage + metric.storageUsage,
    }));

    return {
      readLatency: sum.readLatency / metrics.length,
      writeLatency: sum.writeLatency / metrics.length,
      hitRate: sum.hitRate / metrics.length,
      errorRate: sum.errorRate / metrics.length,
      networkSpeed: sum.networkSpeed / metrics.length,
      storageUsage: sum.storageUsage / metrics.length,
    };
  }

  private calculateTrend(
    oldValue: number,
    newValue: number,
    higherIsBetter = false
  ): 'improving' | 'degrading' | 'stable' {
    const _changeRatio = Math.abs(newValue - oldValue) / oldValue;

    if (changeRatio < 0.05) {
      // 5%以內視為穩定
      return 'stable';
    }

    const _isImproving = higherIsBetter
      ? newValue > oldValue
      : newValue < oldValue;
    return isImproving ? 'improving' : 'degrading';
  }
}

// 輔助Interface
interface TrendAnalysis {
  readLatencyTrend: 'improving' | 'degrading' | 'stable';
  writeLatencyTrend: 'improving' | 'degrading' | 'stable';
  hitRateTrend: 'improving' | 'degrading' | 'stable';
  overallTrend: 'improving' | 'degrading' | 'stable';
}

interface ResourceRequirements {
  memoryMB: number;
  storageMB: number;
  networkMBps: number;
}
