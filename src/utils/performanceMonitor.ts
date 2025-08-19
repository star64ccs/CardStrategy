import { logger } from '@/utils/logger';

// 性能指標接口
export interface PerformanceMetrics {
  // 頁面加載指標
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };

  // 資源加載指標
  resources: {
    totalRequests: number;
    totalSize: number;
    loadTime: number;
    cacheHitRate: number;
  };

  // 內存使用指標
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    memoryUsage: number; // 百分比
  };

  // 網絡指標
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };

  // 用戶交互指標
  interaction: {
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
  };

  // 自定義指標
  custom: Map<string, number>;

  timestamp: Date;
}

// 性能監控配置
export interface PerformanceConfig {
  enableRealTimeMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  enableNetworkMonitoring: boolean;
  enableInteractionMonitoring: boolean;
  monitoringInterval: number;
  maxMetricsHistory: number;
  alertThresholds: {
    memoryUsage: number;
    pageLoadTime: number;
    firstInputDelay: number;
  };
}

// 默認配置
const DEFAULT_CONFIG: PerformanceConfig = {
  enableRealTimeMonitoring: true,
  enableMemoryMonitoring: true,
  enableNetworkMonitoring: true,
  enableInteractionMonitoring: true,
  monitoringInterval: 5000, // 5秒
  maxMetricsHistory: 100,
  alertThresholds: {
    memoryUsage: 80, // 80%
    pageLoadTime: 3000, // 3秒
    firstInputDelay: 100 // 100ms
  }
};

// 性能監控器類
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig;
  private metricsHistory: PerformanceMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private customMetrics: Map<string, number> = new Map();

  private constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.init();
  }

  public static getInstance(config?: Partial<PerformanceConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  // 初始化監控器
  private init(): void {
    if (this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }

    if (this.config.enableInteractionMonitoring) {
      this.setupInteractionMonitoring();
    }

    // 監聽頁面可見性變化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseMonitoring();
      } else {
        this.resumeMonitoring();
      }
    });
  }

  // 開始實時監控
  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      this.metricsHistory.push(metrics);

      // 限制歷史記錄大小
      if (this.metricsHistory.length > this.config.maxMetricsHistory) {
        this.metricsHistory.shift();
      }

      // 檢查警報閾值
      this.checkAlertThresholds(metrics);

      // 通知觀察者
      this.notifyObservers(metrics);
    }, this.config.monitoringInterval);
  }

  // 暫停監控
  private pauseMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // 恢復監控
  private resumeMonitoring(): void {
    if (!this.monitoringInterval && this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }
  }

  // 收集性能指標
  private collectMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      pageLoad: this.getPageLoadMetrics(),
      resources: this.getResourceMetrics(),
      memory: this.getMemoryMetrics(),
      network: this.getNetworkMetrics(),
      interaction: this.getInteractionMetrics(),
      custom: new Map(this.customMetrics),
      timestamp: new Date()
    };

    return metrics;
  }

  // 獲取頁面加載指標
  private getPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint()
    };
  }

  // 獲取資源指標
  private getResourceMetrics() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalRequests = resources.length;
    const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    const loadTime = resources.reduce((sum, resource) => sum + resource.duration, 0);

    // 計算緩存命中率
    const cacheHits = resources.filter(resource => resource.transferSize === 0).length;
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    return {
      totalRequests,
      totalSize,
      loadTime,
      cacheHitRate
    };
  }

  // 獲取內存指標
  private getMemoryMetrics() {
    if ('memory' in performance) {
      const {memory} = (performance as any);
      const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryUsage
      };
    }

    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      memoryUsage: 0
    };
  }

  // 獲取網絡指標
  private getNetworkMetrics() {
    if ('connection' in navigator) {
      const {connection} = (navigator as any);
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }

    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    };
  }

  // 獲取交互指標
  private getInteractionMetrics() {
    return {
      firstInputDelay: this.getFirstInputDelay(),
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
      totalBlockingTime: this.getTotalBlockingTime()
    };
  }

  // 設置交互監控
  private setupInteractionMonitoring(): void {
    // 監聽首次輸入延遲
    let firstInputRecorded = false;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input' && !firstInputRecorded) {
          firstInputRecorded = true;
          this.customMetrics.set('firstInputDelay', entry.processingStart - entry.startTime);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      logger.warn('First Input Delay 監控不可用:', error);
    }

    // 監聽佈局偏移
    const layoutObserver = new PerformanceObserver((list) => {
      let cumulativeLayoutShift = 0;
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          cumulativeLayoutShift += (entry as any).value;
        }
      }
      this.customMetrics.set('cumulativeLayoutShift', cumulativeLayoutShift);
    });

    try {
      layoutObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      logger.warn('Layout Shift 監控不可用:', error);
    }
  }

  // 獲取首次繪製時間
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  // 獲取首次內容繪製時間
  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  // 獲取最大內容繪製時間
  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lcp = lcpEntries[lcpEntries.length - 1];
    return lcp ? lcp.startTime : 0;
  }

  // 獲取首次輸入延遲
  private getFirstInputDelay(): number {
    return this.customMetrics.get('firstInputDelay') || 0;
  }

  // 獲取累積佈局偏移
  private getCumulativeLayoutShift(): number {
    return this.customMetrics.get('cumulativeLayoutShift') || 0;
  }

  // 獲取總阻塞時間
  private getTotalBlockingTime(): number {
    const longTasks = performance.getEntriesByType('long-task');
    return longTasks.reduce((total, task) => {
      return total + Math.max(0, task.duration - 50);
    }, 0);
  }

  // 檢查警報閾值
  private checkAlertThresholds(metrics: PerformanceMetrics): void {
    const { alertThresholds } = this.config;

    // 檢查內存使用
    if (metrics.memory.memoryUsage > alertThresholds.memoryUsage) {
      logger.warn('內存使用率過高:', {
        usage: `${metrics.memory.memoryUsage.toFixed(2)}%`,
        threshold: `${alertThresholds.memoryUsage}%`
      });
    }

    // 檢查頁面加載時間
    const pageLoadTime = metrics.pageLoad.loadComplete;
    if (pageLoadTime > alertThresholds.pageLoadTime) {
      logger.warn('頁面加載時間過長:', {
        loadTime: `${pageLoadTime.toFixed(2)}ms`,
        threshold: `${alertThresholds.pageLoadTime}ms`
      });
    }

    // 檢查首次輸入延遲
    const {firstInputDelay} = metrics.interaction;
    if (firstInputDelay > alertThresholds.firstInputDelay) {
      logger.warn('首次輸入延遲過高:', {
        delay: `${firstInputDelay.toFixed(2)}ms`,
        threshold: `${alertThresholds.firstInputDelay}ms`
      });
    }
  }

  // 添加觀察者
  public addObserver(observer: (metrics: PerformanceMetrics) => void): void {
    this.observers.add(observer);
  }

  // 移除觀察者
  public removeObserver(observer: (metrics: PerformanceMetrics) => void): void {
    this.observers.delete(observer);
  }

  // 通知觀察者
  private notifyObservers(metrics: PerformanceMetrics): void {
    this.observers.forEach(observer => {
      try {
        observer(metrics);
      } catch (error) {
        logger.error('通知性能觀察者失敗:', error);
      }
    });
  }

  // 添加自定義指標
  public addCustomMetric(name: string, value: number): void {
    this.customMetrics.set(name, value);
  }

  // 獲取當前指標
  public getCurrentMetrics(): PerformanceMetrics {
    return this.collectMetrics();
  }

  // 獲取指標歷史
  public getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  // 獲取平均指標
  public getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metricsHistory.length === 0) {
      return {};
    }

    const sum = this.metricsHistory.reduce((acc, metrics) => {
      return {
        pageLoad: {
          domContentLoaded: acc.pageLoad.domContentLoaded + metrics.pageLoad.domContentLoaded,
          loadComplete: acc.pageLoad.loadComplete + metrics.pageLoad.loadComplete,
          firstPaint: acc.pageLoad.firstPaint + metrics.pageLoad.firstPaint,
          firstContentfulPaint: acc.pageLoad.firstContentfulPaint + metrics.pageLoad.firstContentfulPaint,
          largestContentfulPaint: acc.pageLoad.largestContentfulPaint + metrics.pageLoad.largestContentfulPaint
        },
        resources: {
          totalRequests: acc.resources.totalRequests + metrics.resources.totalRequests,
          totalSize: acc.resources.totalSize + metrics.resources.totalSize,
          loadTime: acc.resources.loadTime + metrics.resources.loadTime,
          cacheHitRate: acc.resources.cacheHitRate + metrics.resources.cacheHitRate
        },
        memory: {
          usedJSHeapSize: acc.memory.usedJSHeapSize + metrics.memory.usedJSHeapSize,
          totalJSHeapSize: acc.memory.totalJSHeapSize + metrics.memory.totalJSHeapSize,
          jsHeapSizeLimit: acc.memory.jsHeapSizeLimit + metrics.memory.jsHeapSizeLimit,
          memoryUsage: acc.memory.memoryUsage + metrics.memory.memoryUsage
        },
        interaction: {
          firstInputDelay: acc.interaction.firstInputDelay + metrics.interaction.firstInputDelay,
          cumulativeLayoutShift: acc.interaction.cumulativeLayoutShift + metrics.interaction.cumulativeLayoutShift,
          totalBlockingTime: acc.interaction.totalBlockingTime + metrics.interaction.totalBlockingTime
        }
      };
    }, {
      pageLoad: { domContentLoaded: 0, loadComplete: 0, firstPaint: 0, firstContentfulPaint: 0, largestContentfulPaint: 0 },
      resources: { totalRequests: 0, totalSize: 0, loadTime: 0, cacheHitRate: 0 },
      memory: { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0, memoryUsage: 0 },
      interaction: { firstInputDelay: 0, cumulativeLayoutShift: 0, totalBlockingTime: 0 }
    });

    const count = this.metricsHistory.length;
    return {
      pageLoad: {
        domContentLoaded: sum.pageLoad.domContentLoaded / count,
        loadComplete: sum.pageLoad.loadComplete / count,
        firstPaint: sum.pageLoad.firstPaint / count,
        firstContentfulPaint: sum.pageLoad.firstContentfulPaint / count,
        largestContentfulPaint: sum.pageLoad.largestContentfulPaint / count
      },
      resources: {
        totalRequests: sum.resources.totalRequests / count,
        totalSize: sum.resources.totalSize / count,
        loadTime: sum.resources.loadTime / count,
        cacheHitRate: sum.resources.cacheHitRate / count
      },
      memory: {
        usedJSHeapSize: sum.memory.usedJSHeapSize / count,
        totalJSHeapSize: sum.memory.totalJSHeapSize / count,
        jsHeapSizeLimit: sum.memory.jsHeapSizeLimit / count,
        memoryUsage: sum.memory.memoryUsage / count
      },
      interaction: {
        firstInputDelay: sum.interaction.firstInputDelay / count,
        cumulativeLayoutShift: sum.interaction.cumulativeLayoutShift / count,
        totalBlockingTime: sum.interaction.totalBlockingTime / count
      }
    };
  }

  // 清理歷史數據
  public clearHistory(): void {
    this.metricsHistory = [];
    this.customMetrics.clear();
  }

  // 停止監控
  public stop(): void {
    this.pauseMonitoring();
    this.observers.clear();
    this.clearHistory();
  }
}

// 導出單例實例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 性能測量工具函數
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  const duration = end - start;
  performanceMonitor.addCustomMetric(name, duration);

  logger.debug(`性能測量 [${name}]:`, { duration: `${duration.toFixed(2)}ms` });

  return result;
};

// 異步性能測量工具函數
export const measureAsyncPerformance = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  const duration = end - start;
  performanceMonitor.addCustomMetric(name, duration);

  logger.debug(`異步性能測量 [${name}]:`, { duration: `${duration.toFixed(2)}ms` });

  return result;
};
