import { logger } from '@/utils/logger';

export interface HealthStatus {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  timestamp: Date;
  responseTime: number; // 毫Second
  error?: string;
  details?: Record<string, any>;
}

export interface ServiceHealthCheck {
  name: string;
  check: () => Promise<HealthStatus>;
  timeout?: number; // 毫Second
  retries?: number;
  critical?: boolean; // YesNo為OffKeyService
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
      // RegisterDefault的健康Check
      await this.registerDefaultHealthChecks();

      logger.info('HealthCheckService initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize HealthCheckService', error);
      throw error;
    }
  }

  /**
   * Register健康Check
   */
  public registerHealthCheck(healthCheck: ServiceHealthCheck): void {
    this.healthChecks.set(healthCheck.name, healthCheck);
    logger.info(`Health check registered: ${healthCheck.name}`);
  }

  /**
   * Remove健康Check
   */
  public unregisterHealthCheck(name: string): boolean {
    const _removed = this.healthChecks.delete(name);
    if (removed) {
      logger.info(`Health check unregistered: ${name}`);
    }
    return removed;
  }

  /**
   * 執RowSingleService的健康Check
   */
  public async checkServiceHealth(name: string): Promise<HealthStatus> {
    const _healthCheck = this.healthChecks.get(name);
    if (!healthCheck) {
      return {
        service: name,
        status: 'UNKNOWN',
        timestamp: new Date(),
        responseTime: 0,
        error: 'Health check not found',
      };
    }

    const _startTime = Date.now();
    const _timeout = healthCheck.timeout || 5000; // Default5Second超時
    const _retries = healthCheck.retries || 1;

    try {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const _result = await Promise.race([
            healthCheck.check(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeout)
            ),
          ]);

          const _responseTime = Date.now() - startTime;
          return {
            ...result,
            responseTime,
            timestamp: new Date(),
          };
        } catch (error) {
          lastError = error as Error;
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Retry前Await1Second
          }
        }
      }

      const _responseTime = Date.now() - startTime;
      return {
        service: name,
        status: 'UNHEALTHY',
        timestamp: new Date(),
        responseTime,
        error: lastError?.message || 'Unknown error',
      };
    } catch (error) {
      const _responseTime = Date.now() - startTime;
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
   * 執Row所有Service的健康Check
   */
  public async checkAllServices(): Promise<HealthReport> {
    const _startTime = Date.now();
    const _serviceChecks = Array.from(this.healthChecks.keys());
    const results: HealthStatus[] = [];

    // Concurrent執Row所有健康Check
    const _healthCheckPromises = serviceChecks.map(name =>
      this.checkServiceHealth(name)
    );
    const _healthResults = await Promise.allSettled(healthCheckPromises);

    // Handle結果
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

    // 生成健康Report
    const _report = this.generateHealthReport(results);
    this.lastHealthReport = report;

    const _totalTime = Date.now() - startTime;
    logger.info(`Health check completed in ${totalTime}ms`, {
      overallStatus: report.overallStatus,
      totalServices: report.summary.total,
      healthyServices: report.summary.healthy,
    });

    return report;
  }

  /**
   * Begin定期健康Check
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
   * Stop定期健康Check
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * Get最後的健康Report
   */
  public getLastHealthReport(): HealthReport | null {
    return this.lastHealthReport;
  }

  /**
   * GetMonitorStatus
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
   * 生成健康Report
   */
  private generateHealthReport(services: HealthStatus[]): HealthReport {
    const _summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'HEALTHY').length,
      degraded: services.filter(s => s.status === 'DEGRADED').length,
      unhealthy: services.filter(s => s.status === 'UNHEALTHY').length,
      unknown: services.filter(s => s.status === 'UNKNOWN').length,
    };

    // OK整體Status
    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';

    if (summary.unhealthy > 0) {
      overallStatus = 'UNHEALTHY';
    } else if (summary.degraded > 0 || summary.unknown > 0) {
      overallStatus = 'DEGRADED';
    }

    // 識別OffKeyService
    const _criticalServices = services.filter(service => {
      const _healthCheck = this.healthChecks.get(service.service);
      return healthCheck?.critical && service.status !== 'HEALTHY';
    });

    // 生成建議
    const _recommendations = this.generateRecommendations(services, summary);

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
      const _unhealthyServices = services.filter(s => s.status === 'UNHEALTHY');
      recommendations.push(
        `立即Check ${unhealthyServices.length} 個不健康的Service`
      );

      unhealthyServices.forEach(service => {
        if (service.error) {
          recommendations.push(`Service ${service.service}: ${service.error}`);
        }
      });
    }

    if (summary.degraded > 0) {
      recommendations.push(`監控 ${summary.degraded} 個性能下降的Service`);
    }

    if (summary.unknown > 0) {
      recommendations.push(`調查 ${summary.unknown} 個狀態未知的Service`);
    }

    // CheckResponseTime
    const _slowServices = services.filter(s => s.responseTime > 2000);
    if (slowServices.length > 0) {
      recommendations.push(
        `優化 ${slowServices.length} 個響應時間超過2秒的Service`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('所有Service運行正常');
    }

    return recommendations;
  }

  /**
   * RegisterDefault的健康Check
   */
  private async registerDefaultHealthChecks(): Promise<void> {
    // Database健康Check
    this.registerHealthCheck({
      name: 'Database',
      critical: true,
      timeout: 3000,
      retries: 2,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的DatabaseConnectCheck
          await new Promise(resolve => setTimeout(resolve, 100)); // 模擬Check

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

    // API Service健康Check
    this.registerHealthCheck({
      name: 'API Service',
      critical: true,
      timeout: 5000,
      retries: 1,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的API端點Check
          await new Promise(resolve => setTimeout(resolve, 200)); // 模擬Check

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

    // AuthenticateService健康Check
    this.registerHealthCheck({
      name: 'Authentication Service',
      critical: true,
      timeout: 3000,
      retries: 2,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的AuthenticateServiceCheck
          await new Promise(resolve => setTimeout(resolve, 150)); // 模擬Check

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

    // StorageService健康Check
    this.registerHealthCheck({
      name: 'Storage Service',
      critical: false,
      timeout: 4000,
      retries: 1,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的StorageServiceCheck
          await new Promise(resolve => setTimeout(resolve, 300)); // 模擬Check

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

    // ExternalAPI健康Check
    this.registerHealthCheck({
      name: 'External APIs',
      critical: false,
      timeout: 10000,
      retries: 1,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的ExternalAPICheck
          await new Promise(resolve => setTimeout(resolve, 500)); // 模擬Check

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

    // CacheService健康Check
    this.registerHealthCheck({
      name: 'Cache Service',
      critical: false,
      timeout: 2000,
      retries: 2,
      check: async (): Promise<HealthStatus> => {
        try {
          // 這裡應該實現實際的CacheServiceCheck
          await new Promise(resolve => setTimeout(resolve, 50)); // 模擬Check

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

// Export單例Instance
export const _healthCheckService = HealthCheckService.getInstance();

export default healthCheckService;
