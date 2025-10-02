// 前端效能優化Configure
export const _PERFORMANCE_CONFIG = {
  // Graph片優化Configure
  image: {
    // 支援的Graph片格式
    supportedFormats: ['webp', 'avif', 'jpg', 'jpeg', 'png'],
    // 預設Graph片品質
    defaultQuality: 0.8,
    // Response式Graph片斷點
    breakpoints: {
      small: 480,
      medium: 768,
      large: 1024,
      xlarge: 1440,
    },
    // 懶加載Configure
    lazyLoading: {
      threshold: 0.1,
      rootMargin: '50px',
    },
  },

  // 快取Configure
  cache: {
    // LocalStorageConfigure
    localStorage: {
      maxSize: 10 * 1024 * 1024, // 10MB
      expirationTime: 24 * 60 * 60 * 1000, // 24Hour
    },
    // 記憶體快取Configure
    memoryCache: {
      maxSize: 100, // 最大快取項目數
      expirationTime: 5 * 60 * 1000, // 5Minute
    },
  },

  // API Configure
  api: {
    // Request超時Time
    timeout: 10000, // 10Second
    // RetryConfigure
    retry: {
      maxAttempts: 3,
      delay: 1000, // 1Second
      backoffMultiplier: 2,
    },
    // RequestMergeConfigure
    batch: {
      enabled: true,
      maxBatchSize: 10,
      maxDelay: 100, // 100ms
    },
  },

  // 渲染優化Configure
  rendering: {
    // 虛擬化Configure
    virtualization: {
      itemHeight: 60,
      overscan: 5,
    },
    // 防抖Configure
    debounce: {
      search: 300,
      resize: 150,
      scroll: 100,
    },
    // 節流Configure
    throttle: {
      scroll: 16, // 60fps
      resize: 100,
    },
  },

  // MonitorConfigure
  monitoring: {
    // 效能指標閾Value
    thresholds: {
      fcp: 1500, // 首次Content繪製
      lcp: 2500, // 最大Content繪製
      fid: 100, // 首次Input延遲
      cls: 0.1, // 累積佈局Offset
    },
    // ErrorMonitor
    errorReporting: {
      enabled: true,
      sampleRate: 1.0, // 100% 採樣率
    },
  },

  // 離線Configure
  offline: {
    // 離線StorageConfigure
    storage: {
      maxSize: 50 * 1024 * 1024, // 50MB
      priority: ['critical', 'important', 'normal'],
    },
    // SyncConfigure
    sync: {
      enabled: true,
      interval: 5 * 60 * 1000, // 5Minute
      maxRetries: 3,
    },
  },
};

// 效能優化ToolFunction
export const _PerformanceUtils = {
  // Graph片優化
  optimizeImage: (url: string, width: number, quality = 0.8): string => {
    // Root據設備像素比調整寬度
    const _pixelRatio = window.devicePixelRatio || 1;
    const _adjustedWidth = Math.round(width * pixelRatio);

    // 支援 WebP 格式
    const _supportsWebP = document
      .createElement('canvas')
      .toDataURL('image/webp')
      .startsWith('data:image/webp');

    const _format = supportsWebP ? 'webp' : 'jpg';

    return `${url}?w=${adjustedWidth}&q=${quality}&fmt=${format}`;
  },

  // Response式Graph片
  getResponsiveImage: (url: string, sizes: string): string => {
    return `${url}?sizes=${sizes}`;
  },

  // 記憶體使用Monitor
  getMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  },

  // 效能指標測量
  measurePerformance: (name: string, fn: () => void): void => {
    const _start = performance.now();
    fn();
    const _end = performance.now();
    // logger.info(`${name} took ${end - start}ms`);
  },

  // 防抖Function
  debounce: <T extends (...args: unknown[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // 節流Function
  throttle: <T extends (...args: unknown[]) => any>(
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

  // 懶加載Check
  isInViewport: (element: Element): boolean => {
    const _rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  },

  // 預加載Resource
  preloadResource: (url: string, type: 'image' | 'script' | 'style'): void => {
    const _link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  },

  // 清理記憶體
  cleanupMemory: (): void => {
    // 清理Event監聽器
    // 清理定時器
    // 清理快取
    if ('memory' in performance) {
      // logger.info('Memory usage before cleanup:', (performance as any).memory.usedJSHeapSize);
    }
  },
};

// 效能MonitorClass
export class PerformanceMonitor {
  private readonly metrics: Map<string, number[]> = new Map();
  private readonly observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initObservers();
  }

  private initObservers(): void {
    // Monitor LCP
    if ('PerformanceObserver' in window) {
      const _lcpObserver = new PerformanceObserver(list => {
        const _entries = list.getEntries();
        const _lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // Monitor FID
      const _fidObserver = new PerformanceObserver(list => {
        const _entries = list.getEntries();
        entries.forEach(entry => {
          const _processingStart =
            (entry as any).processingStart || entry.startTime;
          this.recordMetric('fid', processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);

      // Monitor CLS
      const _clsObserver = new PerformanceObserver(list => {
        let clsValue = 0;
        const _entries = list.getEntries();
        entries.forEach((entry: unknown) => {
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
    this.metrics.get(name).push(value);
  }

  public getMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.metrics.forEach((values, key) => {
      result[key] = [...values];
    });
    return result;
  }

  public getAverageMetric(name: string): number {
    const _values = this.metrics.get(name);
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
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// 全域效能MonitorInstance
export const _performanceMonitor = new PerformanceMonitor();
