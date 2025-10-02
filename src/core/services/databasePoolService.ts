import { logger } from '@/utils/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  acquireTimeout: number;
  maxIdleTime: number;
}

export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  maxConnections: number;
  connectionUtilization: number; // 百分比
}

export interface QueryMetrics {
  queryId: string;
  sql: string;
  executionTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  connectionId?: string;
}

export interface PoolHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  stats: ConnectionStats;
  recentErrors: number;
  averageResponseTime: number;
  recommendations: string[];
}

export class DatabasePoolService {
  private static instance: DatabasePoolService;
  private isInitialized = false;
  private config: DatabaseConfig | null = null;
  private pool: unknown = null; // 實際的Connect池Instance
  private queryMetrics: QueryMetrics[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly maxMetricsHistory = 1000;

  public static getInstance(): DatabasePoolService {
    if (!DatabasePoolService.instance) {
      DatabasePoolService.instance = new DatabasePoolService();
    }
    return DatabasePoolService.instance;
  }

  public async initialize(config: DatabaseConfig): Promise<void> {
    if (this.isInitialized) {
      logger.warn('DatabasePoolService already initialized');
      return;
    }

    try {
      this.config = config;

      // 這裡應該Initialize實際的DatabaseConnect池
      // 目前使用模擬實現
      await this.createPool();

      // Begin健康Check
      this.startHealthMonitoring();

      logger.info('DatabasePoolService initialized successfully', {
        host: config.host,
        database: config.database,
        maxConnections: config.maxConnections,
      });

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize DatabasePoolService', error);
      throw error;
    }
  }

  /**
   * GetDatabaseConnect
   */
  public async getConnection(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('DatabasePoolService not initialized');
    }

    try {
      // 模擬GetConnect
      const _connection = await this.acquireConnection();
      logger.debug('Database connection acquired', {
        connectionId: connection.id,
      });
      return connection;
    } catch (error) {
      logger.error('Failed to acquire database connection', error);
      throw error;
    }
  }

  /**
   * 釋放DatabaseConnect
   */
  public async releaseConnection(connection: unknown): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DatabasePoolService not initialized');
    }

    try {
      await this.releaseConnectionToPool(connection);
      logger.debug('Database connection released', {
        connectionId: connection.id,
      });
    } catch (error) {
      logger.error('Failed to release database connection', error);
      throw error;
    }
  }

  /**
   * 執RowQuery
   */
  public async executeQuery(sql: string, params: unknown[] = []): Promise<any> {
    const _queryId = this.generateQueryId();
    const _startTime = Date.now();

    try {
      logger.debug('Executing database query', { queryId, sql });

      // 模擬Query執Row
      const _result = await this.executeQueryInternal(sql, params);

      const _executionTime = Date.now() - startTime;
      this.recordQueryMetrics({
        queryId,
        sql,
        executionTime,
        timestamp: new Date(),
        success: true,
      });

      logger.debug('Database query executed successfully', {
        queryId,
        executionTime,
        rowCount: result?.length || 0,
      });

      return result;
    } catch (error) {
      const _executionTime = Date.now() - startTime;
      this.recordQueryMetrics({
        queryId,
        sql,
        executionTime,
        timestamp: new Date(),
        success: false,
        error: (error as Error).message,
      });

      logger.error('Database query failed', {
        queryId,
        sql,
        executionTime,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * GetConnect池StatisticsInformation
   */
  public getConnectionStats(): ConnectionStats {
    if (!this.isInitialized) {
      throw new Error('DatabasePoolService not initialized');
    }

    // 模擬統Count據
    const _totalConnections = this.config?.maxConnections || 10;
    const _activeConnections = Math.floor(Math.random() * totalConnections);
    const _idleConnections = totalConnections - activeConnections;
    const _waitingConnections = Math.floor(Math.random() * 5);

    return {
      totalConnections,
      activeConnections,
      idleConnections,
      waitingConnections,
      maxConnections: totalConnections,
      connectionUtilization: (activeConnections / totalConnections) * 100,
    };
  }

  /**
   * GetQuery性能指標
   */
  public getQueryMetrics(limit = 100): QueryMetrics[] {
    return this.queryMetrics
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * GetConnect池健康Status
   */
  public getPoolHealth(): PoolHealth {
    if (!this.isInitialized) {
      return {
        status: 'UNHEALTHY',
        stats: {
          totalConnections: 0,
          activeConnections: 0,
          idleConnections: 0,
          waitingConnections: 0,
          maxConnections: 0,
          connectionUtilization: 0,
        },
        recentErrors: 0,
        averageResponseTime: 0,
        recommendations: ['Database pool not initialized'],
      };
    }

    const _stats = this.getConnectionStats();
    const _recentMetrics = this.queryMetrics.slice(-100);
    const _recentErrors = recentMetrics.filter(m => !m.success).length;
    const _averageResponseTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
          recentMetrics.length
        : 0;

    const _recommendations = this.generateRecommendations(
      stats,
      recentErrors,
      averageResponseTime
    );

    let status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
    if (recentErrors > 10 || stats.connectionUtilization > 90) {
      status = 'UNHEALTHY';
    } else if (recentErrors > 5 || stats.connectionUtilization > 75) {
      status = 'DEGRADED';
    }

    return {
      status,
      stats,
      recentErrors,
      averageResponseTime,
      recommendations,
    };
  }

  /**
   * 優化Connect池Configure
   */
  public async optimizePool(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DatabasePoolService not initialized');
    }

    try {
      const _health = this.getPoolHealth();
      const { recommendations } = health;

      logger.info('Optimizing database pool configuration', {
        recommendations,
      });

      // Root據健康Status調整Configure
      if (health.status === 'UNHEALTHY') {
        await this.adjustPoolSize();
        await this.cleanupIdleConnections();
      }

      logger.info('Database pool optimization completed');
    } catch (error) {
      logger.error('Failed to optimize database pool', error);
      throw error;
    }
  }

  /**
   * 清理Connect池
   */
  public async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.pool) {
      // 清理Connect池
      await this.closePool();
      this.pool = null;
    }

    this.isInitialized = false;
    logger.info('DatabasePoolService cleaned up');
  }

  /**
   * GetServiceStatus
   */
  public getStatus(): unknown {
    return {
      isInitialized: this.isInitialized,
      config: this.config
        ? {
            host: this.config.host,
            database: this.config.database,
            maxConnections: this.config.maxConnections,
          }
        : null,
      health: this.getPoolHealth(),
      metricsCount: this.queryMetrics.length,
    };
  }

  // PrivateMethod

  private async createPool(): Promise<void> {
    // 模擬CreateConnect池
    this.pool = {
      id: `pool-${Date.now()}`,
      connections: [],
    };

    // 預Create最小Connect數
    for (let i = 0; i < (this.config?.minConnections || 2); i++) {
      this.pool.connections.push({
        id: `conn-${i}`,
        status: 'idle',
        createdAt: new Date(),
      });
    }
  }

  private async acquireConnection(): Promise<any> {
    // 模擬GetConnect
    const _connection = this.pool.connections.find(
      (c: unknown) => c.status === 'idle'
    );
    if (connection) {
      connection.status = 'active';
      connection.lastUsed = new Date();
      return connection;
    }

    // 如果沒有Empty閒Connect，Create新Connect
    if (this.pool.connections.length < (this.config?.maxConnections || 10)) {
      const _newConnection = {
        id: `conn-${this.pool.connections.length}`,
        status: 'active',
        createdAt: new Date(),
        lastUsed: new Date(),
      };
      this.pool.connections.push(newConnection);
      return newConnection;
    }

    throw new Error('No available connections in pool');
  }

  private async releaseConnectionToPool(connection: unknown): Promise<void> {
    // 模擬釋放Connect
    const _poolConnection = this.pool.connections.find(
      (c: unknown) => c.id === connection.id
    );
    if (poolConnection) {
      poolConnection.status = 'idle';
      poolConnection.lastUsed = new Date();
    }
  }

  private async executeQueryInternal(
    sql: string,
    params: unknown[]
  ): Promise<any> {
    // 模擬Query執Row
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 10));

    // 模擬Query結果
    if (sql.toLowerCase().includes('select')) {
      return [
        { id: 1, name: 'Test Data 1' },
        { id: 2, name: 'Test Data 2' },
      ];
    }

    return { affectedRows: 1 };
  }

  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // Limit歷史Record數量
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }
  }

  private generateQueryId(): string {
    return `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendations(
    stats: ConnectionStats,
    recentErrors: number,
    averageResponseTime: number
  ): string[] {
    const recommendations: string[] = [];

    if (stats.connectionUtilization > 90) {
      recommendations.push('考慮增加最大Connect數');
    }

    if (stats.connectionUtilization < 20) {
      recommendations.push('考慮減少最小Connect數以節省資源');
    }

    if (recentErrors > 10) {
      recommendations.push('Check數據庫Connect穩定性');
    }

    if (averageResponseTime > 1000) {
      recommendations.push('優化慢查詢或增加Connect數');
    }

    if (stats.waitingConnections > 0) {
      recommendations.push('有Connect等待，考慮增加Connect池大小');
    }

    if (recommendations.length === 0) {
      recommendations.push('Connect池運行正常');
    }

    return recommendations;
  }

  private async adjustPoolSize(): Promise<void> {
    // Root據使用情況調整Connect池大小
    const _stats = this.getConnectionStats();

    if (stats.connectionUtilization > 90) {
      // 增加Connect數
      const _newMaxConnections = Math.min(
        (this.config?.maxConnections || 10) + 5,
        50
      );

      if (this.config) {
        this.config.maxConnections = newMaxConnections;
      }

      logger.info('Increased pool size', { newMaxConnections });
    }
  }

  private async cleanupIdleConnections(): Promise<void> {
    // 清理長TimeEmpty閒的Connect
    const _now = new Date();
    const _maxIdleTime = this.config?.maxIdleTime || 300000; // 5Minute

    this.pool.connections = this.pool.connections.filter((conn: unknown) => {
      if (conn.status === 'idle' && conn.lastUsed) {
        const _idleTime = now.getTime() - conn.lastUsed.getTime();
        return idleTime < maxIdleTime;
      }
      return true;
    });

    logger.info('Cleaned up idle connections');
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const _health = this.getPoolHealth();

        if (health.status === 'UNHEALTHY') {
          logger.warn('Database pool health check failed', health);
          await this.optimizePool();
        } else if (health.status === 'DEGRADED') {
          logger.info('Database pool health check warning', health);
        }
      } catch (error) {
        logger.error('Health monitoring error', error);
      }
    }, 30000); // 每30SecondCheck一次
  }

  private async closePool(): Promise<void> {
    // Off閉所有Connect
    this.pool.connections = [];
    logger.info('Database pool closed');
  }
}

// Export單例Instance
export const _databasePoolService = DatabasePoolService.getInstance();

export default databasePoolService;
