/**
 * ServiceInitialize優化器
 * ResolveServiceInitialize順序和依賴問題
 */

import { logger } from '../../utils/logger';

export interface ServiceDependency {
  name: string;
  dependencies: string[];
  priority: number;
  service: unknown;
}

export interface InitializationResult {
  success: boolean;
  initialized: string[];
  failed: { service: string; error: string }[];
  duration: number;
  dependencyGraph: Map<string, string[]>;
}

class ServiceInitializationOptimizer {
  private static instance: ServiceInitializationOptimizer;
  private readonly services: Map<string, ServiceDependency> = new Map();
  private isInitialized = false;

  public static getInstance(): ServiceInitializationOptimizer {
    if (!ServiceInitializationOptimizer.instance) {
      ServiceInitializationOptimizer.instance =
        new ServiceInitializationOptimizer();
    }
    return ServiceInitializationOptimizer.instance;
  }

  /**
   * RegisterService
   */
  public registerService(
    name: string,
    service: unknown,
    dependencies: string[] = [],
    priority = 0
  ): void {
    this.services.set(name, {
      name,
      dependencies,
      priority,
      service,
    });

    logger.info(`Service已註冊: ${name}`, { dependencies, priority });
  }

  /**
   * 優化Initialize順序
   */
  public optimizeInitializationOrder(): string[] {
    const sortedServices: string[] = [];
    const _visited = new Set<string>();
    const _visiting = new Set<string>();

    // 拓撲Sort
    const _visit = (serviceName: string): void => {
      if (visiting.has(serviceName)) {
        throw new Error(`檢測到循環依賴: ${serviceName}`);
      }

      if (visited.has(serviceName)) {
        return;
      }

      visiting.add(serviceName);
      const _service = this.services.get(serviceName);

      if (service) {
        // 先Initialize依賴
        for (const dependency of service.dependencies) {
          if (!this.services.has(dependency)) {
            throw new Error(
              `Service ${serviceName} 依賴的Service ${dependency} 未註冊`
            );
          }
          visit(dependency);
        }
      }

      visiting.delete(serviceName);
      visited.add(serviceName);
      sortedServices.push(serviceName);
    };

    // 按優先級SortService名稱
    const _serviceNames = Array.from(this.services.keys()).sort((a, b) => {
      const _serviceA = this.services.get(a)!;
      const _serviceB = this.services.get(b)!;
      return serviceB.priority - serviceA.priority;
    });

    // 對每個Service執Row拓撲Sort
    for (const serviceName of serviceNames) {
      if (!visited.has(serviceName)) {
        visit(serviceName);
      }
    }

    logger.info('ServiceInitialize順序已優化:', sortedServices);
    return sortedServices;
  }

  /**
   * ParallelInitializeService
   */
  public async initializeServicesInParallel(
    maxConcurrency = 3
  ): Promise<InitializationResult> {
    const _startTime = Date.now();
    const _sortedServices = this.optimizeInitializationOrder();

    const initialized: string[] = [];
    const failed: { service: string; error: string }[] = [];
    const _dependencyGraph = new Map<string, string[]>();

    // Build依賴Graph
    for (const [name, service] of this.services) {
      dependencyGraph.set(name, service.dependencies);
    }

    // GroupInitialize
    const _groups = this.groupServicesByDependencies(
      sortedServices,
      maxConcurrency
    );

    for (const group of groups) {
      logger.info(`InitializeService組: ${group.join(', ')}`);

      const _groupPromises = group.map(async serviceName => {
        const _service = this.services.get(serviceName);
        if (!service) {
          failed.push({ service: serviceName, error: 'Service未找到' });
          return;
        }

        try {
          // CheckServiceYesNo已經Initialize
          if (service.service.isServiceAvailable?.()) {
            logger.info(`Service ${serviceName} 已經Initialize`);
            initialized.push(serviceName);
            return;
          }

          // InitializeService
          if (typeof service.service.initialize === 'function') {
            try {
              const _success = await service.service.initialize();
              if (success === true) {
                initialized.push(serviceName);
                logger.info(`Service ${serviceName} InitializeSuccess`);
              } else {
                failed.push({
                  service: serviceName,
                  error: '初始化返回 false',
                });
              }
            } catch (error) {
              const _errorMessage =
                error instanceof Error ? error.message : '未知Error';
              failed.push({ service: serviceName, error: errorMessage });
              logger.error(`Service ${serviceName} InitializeFailed:`, error);
            }
          } else {
            logger.warn(`Service ${serviceName} 沒有 initialize 方法`);
            initialized.push(serviceName);
          }
        } catch (error) {
          const _errorMessage =
            error instanceof Error ? error.message : '未知Error';
          failed.push({ service: serviceName, error: errorMessage });
          logger.error(`Service ${serviceName} InitializeFailed:`, error);
        }
      });

      // Await當前組的所有ServiceInitializeComplete
      await Promise.allSettled(groupPromises);
    }

    const _duration = Date.now() - startTime;

    const result: InitializationResult = {
      success: failed.length === 0,
      initialized,
      failed,
      duration,
      dependencyGraph,
    };

    logger.info('ServiceInitialize完成:', {
      total: sortedServices.length,
      initialized: initialized.length,
      failed: failed.length,
      duration: `${duration}ms`,
    });

    return result;
  }

  /**
   * 按依賴Off係GroupService
   */
  private groupServicesByDependencies(
    sortedServices: string[],
    maxConcurrency: number
  ): string[][] {
    const groups: string[][] = [];
    let currentGroup: string[] = [];

    for (const serviceName of sortedServices) {
      const _service = this.services.get(serviceName);
      if (!service) continue;

      // Check依賴YesNo已滿足
      const _dependenciesMet = service.dependencies.every(
        dep =>
          groups.some(group => group.includes(dep)) ||
          currentGroup.includes(dep)
      );

      if (dependenciesMet) {
        currentGroup.push(serviceName);

        // Check當前組YesNo已滿
        if (currentGroup.length >= maxConcurrency) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
      } else {
        // 如果依賴未滿足，Begin新組
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
          currentGroup = [serviceName];
        } else {
          currentGroup.push(serviceName);
        }
      }
    }

    if (currentGroup.length > 0) {
      groups.push([...currentGroup]);
    }

    return groups;
  }

  /**
   * Verify依賴Off係
   */
  public validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const _visited = new Set<string>();
    const _visiting = new Set<string>();

    const _checkCycles = (serviceName: string, path: string[] = []): void => {
      if (visiting.has(serviceName)) {
        const _cycle = [...path, serviceName].join(' -> ');
        errors.push(`檢測到循環依賴: ${cycle}`);
        return;
      }

      if (visited.has(serviceName)) {
        return;
      }

      visiting.add(serviceName);
      const _service = this.services.get(serviceName);

      if (service) {
        for (const dependency of service.dependencies) {
          if (!this.services.has(dependency)) {
            errors.push(`Service ${serviceName} 依賴的Service ${dependency} 未註冊`);
          } else {
            checkCycles(dependency, [...path, serviceName]);
          }
        }
      }

      visiting.delete(serviceName);
      visited.add(serviceName);
    };

    for (const serviceName of this.services.keys()) {
      if (!visited.has(serviceName)) {
        checkCycles(serviceName);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * GetService依賴Graph
   */
  public getDependencyGraph(): Map<string, string[]> {
    const _graph = new Map<string, string[]>();

    for (const [name, service] of this.services) {
      graph.set(name, service.dependencies);
    }

    return graph;
  }

  /**
   * CheckServiceStatus
   */
  public getServiceStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};

    for (const [name, service] of this.services) {
      if (service.service.isServiceAvailable) {
        status[name] = service.service.isServiceAvailable();
      } else {
        status[name] = false;
      }
    }

    return status;
  }

  /**
   * Reset優化器
   */
  public reset(): void {
    this.services.clear();
    this.isInitialized = false;
    logger.info('ServiceInitialize優化器已重置');
  }

  /**
   * Check優化器Status
   */
  public isOptimizerAvailable(): boolean {
    return this.services.size > 0;
  }

  /**
   * Get優化器Statistics
   */
  public getStats(): unknown {
    return {
      totalServices: this.services.size,
      isOptimizerAvailable: this.isOptimizerAvailable(),
      serviceNames: Array.from(this.services.keys()),
    };
  }
}

// Export單例Instance
export const _serviceInitializationOptimizer =
  ServiceInitializationOptimizer.getInstance();
