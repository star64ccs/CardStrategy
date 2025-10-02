import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performanceMonitor';

import { serviceManager } from './serviceManager';

/**
 * ApplyInitialize結果Interface
 */
interface AppInitializationResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  services: {
    total: number;
    initialized: number;
    failed: number;
  };
  errors: string[];
  warnings: string[];
}

/**
 * ApplyInitialize器
 * 負責ApplyStart時的所有Initialize工作
 */
export class AppInitializer {
  private static instance: AppInitializer;
  private isInitialized = false;
  private initializationResult: AppInitializationResult | null = null;

  private constructor() {}

  static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  /**
   * InitializeApply
   */
  async initializeApp(): Promise<AppInitializationResult> {
    if (this.isInitialized && this.initializationResult) {
      return this.initializationResult;
    }

    const _startTime = new Date();
    performanceMonitor.startTimer('app_initialization');

    logger.info('開始應用初始化');

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Initialize第三方Service
      logger.info('正在Initialize第三方Service...');
      const _serviceResult = await serviceManager.initializeAll();

      if (!serviceResult.success) {
        warnings.push(
          `部分ServiceInitializeFailed: ${serviceResult.failed.length} 個Service`
        );
        serviceResult.failed.forEach(failure => {
          warnings.push(`Service ${failure.service}: ${failure.error}`);
        });
      }

      // 2. 執Row健康Check
      logger.info('正在執行Service健康Check...');
      const _healthResults = await serviceManager.performHealthCheck();
      const _unhealthyServices = Array.from(healthResults.entries())
        .filter(([, isHealthy]) => !isHealthy)
        .map(([service]) => service);

      if (unhealthyServices.length > 0) {
        warnings.push(`健康CheckFailed的Service: ${unhealthyServices.join(', ')}`);
      }

      // 3. 生成ServiceReport
      const _serviceReport = serviceManager.generateServiceReport();
      logger.info('ServiceInitialize報告:', serviceReport);

      const _endTime = new Date();
      const _duration = performanceMonitor.endTimer('app_initialization');

      this.initializationResult = {
        success: errors.length === 0,
        startTime,
        endTime,
        duration,
        services: {
          total: serviceReport.summary.total,
          initialized: serviceReport.summary.initialized,
          failed: serviceReport.summary.failed,
        },
        errors,
        warnings,
      };

      this.isInitialized = true;

      logger.info('應用初始化完成:', {
        success: this.initializationResult.success,
        duration: this.initializationResult.duration,
        services: this.initializationResult.services,
        errorsCount: errors.length,
        warningsCount: warnings.length,
      });

      return this.initializationResult;
    } catch (error) {
      const _errorMessage = error instanceof Error ? error.message : '未知Error';
      errors.push(`應用InitializeFailed: ${errorMessage}`);

      const _endTime = new Date();
      const _duration = performanceMonitor.endTimer('app_initialization');

      this.initializationResult = {
        success: false,
        startTime,
        endTime,
        duration,
        services: {
          total: 0,
          initialized: 0,
          failed: 0,
        },
        errors,
        warnings,
      };

      logger.error('應用InitializeFailed:', {
        error: errorMessage,
        duration: this.initializationResult.duration,
      });

      return this.initializationResult;
    }
  }

  /**
   * CheckApplyYesNo已Initialize
   */
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * GetInitialize結果
   */
  getInitializationResult(): AppInitializationResult | null {
    return this.initializationResult;
  }

  /**
   * ReInitializeApply
   */
  async reinitializeApp(): Promise<AppInitializationResult> {
    logger.info('開始重新初始化應用');

    this.isInitialized = false;
    this.initializationResult = null;

    return this.initializeApp();
  }

  /**
   * GetApplyStatus
   */
  getAppStatus(): {
    isInitialized: boolean;
    initializationTime?: Date;
    services: {
      total: number;
      available: number;
      failed: number;
    };
    lastHealthCheck?: Date;
  } {
    const _serviceStats = serviceManager.getServiceStatistics();

    return {
      isInitialized: this.isInitialized,
      initializationTime: this.initializationResult?.startTime,
      services: {
        total: serviceStats.total,
        available: serviceStats.available,
        failed: serviceStats.failed,
      },
      lastHealthCheck: new Date(), // 可以從ServiceManage器Get實際Time
    };
  }

  /**
   * 執RowApply健康Check
   */
  async performAppHealthCheck(): Promise<{
    isHealthy: boolean;
    services: Map<string, boolean>;
    issues: string[];
  }> {
    logger.info('開始執行應用健康檢查');

    const issues: string[] = [];

    try {
      // CheckApplyYesNo已Initialize
      if (!this.isInitialized) {
        issues.push('應用尚未初始化');
      }

      // CheckService健康Status
      const _serviceHealthResults = await serviceManager.performHealthCheck();
      const _unhealthyServices = Array.from(serviceHealthResults.entries())
        .filter(([, isHealthy]) => !isHealthy)
        .map(([service]) => service);

      if (unhealthyServices.length > 0) {
        issues.push(`不健康的Service: ${unhealthyServices.join(', ')}`);
      }

      const _isHealthy = issues.length === 0;

      logger.info('應用健康檢查完成:', {
        isHealthy,
        totalServices: serviceHealthResults.size,
        healthyServices: Array.from(serviceHealthResults.values()).filter(
          Boolean
        ).length,
        issuesCount: issues.length,
      });

      return {
        isHealthy,
        services: serviceHealthResults,
        issues,
      };
    } catch (error) {
      const _errorMessage = error instanceof Error ? error.message : '未知Error';
      issues.push(`健康Check執行Failed: ${errorMessage}`);

      logger.error('應用健康CheckFailed:', { error: errorMessage });

      return {
        isHealthy: false,
        services: new Map(),
        issues,
      };
    }
  }

  /**
   * 生成Apply診斷Report
   */
  async generateDiagnosticReport(): Promise<{
    timestamp: Date;
    appStatus: unknown;
    initializationResult: AppInitializationResult | null;
    healthCheck: unknown;
    serviceReport: unknown;
    performance: {
      initializationTime?: number;
      memoryUsage?: unknown;
    };
  }> {
    logger.info('生成應用診斷報告');

    const _timestamp = new Date();
    const _appStatus = this.getAppStatus();
    const _healthCheck = await this.performAppHealthCheck();
    const _serviceReport = serviceManager.generateServiceReport();

    // Get性能Information
    const performance: unknown = {
      initializationTime: this.initializationResult?.duration,
    };

    // 如果在 Node.js 環境中，GetMemory使用情況
    if (typeof process !== 'undefined' && process.memoryUsage) {
      performance.memoryUsage = process.memoryUsage();
    }

    const _report = {
      timestamp,
      appStatus,
      initializationResult: this.initializationResult,
      healthCheck,
      serviceReport,
      performance,
    };

    logger.info('應用診斷報告生成完成');

    return report;
  }
}

// Export單例Instance
export const _appInitializer = AppInitializer.getInstance();

// ExportClass型
export type { AppInitializationResult };
