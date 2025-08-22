/**
 * 性能優化工具函數
 */

// 防抖函數
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

// 節流函數
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 記憶化函數
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 異步防抖
export function asyncDebounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let promise: Promise<ReturnType<T>> | null = null;

  return function executedFunction(
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!promise) {
      promise = new Promise((resolve, reject) => {
        timeout = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            timeout = null;
            promise = null;
          }
        }, wait);
      });
    }

    return promise;
  };
}

// 異步節流
export function asyncThrottle<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let inThrottle: boolean = false;
  let lastPromise: Promise<ReturnType<T>> | null = null;

  return function executedFunction(
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    if (inThrottle && lastPromise) {
      return lastPromise;
    }

    inThrottle = true;
    lastPromise = func(...args);

    setTimeout(() => {
      inThrottle = false;
      lastPromise = null;
    }, limit);

    return lastPromise;
  };
}

// 批量處理函數
export function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delay: number = 100
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = [];
    let currentIndex = 0;

    async function processBatch() {
      const batch = items.slice(currentIndex, currentIndex + batchSize);

      if (batch.length === 0) {
        resolve(results);
        return;
      }

      try {
        const batchResults = await Promise.all(
          batch.map((item) => processor(item))
        );
        results.push(...batchResults);
        currentIndex += batchSize;

        if (currentIndex < items.length) {
          setTimeout(processBatch, delay);
        } else {
          resolve(results);
        }
      } catch (error) {
        reject(error);
      }
    }

    processBatch();
  });
}

// 性能測量函數
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  // logger.info(`${name} took ${end - start}ms`);
  return result;
}

// 異步性能測量函數
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  // logger.info(`${name} took ${end - start}ms`);
  return result;
}

// 懶加載檢查
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

// 預加載資源
export function preloadResource(
  url: string,
  type: 'image' | 'script' | 'style'
): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
}

// 清理記憶體
export function cleanupMemory(): void {
  // 清理事件監聽器
  // 清理定時器
  // 清理快取
  if ('memory' in performance) {
    // logger.info('Memory usage before cleanup:', (performance as any).memory.usedJSHeapSize);
  }

  // 強制垃圾回收（如果可用）
  if (global.gc) {
    global.gc();
  }
}

// 獲取記憶體使用情況
export function getMemoryUsage(): number {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
}

// 檢查記憶體使用是否過高
export function isMemoryUsageHigh(
  threshold: number = 100 * 1024 * 1024
): boolean {
  return getMemoryUsage() > threshold;
}

// 創建性能監控器
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initObservers();
  }

  private initObservers(): void {
    if ('PerformanceObserver' in window) {
      // LCP 監控
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // FID 監控
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);

      // CLS 監控
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    }
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  public getMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.metrics.forEach((values, key) => {
      result[key] = [...values];
    });
    return result;
  }

  public getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  public reportMetrics(): void {
    // logger.info('Performance Metrics:', this.getMetrics());
    // logger.info('Average LCP:', this.getAverageMetric('lcp'));
    // logger.info('Average FID:', this.getAverageMetric('fid'));
    // logger.info('Average CLS:', this.getAverageMetric('cls'));
  }

  public disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// 全域性能監控實例
export const performanceMonitor = new PerformanceMonitor();

// 導出便捷函數
export const debounceSearch = debounce(
  (callback: () => void) => callback(),
  300
);
export const throttleScroll = throttle(
  (callback: () => void) => callback(),
  16
);
export const throttleResize = throttle(
  (callback: () => void) => callback(),
  100
);
