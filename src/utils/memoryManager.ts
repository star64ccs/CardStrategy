export interface CacheItem<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface MemoryStats {
  totalItems: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageAccessTime: number;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private cache = new Map<string, CacheItem>();
  private maxCacheSize: number;
  private maxMemoryUsage: number;
  private hitCount = 0;
  private missCount = 0;
  private totalAccessTime = 0;
  private accessCount = 0;

  constructor(maxCacheSize: number = 100, maxMemoryUsage: number = 50 * 1024 * 1024) {
    this.maxCacheSize = maxCacheSize;
    this.maxMemoryUsage = maxMemoryUsage;
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * 設置緩存項目
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    // 檢查緩存大小
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanup();
    }

    // 檢查記憶體使用量
    if (this.getCurrentMemoryUsage() > this.maxMemoryUsage) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  /**
   * 獲取緩存項目
   */
  get<T>(key: string): T | null {
    const startTime = performance.now();

    const item = this.cache.get(key);
    if (!item) {
      this.missCount++;
      this.recordAccessTime(performance.now() - startTime);
      return null;
    }

    // 檢查是否過期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.missCount++;
      this.recordAccessTime(performance.now() - startTime);
      return null;
    }

    // 更新訪問統計
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.hitCount++;
    this.recordAccessTime(performance.now() - startTime);

    return item.value as T;
  }

  /**
   * 檢查緩存項目是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // 檢查是否過期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 刪除緩存項目
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清理過期項目
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 驅逐最少使用的項目
   */
  evictLeastUsed(): void {
    const items = Array.from(this.cache.entries());

    // 按訪問次數和最後訪問時間排序
    items.sort((a, b) => {
      const aScore = a[1].accessCount * 0.7 + (a[1].lastAccessed / 1000000) * 0.3;
      const bScore = b[1].accessCount * 0.7 + (b[1].lastAccessed / 1000000) * 0.3;
      return aScore - bScore;
    });

    // 刪除 20% 的項目
    const deleteCount = Math.ceil(items.length * 0.2);
    for (let i = 0; i < deleteCount; i++) {
      this.cache.delete(items[i][0]);
    }
  }

  /**
   * 清空所有緩存
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * 獲取緩存統計
   */
  getStats(): MemoryStats {
    const totalItems = this.cache.size;
    const totalSize = this.getCurrentMemoryUsage();
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.missCount / totalRequests : 0;
    const averageAccessTime = this.accessCount > 0 ? this.totalAccessTime / this.accessCount : 0;

    return {
      totalItems,
      totalSize,
      hitRate,
      missRate,
      averageAccessTime
    };
  }

  /**
   * 重置統計數據
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
    this.totalAccessTime = 0;
    this.accessCount = 0;
  }

  /**
   * 獲取當前記憶體使用量
   */
  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * 記錄訪問時間
   */
  private recordAccessTime(time: number): void {
    this.totalAccessTime += time;
    this.accessCount++;
  }

  /**
   * 獲取緩存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 檢查緩存是否為空
   */
  get isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * 獲取所有緩存鍵
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 獲取所有緩存值
   */
  values<T>(): T[] {
    return Array.from(this.cache.values()).map(item => item.value);
  }

  /**
   * 遍歷所有緩存項目
   */
  forEach(callback: (value: any, key: string) => void): void {
    this.cache.forEach((item, key) => {
      callback(item.value, key);
    });
  }

  /**
   * 設置最大緩存大小
   */
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    if (this.cache.size > size) {
      this.cleanup();
    }
  }

  /**
   * 設置最大記憶體使用量
   */
  setMaxMemoryUsage(bytes: number): void {
    this.maxMemoryUsage = bytes;
    if (this.getCurrentMemoryUsage() > bytes) {
      this.evictLeastUsed();
    }
  }
}

// 導出單例實例
export const memoryManager = MemoryManager.getInstance();

// 便捷函數
export const setCache = <T>(key: string, value: T, ttl?: number) =>
  memoryManager.set(key, value, ttl);

export const getCache = <T>(key: string): T | null =>
  memoryManager.get<T>(key);

export const hasCache = (key: string): boolean =>
  memoryManager.has(key);

export const deleteCache = (key: string): boolean =>
  memoryManager.delete(key);

export const clearCache = () =>
  memoryManager.clear();

export const getCacheStats = () =>
  memoryManager.getStats();
