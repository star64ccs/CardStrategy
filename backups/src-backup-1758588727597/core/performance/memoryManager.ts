/**
 * 內存管理器 - 第三階段性能優化
 * 實現智能內存管理和垃圾回收優化
 */

import { logger } from '../utils/logger';

export interface MemoryConfig {
  maxMemoryUsage: number; // 最大內存使用量（MB）
  gcThreshold: number; // 垃圾回收閾值（0-1）
  cleanupInterval: number; // 清理間隔（毫秒）
  enableWeakRefs: boolean; // 啟用弱引用
  enableMemoryPool: boolean; // 啟用內存池
  poolSize: number; // 內存池大小
}

export interface MemoryMetrics {
  usedMemory: number;
  totalMemory: number;
  memoryUsage: number;
  gcCount: number;
  lastGcTime: number;
  objectCount: number;
  poolUsage: number;
  leakCount: number;
}

export interface MemoryLeak {
  id: string;
  type: 'eventListener' | 'timer' | 'observer' | 'cache' | 'component';
  location: string;
  size: number;
  timestamp: Date;
  stackTrace?: string;
}

/**
 * 內存管理器
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private config: MemoryConfig;
  private metrics: MemoryMetrics;
  private memoryPool: Map<string, any[]> = new Map();
  private weakRefs: Set<WeakRef<any>> = new Set();
  private trackedObjects: Map<string, any> = new Map();
  private leaks: MemoryLeak[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;
  private gcTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.metrics = this.getInitialMetrics();
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * 初始化內存管理器
   */
  public async initialize(): Promise<void> {
    logger.info('初始化內存管理器...');

    try {
      // 設置內存監控
      this.setupMemoryMonitoring();

      // 初始化內存池
      if (this.config.enableMemoryPool) {
        await this.initializeMemoryPool();
      }

      // 設置垃圾回收
      this.setupGarbageCollection();

      // 設置清理定時器
      this.setupCleanupTimer();

      logger.info('內存管理器初始化完成');
    } catch (error) {
      logger.error('內存管理器初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 分配內存對象
   */
  public allocateObject<T>(id: string, object: T, type: string = 'generic'): T {
    logger.debug('分配內存對象', { id, type });

    // 檢查內存使用
    this.checkMemoryUsage();

    // 使用內存池（如果可用）
    if (this.config.enableMemoryPool && this.memoryPool.has(type)) {
      const pool = this.memoryPool.get(type)!;
      if (pool.length > 0) {
        const pooledObject = pool.pop();
        Object.assign(pooledObject, object);
        this.trackedObjects.set(id, pooledObject);
        return pooledObject;
      }
    }

    // 創建新對象
    this.trackedObjects.set(id, object);
    this.metrics.objectCount++;

    // 創建弱引用（如果啟用）
    if (this.config.enableWeakRefs && typeof WeakRef !== 'undefined') {
      const weakRef = new WeakRef(object);
      this.weakRefs.add(weakRef);
    }

    return object;
  }

  /**
   * 釋放內存對象
   */
  public deallocateObject(id: string, type?: string): void {
    logger.debug('釋放內存對象', { id, type });

    const object = this.trackedObjects.get(id);
    if (!object) {
      return;
    }

    // 清理對象
    this.cleanupObject(object, type);

    // 移除追蹤
    this.trackedObjects.delete(id);
    this.metrics.objectCount--;

    // 返回內存池（如果適用）
    if (this.config.enableMemoryPool && type && this.memoryPool.has(type)) {
      this.resetObject(object);
      this.memoryPool.get(type)!.push(object);
    }
  }

  /**
   * 批量釋放對象
   */
  public deallocateObjects(ids: string[], type?: string): void {
    logger.debug('批量釋放內存對象', { count: ids.length, type });

    for (const id of ids) {
      this.deallocateObject(id, type);
    }

    // 觸發垃圾回收
    this.scheduleGarbageCollection();
  }

  /**
   * 監控組件內存
   */
  public monitorComponent(
    componentId: string,
    component: React.Component<any, any>
  ): void {
    logger.debug('監控組件內存', { componentId });

    // 監控組件生命週期
    const originalComponentWillUnmount = component.componentWillUnmount;

    component.componentWillUnmount = () => {
      // 清理組件相關資源
      this.cleanupComponentResources(componentId);

      // 調用原始方法
      if (originalComponentWillUnmount) {
        originalComponentWillUnmount.call(component);
      }
    };

    // 追蹤組件
    this.trackedObjects.set(componentId, component);
  }

  /**
   * 清理事件監聽器
   */
  public cleanupEventListeners(element: Element | null): void {
    if (!element) {
      return;
    }

    logger.debug('清理事件監聽器', { element: element.tagName });

    // 克隆元素以移除所有事件監聽器
    const newElement = element.cloneNode(true) as Element;
    element.parentNode?.replaceChild(newElement, element);

    // 記錄清理
    this.recordLeak({
      id: `event_${Date.now()}`,
      type: 'eventListener',
      location: element.tagName,
      size: this.estimateElementSize(element),
      timestamp: new Date(),
    });
  }

  /**
   * 清理定時器
   */
  public cleanupTimers(timers: NodeJS.Timeout[]): void {
    logger.debug('清理定時器', { count: timers.length });

    for (const timer of timers) {
      clearTimeout(timer);
      clearInterval(timer);
    }

    // 記錄清理
    this.recordLeak({
      id: `timer_${Date.now()}`,
      type: 'timer',
      location: 'global',
      size: timers.length * 100, // 估算每個定時器100字節
      timestamp: new Date(),
    });
  }

  /**
   * 清理觀察者
   */
  public cleanupObservers(observers: IntersectionObserver[]): void {
    logger.debug('清理觀察者', { count: observers.length });

    for (const observer of observers) {
      observer.disconnect();
    }

    // 記錄清理
    this.recordLeak({
      id: `observer_${Date.now()}`,
      type: 'observer',
      location: 'global',
      size: observers.length * 200, // 估算每個觀察者200字節
      timestamp: new Date(),
    });
  }

  /**
   * 強制垃圾回收
   */
  public forceGarbageCollection(): void {
    logger.debug('執行強制垃圾回收');

    const startTime = Date.now();

    // 清理弱引用
    this.cleanupWeakRefs();

    // 清理內存池
    this.cleanupMemoryPool();

    // 清理追蹤對象
    this.cleanupTrackedObjects();

    // 觸發瀏覽器GC（如果可用）
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }

    const gcTime = Date.now() - startTime;
    this.metrics.gcCount++;
    this.metrics.lastGcTime = gcTime;

    logger.debug('垃圾回收完成', {
      gcTime,
      gcCount: this.metrics.gcCount,
    });
  }

  /**
   * 獲取內存指標
   */
  public getMemoryMetrics(): MemoryMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * 獲取內存洩漏報告
   */
  public getMemoryLeakReport(): MemoryLeak[] {
    return [...this.leaks];
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('內存管理器配置已更新', this.config);
  }

  /**
   * 清理所有資源
   */
  public cleanup(): void {
    logger.info('清理內存管理器資源');

    // 清理定時器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }

    // 清理所有追蹤對象
    this.trackedObjects.clear();

    // 清理內存池
    this.memoryPool.clear();

    // 清理弱引用
    this.weakRefs.clear();

    // 清理洩漏記錄
    this.leaks.length = 0;
  }

  // 私有方法

  private setupMemoryMonitoring(): void {
    // 設置內存監控
    if (typeof window !== 'undefined' && 'performance' in window) {
      setInterval(() => {
        this.updateMetrics();
        this.checkMemoryUsage();
      }, 5000); // 每5秒檢查一次
    }
  }

  private async initializeMemoryPool(): Promise<void> {
    logger.debug('初始化內存池...');

    const poolTypes = ['component', 'service', 'cache', 'buffer'];

    for (const type of poolTypes) {
      const pool: any[] = [];
      for (let i = 0; i < this.config.poolSize; i++) {
        pool.push(this.createPoolObject(type));
      }
      this.memoryPool.set(type, pool);
    }

    logger.debug('內存池初始化完成', {
      poolTypes: poolTypes.length,
      poolSize: this.config.poolSize,
    });
  }

  private createPoolObject(type: string): any {
    switch (type) {
      case 'component':
        return {};
      case 'service':
        return { methods: {} };
      case 'cache':
        return { data: new Map() };
      case 'buffer':
        return new ArrayBuffer(1024);
      default:
        return {};
    }
  }

  private setupGarbageCollection(): void {
    // 設置自動垃圾回收
    this.gcTimer = setInterval(() => {
      if (this.metrics.memoryUsage > this.config.gcThreshold) {
        this.forceGarbageCollection();
      }
    }, 30000); // 每30秒檢查一次
  }

  private setupCleanupTimer(): void {
    // 設置清理定時器
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  private checkMemoryUsage(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.usedMemory = memory.usedJSHeapSize;
      this.metrics.totalMemory = memory.jsHeapSizeLimit;
      this.metrics.memoryUsage =
        this.metrics.usedMemory / this.metrics.totalMemory;

      // 檢查是否超過閾值
      if (this.metrics.memoryUsage > this.config.gcThreshold) {
        logger.warn('內存使用率過高', {
          usage: this.metrics.memoryUsage,
          threshold: this.config.gcThreshold,
        });

        this.forceGarbageCollection();
      }
    }
  }

  private updateMetrics(): void {
    // 更新內存指標
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.usedMemory = memory.usedJSHeapSize;
      this.metrics.totalMemory = memory.jsHeapSizeLimit;
      this.metrics.memoryUsage =
        this.metrics.usedMemory / this.metrics.totalMemory;
    }

    // 更新池使用率
    const totalPoolSize = Array.from(this.memoryPool.values()).reduce(
      (sum, pool) => sum + pool.length,
      0
    );
    const maxPoolSize = this.memoryPool.size * this.config.poolSize;
    this.metrics.poolUsage = maxPoolSize > 0 ? totalPoolSize / maxPoolSize : 0;

    // 更新洩漏數量
    this.metrics.leakCount = this.leaks.length;
  }

  private performCleanup(): void {
    logger.debug('執行定期清理');

    // 清理過期的洩漏記錄
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.leaks = this.leaks.filter(
      leak => leak.timestamp.getTime() > oneHourAgo
    );

    // 清理未使用的內存池對象
    this.cleanupMemoryPool();

    // 清理弱引用
    this.cleanupWeakRefs();
  }

  private cleanupObject(object: any, type?: string): void {
    if (!object) {
      return;
    }

    // 根據類型進行特定清理
    switch (type) {
      case 'component':
        this.cleanupComponentResources(object);
        break;
      case 'service':
        if (object.cleanup) {
          object.cleanup();
        }
        break;
      case 'cache':
        if (object.clear) {
          object.clear();
        }
        break;
      default:
        // 通用清理
        if (typeof object === 'object') {
          Object.keys(object).forEach(key => {
            delete object[key];
          });
        }
    }
  }

  private cleanupComponentResources(component: any): void {
    // 清理組件相關資源
    if (component.state) {
      component.setState({});
    }

    // 清理事件監聽器
    if (component._eventListeners) {
      component._eventListeners.forEach((listener: any) => {
        listener.element?.removeEventListener(listener.event, listener.handler);
      });
    }

    // 清理定時器
    if (component._timers) {
      component._timers.forEach((timer: NodeJS.Timeout) => {
        clearTimeout(timer);
        clearInterval(timer);
      });
    }
  }

  private cleanupComponentResources(componentId: string): void {
    const component = this.trackedObjects.get(componentId);
    if (component) {
      this.cleanupComponentResources(component);
    }
  }

  private cleanupWeakRefs(): void {
    for (const weakRef of this.weakRefs) {
      if (weakRef.deref() === undefined) {
        this.weakRefs.delete(weakRef);
      }
    }
  }

  private cleanupMemoryPool(): void {
    for (const [type, pool] of this.memoryPool.entries()) {
      // 保持池大小
      while (pool.length > this.config.poolSize) {
        pool.pop();
      }

      // 補充池大小
      while (pool.length < this.config.poolSize) {
        pool.push(this.createPoolObject(type));
      }
    }
  }

  private cleanupTrackedObjects(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10分鐘

    for (const [id, object] of this.trackedObjects.entries()) {
      // 清理過期對象（如果有時間戳）
      if (object._createdAt && now - object._createdAt > maxAge) {
        this.deallocateObject(id);
      }
    }
  }

  private resetObject(object: any): void {
    // 重置對象到初始狀態
    if (typeof object === 'object' && object !== null) {
      Object.keys(object).forEach(key => {
        delete object[key];
      });
    }
  }

  private estimateElementSize(element: Element): number {
    // 估算元素大小（簡化實現）
    return element.innerHTML.length * 2; // 每個字符2字節
  }

  private recordLeak(leak: MemoryLeak): void {
    this.leaks.push(leak);

    // 限制洩漏記錄數量
    if (this.leaks.length > 1000) {
      this.leaks = this.leaks.slice(-500);
    }
  }

  private scheduleGarbageCollection(): void {
    // 延遲執行垃圾回收，避免阻塞主線程
    setTimeout(() => {
      this.forceGarbageCollection();
    }, 100);
  }

  private getDefaultConfig(): MemoryConfig {
    return {
      maxMemoryUsage: 100, // 100MB
      gcThreshold: 0.8, // 80%
      cleanupInterval: 60000, // 1分鐘
      enableWeakRefs: true,
      enableMemoryPool: true,
      poolSize: 100,
    };
  }

  private getInitialMetrics(): MemoryMetrics {
    return {
      usedMemory: 0,
      totalMemory: 0,
      memoryUsage: 0,
      gcCount: 0,
      lastGcTime: 0,
      objectCount: 0,
      poolUsage: 0,
      leakCount: 0,
    };
  }
}

export default MemoryManager;
