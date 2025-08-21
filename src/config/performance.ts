// 前端效能優化配置
export const PERFORMANCE_CONFIG = {
  // 圖片優化配置
  image: {
    // 支援的圖片格式
    supportedFormats: ['webp', 'avif', 'jpg', 'jpeg', 'png'],
    // 預設圖片品質
    defaultQuality: 0.8,
    // 響應式圖片斷點
    breakpoints: {
      small: 480,
      medium: 768,
      large: 1024,
      xlarge: 1440
    },
    // 懶加載配置
    lazyLoading: {
      threshold: 0.1,
      rootMargin: '50px'
    }
  },

  // 快取配置
  cache: {
    // 本地存儲配置
    localStorage: {
      maxSize: 10 * 1024 * 1024, // 10MB
      expirationTime: 24 * 60 * 60 * 1000 // 24小時
    },
    // 記憶體快取配置
    memoryCache: {
      maxSize: 100, // 最大快取項目數
      expirationTime: 5 * 60 * 1000 // 5分鐘
    }
  },

  // API 配置
  api: {
    // 請求超時時間
    timeout: 10000, // 10秒
    // 重試配置
    retry: {
      maxAttempts: 3,
      delay: 1000, // 1秒
      backoffMultiplier: 2
    },
    // 請求合併配置
    batch: {
      enabled: true,
      maxBatchSize: 10,
      maxDelay: 100 // 100ms
    }
  },

  // 渲染優化配置
  rendering: {
    // 虛擬化配置
    virtualization: {
      itemHeight: 60,
      overscan: 5
    },
    // 防抖配置
    debounce: {
      search: 300,
      resize: 150,
      scroll: 100
    },
    // 節流配置
    throttle: {
      scroll: 16, // 60fps
      resize: 100
    }
  },

  // 監控配置
  monitoring: {
    // 效能指標閾值
    thresholds: {
      fcp: 1500, // 首次內容繪製
      lcp: 2500, // 最大內容繪製
      fid: 100, // 首次輸入延遲
      cls: 0.1 // 累積佈局偏移
    },
    // 錯誤監控
    errorReporting: {
      enabled: true,
      sampleRate: 1.0 // 100% 採樣率
    }
  },

  // 離線配置
  offline: {
    // 離線存儲配置
    storage: {
      maxSize: 50 * 1024 * 1024, // 50MB
      priority: ['critical', 'important', 'normal']
    },
    // 同步配置
    sync: {
      enabled: true,
      interval: 5 * 60 * 1000, // 5分鐘
      maxRetries: 3
    }
  }
};

// 效能優化工具函數
export const PerformanceUtils = {
  // 圖片優化
  optimizeImage: (url: string, width: number, quality: number = 0.8): string => {
    // 根據設備像素比調整寬度
    const pixelRatio = window.devicePixelRatio || 1;
    const adjustedWidth = Math.round(width * pixelRatio);

    // 支援 WebP 格式
    const supportsWebP = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;

    const format = supportsWebP ? 'webp' : 'jpg';

    return `${url}?w=${adjustedWidth}&q=${quality}&fmt=${format}`;
  },

  // 響應式圖片
  getResponsiveImage: (url: string, sizes: string): string => {
    return `${url}?sizes=${sizes}`;
  },

  // 記憶體使用監控
  getMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  },

  // 效能指標測量
  measurePerformance: (name: string, fn: () => void): void => {
    const start = performance.now();
    fn();
    const end = performance.now();
    // logger.info(`${name} took ${end - start}ms`);
  },

  // 防抖函數
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // 節流函數
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // 懶加載檢查
  isInViewport: (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  },

  // 預加載資源
  preloadResource: (url: string, type: 'image' | 'script' | 'style'): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  },

  // 清理記憶體
  cleanupMemory: (): void => {
    // 清理事件監聽器
    // 清理定時器
    // 清理快取
    if ('memory' in performance) {
      // logger.info('Memory usage before cleanup:', (performance as any).memory.usedJSHeapSize);
    }
  }
};

// 效能監控類
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initObservers();
  }

  private initObservers(): void {
    // 監控 LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // 監控 FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);

      // 監控 CLS
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

// 全域效能監控實例
export const performanceMonitor = new PerformanceMonitor();
