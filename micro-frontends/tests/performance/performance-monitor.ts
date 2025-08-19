import { Page } from '@playwright/test';

// 性能指標接口
export interface PerformanceMetrics {
  // 頁面加載指標
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    timeToInteractive: number;
  };
  // 資源加載指標
  resourceLoad: {
    totalResources: number;
    totalSize: number;
    averageLoadTime: number;
    slowestResource: string;
    slowestLoadTime: number;
  };
  // 內存使用指標
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    memoryGrowth: number;
  };
  // API 性能指標
  apiPerformance: {
    totalRequests: number;
    averageResponseTime: number;
    slowestEndpoint: string;
    slowestResponseTime: number;
    errorRate: number;
  };
  // 渲染性能指標
  rendering: {
    frameRate: number;
    droppedFrames: number;
    animationSmoothness: number;
  };
  // 用戶交互指標
  userInteraction: {
    totalInteractions: number;
    averageInteractionTime: number;
    slowestInteraction: string;
    slowestInteractionTime: number;
  };
}

// 性能監控配置
export interface PerformanceMonitorConfig {
  enableRealTimeMonitoring: boolean;
  collectInterval: number; // 毫秒
  maxDataPoints: number;
  enableAlerts: boolean;
  alertThresholds: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
    frameRate: number;
  };
}

// 性能警報接口
export interface PerformanceAlert {
  type: 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

// 性能數據點
export interface PerformanceDataPoint {
  timestamp: number;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
}

/**
 * 性能監控器類
 * 用於實時監控和收集應用性能指標
 */
export class PerformanceMonitor {
  private page: Page;
  private config: PerformanceMonitorConfig;
  private dataPoints: PerformanceDataPoint[] = [];
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  // 性能基準
  private readonly PERFORMANCE_BENCHMARKS = {
    pageLoad: {
      domContentLoaded: 1500,
      loadComplete: 2500,
      firstContentfulPaint: 1000,
      largestContentfulPaint: 2000,
      firstInputDelay: 100,
      timeToInteractive: 3000
    },
    memoryUsage: {
      maxMemoryGrowth: 100, // MB
      maxMemoryUsage: 512   // MB
    },
    apiPerformance: {
      maxResponseTime: 2000, // ms
      maxErrorRate: 0.05     // 5%
    },
    rendering: {
      minFrameRate: 30,      // FPS
      maxDroppedFrames: 10   // 幀數
    }
  };

  constructor(page: Page, config: Partial<PerformanceMonitorConfig> = {}) {
    this.page = page;
    this.config = {
      enableRealTimeMonitoring: true,
      collectInterval: 5000, // 5秒
      maxDataPoints: 100,
      enableAlerts: true,
      alertThresholds: {
        responseTime: 2000,
        memoryUsage: 512,
        errorRate: 0.05,
        frameRate: 30
      },
      ...config
    };
  }

  /**
   * 開始性能監控
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.warn('性能監控已經在運行中');
      return;
    }

    console.log('🚀 開始性能監控...');
    this.isMonitoring = true;

    // 設置性能監控腳本
    await this.setupPerformanceScripts();

    // 開始定期收集數據
    if (this.config.enableRealTimeMonitoring) {
      this.monitoringInterval = setInterval(async () => {
        await this.collectPerformanceData();
      }, this.config.collectInterval);
    }
  }

  /**
   * 停止性能監控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('🛑 停止性能監控...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * 設置性能監控腳本
   */
  private async setupPerformanceScripts(): Promise<void> {
    await this.page.addInitScript(() => {
      // 全局性能監控變數
      (window as any).performanceMonitor = {
        metrics: {},
        alerts: [],
        startTime: Date.now(),
        interactionCount: 0,
        interactionTimes: [],
        apiRequests: [],
        frameRates: [],
        memorySnapshots: []
      };

      // 監控 Web Vitals
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            (window as any).performanceMonitor.metrics[entry.name] = entry.startTime;
          }
        });
        observer.observe({
          entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
        });
      }

      // 監控 API 請求
      const originalFetch = window.fetch;
      window.fetch = async (url: string, options?: RequestInit) => {
        const startTime = performance.now();
        try {
          const response = await originalFetch(url, options);
          const endTime = performance.now();
          const duration = endTime - startTime;

          (window as any).performanceMonitor.apiRequests.push({
            url,
            duration,
            status: response.status,
            timestamp: Date.now()
          });

          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;

          (window as any).performanceMonitor.apiRequests.push({
            url,
            duration,
            status: 'error',
            error: error.message,
            timestamp: Date.now()
          });

          throw error;
        }
      };

      // 監控用戶交互
      document.addEventListener('click', (event) => {
        const startTime = performance.now();
        (window as any).performanceMonitor.interactionCount++;

        setTimeout(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          (window as any).performanceMonitor.interactionTimes.push({
            type: 'click',
            target: (event.target as HTMLElement).tagName,
            duration,
            timestamp: Date.now()
          });
        }, 0);
      });

      // 監控幀率
      let frameCount = 0;
      let lastTime = performance.now();

      const measureFrameRate = () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
          const fps = frameCount * 1000 / (currentTime - lastTime);
          (window as any).performanceMonitor.frameRates.push({
            fps,
            timestamp: Date.now()
          });
          frameCount = 0;
          lastTime = currentTime;
        }

        requestAnimationFrame(measureFrameRate);
      };

      requestAnimationFrame(measureFrameRate);

      // 定期收集內存快照
      setInterval(() => {
        if ('memory' in performance) {
          (window as any).performanceMonitor.memorySnapshots.push({
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            timestamp: Date.now()
          });
        }
      }, 10000); // 每10秒收集一次
    });
  }

  /**
   * 收集性能數據
   */
  private async collectPerformanceData(): Promise<void> {
    try {
      const metrics = await this.getCurrentMetrics();
      const alerts = this.checkPerformanceAlerts(metrics);

      const dataPoint: PerformanceDataPoint = {
        timestamp: Date.now(),
        metrics,
        alerts
      };

      this.dataPoints.push(dataPoint);
      this.alerts.push(...alerts);

      // 限制數據點數量
      if (this.dataPoints.length > this.config.maxDataPoints) {
        this.dataPoints.shift();
      }

      // 輸出警報
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          console.warn(`⚠️ 性能警報 [${alert.type.toUpperCase()}]: ${alert.message}`);
        });
      }

    } catch (error) {
      console.error('收集性能數據失敗:', error);
    }
  }

  /**
   * 獲取當前性能指標
   */
  private async getCurrentMetrics(): Promise<PerformanceMetrics> {
    return await this.page.evaluate(() => {
      const monitor = (window as any).performanceMonitor;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const fidEntries = performance.getEntriesByType('first-input');
      const resources = performance.getEntriesByType('resource');

      // 計算資源加載指標
      const totalSize = resources.reduce((sum: number, resource: any) => sum + (resource.transferSize || 0), 0);
      const averageLoadTime = resources.reduce((sum: number, resource: any) => sum + resource.duration, 0) / resources.length;
      const slowestResource = resources.reduce((slowest: any, resource: any) =>
        (resource.duration > slowest.duration ? resource : slowest), resources[0]);

      // 計算 API 性能指標
      const apiRequests = monitor.apiRequests || [];
      const totalRequests = apiRequests.length;
      const averageResponseTime = apiRequests.reduce((sum: number, req: any) => sum + req.duration, 0) / totalRequests;
      const slowestEndpoint = apiRequests.reduce((slowest: any, req: any) =>
        (req.duration > slowest.duration ? req : slowest), apiRequests[0]);
      const errorRate = apiRequests.filter((req: any) => req.status >= 400).length / totalRequests;

      // 計算渲染性能指標
      const frameRates = monitor.frameRates || [];
      const recentFrameRates = frameRates.slice(-10); // 最近10個數據點
      const averageFrameRate = recentFrameRates.reduce((sum: number, fr: any) => sum + fr.fps, 0) / recentFrameRates.length;

      // 計算用戶交互指標
      const interactionTimes = monitor.interactionTimes || [];
      const totalInteractions = interactionTimes.length;
      const averageInteractionTime = interactionTimes.reduce((sum: number, interaction: any) => sum + interaction.duration, 0) / totalInteractions;
      const slowestInteraction = interactionTimes.reduce((slowest: any, interaction: any) =>
        (interaction.duration > slowest.duration ? interaction : slowest), interactionTimes[0]);

      // 獲取內存使用情況
      const memorySnapshots = monitor.memorySnapshots || [];
      const latestMemory = memorySnapshots[memorySnapshots.length - 1] || {};

      return {
        pageLoad: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0,
          firstInputDelay: fidEntries.length > 0 ? fidEntries[0].processingStart - fidEntries[0].startTime : 0,
          timeToInteractive: 0 // 需要額外計算
        },
        resourceLoad: {
          totalResources: resources.length,
          totalSize,
          averageLoadTime,
          slowestResource: slowestResource?.name || '',
          slowestLoadTime: slowestResource?.duration || 0
        },
        memoryUsage: {
          usedJSHeapSize: latestMemory.usedJSHeapSize || 0,
          totalJSHeapSize: latestMemory.totalJSHeapSize || 0,
          jsHeapSizeLimit: latestMemory.jsHeapSizeLimit || 0,
          memoryGrowth: 0 // 需要計算
        },
        apiPerformance: {
          totalRequests,
          averageResponseTime,
          slowestEndpoint: slowestEndpoint?.url || '',
          slowestResponseTime: slowestEndpoint?.duration || 0,
          errorRate
        },
        rendering: {
          frameRate: averageFrameRate,
          droppedFrames: 0, // 需要額外計算
          animationSmoothness: 0.95 // 默認值
        },
        userInteraction: {
          totalInteractions,
          averageInteractionTime,
          slowestInteraction: slowestInteraction?.type || '',
          slowestInteractionTime: slowestInteraction?.duration || 0
        }
      };
    });
  }

  /**
   * 檢查性能警報
   */
  private checkPerformanceAlerts(metrics: PerformanceMetrics): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    const timestamp = Date.now();

    // 檢查頁面加載性能
    if (metrics.pageLoad.domContentLoaded > this.PERFORMANCE_BENCHMARKS.pageLoad.domContentLoaded) {
      alerts.push({
        type: 'warning',
        metric: 'domContentLoaded',
        value: metrics.pageLoad.domContentLoaded,
        threshold: this.PERFORMANCE_BENCHMARKS.pageLoad.domContentLoaded,
        timestamp,
        message: `DOM 內容加載時間過長: ${metrics.pageLoad.domContentLoaded}ms`
      });
    }

    if (metrics.pageLoad.largestContentfulPaint > this.PERFORMANCE_BENCHMARKS.pageLoad.largestContentfulPaint) {
      alerts.push({
        type: 'error',
        metric: 'largestContentfulPaint',
        value: metrics.pageLoad.largestContentfulPaint,
        threshold: this.PERFORMANCE_BENCHMARKS.pageLoad.largestContentfulPaint,
        timestamp,
        message: `最大內容繪製時間過長: ${metrics.pageLoad.largestContentfulPaint}ms`
      });
    }

    // 檢查內存使用
    const memoryUsageMB = metrics.memoryUsage.usedJSHeapSize / (1024 * 1024);
    if (memoryUsageMB > this.PERFORMANCE_BENCHMARKS.memoryUsage.maxMemoryUsage) {
      alerts.push({
        type: 'critical',
        metric: 'memoryUsage',
        value: memoryUsageMB,
        threshold: this.PERFORMANCE_BENCHMARKS.memoryUsage.maxMemoryUsage,
        timestamp,
        message: `內存使用過高: ${memoryUsageMB.toFixed(2)}MB`
      });
    }

    // 檢查 API 性能
    if (metrics.apiPerformance.averageResponseTime > this.PERFORMANCE_BENCHMARKS.apiPerformance.maxResponseTime) {
      alerts.push({
        type: 'warning',
        metric: 'apiResponseTime',
        value: metrics.apiPerformance.averageResponseTime,
        threshold: this.PERFORMANCE_BENCHMARKS.apiPerformance.maxResponseTime,
        timestamp,
        message: `API 平均響應時間過長: ${metrics.apiPerformance.averageResponseTime.toFixed(2)}ms`
      });
    }

    if (metrics.apiPerformance.errorRate > this.PERFORMANCE_BENCHMARKS.apiPerformance.maxErrorRate) {
      alerts.push({
        type: 'error',
        metric: 'apiErrorRate',
        value: metrics.apiPerformance.errorRate,
        threshold: this.PERFORMANCE_BENCHMARKS.apiPerformance.maxErrorRate,
        timestamp,
        message: `API 錯誤率過高: ${(metrics.apiPerformance.errorRate * 100).toFixed(2)}%`
      });
    }

    // 檢查渲染性能
    if (metrics.rendering.frameRate < this.PERFORMANCE_BENCHMARKS.rendering.minFrameRate) {
      alerts.push({
        type: 'warning',
        metric: 'frameRate',
        value: metrics.rendering.frameRate,
        threshold: this.PERFORMANCE_BENCHMARKS.rendering.minFrameRate,
        timestamp,
        message: `幀率過低: ${metrics.rendering.frameRate.toFixed(2)} FPS`
      });
    }

    return alerts;
  }

  /**
   * 獲取性能報告
   */
  getPerformanceReport(): {
    summary: {
      totalDataPoints: number;
      totalAlerts: number;
      monitoringDuration: number;
      averageMetrics: Partial<PerformanceMetrics>;
    };
    dataPoints: PerformanceDataPoint[];
    alerts: PerformanceAlert[];
    recommendations: string[];
    } {
    const totalDataPoints = this.dataPoints.length;
    const totalAlerts = this.alerts.length;
    const monitoringDuration = totalDataPoints > 0 ?
      this.dataPoints[totalDataPoints - 1].timestamp - this.dataPoints[0].timestamp : 0;

    // 計算平均指標
    const averageMetrics: Partial<PerformanceMetrics> = {};
    if (totalDataPoints > 0) {
      const sumMetrics = this.dataPoints.reduce((sum, point) => {
        return {
          pageLoad: {
            domContentLoaded: sum.pageLoad?.domContentLoaded || 0 + point.metrics.pageLoad.domContentLoaded,
            loadComplete: sum.pageLoad?.loadComplete || 0 + point.metrics.pageLoad.loadComplete,
            firstContentfulPaint: sum.pageLoad?.firstContentfulPaint || 0 + point.metrics.pageLoad.firstContentfulPaint,
            largestContentfulPaint: sum.pageLoad?.largestContentfulPaint || 0 + point.metrics.pageLoad.largestContentfulPaint,
            firstInputDelay: sum.pageLoad?.firstInputDelay || 0 + point.metrics.pageLoad.firstInputDelay,
            timeToInteractive: sum.pageLoad?.timeToInteractive || 0 + point.metrics.pageLoad.timeToInteractive
          },
          apiPerformance: {
            totalRequests: sum.apiPerformance?.totalRequests || 0 + point.metrics.apiPerformance.totalRequests,
            averageResponseTime: sum.apiPerformance?.averageResponseTime || 0 + point.metrics.apiPerformance.averageResponseTime,
            errorRate: sum.apiPerformance?.errorRate || 0 + point.metrics.apiPerformance.errorRate
          }
        };
      }, {} as any);

      averageMetrics.pageLoad = {
        domContentLoaded: sumMetrics.pageLoad.domContentLoaded / totalDataPoints,
        loadComplete: sumMetrics.pageLoad.loadComplete / totalDataPoints,
        firstContentfulPaint: sumMetrics.pageLoad.firstContentfulPaint / totalDataPoints,
        largestContentfulPaint: sumMetrics.pageLoad.largestContentfulPaint / totalDataPoints,
        firstInputDelay: sumMetrics.pageLoad.firstInputDelay / totalDataPoints,
        timeToInteractive: sumMetrics.pageLoad.timeToInteractive / totalDataPoints
      };

      averageMetrics.apiPerformance = {
        totalRequests: sumMetrics.apiPerformance.totalRequests / totalDataPoints,
        averageResponseTime: sumMetrics.apiPerformance.averageResponseTime / totalDataPoints,
        errorRate: sumMetrics.apiPerformance.errorRate / totalDataPoints
      } as any;
    }

    // 生成建議
    const recommendations = this.generateRecommendations();

    return {
      summary: {
        totalDataPoints,
        totalAlerts,
        monitoringDuration,
        averageMetrics
      },
      dataPoints: [...this.dataPoints],
      alerts: [...this.alerts],
      recommendations
    };
  }

  /**
   * 生成性能優化建議
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.getPerformanceReport();

    // 基於平均指標生成建議
    if (report.summary.averageMetrics.pageLoad?.domContentLoaded > 1000) {
      recommendations.push('優化 DOM 內容加載時間：考慮使用代碼分割和懶加載');
    }

    if (report.summary.averageMetrics.pageLoad?.largestContentfulPaint > 1500) {
      recommendations.push('優化最大內容繪製：優化圖片加載和關鍵資源');
    }

    if (report.summary.averageMetrics.apiPerformance?.averageResponseTime > 1000) {
      recommendations.push('優化 API 響應時間：考慮使用緩存和數據庫優化');
    }

    if (report.summary.averageMetrics.apiPerformance?.errorRate > 0.02) {
      recommendations.push('降低 API 錯誤率：檢查服務器穩定性和錯誤處理');
    }

    if (report.alerts.length > 0) {
      const criticalAlerts = report.alerts.filter(alert => alert.type === 'critical');
      if (criticalAlerts.length > 0) {
        recommendations.push('處理關鍵性能問題：優先解決內存洩漏和嚴重性能問題');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表現良好，繼續監控並保持當前優化水平');
    }

    return recommendations;
  }

  /**
   * 導出性能數據
   */
  exportData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * 清理歷史數據
   */
  clearData(): void {
    this.dataPoints = [];
    this.alerts = [];
    console.log('🧹 性能監控數據已清理');
  }
}
