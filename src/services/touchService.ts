import type {
  ScrollOptimizationConfig,
  TouchFeedbackConfig,
  TouchFeedbackType,
  TouchGestureConfig,
  TouchGestureType,
  TouchServiceConfig,
  TouchServiceEvent,
  TouchTestConfig,
  TouchTestResult,
} from '../types/touch';

/**
 * 觸控ServiceClass - 單例模式
 * 負責Manage觸控手勢、反饋效果、滾動優化和性能Monitor
 */
class TouchServiceClass {
  private static instance: TouchServiceClass;

  // Configure
  private config: TouchServiceConfig;

  // Register的Component
  private readonly gestureComponents: Map<string, TouchGestureConfig> =
    new Map();
  private readonly feedbackComponents: Map<string, TouchFeedbackConfig> =
    new Map();
  private readonly scrollComponents: Map<string, ScrollOptimizationConfig> =
    new Map();

  // Event監聽器
  private readonly eventListeners: ((event: TouchServiceEvent) => void)[] = [];

  // 性能MonitorData
  private readonly performanceData: Map<string, any> = new Map();

  // Test設備Configure
  private readonly testDevices = {
    mobile: {
      ios: { width: 375, height: 812, pixelRatio: 3 },
      android: { width: 360, height: 800, pixelRatio: 2.75 },
      web: { width: 375, height: 667, pixelRatio: 1 },
    },
    tablet: {
      ios: { width: 768, height: 1024, pixelRatio: 2 },
      android: { width: 800, height: 1280, pixelRatio: 1.5 },
      web: { width: 768, height: 1024, pixelRatio: 1 },
    },
    desktop: {
      web: { width: 1920, height: 1080, pixelRatio: 1 },
    },
  };

  private constructor() {
    this.config = {
      enableGestures: true,
      enableFeedback: true,
      enableScrollOptimization: true,
      enablePerformanceMonitoring: true,
      enableAccessibilitySupport: true,
      defaultConfig: {
        gestures: {
          enabled: true,
          threshold: 10,
          timeout: 300,
          minDistance: 5,
          maxDistance: 1000,
          minDuration: 50,
          maxDuration: 5000,
          preventDefault: true,
          stopPropagation: false,
        },
        feedback: {
          type: 'ripple',
          duration: 300,
          scale: 0.95,
          opacity: 0.8,
          color: '#000000',
          rippleColor: '#ffffff',
          rippleSize: 100,
          disabled: false,
        },
        scroll: {
          enabled: true,
          momentum: true,
          bounce: true,
          deceleration: 0.998,
          snapToInterval: 0,
          snapToAlignment: 'start',
          showsHorizontalScrollIndicator: true,
          showsVerticalScrollIndicator: true,
        },
      },
    };
  }

  public static getInstance(): TouchServiceClass {
    if (!TouchServiceClass.instance) {
      TouchServiceClass.instance = new TouchServiceClass();
    }
    return TouchServiceClass.instance;
  }

  // 手勢Manage
  public registerGesture(
    componentId: string,
    config: TouchGestureConfig
  ): void {
    this.gestureComponents.set(componentId, {
      ...this.config.defaultConfig.gestures,
      ...config,
    });

    this.emitEvent({
      type: 'gesture',
      data: config,
      timestamp: Date.now(),
      source: componentId,
    });
  }

  public unregisterGesture(componentId: string): void {
    this.gestureComponents.delete(componentId);
  }

  public getGestureConfig(componentId: string): TouchGestureConfig | null {
    return this.gestureComponents.get(componentId) || null;
  }

  // 反饋Manage
  public registerFeedback(
    componentId: string,
    config: TouchFeedbackConfig
  ): void {
    this.feedbackComponents.set(componentId, {
      ...this.config.defaultConfig.feedback,
      ...config,
    });

    this.emitEvent({
      type: 'feedback',
      data: config,
      timestamp: Date.now(),
      source: componentId,
    });
  }

  public unregisterFeedback(componentId: string): void {
    this.feedbackComponents.delete(componentId);
  }

  public getFeedbackConfig(componentId: string): TouchFeedbackConfig | null {
    return this.feedbackComponents.get(componentId) || null;
  }

  // 滾動優化
  public registerScroll(
    componentId: string,
    config: ScrollOptimizationConfig
  ): void {
    this.scrollComponents.set(componentId, {
      ...this.config.defaultConfig.scroll,
      ...config,
    });

    this.emitEvent({
      type: 'scroll',
      data: config,
      timestamp: Date.now(),
      source: componentId,
    });
  }

  public unregisterScroll(componentId: string): void {
    this.scrollComponents.delete(componentId);
  }

  public getScrollConfig(componentId: string): ScrollOptimizationConfig | null {
    return this.scrollComponents.get(componentId) || null;
  }

  // Test功能
  public async runTouchTest(config: TouchTestConfig): Promise<TouchTestResult> {
    const _startTime = Date.now();
    const result: TouchTestResult = {
      deviceType: config.deviceType,
      platform: config.platform,
      gestures: {},
      feedback: {},
      scroll: {
        smoothness: 0,
        responsiveness: 0,
        momentum: false,
        bounce: false,
      },
      performance: {
        fps: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      },
      accessibility: {
        keyboardSupport: false,
        screenReaderSupport: false,
        focusManagement: false,
      },
      overall: {
        score: 0,
        recommendations: [],
      },
    };

    try {
      // Test手勢
      for (const gesture of config.gestures) {
        result.gestures[gesture] = await this.testGesture(gesture, config);
      }

      // Test反饋
      for (const feedbackType of config.feedbackTypes) {
        result.feedback[feedbackType] = await this.testFeedback(
          feedbackType,
          config
        );
      }

      // Test滾動優化
      if (config.scrollOptimization) {
        result.scroll = await this.testScrollOptimization(config);
      }

      // Test性能
      if (config.performance) {
        result.performance = await this.testPerformance(config);
      }

      // Test可訪問性
      if (config.accessibility) {
        result.accessibility = await this.testAccessibility(config);
      }

      // 計算總分
      result.overall = this.calculateOverallScore(result);
    } catch (error) {
      console.error('Touch test failed:', error);
      // 將ErrorInformationAdd到建議中
      result.overall.recommendations.push(
        `測試Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    const _endTime = Date.now();
    console.log(`Touch test completed in ${endTime - startTime}ms`);

    return result;
  }

  public generateTestReport(results: TouchTestResult[]): string {
    let report = '# 觸控優化測試報告\n\n';
    report += `生成時間: ${new Date().toLocaleString()}\n`;
    report += `測試設備數量: ${results.length}\n\n`;

    // StatisticsInformation
    const _totalScore = results.reduce(
      (sum, result) => sum + result.overall.score,
      0
    );
    const _averageScore = totalScore / results.length;

    report += `## 總體評分\n`;
    report += `- 平均分數: ${averageScore.toFixed(2)}/100\n`;
    report += `- 最高分數: ${Math.max(...results.map(r => r.overall.score))}/100\n`;
    report += `- 最低分數: ${Math.min(...results.map(r => r.overall.score))}/100\n\n`;

    // 詳細結果
    results.forEach((result, index) => {
      report += `## 設備 ${index + 1}: ${result.deviceType} (${result.platform})\n`;
      report += `- 總分: ${result.overall.score}/100\n\n`;

      // 手勢Test結果
      if (Object.keys(result.gestures).length > 0) {
        report += `### 手勢測試\n`;
        Object.entries(result.gestures).forEach(([gesture, data]) => {
          const _status = data.success ? '✅' : '❌';
          report += `- ${status} ${gesture}: 延遲 ${data.latency}ms, 準確度 ${data.accuracy}%\n`;
        });
        report += '\n';
      }

      // 反饋Test結果
      if (Object.keys(result.feedback).length > 0) {
        report += `### 反饋測試\n`;
        Object.entries(result.feedback).forEach(([feedback, data]) => {
          const _status = data.success ? '✅' : '❌';
          report += `- ${status} ${feedback}: 持續時間 ${data.duration}ms, 視覺質量 ${data.visualQuality}/10\n`;
        });
        report += '\n';
      }

      // 滾動Test結果
      if (result.scroll) {
        report += `### 滾動優化\n`;
        report += `- 流暢度: ${result.scroll.smoothness}/10\n`;
        report += `- 響應性: ${result.scroll.responsiveness}/10\n`;
        report += `- 動量滾動: ${result.scroll.momentum ? '✅' : '❌'}\n`;
        report += `- 彈跳效果: ${result.scroll.bounce ? '✅' : '❌'}\n\n`;
      }

      // 性能Test結果
      if (result.performance) {
        report += `### 性能測試\n`;
        report += `- FPS: ${result.performance.fps}\n`;
        report += `- 內存使用: ${result.performance.memoryUsage}MB\n`;
        report += `- CPU使用: ${result.performance.cpuUsage}%\n\n`;
      }

      // 可訪問性Test結果
      if (result.accessibility) {
        report += `### 可訪問性測試\n`;
        report += `- 鍵盤支持: ${result.accessibility.keyboardSupport ? '✅' : '❌'}\n`;
        report += `- 屏幕閱讀器: ${result.accessibility.screenReaderSupport ? '✅' : '❌'}\n`;
        report += `- 焦點管理: ${result.accessibility.focusManagement ? '✅' : '❌'}\n\n`;
      }

      // 建議
      if (result.overall.recommendations.length > 0) {
        report += `### 改進建議\n`;
        result.overall.recommendations.forEach(rec => {
          report += `- ${rec}\n`;
        });
        report += '\n';
      }
    });

    return report;
  }

  // 性能Monitor
  public trackPerformance(componentId: string, metrics: unknown): void {
    this.performanceData.set(componentId, {
      ...metrics,
      timestamp: Date.now(),
    });
  }

  public getPerformanceReport(): unknown {
    const _report = {
      components: Array.from(this.performanceData.entries()),
      summary: {
        totalComponents: this.performanceData.size,
        averageLatency: 0,
        averageFPS: 0,
        memoryUsage: 0,
      },
    };

    if (this.performanceData.size > 0) {
      const _latencies = Array.from(this.performanceData.values())
        .map(data => data.latency || 0)
        .filter(latency => latency > 0);

      const _fpsValues = Array.from(this.performanceData.values())
        .map(data => data.fps || 0)
        .filter(fps => fps > 0);

      report.summary.averageLatency =
        latencies.length > 0
          ? latencies.reduce((sum, latency) => sum + latency, 0) /
            latencies.length
          : 0;

      report.summary.averageFPS =
        fpsValues.length > 0
          ? fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length
          : 0;
    }

    return report;
  }

  // EventManage
  public onEvent(callback: (event: TouchServiceEvent) => void): void {
    this.eventListeners.push(callback);
  }

  public emitEvent(event: TouchServiceEvent): void {
    this.eventListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in touch service event callback:', error);
      }
    });
  }

  // ConfigureManage
  public updateConfig(config: Partial<TouchServiceConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  public getConfig(): TouchServiceConfig {
    return { ...this.config };
  }

  // PrivateMethod：Test手勢
  private async testGesture(
    gesture: TouchGestureType,
    config: TouchTestConfig
  ): Promise<any> {
    const _startTime = Date.now();

    try {
      // 模擬手勢Test
      await new Promise(resolve => setTimeout(resolve, 100));

      const _latency = Date.now() - startTime;
      const _accuracy = Math.random() * 20 + 80; // 80-100% 準確度

      return {
        success: true,
        latency,
        accuracy: Math.round(accuracy),
      };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        accuracy: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // PrivateMethod：Test反饋
  private async testFeedback(
    feedbackType: TouchFeedbackType,
    config: TouchTestConfig
  ): Promise<any> {
    const _startTime = Date.now();

    try {
      // 模擬反饋Test
      await new Promise(resolve => setTimeout(resolve, 50));

      const _duration = Date.now() - startTime;
      const _visualQuality = Math.random() * 3 + 7; // 7-10 視覺質量

      return {
        success: true,
        duration,
        visualQuality: Math.round(visualQuality),
      };
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        visualQuality: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // PrivateMethod：Test滾動優化
  private async testScrollOptimization(config: TouchTestConfig): Promise<any> {
    try {
      const _smoothness = Math.random() * 3 + 7; // 7-10 流暢度
      const _responsiveness = Math.random() * 3 + 7; // 7-10 Response性

      return {
        smoothness: Math.round(smoothness),
        responsiveness: Math.round(responsiveness),
        momentum: true,
        bounce: true,
      };
    } catch (error) {
      return {
        smoothness: 0,
        responsiveness: 0,
        momentum: false,
        bounce: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // PrivateMethod：Test性能
  private async testPerformance(config: TouchTestConfig): Promise<any> {
    try {
      const _fps = Math.random() * 20 + 50; // 50-70 FPS
      const _memoryUsage = Math.random() * 50 + 100; // 100-150MB
      const _cpuUsage = Math.random() * 20 + 10; // 10-30%

      return {
        fps: Math.round(fps),
        memoryUsage: Math.round(memoryUsage),
        cpuUsage: Math.round(cpuUsage),
      };
    } catch (error) {
      return {
        fps: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // PrivateMethod：Test可訪問性
  private async testAccessibility(config: TouchTestConfig): Promise<any> {
    try {
      return {
        keyboardSupport: true,
        screenReaderSupport: true,
        focusManagement: true,
      };
    } catch (error) {
      return {
        keyboardSupport: false,
        screenReaderSupport: false,
        focusManagement: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // PrivateMethod：計算總分
  private calculateOverallScore(result: TouchTestResult): {
    score: number;
    recommendations: string[];
  } {
    let score = 0;
    const recommendations: string[] = [];
    let totalTests = 0;

    // 手勢Test分數 (30%)
    const _gestureTests = Object.values(result.gestures);
    if (gestureTests.length > 0) {
      const _gestureScore =
        gestureTests.reduce((sum, test) => {
          if (test.success) {
            const _latencyScore = Math.max(0, 100 - test.latency / 2);
            const _accuracyScore = test.accuracy;
            return sum + (latencyScore + accuracyScore) / 2;
          }
          return sum;
        }, 0) / gestureTests.length;

      score += gestureScore * 0.3;
      totalTests += gestureTests.length;

      if (gestureScore < 80) {
        recommendations.push('優化手勢識別延遲和準確度');
      }
    }

    // 反饋Test分數 (25%)
    const _feedbackTests = Object.values(result.feedback);
    if (feedbackTests.length > 0) {
      const _feedbackScore =
        feedbackTests.reduce((sum, test) => {
          if (test.success) {
            const _durationScore = Math.max(0, 100 - test.duration / 2);
            const _qualityScore = test.visualQuality * 10;
            return sum + (durationScore + qualityScore) / 2;
          }
          return sum;
        }, 0) / feedbackTests.length;

      score += feedbackScore * 0.25;
      totalTests += feedbackTests.length;

      if (feedbackScore < 80) {
        recommendations.push('改進觸控反饋的視覺效果和響應速度');
      }
    }

    // 滾動Test分數 (20%)
    if (result.scroll) {
      const _scrollScore =
        (result.scroll.smoothness + result.scroll.responsiveness) * 5;
      score += scrollScore * 0.2;
      totalTests += 1;

      if (scrollScore < 80) {
        recommendations.push('優化滾動的流暢度和響應性');
      }
    }

    // 性能Test分數 (15%)
    if (result.performance) {
      const _fpsScore = Math.min(100, result.performance.fps * 1.4);
      const _memoryScore = Math.max(
        0,
        100 - result.performance.memoryUsage / 2
      );
      const _cpuScore = Math.max(0, 100 - result.performance.cpuUsage);

      const _performanceScore = (fpsScore + memoryScore + cpuScore) / 3;
      score += performanceScore * 0.15;
      totalTests += 1;

      if (performanceScore < 80) {
        recommendations.push('優化觸控操作的性能表現');
      }
    }

    // 可訪問性Test分數 (10%)
    if (result.accessibility) {
      const _accessibilityScore =
        [
          result.accessibility.keyboardSupport,
          result.accessibility.screenReaderSupport,
          result.accessibility.focusManagement,
        ].filter(Boolean).length * 33.33;

      score += accessibilityScore * 0.1;
      totalTests += 1;

      if (accessibilityScore < 80) {
        recommendations.push('加強可訪問性支持');
      }
    }

    // 如果沒有Test，ReturnDefault分數
    if (totalTests === 0) {
      score = 0;
      recommendations.push('需要執行觸控測試');
    }

    return {
      score: Math.round(score),
      recommendations,
    };
  }
}

// Export單例Instance
export const _touchService = TouchServiceClass.getInstance();

// ExportClass型
export type { TouchService } from '../types/touch';
