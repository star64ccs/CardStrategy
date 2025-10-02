import { geminiService } from '../../shared/services/ai/geminiService';
import { openaiService } from '../../shared/services/ai/openaiService';
import { cloudinaryService } from '../../shared/services/storage/cloudinaryService';
import { logger } from '../utils/logger';

import { serviceInitializationOptimizer } from './serviceInitializationOptimizer';
import { serviceConfig } from './services';

/**
 * ServiceStatusInterface
 */
interface ServiceStatus {
  name: string;
  isAvailable: boolean;
  isInitialized: boolean;
  lastChecked: Date;
  error?: string;
}

/**
 * ServiceInitialize結果Interface
 */
interface InitializationResult {
  success: boolean;
  initialized: string[];
  failed: {
    service: string;
    error: string;
  }[];
}

/**
 * 第三方ServiceManage器
 * 統一Manage所有第三方Service的Initialize、StatusMonitor和Configure
 */
export class ServiceManager {
  private static instance: ServiceManager;
  private readonly services: Map<string, any> = new Map();
  private readonly serviceStatus: Map<string, ServiceStatus> = new Map();
  private _isInitialized = false;
  private initializationPromise: Promise<InitializationResult> | null = null;

  private constructor() {
    this.registerServices();
  }

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * Register所有Service
   */
  private registerServices(): void {
    // AI Service
    this.services.set('openai', openaiService);
    this.services.set('gemini', geminiService);

    // StorageService
    this.services.set('cloudinary', cloudinaryService);

    // 使用優化器RegisterService
    serviceInitializationOptimizer.registerService(
      'openai',
      openaiService,
      [],
      10
    );
    serviceInitializationOptimizer.registerService(
      'gemini',
      geminiService,
      [],
      10
    );
    serviceInitializationOptimizer.registerService(
      'cloudinary',
      cloudinaryService,
      [],
      5
    );

    // InitializeServiceStatus
    for (const [name] of this.services) {
      this.serviceStatus.set(name, {
        name,
        isAvailable: false,
        isInitialized: false,
        lastChecked: new Date(),
      });
    }
  }

  /**
   * Initialize所有Service
   */
  async initializeAll(): Promise<InitializationResult> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * 執RowServiceInitialize
   */
  private async performInitialization(): Promise<InitializationResult> {
    logger.info('開始Initialize第三方Service');

    // 首先InitializeServiceConfigure
    try {
      await serviceConfig.initialize();
      logger.info('ServiceConfigureInitializeSuccess');
    } catch (error) {
      logger.error('ServiceConfigureInitializeFailed:', { error });
      // 即使ConfigureInitializeFailed，我們也Continue嘗試Initialize各個Service
    }

    // 使用優化器進RowServiceInitialize
    const _initResult =
      await serviceInitializationOptimizer.initializeServicesInParallel(3);

    // UpdateServiceStatus
    for (const serviceName of initResult.initialized) {
      this.updateServiceStatus(serviceName, {
        isAvailable: true,
        isInitialized: true,
        lastChecked: new Date(),
      });
    }

    for (const failure of initResult.failed) {
      this.updateServiceStatus(failure.service, {
        isAvailable: false,
        isInitialized: false,
        lastChecked: new Date(),
        error: failure.error,
      });
    }

    this._isInitialized = true;

    const result: InitializationResult = {
      success: initResult.success,
      initialized: initResult.initialized,
      failed: initResult.failed,
    };

    logger.info('第三方ServiceInitialize完成:', {
      total: this.services.size,
      initialized: initResult.initialized.length,
      failed: initResult.failed.length,
    });

    return result;
  }

  /**
   * InitializeSpecificService
   */
  async initializeService(serviceName: string): Promise<boolean> {
    const _service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} 不存在`);
    }

    try {
      logger.info(`正在InitializeService: ${serviceName}`);

      // CheckServiceYesNo可用
      if (!serviceConfig.isServiceAvailable(serviceName)) {
        throw new Error(`Service ${serviceName} Configure不可用`);
      }

      // InitializeService
      if (typeof service.initialize === 'function') {
        await service.initialize();
      }

      // UpdateServiceStatus
      this.updateServiceStatus(serviceName, {
        isAvailable: true,
        isInitialized: true,
        lastChecked: new Date(),
      });

      logger.info(`Service ${serviceName} InitializeSuccess`);
      return true;
    } catch (error) {
      const _errorMessage = error instanceof Error ? error.message : '未知Error';

      // UpdateServiceStatus
      this.updateServiceStatus(serviceName, {
        isAvailable: false,
        isInitialized: false,
        lastChecked: new Date(),
        error: errorMessage,
      });

      logger.error(`Service ${serviceName} InitializeFailed:`, { error: errorMessage });
      return false;
    }
  }

  /**
   * GetServiceInstance
   */
  getService<T>(serviceName: string): T | null {
    const _service = this.services.get(serviceName);
    return service || null;
  }

  /**
   * CheckServiceYesNo可用
   */
  isServiceAvailable(serviceName: string): boolean {
    const _status = this.serviceStatus.get(serviceName);
    return status ? status.isAvailable && status.isInitialized : false;
  }

  /**
   * GetServiceStatus
   */
  getServiceStatus(serviceName: string): ServiceStatus | null {
    return this.serviceStatus.get(serviceName) || null;
  }

  /**
   * Get所有ServiceStatus
   */
  getAllServiceStatus(): ServiceStatus[] {
    return Array.from(this.serviceStatus.values());
  }

  /**
   * UpdateServiceStatus
   */
  private updateServiceStatus(
    serviceName: string,
    updates: Partial<ServiceStatus>
  ): void {
    const _currentStatus = this.serviceStatus.get(serviceName);
    if (currentStatus) {
      this.serviceStatus.set(serviceName, {
        ...currentStatus,
        ...updates,
      });
    }
  }

  /**
   * 健康Check所有Service
   */
  async performHealthCheck(): Promise<Map<string, boolean>> {
    logger.info('開始執行Service健康Check');

    const _healthResults = new Map<string, boolean>();

    const _healthCheckPromises = Array.from(this.services.entries()).map(
      async ([name, service]) => {
        try {
          let isHealthy = false;

          // 如果Service有 getServiceStatus Method，使用它
          if (typeof service.getServiceStatus === 'function') {
            const _status = await service.getServiceStatus();
            isHealthy = status.isAvailable;
          } else {
            // No則只CheckServiceYesNo已Initialize
            const _status = this.serviceStatus.get(name);
            isHealthy = status ? status.isInitialized : false;
          }

          healthResults.set(name, isHealthy);

          // UpdateServiceStatus
          this.updateServiceStatus(name, {
            isAvailable: isHealthy,
            lastChecked: new Date(),
            error: isHealthy ? undefined : '健康CheckFailed',
          });

          logger.info(`Service ${name} 健康Check:`, { isHealthy });
        } catch (error) {
          const _errorMessage =
            error instanceof Error ? error.message : '未知Error';

          healthResults.set(name, false);

          this.updateServiceStatus(name, {
            isAvailable: false,
            lastChecked: new Date(),
            error: errorMessage,
          });

          logger.error(`Service ${name} 健康CheckFailed:`, { error: errorMessage });
        }
      }
    );

    await Promise.allSettled(healthCheckPromises);

    logger.info('Service健康Check完成:', {
      total: healthResults.size,
      healthy: Array.from(healthResults.values()).filter(Boolean).length,
    });

    return healthResults;
  }

  /**
   * ReInitializeFailed的Service
   */
  async reinitializeFailedServices(): Promise<string[]> {
    const _failedServices = Array.from(this.serviceStatus.entries())
      .filter(([, status]) => !status.isInitialized)
      .map(([name]) => name);

    if (failedServices.length === 0) {
      logger.info('沒有需要重新Initialize的Service');
      return [];
    }

    logger.info('開始重新InitializeFailed的Service:', { services: failedServices });

    const reinitialized: string[] = [];

    for (const serviceName of failedServices) {
      const _success = await this.initializeService(serviceName);
      if (success) {
        reinitialized.push(serviceName);
      }
    }

    logger.info('重新初始化完成:', {
      attempted: failedServices.length,
      successful: reinitialized.length,
    });

    return reinitialized;
  }

  /**
   * GetServiceStatisticsInformation
   */
  getServiceStatistics(): {
    total: number;
    initialized: number;
    available: number;
    failed: number;
  } {
    const _statuses = Array.from(this.serviceStatus.values());

    return {
      total: statuses.length,
      initialized: statuses.filter(s => s.isInitialized).length,
      available: statuses.filter(s => s.isAvailable).length,
      failed: statuses.filter(s => s.error).length,
    };
  }

  /**
   * 生成ServiceReport
   */
  generateServiceReport(): {
    summary: {
      total: number;
      initialized: number;
      available: number;
      failed: number;
    };
    services: ServiceStatus[];
    recommendations: string[];
  } {
    const _summary = this.getServiceStatistics();
    const _services = this.getAllServiceStatus();
    const recommendations: string[] = [];

    // 生成建議
    if (summary.failed > 0) {
      recommendations.push(
        `有 ${summary.failed} 個ServiceInitializeFailed，建議CheckConfigure`
      );
    }

    if (summary.available < summary.total) {
      recommendations.push(
        `有 ${summary.total - summary.available} 個Service不可用，可能影響功能`
      );
    }

    if (summary.initialized === summary.total) {
      recommendations.push('所有Service已SuccessInitialize');
    }

    return {
      summary,
      services,
      recommendations,
    };
  }

  /**
   * CheckYesNo已Initialize
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }
}

// Export單例Instance
export const _serviceManager = ServiceManager.getInstance();

// ExportClass型
export type { InitializationResult, ServiceStatus };
