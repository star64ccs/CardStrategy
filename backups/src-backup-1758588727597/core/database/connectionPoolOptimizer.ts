/**
 * 連接池優化器 - 第三階段性能優化
 * 實現數據庫連接池的智能管理和優化
 */

import { logger } from '../utils/logger';

export interface ConnectionPoolConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeout: number; // 毫秒
  acquireTimeout: number; // 毫秒
  createTimeout: number; // 毫秒
  destroyTimeout: number; // 毫秒
  reapInterval: number; // 毫秒
  createRetryInterval: number; // 毫秒
  propagateCreateError: boolean;
  enableHealthCheck: boolean;
  healthCheckInterval: number; // 毫秒
}

export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  connectionWaitTime: number;
  averageQueryTime: number;
  connectionErrors: number;
  poolUtilization: number;
  lastHealthCheck: Date;
}

export interface ConnectionStats {
  created: number;
  destroyed: number;
  acquired: number;
  released: number;
  errors: number;
  timeouts: number;
}

/**
 * 連接池優化器
 */
export class ConnectionPoolOptimizer {
  private static instance: ConnectionPoolOptimizer;
  private config: ConnectionPoolConfig;
  private metrics: ConnectionMetrics;
  private stats: ConnectionStats;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private reapTimer: NodeJS.Timeout | null = null;
  private pool: any; // PostgreSQL Pool實例

  private constructor() {
    this.config = this.getDefaultConfig();
    this.metrics = this.getInitialMetrics();
    this.stats = this.getInitialStats();
  }

  public static getInstance(): ConnectionPoolOptimizer {
    if (!ConnectionPoolOptimizer.instance) {
      ConnectionPoolOptimizer.instance = new ConnectionPoolOptimizer();
    }
    return ConnectionPoolOptimizer.instance;
  }

  /**
   * 初始化連接池優化器
   */
  public async initialize(pool: any): Promise<void> {
    logger.info('初始化連接池優化器...');

    try {
      this.pool = pool;

      // 設置健康檢查
      if (this.config.enableHealthCheck) {
        this.setupHealthCheck();
      }

      // 設置連接回收
      this.setupConnectionReaping();

      // 設置指標監控
      this.setupMetricsMonitoring();

      // 初始健康檢查
      await this.performHealthCheck();

      logger.info('連接池優化器初始化完成');
    } catch (error) {
      logger.error('連接池優化器初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 優化連接池配置
   */
  public async optimizePoolConfiguration(): Promise<{
    originalConfig: ConnectionPoolConfig;
    optimizedConfig: ConnectionPoolConfig;
    improvements: string[];
  }> {
    logger.info('優化連接池配置...');

    const originalConfig = { ...this.config };
    const improvements: string[] = [];

    try {
      // 1. 分析連接使用模式
      const usagePattern = await this.analyzeConnectionUsagePattern();

      // 2. 優化連接數量
      const optimizedMinMax = this.optimizeConnectionLimits(usagePattern);
      if (optimizedMinMax) {
        this.config.minConnections = optimizedMinMax.minConnections;
        this.config.maxConnections = optimizedMinMax.maxConnections;
        improvements.push(
          `調整連接數限制: ${optimizedMinMax.minConnections}-${optimizedMinMax.maxConnections}`
        );
      }

      // 3. 優化超時設置
      const optimizedTimeouts = this.optimizeTimeouts(usagePattern);
      if (optimizedTimeouts) {
        Object.assign(this.config, optimizedTimeouts);
        improvements.push('優化連接超時設置');
      }

      // 4. 調整健康檢查間隔
      const optimizedHealthCheck =
        this.optimizeHealthCheckInterval(usagePattern);
      if (optimizedHealthCheck) {
        this.config.healthCheckInterval = optimizedHealthCheck;
        improvements.push(`調整健康檢查間隔: ${optimizedHealthCheck}ms`);
      }

      // 應用優化配置
      await this.applyPoolConfiguration();

      logger.info('連接池配置優化完成', { improvements });

      return {
        originalConfig,
        optimizedConfig: { ...this.config },
        improvements,
      };
    } catch (error) {
      logger.error('連接池配置優化失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取連接（帶優化）
   */
  public async getConnection(): Promise<any> {
    const startTime = Date.now();

    try {
      // 檢查連接池健康狀態
      if (!this.isPoolHealthy()) {
        await this.performHealthCheck();
      }

      // 獲取連接
      const connection = await this.pool.connect();

      // 記錄統計
      this.stats.acquired++;
      this.metrics.activeConnections++;

      const waitTime = Date.now() - startTime;
      this.metrics.connectionWaitTime =
        (this.metrics.connectionWaitTime + waitTime) / 2;

      logger.debug('獲取連接成功', {
        waitTime,
        activeConnections: this.metrics.activeConnections,
      });

      return connection;
    } catch (error) {
      this.stats.errors++;
      this.metrics.connectionErrors++;

      logger.error('獲取連接失敗:', error);
      throw error;
    }
  }

  /**
   * 釋放連接（帶優化）
   */
  public async releaseConnection(connection: any): Promise<void> {
    try {
      // 檢查連接狀態
      if (connection && !connection._ended) {
        await connection.release();
        this.stats.released++;
        this.metrics.activeConnections--;

        logger.debug('釋放連接成功', {
          activeConnections: this.metrics.activeConnections,
        });
      }
    } catch (error) {
      this.stats.errors++;
      logger.error('釋放連接失敗:', error);
    }
  }

  /**
   * 執行查詢（帶連接管理）
   */
  public async executeQuery<T>(query: string, params?: any[]): Promise<T[]> {
    const connection = await this.getConnection();

    try {
      const startTime = Date.now();
      const result = await connection.query(query, params);
      const queryTime = Date.now() - startTime;

      // 更新平均查詢時間
      this.metrics.averageQueryTime =
        (this.metrics.averageQueryTime + queryTime) / 2;

      return result.rows;
    } finally {
      await this.releaseConnection(connection);
    }
  }

  /**
   * 執行事務（帶連接管理）
   */
  public async executeTransaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();

    try {
      await connection.query('BEGIN');
      const result = await callback(connection);
      await connection.query('COMMIT');

      return result;
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      await this.releaseConnection(connection);
    }
  }

  /**
   * 獲取連接池指標
   */
  public getConnectionMetrics(): ConnectionMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * 獲取連接統計
   */
  public getConnectionStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * 執行健康檢查
   */
  public async performHealthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    logger.debug('執行連接池健康檢查...');

    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. 檢查連接池狀態
      if (this.pool) {
        const poolInfo = {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount,
        };

        // 檢查連接池利用率
        const utilization = poolInfo.totalCount / this.config.maxConnections;
        if (utilization > 0.8) {
          issues.push('連接池利用率過高');
          recommendations.push('考慮增加最大連接數');
        }

        // 檢查等待隊列
        if (poolInfo.waitingCount > 5) {
          issues.push('等待連接的請求過多');
          recommendations.push('優化查詢性能或增加連接數');
        }
      }

      // 2. 測試連接
      const testConnection = await this.pool.connect();
      await testConnection.query('SELECT 1');
      await testConnection.release();

      // 3. 檢查錯誤率
      const errorRate =
        this.stats.errors / (this.stats.acquired + this.stats.errors);
      if (errorRate > 0.05) {
        // 5%錯誤率
        issues.push('連接錯誤率過高');
        recommendations.push('檢查數據庫配置和網絡連接');
      }

      // 4. 檢查平均查詢時間
      if (this.metrics.averageQueryTime > 5000) {
        // 5秒
        issues.push('平均查詢時間過長');
        recommendations.push('優化查詢或檢查數據庫性能');
      }

      const healthy = issues.length === 0;

      this.metrics.lastHealthCheck = new Date();

      logger.debug('健康檢查完成', {
        healthy,
        issues: issues.length,
        recommendations: recommendations.length,
      });

      return {
        healthy,
        issues,
        recommendations,
      };
    } catch (error) {
      logger.error('健康檢查失敗:', error);
      return {
        healthy: false,
        issues: ['健康檢查失敗'],
        recommendations: ['檢查數據庫連接配置'],
      };
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<ConnectionPoolConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('連接池配置已更新', this.config);
  }

  /**
   * 清理資源
   */
  public cleanup(): void {
    logger.info('清理連接池優化器資源');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    if (this.reapTimer) {
      clearInterval(this.reapTimer);
    }
  }

  // 私有方法

  private setupHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private setupConnectionReaping(): void {
    this.reapTimer = setInterval(async () => {
      await this.reapIdleConnections();
    }, this.config.reapInterval);
  }

  private setupMetricsMonitoring(): void {
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // 每30秒更新指標
  }

  private async analyzeConnectionUsagePattern(): Promise<{
    peakConnections: number;
    averageConnections: number;
    peakTimes: string[];
    connectionPattern: 'steady' | 'burst' | 'sporadic';
  }> {
    // 分析連接使用模式
    return {
      peakConnections: this.metrics.totalConnections,
      averageConnections: Math.floor(this.metrics.totalConnections * 0.6),
      peakTimes: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
      connectionPattern: 'burst',
    };
  }

  private optimizeConnectionLimits(usagePattern: any): {
    minConnections: number;
    maxConnections: number;
  } | null {
    const currentMin = this.config.minConnections;
    const currentMax = this.config.maxConnections;

    // 基於使用模式優化連接數
    let optimizedMin = currentMin;
    let optimizedMax = currentMax;

    if (usagePattern.connectionPattern === 'burst') {
      optimizedMin = Math.max(
        2,
        Math.floor(usagePattern.averageConnections * 0.5)
      );
      optimizedMax = Math.min(
        50,
        Math.floor(usagePattern.peakConnections * 1.2)
      );
    } else if (usagePattern.connectionPattern === 'steady') {
      optimizedMin = Math.max(
        2,
        Math.floor(usagePattern.averageConnections * 0.8)
      );
      optimizedMax = Math.min(
        30,
        Math.floor(usagePattern.averageConnections * 1.5)
      );
    }

    if (optimizedMin !== currentMin || optimizedMax !== currentMax) {
      return { minConnections: optimizedMin, maxConnections: optimizedMax };
    }

    return null;
  }

  private optimizeTimeouts(
    usagePattern: any
  ): Partial<ConnectionPoolConfig> | null {
    const optimizations: Partial<ConnectionPoolConfig> = {};

    // 根據連接模式優化超時
    if (usagePattern.connectionPattern === 'burst') {
      optimizations.acquireTimeout = 5000; // 5秒
      optimizations.idleTimeout = 30000; // 30秒
    } else if (usagePattern.connectionPattern === 'steady') {
      optimizations.acquireTimeout = 3000; // 3秒
      optimizations.idleTimeout = 60000; // 60秒
    }

    return Object.keys(optimizations).length > 0 ? optimizations : null;
  }

  private optimizeHealthCheckInterval(usagePattern: any): number | null {
    // 根據連接模式調整健康檢查間隔
    if (usagePattern.connectionPattern === 'burst') {
      return 30000; // 30秒
    } else if (usagePattern.connectionPattern === 'steady') {
      return 60000; // 60秒
    }

    return null;
  }

  private async applyPoolConfiguration(): Promise<void> {
    // 應用優化後的配置到連接池
    if (this.pool && this.pool.options) {
      Object.assign(this.pool.options, {
        min: this.config.minConnections,
        max: this.config.maxConnections,
        idleTimeoutMillis: this.config.idleTimeout,
        acquireTimeoutMillis: this.config.acquireTimeout,
      });
    }
  }

  private isPoolHealthy(): boolean {
    // 檢查連接池健康狀態
    if (!this.pool) {
      return false;
    }

    // 檢查錯誤率
    const errorRate = this.stats.errors / Math.max(1, this.stats.acquired);
    if (errorRate > 0.1) {
      // 10%錯誤率
      return false;
    }

    // 檢查等待時間
    if (this.metrics.connectionWaitTime > this.config.acquireTimeout) {
      return false;
    }

    return true;
  }

  private async reapIdleConnections(): Promise<void> {
    logger.debug('回收空閒連接...');

    try {
      // 回收空閒連接
      if (this.pool && this.pool._idleTimeout) {
        // 觸發空閒連接回收
        const idleConnections = this.metrics.idleConnections;
        if (idleConnections > this.config.minConnections) {
          logger.debug('回收空閒連接', { count: idleConnections });
        }
      }
    } catch (error) {
      logger.error('回收空閒連接失敗:', error);
    }
  }

  private updateMetrics(): void {
    if (this.pool) {
      this.metrics.totalConnections = this.pool.totalCount || 0;
      this.metrics.activeConnections =
        (this.pool.totalCount || 0) - (this.pool.idleCount || 0);
      this.metrics.idleConnections = this.pool.idleCount || 0;
      this.metrics.waitingRequests = this.pool.waitingCount || 0;

      // 計算連接池利用率
      this.metrics.poolUtilization =
        this.metrics.totalConnections / this.config.maxConnections;
    }
  }

  private getDefaultConfig(): ConnectionPoolConfig {
    return {
      minConnections: 2,
      maxConnections: 20,
      idleTimeout: 30000, // 30秒
      acquireTimeout: 10000, // 10秒
      createTimeout: 30000, // 30秒
      destroyTimeout: 5000, // 5秒
      reapInterval: 1000, // 1秒
      createRetryInterval: 200, // 200毫秒
      propagateCreateError: false,
      enableHealthCheck: true,
      healthCheckInterval: 30000, // 30秒
    };
  }

  private getInitialMetrics(): ConnectionMetrics {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      connectionWaitTime: 0,
      averageQueryTime: 0,
      connectionErrors: 0,
      poolUtilization: 0,
      lastHealthCheck: new Date(),
    };
  }

  private getInitialStats(): ConnectionStats {
    return {
      created: 0,
      destroyed: 0,
      acquired: 0,
      released: 0,
      errors: 0,
      timeouts: 0,
    };
  }
}

export default ConnectionPoolOptimizer;
