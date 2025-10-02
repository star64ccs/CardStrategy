// 性能監控工具
class PerformanceMonitoring {
  constructor() {
    this.metrics = {
      fcp: null, // First Contentful Paint
      lcp: null, // Largest Contentful Paint
      fid: null, // First Input Delay
      cls: null, // Cumulative Layout Shift
      ttfb: null, // Time to First Byte
      fmp: null // First Meaningful Paint
    };

    this.observers = new Map();
    this.isSupported = typeof window !== 'undefined' && 'PerformanceObserver' in window;
  }

  // 初始化監控
  init() {
    if (!this.isSupported) {
      console.warn('性能監控不支持當前瀏覽器');
      return;
    }

    this.observeFCP();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
    this.observeFMP();

    // 頁面卸載時發送數據
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
  }

  // 監控 First Contentful Paint
  observeFCP() {
    if (!this.isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        console.log('FCP:', fcpEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.set('fcp', observer);
  }

  // 監控 Largest Contentful Paint
  observeLCP() {
    if (!this.isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        this.metrics.lcp = lastEntry.startTime;
        console.log('LCP:', lastEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('lcp', observer);
  }

  // 監控 First Input Delay
  observeFID() {
    if (!this.isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (entry.processingStart && entry.startTime) {
          this.metrics.fid = entry.processingStart - entry.startTime;
          console.log('FID:', this.metrics.fid);
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('fid', observer);
  }

  // 監控 Cumulative Layout Shift
  observeCLS() {
    if (!this.isSupported) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      this.metrics.cls = clsValue;
      console.log('CLS:', clsValue);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('cls', observer);
  }

  // 監控 Time to First Byte
  observeTTFB() {
    if (!this.isSupported) return;

    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      console.log('TTFB:', this.metrics.ttfb);
    }
  }

  // 監控 First Meaningful Paint
  observeFMP() {
    if (!this.isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fmpEntry = entries.find(entry => entry.name === 'first-meaningful-paint');
      
      if (fmpEntry) {
        this.metrics.fmp = fmpEntry.startTime;
        console.log('FMP:', fmpEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.set('fmp', observer);
  }

  // 測量自定義指標
  measureCustomMetric(name, startMark, endMark) {
    if (!this.isSupported) return null;

    const startTime = performance.getEntriesByName(startMark)[0]?.startTime;
    const endTime = performance.getEntriesByName(endMark)[0]?.startTime;

    if (startTime && endTime) {
      const duration = endTime - startTime;
      console.log(`自定義指標 ${name}:`, duration);
      return duration;
    }

    return null;
  }

  // 記錄自定義指標
  recordCustomMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    console.log('自定義指標:', metric);
    
    // 發送到分析服務
    this.sendCustomMetric(metric);
  }

  // 獲取性能指標
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  // 發送指標到服務器
  sendMetrics() {
    const metrics = this.getMetrics();
    
    // 發送到分析服務
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metrics', {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        ttfb: metrics.ttfb,
        fmp: metrics.fmp
      });
    }

    // 發送到自定義端點
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    }).catch(error => {
      console.warn('發送性能指標失敗:', error);
    });
  }

  // 發送自定義指標
  sendCustomMetric(metric) {
    fetch('/api/analytics/custom-metric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    }).catch(error => {
      console.warn('發送自定義指標失敗:', error);
    });
  }

  // 清理觀察器
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // 性能建議
  getPerformanceSuggestions() {
    const suggestions = [];

    if (this.metrics.fcp > 1800) {
      suggestions.push('FCP 過慢，建議優化關鍵資源載入');
    }

    if (this.metrics.lcp > 2500) {
      suggestions.push('LCP 過慢，建議優化最大內容元素');
    }

    if (this.metrics.fid > 100) {
      suggestions.push('FID 過慢，建議優化 JavaScript 執行');
    }

    if (this.metrics.cls > 0.1) {
      suggestions.push('CLS 過高，建議穩定佈局');
    }

    if (this.metrics.ttfb > 600) {
      suggestions.push('TTFB 過慢，建議優化服務器響應');
    }

    return suggestions;
  }

  // 性能評分
  getPerformanceScore() {
    let score = 100;

    // FCP 評分
    if (this.metrics.fcp > 1800) score -= 20;
    else if (this.metrics.fcp > 1200) score -= 10;

    // LCP 評分
    if (this.metrics.lcp > 2500) score -= 25;
    else if (this.metrics.lcp > 1800) score -= 15;

    // FID 評分
    if (this.metrics.fid > 100) score -= 20;
    else if (this.metrics.fid > 50) score -= 10;

    // CLS 評分
    if (this.metrics.cls > 0.1) score -= 20;
    else if (this.metrics.cls > 0.05) score -= 10;

    // TTFB 評分
    if (this.metrics.ttfb > 600) score -= 15;
    else if (this.metrics.ttfb > 300) score -= 5;

    return Math.max(0, score);
  }
}

// 創建全局實例
const performanceMonitoring = new PerformanceMonitoring();

// 自動初始化
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitoring.init();
  });
}

export default performanceMonitoring;
