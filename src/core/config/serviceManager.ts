import { geminiService } from '../../shared/services/ai/geminiService';
import { openaiService } from '../../shared/services/ai/openaiService';
import { cloudinaryService } from '../../shared/services/storage/cloudinaryService';
import { logger } from '../utils/logger';

import { serviceInitializationOptimizer } from './serviceInitializationOptimizer';
import { serviceConfig } from './services';

/**
 * 服務狀態接口
 */
interface ServiceStatus {
  name: string;
  isAvailable: boolean;
  isInitialized: boolean;
  lastChecked: Date;
  error?: string;
}

/**
 * 服務初始化結果接口
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
 * 第三方服務管理器
 * 統一管理所有第三方服務的初始化、狀態監控和配置
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
   * 註冊所有服務
   */
  private registerServices(): void {
    // AI 服務
    this.services.set('openai', openaiService);
    this.services.set('gemini', geminiService);

    // 存儲服務
    this.services.set('cloudinary', cloudinaryService);

    // 使用優化器註冊服務
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

    // 初始化服務狀態
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
   * 初始化所有服務
   */
  async initializeAll(): Promise<InitializationResult> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * 執行服務初始化
   */
  private async performInitialization(): Promise<InitializationResult> {
    logger.info('開始初始化第三方服務');

    // 首先初始化服務配置
    try {
      await serviceConfig.initialize();
      logger.info('服務配置初始化成功');
    } catch (error) {
      logger.error('服務配置初始化失敗:', { error });
      // 即使配置初始化失敗，我們也繼續嘗試初始化各個服務
    }

    // 使用優化器進行服務初始化
    const _initResult =
      await serviceInitializationOptimizer.initializeServicesInParallel(3);

    // 更新服務狀態
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

    logger.info('第三方服務初始化完成:', {
      total: this.services.size,
      initialized: initResult.initialized.length,
      failed: initResult.failed.length,
    });

    return result;
  }

  /**
   * 初始化特定服務
   */
  async initializeService(serviceName: string): Promise<boolean> {
    const _service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`服務 ${serviceName} 不存在`);
    }

    try {
      logger.info(`正在初始化服務: ${serviceName}`);

      // 檢查服務是否可用
      if (!serviceConfig.isServiceAvailable(serviceName)) {
        throw new Error(`服務 ${serviceName} 配置不可用`);
      }

      // 初始化服務
      if (typeof service.initialize === 'function') {
        await service.initialize();
      }

      // 更新服務狀態
      this.updateServiceStatus(serviceName, {
        isAvailable: true,
        isInitialized: true,
        lastChecked: new Date(),
      });

      logger.info(`服務 ${serviceName} 初始化成功`);
      return true;
    } catch (error) {
      const _errorMessage = error instanceof Error ? error.message : '未知錯誤';

      // 更新服務狀態
      this.updateServiceStatus(serviceName, {
        isAvailable: false,
        isInitialized: false,
        lastChecked: new Date(),
        error: errorMessage,
      });

      logger.error(`服務 ${serviceName} 初始化失敗:`, { error: errorMessage });
      return false;
    }
  }

  /**
   * 獲取服務實例
   */
  getService<T>(serviceName: string): T | null {
    const _service = this.services.get(serviceName);
    return service || null;
  }

  /**
   * 檢查服務是否可用
   */
  isServiceAvailable(serviceName: string): boolean {
    const _status = this.serviceStatus.get(serviceName);
    return status ? status.isAvailable && status.isInitialized : false;
  }

  /**
   * 獲取服務狀態
   */
  getServiceStatus(serviceName: string): ServiceStatus | null {
    return this.serviceStatus.get(serviceName) || null;
  }

  /**
   * 獲取所有服務狀態
   */
  getAllServiceStatus(): ServiceStatus[] {
    return Array.from(this.serviceStatus.values());
  }

  /**
   * 更新服務狀態
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
   * 健康檢查所有服務
   */
  async performHealthCheck(): Promise<Map<string, boolean>> {
    logger.info('開始執行服務健康檢查');

    const _healthResults = new Map<string, boolean>();

    const _healthCheckPromises = Array.from(this.services.entries()).map(
      async ([name, service]) => {
        try {
          let isHealthy = false;

          // 如果服務有 getServiceStatus 方法，使用它
          if (typeof service.getServiceStatus === 'function') {
            const _status = await service.getServiceStatus();
            isHealthy = status.isAvailable;
          } else {
            // 否則只檢查服務是否已初始化
            const _status = this.serviceStatus.get(name);
            isHealthy = status ? status.isInitialized : false;
          }

          healthResults.set(name, isHealthy);

          // 更新服務狀態
          this.updateServiceStatus(name, {
            isAvailable: isHealthy,
            lastChecked: new Date(),
            error: isHealthy ? undefined : '健康檢查失敗',
          });

          logger.info(`服務 ${name} 健康檢查:`, { isHealthy });
        } catch (error) {
          const _errorMessage =
            error instanceof Error ? error.message : '未知錯誤';

          healthResults.set(name, false);

          this.updateServiceStatus(name, {
            isAvailable: false,
            lastChecked: new Date(),
            error: errorMessage,
          });

          logger.error(`服務 ${name} 健康檢查失敗:`, { error: errorMessage });
        }
      }
    );

    await Promise.allSettled(healthCheckPromises);

    logger.info('服務健康檢查完成:', {
      total: healthResults.size,
      healthy: Array.from(healthResults.values()).filter(Boolean).length,
    });

    return healthResults;
  }

  /**
   * 重新初始化失敗的服務
   */
  async reinitializeFailedServices(): Promise<string[]> {
    const _failedServices = Array.from(this.serviceStatus.entries())
      .filter(([, status]) => !status.isInitialized)
      .map(([name]) => name);

    if (failedServices.length === 0) {
      logger.info('沒有需要重新初始化的服務');
      return [];
    }

    logger.info('開始重新初始化失敗的服務:', { services: failedServices });

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
   * 獲取服務統計信息
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
   * 生成服務報告
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
        `有 ${summary.failed} 個服務初始化失敗，建議檢查配置`
      );
    }

    if (summary.available < summary.total) {
      recommendations.push(
        `有 ${summary.total - summary.available} 個服務不可用，可能影響功能`
      );
    }

    if (summary.initialized === summary.total) {
      recommendations.push('所有服務已成功初始化');
    }

    return {
      summary,
      services,
      recommendations,
    };
  }

  /**
   * 檢查是否已初始化
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }
}

// 導出單例實例
export const _serviceManager = ServiceManager.getInstance();

// 導出類型
export type { InitializationResult, ServiceStatus };
