/**
 * 懶加載管理器 - 第三階段性能優化
 * 實現組件和模組的智能懶加載
 */

import { logger } from '../utils/logger';

export interface LazyLoadConfig {
  preloadDistance: number; // 預加載距離（像素）
  loadTimeout: number; // 加載超時時間（毫秒）
  maxConcurrentLoads: number; // 最大並發加載數
  cacheSize: number; // 緩存大小
  retryAttempts: number; // 重試次數
  retryDelay: number; // 重試延遲（毫秒）
}

export interface LazyLoadItem {
  id: string;
  component: React.LazyExoticComponent<any> | null;
  isLoaded: boolean;
  isLoading: boolean;
  loadTime: number;
  lastAccessed: Date;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

export interface LazyLoadMetrics {
  totalItems: number;
  loadedItems: number;
  loadingItems: number;
  cacheHitRate: number;
  averageLoadTime: number;
  memoryUsage: number;
}

/**
 * 懶加載管理器
 */
export class LazyLoadManager {
  private static instance: LazyLoadManager;
  private config: LazyLoadConfig;
  private items: Map<string, LazyLoadItem> = new Map();
  private loadingQueue: string[] = [];
  private activeLoads: Set<string> = new Set();
  private metrics: LazyLoadMetrics;
  private observers: Map<string, IntersectionObserver> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.metrics = this.getInitialMetrics();
  }

  public static getInstance(): LazyLoadManager {
    if (!LazyLoadManager.instance) {
      LazyLoadManager.instance = new LazyLoadManager();
    }
    return LazyLoadManager.instance;
  }

  /**
   * 初始化懶加載管理器
   */
  public async initialize(): Promise<void> {
    logger.info('初始化懶加載管理器...');

    try {
      // 設置性能監控
      this.setupPerformanceMonitoring();

      // 初始化Intersection Observer
      this.setupIntersectionObserver();

      // 設置內存管理
      this.setupMemoryManagement();

      logger.info('懶加載管理器初始化完成');
    } catch (error) {
      logger.error('懶加載管理器初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 註冊懶加載組件
   */
  public registerLazyComponent(
    id: string,
    importFunction: () => Promise<any>,
    priority: 'high' | 'medium' | 'low' = 'medium',
    dependencies: string[] = []
  ): void {
    logger.debug('註冊懶加載組件', { id, priority });

    const lazyComponent = React.lazy(importFunction);

    const item: LazyLoadItem = {
      id,
      component: lazyComponent,
      isLoaded: false,
      isLoading: false,
      loadTime: 0,
      lastAccessed: new Date(),
      priority,
      dependencies,
    };

    this.items.set(id, item);
    this.metrics.totalItems++;
  }

  /**
   * 預加載組件
   */
  public async preloadComponent(id: string): Promise<void> {
    const item = this.items.get(id);
    if (!item || item.isLoaded || item.isLoading) {
      return;
    }

    logger.debug('預加載組件', { id });

    try {
      await this.loadComponent(id);
      logger.debug('組件預加載完成', { id });
    } catch (error) {
      logger.error('組件預加載失敗', { id, error });
    }
  }

  /**
   * 批量預加載組件
   */
  public async preloadComponents(ids: string[]): Promise<void> {
    logger.debug('批量預加載組件', { count: ids.length });

    // 按優先級排序
    const sortedIds = ids.sort((a, b) => {
      const itemA = this.items.get(a);
      const itemB = this.items.get(b);
      if (!itemA || !itemB) return 0;

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[itemB.priority] - priorityOrder[itemA.priority];
    });

    // 並行預加載（限制並發數）
    const chunks = this.chunkArray(sortedIds, this.config.maxConcurrentLoads);

    for (const chunk of chunks) {
      await Promise.all(chunk.map(id => this.preloadComponent(id)));
    }
  }

  /**
   * 獲取懶加載組件
   */
  public getLazyComponent(id: string): React.LazyExoticComponent<any> | null {
    const item = this.items.get(id);
    if (!item) {
      logger.warn('未找到懶加載組件', { id });
      return null;
    }

    // 更新訪問時間
    item.lastAccessed = new Date();

    // 如果未加載，加入加載隊列
    if (!item.isLoaded && !item.isLoading) {
      this.addToLoadingQueue(id);
    }

    return item.component;
  }

  /**
   * 設置組件可見性觀察
   */
  public observeComponent(
    id: string,
    element: Element,
    onVisible: () => void,
    onHidden: () => void
  ): void {
    if (!this.observers.has(id)) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              onVisible();
              // 預加載相關組件
              this.preloadRelatedComponents(id);
            } else {
              onHidden();
            }
          });
        },
        {
          rootMargin: `${this.config.preloadDistance}px`,
          threshold: 0.1,
        }
      );

      this.observers.set(id, observer);
    }

    const observer = this.observers.get(id);
    if (observer) {
      observer.observe(element);
    }
  }

  /**
   * 取消觀察組件
   */
  public unobserveComponent(id: string, element: Element): void {
    const observer = this.observers.get(id);
    if (observer) {
      observer.unobserve(element);
    }
  }

  /**
   * 清理未使用的組件
   */
  public cleanup(): void {
    logger.debug('清理未使用的懶加載組件');

    const now = new Date();
    const cleanupThreshold = 5 * 60 * 1000; // 5分鐘

    for (const [id, item] of this.items.entries()) {
      const timeSinceLastAccess = now.getTime() - item.lastAccessed.getTime();

      if (timeSinceLastAccess > cleanupThreshold && item.isLoaded) {
        this.unloadComponent(id);
      }
    }

    // 清理觀察器
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();

    // 更新指標
    this.updateMetrics();
  }

  /**
   * 獲取性能指標
   */
  public getMetrics(): LazyLoadMetrics {
    return { ...this.metrics };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<LazyLoadConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('懶加載管理器配置已更新', this.config);
  }

  // 私有方法

  private async loadComponent(id: string): Promise<void> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`組件 ${id} 不存在`);
    }

    if (item.isLoaded || item.isLoading) {
      return;
    }

    // 檢查依賴
    if (item.dependencies && item.dependencies.length > 0) {
      await this.loadDependencies(item.dependencies);
    }

    item.isLoading = true;
    this.activeLoads.add(id);
    const startTime = Date.now();

    try {
      // 實際加載組件
      await this.forceLoadComponent(item.component!);

      item.isLoaded = true;
      item.loadTime = Date.now() - startTime;

      logger.debug('組件加載完成', {
        id,
        loadTime: item.loadTime,
      });
    } catch (error) {
      logger.error('組件加載失敗', { id, error });
      throw error;
    } finally {
      item.isLoading = false;
      this.activeLoads.delete(id);
      this.removeFromLoadingQueue(id);
      this.updateMetrics();
    }
  }

  private async loadDependencies(dependencies: string[]): Promise<void> {
    for (const depId of dependencies) {
      const depItem = this.items.get(depId);
      if (depItem && !depItem.isLoaded && !depItem.isLoading) {
        await this.loadComponent(depId);
      }
    }
  }

  private async forceLoadComponent(
    component: React.LazyExoticComponent<any>
  ): Promise<void> {
    // 觸發組件實際加載
    try {
      await (component as any)._payload._result;
    } catch (error) {
      // 如果組件已經加載，這個調用會失敗，這是正常的
      if (!error.message?.includes('already loaded')) {
        throw error;
      }
    }
  }

  private addToLoadingQueue(id: string): void {
    if (!this.loadingQueue.includes(id)) {
      this.loadingQueue.push(id);
      this.processLoadingQueue();
    }
  }

  private removeFromLoadingQueue(id: string): void {
    const index = this.loadingQueue.indexOf(id);
    if (index > -1) {
      this.loadingQueue.splice(index, 1);
    }
  }

  private async processLoadingQueue(): Promise<void> {
    if (this.activeLoads.size >= this.config.maxConcurrentLoads) {
      return;
    }

    const nextId = this.loadingQueue.shift();
    if (nextId) {
      this.loadComponent(nextId).catch(error => {
        logger.error('隊列中的組件加載失敗', { id: nextId, error });
      });
    }
  }

  private async preloadRelatedComponents(id: string): Promise<void> {
    const item = this.items.get(id);
    if (!item || !item.dependencies) {
      return;
    }

    // 預加載依賴組件
    const relatedIds = item.dependencies.filter(depId => {
      const depItem = this.items.get(depId);
      return depItem && !depItem.isLoaded && !depItem.isLoading;
    });

    if (relatedIds.length > 0) {
      await this.preloadComponents(relatedIds);
    }
  }

  private unloadComponent(id: string): void {
    const item = this.items.get(id);
    if (!item) {
      return;
    }

    logger.debug('卸載組件', { id });

    // 這裡可以實現實際的組件卸載邏輯
    // 例如清理組件相關的資源、事件監聽器等

    item.isLoaded = false;
    item.component = null;

    this.updateMetrics();
  }

  private setupPerformanceMonitoring(): void {
    // 設置性能監控
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // 每30秒更新一次指標
  }

  private setupIntersectionObserver(): void {
    // 設置全局Intersection Observer
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      logger.debug('Intersection Observer 可用');
    } else {
      logger.warn('Intersection Observer 不可用，將使用回退方案');
    }
  }

  private setupMemoryManagement(): void {
    // 設置內存管理
    if (typeof window !== 'undefined' && 'performance' in window) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 60000); // 每分鐘檢查一次內存使用
    }
  }

  private checkMemoryUsage(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

      if (memoryUsage > 0.8) {
        // 內存使用超過80%
        logger.warn('內存使用率過高，開始清理', {
          usage: memoryUsage,
          used: memory.usedJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
        this.cleanup();
      }
    }
  }

  private updateMetrics(): void {
    let loadedItems = 0;
    let loadingItems = 0;
    let totalLoadTime = 0;
    let loadedCount = 0;

    for (const item of this.items.values()) {
      if (item.isLoaded) {
        loadedItems++;
        totalLoadTime += item.loadTime;
        loadedCount++;
      }
      if (item.isLoading) {
        loadingItems++;
      }
    }

    this.metrics.loadedItems = loadedItems;
    this.metrics.loadingItems = loadingItems;
    this.metrics.averageLoadTime =
      loadedCount > 0 ? totalLoadTime / loadedCount : 0;

    // 計算緩存命中率
    const totalAccesses = loadedItems + loadingItems;
    this.metrics.cacheHitRate =
      totalAccesses > 0 ? loadedItems / totalAccesses : 0;

    // 估算內存使用
    this.metrics.memoryUsage = this.estimateMemoryUsage();
  }

  private estimateMemoryUsage(): number {
    // 簡化的內存使用估算
    let estimatedSize = 0;

    for (const item of this.items.values()) {
      if (item.isLoaded) {
        estimatedSize += 1024 * 1024; // 假設每個組件1MB
      }
    }

    return estimatedSize;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private getDefaultConfig(): LazyLoadConfig {
    return {
      preloadDistance: 200, // 200px
      loadTimeout: 10000, // 10秒
      maxConcurrentLoads: 3, // 最多3個並發加載
      cacheSize: 50, // 緩存50個組件
      retryAttempts: 3,
      retryDelay: 1000, // 1秒
    };
  }

  private getInitialMetrics(): LazyLoadMetrics {
    return {
      totalItems: 0,
      loadedItems: 0,
      loadingItems: 0,
      cacheHitRate: 0,
      averageLoadTime: 0,
      memoryUsage: 0,
    };
  }
}

export default LazyLoadManager;
