
/**
 * 智能緩存管理器
 * 提供內存緩存和持久化緩存功能
 */
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number = 1000;
  private cleanupInterval: NodeJS.Timeout;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  constructor() {
    // 每5分鐘清理過期緩存
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: any, ttl: number = 300000): void { // 默認5分鐘
    // 如果緩存已滿，移除最舊的項目
    if (this.memoryCache.size >= this.maxSize) {
      this.removeOldest();
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    // 檢查是否過期
    if (Date.now() - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  clear(): void {
    this.memoryCache.clear();
  }

  size(): number {
    return this.memoryCache.size;
  }

  private removeOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export const cacheManager = CacheManager.getInstance();
