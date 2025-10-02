/**
 * 性能監控器
 * 實時監控應用性能指標和用戶體驗
 */

import { logger } from '../../utils/logger';

export interface PerformanceConfig {
  enabled: boolean;
  samplingRate: number;
  enableWebVitals: boolean;
  enableResourceTiming: boolean;
  enableNavigationTiming: boolean;
  enableUserTiming: boolean;
  enableMemoryMonitoring: boolean;
  reportInterval: number;
  maxSamples: number;
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  delta?: number;
}

export interface ResourceTiming {
  name: string;
  startTime: number;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  initiatorType: string;
  nextHopProtocol: string;
}

export interface NavigationTiming {
  loadEventEnd: number;
  loadEventStart: number;
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  responseEnd: number;
  responseStart: number;
  requestStart: number;
  navigationStart: number;
  connectEnd: number;
  connectStart: number;
  domainLookupEnd: number;
  domainLookupStart: number;
}

export interface UserTiming {
  name: string;
  startTime: number;
  duration: number;
  entryType: 'measure' | 'mark';
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface PerformanceReport {
  timestamp: number;
  webVitals: WebVital[];
  resourceTimings: ResourceTiming[];
  navigationTiming: NavigationTiming | null;
  userTimings: UserTiming[];
  memoryInfo: MemoryInfo | null;
  customMetrics: Record<string, number>;
}

export interface PerformanceStats {
  totalReports: number;
  averageWebVitals: Record<string, number>;
  slowResources: ResourceTiming[];
  memoryLeaks: number;
  performanceScore: number;
  lastReport: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig;
  private webVitals: Map<string, WebVital[]> = new Map();
  private resourceTimings: ResourceTiming[] = [];
  private userTimings: UserTiming[] = [];
  private memoryHistory: MemoryInfo[] = [];
  private reports: PerformanceReport[] = [];
  private stats: PerformanceStats;
  private isInitialized: boolean = false;
  private observer: PerformanceObserver | null = null;

  private constructor(config: PerformanceConfig) {
    this.config = {
      samplingRate: 1.0,
      enableWebVitals: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
      enableUserTiming: true,
      enableMemoryMonitoring: true,
      reportInterval: 30000, // 30秒
      maxSamples: 1000,
      ...config,
    };

    this.stats = {
      totalReports: 0,
      averageWebVitals: {},
      slowResources: [],
      memoryLeaks: 0,
      performanceScore: 0,
      lastReport: 0,
    };
  }

  public static getInstance(config?: PerformanceConfig): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      if (!config) {
        throw new Error(
          'Performance monitor configuration is required for first initialization'
        );
      }
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 初始化性能監控
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.config.enabled) {
        await this.setupPerformanceObservers();
        this.startPeriodicMonitoring();
      }

      this.isInitialized = true;
      logger.info('Performance monitor initialized successfully', {
        enabled: this.config.enabled,
        webVitals: this.config.enableWebVitals,
        resourceTiming: this.config.enableResourceTiming,
        memoryMonitoring: this.config.enableMemoryMonitoring,
      });
    } catch (error) {
      logger.error('Failed to initialize performance monitor', error);
      throw error;
    }
  }

  /**
   * 記錄自定義指標
   */
  public recordCustomMetric(name: string, value: number): void {
    if (!this.config.enabled || Math.random() > this.config.samplingRate) {
      return;
    }

    try {
      // 這裡可以將自定義指標存儲到報告中
      logger.debug('Custom metric recorded', { name, value });
    } catch (error) {
      logger.error('Failed to record custom metric', { name, value, error });
    }
  }

  /**
   * 標記用戶時間
   */
  public mark(name: string): void {
    if (!this.config.enabled || !this.config.enableUserTiming) {
      return;
    }

    try {
      // 在瀏覽器環境中，使用 performance.mark
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(name);
      }

      const userTiming: UserTiming = {
        name,
        startTime: Date.now(),
        duration: 0,
        entryType: 'mark',
      };

      this.userTimings.push(userTiming);
      this.limitArraySize(this.userTimings);

      logger.debug('Performance mark recorded', { name });
    } catch (error) {
      logger.error('Failed to record performance mark', { name, error });
    }
  }

  /**
   * 測量用戶時間
   */
  public measure(name: string, startMark?: string, endMark?: string): void {
    if (!this.config.enabled || !this.config.enableUserTiming) {
      return;
    }

    try {
      const startTime = startMark ? this.getMarkTime(startMark) : Date.now();
      const endTime = endMark ? this.getMarkTime(endMark) : Date.now();
      const duration = endTime - startTime;

      // 在瀏覽器環境中，使用 performance.measure
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.measure(name, startMark, endMark);
      }

      const userTiming: UserTiming = {
        name,
        startTime,
        duration,
        entryType: 'measure',
      };

      this.userTimings.push(userTiming);
      this.limitArraySize(this.userTimings);

      logger.debug('Performance measure recorded', { name, duration });
    } catch (error) {
      logger.error('Failed to record performance measure', { name, error });
    }
  }

  /**
   * 獲取性能統計
   */
  public getStats(): PerformanceStats {
    this.calculatePerformanceScore();
    this.updateAverageWebVitals();
    this.identifySlowResources();
    this.detectMemoryLeaks();

    return { ...this.stats };
  }

  /**
   * 獲取最新報告
   */
  public getLatestReport(): PerformanceReport | null {
    return this.reports.length > 0
      ? this.reports[this.reports.length - 1]
      : null;
  }

  /**
   * 獲取報告歷史
   */
  public getReportHistory(count: number = 10): PerformanceReport[] {
    return this.reports.slice(-count);
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const stats = this.getStats();
      const healthy = stats.performanceScore >= 70 && stats.memoryLeaks === 0;

      return {
        healthy,
        details: {
          initialized: this.isInitialized,
          config: {
            enabled: this.config.enabled,
            webVitals: this.config.enableWebVitals,
            resourceTiming: this.config.enableResourceTiming,
            memoryMonitoring: this.config.enableMemoryMonitoring,
          },
          stats,
          reportsCount: this.reports.length,
          webVitalsCount: Array.from(this.webVitals.values()).reduce(
            (sum, arr) => sum + arr.length,
            0
          ),
          resourceTimingsCount: this.resourceTimings.length,
          userTimingsCount: this.userTimings.length,
          memoryHistoryCount: this.memoryHistory.length,
        },
      };
    } catch (error) {
      logger.error('Performance monitor health check failed', error);
      return {
        healthy: false,
        details: {
          initialized: this.isInitialized,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async setupPerformanceObservers(): Promise<void> {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      logger.warn(
        'PerformanceObserver not available, using fallback monitoring'
      );
      return;
    }

    try {
      // Web Vitals 觀察器
      if (this.config.enableWebVitals) {
        this.observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.handleWebVitalEntry(entry);
          }
        });

        this.observer.observe({
          entryTypes: [
            'largest-contentful-paint',
            'first-input',
            'layout-shift',
          ],
        });
      }

      // 資源計時觀察器
      if (this.config.enableResourceTiming) {
        const resourceObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.handleResourceEntry(entry as PerformanceResourceTiming);
          }
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
      }

      // 導航計時觀察器
      if (this.config.enableNavigationTiming) {
        const navObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.handleNavigationEntry(entry as PerformanceNavigationTiming);
          }
        });

        navObserver.observe({ entryTypes: ['navigation'] });
      }

      logger.info('Performance observers setup completed');
    } catch (error) {
      logger.error('Failed to setup performance observers', error);
    }
  }

  private handleWebVitalEntry(entry: PerformanceEntry): void {
    try {
      let webVital: WebVital | null = null;

      switch (entry.entryType) {
        case 'largest-contentful-paint':
          webVital = {
            name: 'LCP',
            value: entry.startTime,
            rating: this.getLCPRating(entry.startTime),
            timestamp: Date.now(),
          };
          break;
        case 'first-input':
          const fiEntry = entry as PerformanceEventTiming;
          webVital = {
            name: 'FID',
            value: fiEntry.processingStart - fiEntry.startTime,
            rating: this.getFIDRating(
              fiEntry.processingStart - fiEntry.startTime
            ),
            timestamp: Date.now(),
          };
          break;
        case 'layout-shift':
          const lsEntry = entry as PerformanceEventTiming;
          webVital = {
            name: 'CLS',
            value: lsEntry.value,
            rating: this.getCLSRating(lsEntry.value),
            timestamp: Date.now(),
          };
          break;
      }

      if (webVital) {
        if (!this.webVitals.has(webVital.name)) {
          this.webVitals.set(webVital.name, []);
        }

        this.webVitals.get(webVital.name)!.push(webVital);
        this.limitArraySize(this.webVitals.get(webVital.name)!);

        logger.debug('Web vital recorded', webVital);
      }
    } catch (error) {
      logger.error('Failed to handle web vital entry', {
        entryType: entry.entryType,
        error,
      });
    }
  }

  private handleResourceEntry(entry: PerformanceResourceTiming): void {
    try {
      const resourceTiming: ResourceTiming = {
        name: entry.name,
        startTime: entry.startTime,
        duration: entry.duration,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        initiatorType: entry.initiatorType,
        nextHopProtocol: entry.nextHopProtocol,
      };

      this.resourceTimings.push(resourceTiming);
      this.limitArraySize(this.resourceTimings);

      logger.debug('Resource timing recorded', {
        name: resourceTiming.name,
        duration: resourceTiming.duration,
        size: resourceTiming.transferSize,
      });
    } catch (error) {
      logger.error('Failed to handle resource entry', {
        name: entry.name,
        error,
      });
    }
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    try {
      const navigationTiming: NavigationTiming = {
        loadEventEnd: entry.loadEventEnd,
        loadEventStart: entry.loadEventStart,
        domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
        domContentLoadedEventStart: entry.domContentLoadedEventStart,
        responseEnd: entry.responseEnd,
        responseStart: entry.responseStart,
        requestStart: entry.requestStart,
        navigationStart: entry.navigationStart,
        connectEnd: entry.connectEnd,
        connectStart: entry.connectStart,
        domainLookupEnd: entry.domainLookupEnd,
        domainLookupStart: entry.domainLookupStart,
      };

      // 存儲最新的導航計時
      // 這裡可以存儲到 reports 或單獨的導航計時數組

      logger.debug('Navigation timing recorded', {
        loadTime: entry.loadEventEnd - entry.navigationStart,
        domContentLoadedTime:
          entry.domContentLoadedEventEnd - entry.navigationStart,
      });
    } catch (error) {
      logger.error('Failed to handle navigation entry', error);
    }
  }

  private startPeriodicMonitoring(): void {
    // 定期收集內存信息
    if (this.config.enableMemoryMonitoring) {
      setInterval(() => {
        this.collectMemoryInfo();
      }, 5000); // 每5秒收集一次
    }

    // 定期生成報告
    setInterval(() => {
      this.generateReport();
    }, this.config.reportInterval);
  }

  private collectMemoryInfo(): void {
    try {
      // 在瀏覽器環境中收集內存信息
      if (
        typeof window !== 'undefined' &&
        (window as any).performance?.memory
      ) {
        const memory = (window as any).performance.memory;

        const memoryInfo: MemoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now(),
        };

        this.memoryHistory.push(memoryInfo);
        this.limitArraySize(this.memoryHistory);

        logger.debug('Memory info collected', {
          used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024),
        });
      }
    } catch (error) {
      logger.error('Failed to collect memory info', error);
    }
  }

  private generateReport(): void {
    try {
      const report: PerformanceReport = {
        timestamp: Date.now(),
        webVitals: this.getLatestWebVitals(),
        resourceTimings: this.getLatestResourceTimings(),
        navigationTiming: this.getLatestNavigationTiming(),
        userTimings: this.getLatestUserTimings(),
        memoryInfo: this.getLatestMemoryInfo(),
        customMetrics: {},
      };

      this.reports.push(report);
      this.limitArraySize(this.reports);
      this.stats.totalReports++;
      this.stats.lastReport = report.timestamp;

      logger.debug('Performance report generated', {
        webVitals: report.webVitals.length,
        resourceTimings: report.resourceTimings.length,
        userTimings: report.userTimings.length,
      });
    } catch (error) {
      logger.error('Failed to generate performance report', error);
    }
  }

  private getLatestWebVitals(): WebVital[] {
    const latest: WebVital[] = [];

    for (const [name, vitals] of this.webVitals.entries()) {
      if (vitals.length > 0) {
        latest.push(vitals[vitals.length - 1]);
      }
    }

    return latest;
  }

  private getLatestResourceTimings(): ResourceTiming[] {
    return this.resourceTimings.slice(-50); // 返回最新的50個資源計時
  }

  private getLatestNavigationTiming(): NavigationTiming | null {
    // 這裡可以從 reports 或單獨的導航計時數組中獲取
    return null;
  }

  private getLatestUserTimings(): UserTiming[] {
    return this.userTimings.slice(-100); // 返回最新的100個用戶計時
  }

  private getLatestMemoryInfo(): MemoryInfo | null {
    return this.memoryHistory.length > 0
      ? this.memoryHistory[this.memoryHistory.length - 1]
      : null;
  }

  private calculatePerformanceScore(): void {
    const webVitals = this.getLatestWebVitals();
    let score = 100;

    for (const vital of webVitals) {
      switch (vital.rating) {
        case 'poor':
          score -= 20;
          break;
        case 'needs-improvement':
          score -= 10;
          break;
        case 'good':
          // 不扣分
          break;
      }
    }

    this.stats.performanceScore = Math.max(0, score);
  }

  private updateAverageWebVitals(): void {
    this.stats.averageWebVitals = {};

    for (const [name, vitals] of this.webVitals.entries()) {
      if (vitals.length > 0) {
        const average =
          vitals.reduce((sum, vital) => sum + vital.value, 0) / vitals.length;
        this.stats.averageWebVitals[name] = average;
      }
    }
  }

  private identifySlowResources(): void {
    const slowThreshold = 1000; // 1秒
    this.stats.slowResources = this.resourceTimings.filter(
      timing => timing.duration > slowThreshold
    );
  }

  private detectMemoryLeaks(): void {
    if (this.memoryHistory.length < 10) {
      return;
    }

    const recent = this.memoryHistory.slice(-10);
    const trend = this.calculateMemoryTrend(recent);

    // 如果內存使用持續增長，可能存在內存洩漏
    if (trend > 0.1) {
      // 10% 增長率
      this.stats.memoryLeaks++;
    }
  }

  private calculateMemoryTrend(memoryHistory: MemoryInfo[]): number {
    if (memoryHistory.length < 2) {
      return 0;
    }

    const first = memoryHistory[0];
    const last = memoryHistory[memoryHistory.length - 1];

    return (last.usedJSHeapSize - first.usedJSHeapSize) / first.usedJSHeapSize;
  }

  private getLCPRating(value: number): WebVital['rating'] {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): WebVital['rating'] {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getCLSRating(value: number): WebVital['rating'] {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getMarkTime(markName: string): number {
    // 在實際實現中，這裡應該從 performance.getEntriesByName 獲取標記時間
    return Date.now();
  }

  private limitArraySize<T>(array: T[]): void {
    if (array.length > this.config.maxSamples) {
      array.splice(0, array.length - this.config.maxSamples);
    }
  }
}

export default PerformanceMonitor;
