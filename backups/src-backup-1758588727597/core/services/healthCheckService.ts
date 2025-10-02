import { logger } from '@/utils/logger';

export interface HealthStatus {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  timestamp: Date;
  responseTime: number; // 毫秒
  error?: string;
  details?: Record<string, any>;
}

export interface ServiceHealthCheck {
  name: string;
  check: () => Promise<HealthStatus>;
  timeout?: number; // 毫秒
  retries?: number;
  critical?: boolean; // 是否為關鍵服務
}

export interface HealthReport {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: Date;
  services: HealthStatus[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
  criticalServices: HealthStatus[];
  recommendations: string[];
}

export class HealthCheckService {
  private static instance: HealthCheckService;
  private isInitialized = false;
  private readonly healthChecks: Map<string, ServiceHealthCheck> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastHealthReport: HealthReport | null = null;

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 註冊默認的健康檢查
      await this.registerDefaultHealthChecks();

      logger.info('HealthCheckService initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize HealthCheckService', error);
      throw error;
    }
  }

  /**
   * 註冊健康檢查
   */
  public registerHealthCheck(healthCheck: ServiceHealthCheck): void {
    this.healthChecks.set(healthCheck.name, healthCheck);
    logger.info(`Health check registered: ${healthCheck.name}`);
  }

  /**
   * 移除健康檢查
   */
  public unregisterHealthCheck(name: string): boolean {
    const removed = this.healthChecks.delete(name);
    if (removed) {
      logger.info(`Health check unregistered: ${name}`);
    }
    return removed;
  }

  /**
   * 執行單個服務的健康檢查
   */
  public async checkServiceHealth(name: string): Promise<HealthStatus> {
    const healthCheck = this.healthChecks.get(name);
    if (!healthCheck) {
      return {
        service: name,
        status: 'UNKNOWN',
        timestamp: new Date(),
        responseTime: 0,
        error: 'Health check not found',
      };
    }

    const startTime = Date.now();
    const timeout = healthCheck.timeout || 5000; // 默認5秒超時
    const retries = healthCheck.retries || 1;

    try {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await Promise.race([
            healthCheck.check(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeout)
            ),
          ]);

          const responseTime = Date.now() - startTime;
          return {
            ...result,
            responseTime,
            timestamp: new Date(),
          };
        } catch (error) {
          lastError = error as Error;
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 重試前等待1秒
          }
        }
      }

      const responseTime = Date.now() - startTime;
      return {
        service: name,
        status: 'UNHEALTHY',
        timestamp: new Date(),
        responseTime,
        error: lastError?.message || 'Unknown error',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: name,
        status: 'UNHEALTHY',
        timestamp: new Date(),
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 執行所有服務的健康檢查
   */
  public async checkAllServices(): Promise<HealthReport> {
    const startTime = Date.now();
    const serviceChecks = Array.from(this.healthChecks.keys());
    const results: HealthStatus[] = [];

    // 並發執行所有健康檢查
    const healthCheckPromises = serviceChecks.map(name =>
      this.checkServiceHealth(name)
    );
    const healthResults = await Promise.allSettled(healthCheckPromises);

    // 處理結果
    healthResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          service: serviceChecks[index],
          status: 'UNHEALTHY',
          timestamp: new Date(),
          responseTime: 0,
          error: result.reason?.message || 'Check failed',
        });
      }
    });

    // 生成健康報告
    const report = this.generateHealthReport(results);
    this.lastHealthReport = report;

    const totalTime = Date.now() - startTime;
    logger.info(`Health check completed in ${totalTime}ms`, {
      overallStatus: report.overallStatus,
      totalServices: report.summary.total,
      healthyServices: report.summary.healthy,
    });

    return report;
  }

  /**
   * 開始定期健康檢查
   */
  public async startMonitoring(intervalMs = 60000): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAllServices();
      } catch (error) {
        logger.error('Periodic health check failed', error);
      }
    }, intervalMs);

    logger.info(`Health monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * 停止定期健康檢查
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * 獲取最後的健康報告
   */
  public getLastHealthReport(): HealthReport | null {
    return this.lastHealthReport;
  }

  /**
   * 獲取監控狀態
   */
  public getMonitoringStatus(): unknown {
    return {
      isInitialized: this.isInitialized,
      isMonitoring: this.monitoringInterval !== null,
      registeredChecks: Array.from(this.healthChecks.keys()),
      lastReport: this.lastHealthReport
        ? {
            timestamp: this.lastHealthReport.timestamp,
            overallStatus: this.lastHealthReport.overallStatus,
            summary: this.lastHealthReport.summary,
          }
        : null,
    };
  }

  /**
   * 生成健康報告
   */
  private generateHealthReport(services: HealthStatus[]): HealthReport {
    const summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'HEALTHY').length,
      degraded: services.filter(s => s.status === 'DEGRADED').length,
      unhealthy: services.filter(s => s.status === 'UNHEALTHY').length,
      unknown: services.filter(s => s.status === 'UNKNOWN').length,
    };

    // 確定整體狀態
    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';

    if (summary.unhealthy > 0) {
      overallStatus = 'UNHEALTHY';
    } else if (summary.degraded > 0 || summary.unknown > 0) {
      overallStatus = 'DEGRADED';
    }

    // 識別關鍵服務
    const criticalServices = services.filter(service => {
      const healthCheck = this.healthChecks.get(service.service);
      return healthCheck?.critical && service.status !== 'HEALTHY';
    });

    // 生成建議
    const recommendations = this.generateRecommendations(services, summary);

    return {
      overallStatus,
      timestamp: new Date(),
      services,
      summary,
      criticalServices,
      recommendations,
    };
  }

  /**
   * 生成建議
   */
  private generateRecommendations(
    services: HealthStatus[],
    summary: unknown
  ): string[] {
    const recommendations: string[] = [];

    if (summary.unhealthy > 0) {
      const unhealthyServices = services.filter(s => s.status === 'UNHEALTHY');
      recommendations.push(
        `立即檢查 ${unhealthyServices.length} 個不健康的服務`
      );

      unhealthyServices.forEach(service => {
        if (service.error) {
          recommendations.push(`服務 ${service.service}: ${service.error}`);
        }
      });
    }

    if (summary.degraded > 0) {
      recommendations.push(`監控 ${summary.degraded} 個性能下降的服務`);
    }

    if (summary.unknown > 0) {
      recommendations.push(`調查 ${summary.unknown} 個狀態未知的服務`);
    }

    // 檢查響應時間
    const slowServices = services.filter(s => s.responseTime > 2000);
    if (slowServices.length > 0) {
      recommendations.push(
        `優化 ${slowServices.length} 個響應時間超過2秒的服務`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('所有服務運行正常');
    }

    return recommendations;
  }

  /**
   * 註冊默認的健康檢查
   */
  private async registerDefaultHealthChecks(): Promise<void> {
    // 數據庫健康檢查
    this.registerHealthCheck({
      name: 'Database',
      critical: true,
      timeout: 3000,
      retries: 2,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的數據庫連接檢查
          await new Promise(resolve => setTimeout(resolve, 100)); // 模擬檢查

          return {
            service: 'Database',
            status: 'HEALTHY',
            timestamp: new Date(),
            responseTime: 100,
            details: {
              connections: 10,
              activeQueries: 5,
            },
          };
        } catch (error) {
          throw new Error(`Database check failed: ${(error as Error).message}`);
        }
      },
    });

    // API 服務健康檢查
    this.registerHealthCheck({
      name: 'API Service',
      critical: true,
      timeout: 5000,
      retries: 1,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的API端點檢查
          await new Promise(resolve => setTimeout(resolve, 200)); // 模擬檢查

          return {
            service: 'API Service',
            status: 'HEALTHY',
            timestamp: new Date(),
            responseTime: 200,
            details: {
              endpoints: 15,
              activeRequests: 25,
            },
          };
        } catch (error) {
          throw new Error(
            `API service check failed: ${(error as Error).message}`
          );
        }
      },
    });

    // 認證服務健康檢查
    this.registerHealthCheck({
      name: 'Authentication Service',
      critical: true,
      timeout: 3000,
      retries: 2,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的認證服務檢查
          await new Promise(resolve => setTimeout(resolve, 150)); // 模擬檢查

          return {
            service: 'Authentication Service',
            status: 'HEALTHY',
            timestamp: new Date(),
            responseTime: 150,
            details: {
              activeSessions: 100,
              authMethods: ['JWT', 'OAuth', 'Biometric'],
            },
          };
        } catch (error) {
          throw new Error(
            `Authentication service check failed: ${(error as Error).message}`
          );
        }
      },
    });

    // 存儲服務健康檢查
    this.registerHealthCheck({
      name: 'Storage Service',
      critical: false,
      timeout: 4000,
      retries: 1,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的存儲服務檢查
          await new Promise(resolve => setTimeout(resolve, 300)); // 模擬檢查

          return {
            service: 'Storage Service',
            status: 'HEALTHY',
            timestamp: new Date(),
            responseTime: 300,
            details: {
              usedSpace: '75%',
              availableSpace: '25%',
              totalFiles: 10000,
            },
          };
        } catch (error) {
          throw new Error(
            `Storage service check failed: ${(error as Error).message}`
          );
        }
      },
    });

    // 外部API健康檢查
    this.registerHealthCheck({
      name: 'External APIs',
      critical: false,
      timeout: 10000,
      retries: 1,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的外部API檢查
          await new Promise(resolve => setTimeout(resolve, 500)); // 模擬檢查

          return {
            service: 'External APIs',
            status: 'HEALTHY',
            timestamp: new Date(),
            responseTime: 500,
            details: {
              apis: ['Payment Gateway', 'Email Service', 'SMS Service'],
              successRate: '99.5%',
            },
          };
        } catch (error) {
          throw new Error(
            `External APIs check failed: ${(error as Error).message}`
          );
        }
      },
    });

    // 緩存服務健康檢查
    this.registerHealthCheck({
      name: 'Cache Service',
      critical: false,
      timeout: 2000,
      retries: 2,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的緩存服務檢查
          await new Promise(resolve => setTimeout(resolve, 50)); // 模擬檢查

          return {
            service: 'Cache Service',
            status: 'HEALTHY',
            timestamp: new Date(),
            responseTime: 50,
            details: {
              hitRate: '85%',
              memoryUsage: '60%',
              activeKeys: 5000,
            },
          };
        } catch (error) {
          throw new Error(
            `Cache service check failed: ${(error as Error).message}`
          );
        }
      },
    });
  }
}

// 導出單例實例
export const healthCheckService = HealthCheckService.getInstance();

export default healthCheckService;
