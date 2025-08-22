import { logger } from '@/utils/logger';
import { logService } from './logService';
import { PERFORMANCE_CONFIG } from '@/config/performance';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 性能指標接口定義
export interface PerformanceMetrics {
  // 核心 Web 指標
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte

  // 自定義指標
  appLoadTime: number;
  componentRenderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;

  // 用戶體驗指標
  interactionToNextPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;

  // 資源加載指標
  resourceLoadTime: number;
  imageLoadTime: number;
  scriptLoadTime: number;
  styleLoadTime: number;
}

// 性能事件接口
export interface PerformanceEvent {
  id: string;
  type: 'metric' | 'error' | 'warning' | 'optimization';
  category:
    | 'navigation'
    | 'resource'
    | 'paint'
    | 'layout'
    | 'api'
    | 'memory'
    | 'component';
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 性能警告接口
export interface PerformanceWarning {
  id: string;
  type:
    | 'threshold_exceeded'
    | 'memory_leak'
    | 'slow_api'
    | 'large_bundle'
    | 'unoptimized_image';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  suggestions: string[];
  metadata?: Record<string, any>;
}

// 性能優化建議接口
export interface PerformanceSuggestion {
  id: string;
  category: 'loading' | 'rendering' | 'memory' | 'network' | 'caching';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  implementation: string;
  expectedImprovement: string;
}

// 性能監控配置
interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number;
  collectionInterval: number;
  maxHistorySize: number;
  thresholds: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    memoryUsage: number;
    apiResponseTime: number;
  };
  reporting: {
    enabled: boolean;
    endpoint: string;
    batchSize: number;
    flushInterval: number;
  };
}

// 前端性能監控服務
class PerformanceMonitorService {
  private config: PerformanceMonitorConfig;
  private metrics: Map<string, number[]> = new Map();
  private events: PerformanceEvent[] = [];
  private warnings: PerformanceWarning[] = [];
  private suggestions: PerformanceSuggestion[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;
  private startTime = Date.now();

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      collectionInterval: 5000, // 5秒
      maxHistorySize: 1000,
      thresholds: {
        fcp: 1500,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        memoryUsage: 50 * 1024 * 1024, // 50MB
        apiResponseTime: 3000,
      },
      reporting: {
        enabled: true,
        endpoint: '/api/performance',
        batchSize: 50,
        flushInterval: 30000, // 30秒
      },
      ...config,
    };
  }

  // 初始化性能監控
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.enabled) return;

    try {
      // 初始化 Web Vitals 監控
      this.initWebVitalsMonitoring();

      // 初始化自定義指標監控
      this.initCustomMetricsMonitoring();

      // 初始化資源監控
      this.initResourceMonitoring();

      // 初始化內存監控
      this.initMemoryMonitoring();

      // 初始化 API 監控
      this.initAPIMonitoring();

      // 啟動定期收集
      this.startPeriodicCollection();

      // 啟動定期報告
      if (this.config.reporting.enabled) {
        this.startPeriodicReporting();
      }

      this.isInitialized = true;
      logger.info('前端性能監控已初始化', { config: this.config });
    } catch (error) {
      logger.error('前端性能監控初始化失敗:', { error });
    }
  }

  // 初始化 Web Vitals 監控
  private initWebVitalsMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    // 監控 FCP (First Contentful Paint)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('fcp', lastEntry.startTime);
        this.checkThreshold('fcp', lastEntry.startTime);
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('fcp', fcpObserver);
    } catch (error) {
      logger.warn('FCP 監控初始化失敗:', { error });
    }

    // 監控 LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
        this.checkThreshold('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (error) {
      logger.warn('LCP 監控初始化失敗:', { error });
    }

    // 監控 FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          this.recordMetric('fid', fid);
          this.checkThreshold('fid', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (error) {
      logger.warn('FID 監控初始化失敗:', { error });
    }

    // 監控 CLS (Cumulative Layout Shift)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cls', clsValue);
        this.checkThreshold('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (error) {
      logger.warn('CLS 監控初始化失敗:', { error });
    }

    // 監控 TTFB (Time to First Byte)
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('ttfb', entry.responseStart - entry.requestStart);
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
    } catch (error) {
      logger.warn('TTFB 監控初始化失敗:', { error });
    }
  }

  // 初始化自定義指標監控
  private initCustomMetricsMonitoring(): void {
    // 監控應用加載時間
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordMetric('appLoadTime', loadTime);
      this.addEvent(
        'metric',
        'navigation',
        'app_load_time',
        loadTime,
        'ms',
        'medium'
      );
    });

    // 監控組件渲染時間
    this.monitorComponentRendering();

    // 監控用戶交互
    this.monitorUserInteractions();
  }

  // 監控組件渲染時間
  private monitorComponentRendering(): void {
    // 使用 MutationObserver 監控 DOM 變化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const renderTime = performance.now();
          this.recordMetric('componentRenderTime', renderTime);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // 監控用戶交互
  private monitorUserInteractions(): void {
    let lastInteractionTime = 0;

    const handleInteraction = () => {
      const currentTime = performance.now();
      if (lastInteractionTime > 0) {
        const timeSinceLastInteraction = currentTime - lastInteractionTime;
        this.recordMetric('interactionToNextPaint', timeSinceLastInteraction);
      }
      lastInteractionTime = currentTime;
    };

    ['click', 'touchstart', 'keydown'].forEach((eventType) => {
      document.addEventListener(eventType, handleInteraction, {
        passive: true,
      });
    });
  }

  // 初始化資源監控
  private initResourceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const loadTime = entry.responseEnd - entry.fetchStart;

          switch (entry.initiatorType) {
            case 'img':
              this.recordMetric('imageLoadTime', loadTime);
              break;
            case 'script':
              this.recordMetric('scriptLoadTime', loadTime);
              break;
            case 'link':
              this.recordMetric('styleLoadTime', loadTime);
              break;
            default:
              this.recordMetric('resourceLoadTime', loadTime);
          }

          // 檢查大文件警告
          if (entry.transferSize > 1024 * 1024) {
            // 1MB
            this.addWarning(
              'large_bundle',
              `大文件警告: ${entry.name} (${Math.round(entry.transferSize / 1024)}KB)`,
              'medium'
            );
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      logger.warn('資源監控初始化失敗:', { error });
    }
  }

  // 初始化內存監控
  private initMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const { memory } = performance as any;
      const usedMemory = memory.usedJSHeapSize;

      this.recordMetric('memoryUsage', usedMemory);
      this.checkThreshold('memoryUsage', usedMemory);

      // 檢查內存洩漏
      if (this.metrics.has('memoryUsage')) {
        const memoryHistory = this.metrics.get('memoryUsage')!;
        if (memoryHistory.length > 10) {
          const recentMemory = memoryHistory.slice(-10);
          const memoryGrowth =
            recentMemory[recentMemory.length - 1] - recentMemory[0];

          if (memoryGrowth > 10 * 1024 * 1024) {
            // 10MB 增長
            this.addWarning('memory_leak', '檢測到可能的內存洩漏', 'high');
          }
        }
      }
    };

    // 定期檢查內存使用
    const memoryTimer = setInterval(checkMemory, 10000); // 10秒
    this.timers.set('memory', memoryTimer);
  }

  // 初始化 API 監控
  private initAPIMonitoring(): void {
    // 攔截 fetch 請求
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.recordMetric('apiResponseTime', responseTime);
        this.checkThreshold('apiResponseTime', responseTime);

        // 檢查慢 API 調用
        if (responseTime > this.config.thresholds.apiResponseTime) {
          this.addWarning(
            'slow_api',
            `慢 API 調用: ${args[0]} (${Math.round(responseTime)}ms)`,
            'medium'
          );
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.addEvent('error', 'api', 'api_error', responseTime, 'ms', 'high', {
          url: args[0],
          error: error.message,
        });

        throw error;
      }
    };
  }

  // 記錄指標
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // 限制歷史數據大小
    if (values.length > this.config.maxHistorySize) {
      values.shift();
    }
  }

  // 檢查閾值
  private checkThreshold(metricName: string, value: number): void {
    const threshold =
      this.config.thresholds[metricName as keyof typeof this.config.thresholds];
    if (threshold && value > threshold) {
      this.addWarning(
        'threshold_exceeded',
        `${metricName} 超出閾值: ${value} > ${threshold}`,
        'medium'
      );
    }
  }

  // 添加性能事件
  private addEvent(
    type: PerformanceEvent['type'],
    category: PerformanceEvent['category'],
    name: string,
    value: number,
    unit: string,
    severity: PerformanceEvent['severity'],
    metadata?: Record<string, any>
  ): void {
    const event: PerformanceEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      category,
      name,
      value,
      unit,
      timestamp: Date.now(),
      severity,
      metadata,
    };

    this.events.push(event);

    // 限制事件歷史大小
    if (this.events.length > this.config.maxHistorySize) {
      this.events.shift();
    }

    // 記錄到日誌服務
    logService.sendLog('info', `性能事件: ${name}`, {
      event,
      metrics: this.getCurrentMetrics(),
    });
  }

  // 添加性能警告
  private addWarning(
    type: PerformanceWarning['type'],
    message: string,
    severity: PerformanceWarning['severity']
  ): void {
    const warning: PerformanceWarning = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      severity,
      timestamp: Date.now(),
      suggestions: this.getSuggestionsForWarning(type),
    };

    this.warnings.push(warning);

    // 限制警告歷史大小
    if (this.warnings.length > this.config.maxHistorySize) {
      this.warnings.shift();
    }

    // 記錄到日誌服務
    logService.sendLog('warn', `性能警告: ${message}`, {
      warning,
      metrics: this.getCurrentMetrics(),
    });
  }

  // 獲取警告對應的建議
  private getSuggestionsForWarning(type: PerformanceWarning['type']): string[] {
    const suggestions: Record<PerformanceWarning['type'], string[]> = {
      threshold_exceeded: [
        '檢查資源加載優化',
        '考慮使用懶加載',
        '優化圖片格式和大小',
      ],
      memory_leak: [
        '檢查事件監聽器清理',
        '避免閉包導致的內存洩漏',
        '定期清理未使用的對象',
      ],
      slow_api: ['檢查 API 響應時間', '考慮使用緩存', '優化數據庫查詢'],
      large_bundle: [
        '代碼分割和懶加載',
        '移除未使用的依賴',
        '使用 Tree Shaking',
      ],
      unoptimized_image: ['使用 WebP 格式', '實現響應式圖片', '使用圖片壓縮'],
    };

    return suggestions[type] || [];
  }

  // 啟動定期收集
  private startPeriodicCollection(): void {
    const collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectionInterval);

    this.timers.set('collection', collectionTimer);
  }

  // 收集指標
  private collectMetrics(): void {
    // 收集當前指標快照
    const currentMetrics = this.getCurrentMetrics();

    // 生成性能建議
    this.generateSuggestions(currentMetrics);

    // 記錄到日誌
    logger.info('性能指標收集完成', { metrics: currentMetrics });
  }

  // 啟動定期報告
  private startPeriodicReporting(): void {
    const reportingTimer = setInterval(() => {
      this.reportMetrics();
    }, this.config.reporting.flushInterval);

    this.timers.set('reporting', reportingTimer);
  }

  // 報告指標
  private async reportMetrics(): Promise<void> {
    try {
      const reportData = {
        metrics: this.getCurrentMetrics(),
        events: this.events.slice(-this.config.reporting.batchSize),
        warnings: this.warnings.slice(-this.config.reporting.batchSize),
        suggestions: this.suggestions,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
      };

      // 發送到後端
      const response = await fetch(this.config.reporting.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        logger.info('性能指標報告成功');
      } else {
        logger.warn('性能指標報告失敗', { status: response.status });
      }
    } catch (error) {
      logger.error('性能指標報告錯誤:', { error });
    }
  }

  // 獲取當前指標
  public getCurrentMetrics(): Partial<PerformanceMetrics> {
    const metrics: Partial<PerformanceMetrics> = {};

    this.metrics.forEach((values, key) => {
      if (values.length > 0) {
        const average =
          values.reduce((sum, value) => sum + value, 0) / values.length;
        (metrics as any)[key] = average;
      }
    });

    return metrics;
  }

  // 獲取性能事件
  public getEvents(limit?: number): PerformanceEvent[] {
    const events = [...this.events];
    return limit ? events.slice(-limit) : events;
  }

  // 獲取性能警告
  public getWarnings(limit?: number): PerformanceWarning[] {
    const warnings = [...this.warnings];
    return limit ? warnings.slice(-limit) : warnings;
  }

  // 獲取性能建議
  public getSuggestions(): PerformanceSuggestion[] {
    return [...this.suggestions];
  }

  // 生成性能建議
  private generateSuggestions(metrics: Partial<PerformanceMetrics>): void {
    this.suggestions = [];

    // 基於 LCP 的建議
    if (metrics.lcp && metrics.lcp > this.config.thresholds.lcp) {
      this.suggestions.push({
        id: 'lcp-optimization',
        category: 'loading',
        title: '優化最大內容繪製 (LCP)',
        description: 'LCP 時間過長，影響用戶體驗',
        impact: 'high',
        effort: 'medium',
        priority: 1,
        implementation: '優化關鍵資源加載，使用 CDN，實現圖片懶加載',
        expectedImprovement: 'LCP 時間減少 30-50%',
      });
    }

    // 基於 FID 的建議
    if (metrics.fid && metrics.fid > this.config.thresholds.fid) {
      this.suggestions.push({
        id: 'fid-optimization',
        category: 'rendering',
        title: '優化首次輸入延遲 (FID)',
        description: 'FID 時間過長，影響交互響應',
        impact: 'high',
        effort: 'high',
        priority: 2,
        implementation: '減少主線程阻塞，優化 JavaScript 執行',
        expectedImprovement: 'FID 時間減少 40-60%',
      });
    }

    // 基於內存使用的建議
    if (
      metrics.memoryUsage &&
      metrics.memoryUsage > this.config.thresholds.memoryUsage
    ) {
      this.suggestions.push({
        id: 'memory-optimization',
        category: 'memory',
        title: '優化內存使用',
        description: '內存使用量過高，可能影響性能',
        impact: 'medium',
        effort: 'medium',
        priority: 3,
        implementation: '檢查內存洩漏，優化數據結構，及時清理資源',
        expectedImprovement: '內存使用減少 20-30%',
      });
    }
  }

  // 獲取會話 ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  // 手動測量性能
  public measurePerformance<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.recordMetric(name, duration);
    this.addEvent('metric', 'component', name, duration, 'ms', 'low');

    return result;
  }

  // 異步性能測量
  public async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.recordMetric(name, duration);
    this.addEvent('metric', 'component', name, duration, 'ms', 'low');

    return result;
  }

  // 清理資源
  public cleanup(): void {
    // 停止所有定時器
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();

    // 斷開所有觀察器
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // 清理數據
    this.metrics.clear();
    this.events = [];
    this.warnings = [];
    this.suggestions = [];

    this.isInitialized = false;
    logger.info('前端性能監控已清理');
  }

  // 獲取性能報告
  public getPerformanceReport(): {
    metrics: Partial<PerformanceMetrics>;
    events: PerformanceEvent[];
    warnings: PerformanceWarning[];
    suggestions: PerformanceSuggestion[];
    uptime: number;
  } {
    return {
      metrics: this.getCurrentMetrics(),
      events: this.getEvents(),
      warnings: this.getWarnings(),
      suggestions: this.getSuggestions(),
      uptime: Date.now() - this.startTime,
    };
  }
}

// 導出單例實例
export { PerformanceMonitorService };
export const performanceMonitorService = new PerformanceMonitorService();
