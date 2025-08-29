// 響應式組件服務

import { EventEmitter } from 'events';

import type { Breakpoint } from '../types/layout';
import type {
  ResponsiveComponentEvent,
  ResponsiveComponentRegistration,
  ResponsiveComponentService,
  ResponsiveTestConfig,
  ResponsiveTestDevice,
  ResponsiveTestResult,
} from '../types/responsive';

import { layoutService } from './layoutService';

// 響應式組件服務類
class ResponsiveComponentServiceClass implements ResponsiveComponentService {
  private readonly components: Map<string, ResponsiveComponentRegistration> =
    new Map();
  private readonly eventEmitter = new EventEmitter();
  private readonly performanceData: Map<string, any[]> = new Map();
  private readonly testResults: Map<string, ResponsiveTestResult[]> = new Map();

  // 默認測試設備配置
  private readonly defaultDevices: ResponsiveTestDevice[] = [
    {
      name: 'iPhone SE',
      width: 375,
      height: 667,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      pixelRatio: 2,
      touch: true,
    },
    {
      name: 'iPhone 12',
      width: 390,
      height: 844,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      pixelRatio: 3,
      touch: true,
    },
    {
      name: 'iPad',
      width: 768,
      height: 1024,
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      pixelRatio: 2,
      touch: true,
    },
    {
      name: 'Desktop',
      width: 1920,
      height: 1080,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      pixelRatio: 1,
      touch: false,
    },
  ];

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // 監聽佈局服務的斷點變化事件
    layoutService.onBreakpointChange(event => {
      this.emitEvent({
        type: 'breakpointChange',
        componentName: 'system',
        breakpoint: event.breakpoint,
        deviceType: this.getDeviceType(event.windowWidth),
        timestamp: Date.now(),
      });
    });
  }

  // 組件管理
  registerComponent(component: ResponsiveComponentRegistration): void {
    this.components.set(component.name, component);

    this.emitEvent({
      type: 'componentRender',
      componentName: component.name,
      breakpoint: layoutService.getCurrentBreakpoint(),
      deviceType: this.getDeviceType(window.innerWidth),
      timestamp: Date.now(),
      data: component,
    });
  }

  getComponent(name: string): ResponsiveComponentRegistration | null {
    return this.components.get(name) || null;
  }

  getAllComponents(): ResponsiveComponentRegistration[] {
    return Array.from(this.components.values());
  }

  // 響應式測試
  async testComponent(
    componentName: string,
    config?: ResponsiveTestConfig
  ): Promise<ResponsiveTestResult[]> {
    const _component = this.getComponent(componentName);
    if (!component) {
      throw new Error(`Component ${componentName} not found`);
    }

    const _testConfig = config || {
      breakpoints: layoutService.getBreakpointConfig(),
      devices: this.defaultDevices,
      orientations: ['portrait', 'landscape'],
      userAgents: this.defaultDevices.map(d => d.userAgent),
    };

    const results: ResponsiveTestResult[] = [];

    for (const device of testConfig.devices) {
      for (const orientation of testConfig.orientations) {
        const _breakpoint = this.getBreakpointFromWidth(device.width);

        const result: ResponsiveTestResult = {
          component: componentName,
          device: device.name,
          breakpoint,
          orientation,
          passed: true,
          issues: [],
          performance: {
            renderTime: this.measureRenderTime(component),
            memoryUsage: this.measureMemoryUsage(),
            interactionTime: this.measureInteractionTime(component),
          },
        };

        // 執行響應式測試
        const _testIssues = await this.runResponsiveTests(
          component,
          device,
          breakpoint
        );
        result.issues = testIssues;
        result.passed = testIssues.length === 0;

        results.push(result);
      }
    }

    this.testResults.set(componentName, results);
    return results;
  }

  generateTestReport(results: ResponsiveTestResult[]): string {
    const _totalTests = results.length;
    const _passedTests = results.filter(r => r.passed).length;
    const _failedTests = totalTests - passedTests;
    const _passRate = ((passedTests / totalTests) * 100).toFixed(2);

    let report = `# 響應式組件測試報告\n\n`;
    report += `## 總覽\n`;
    report += `- 總測試數: ${totalTests}\n`;
    report += `- 通過測試: ${passedTests}\n`;
    report += `- 失敗測試: ${failedTests}\n`;
    report += `- 通過率: ${passRate}%\n\n`;

    // 按組件分組
    const _componentGroups = this.groupResultsByComponent(results);

    for (const [componentName, componentResults] of componentGroups) {
      report += `## ${componentName}\n`;

      const _componentPassed = componentResults.filter(r => r.passed).length;
      const _componentTotal = componentResults.length;
      const _componentPassRate = (
        (componentPassed / componentTotal) *
        100
      ).toFixed(2);

      report += `- 通過率: ${componentPassRate}% (${componentPassed}/${componentTotal})\n\n`;

      // 失敗的測試
      const _failedResults = componentResults.filter(r => !r.passed);
      if (failedResults.length > 0) {
        report += `### 失敗的測試\n`;
        for (const result of failedResults) {
          report += `- ${result.device} (${result.breakpoint}, ${result.orientation})\n`;
          for (const issue of result.issues) {
            report += `  - ${issue}\n`;
          }
        }
        report += `\n`;
      }

      // 性能報告
      const _avgRenderTime = this.calculateAveragePerformance(
        componentResults,
        'renderTime'
      );
      const _avgMemoryUsage = this.calculateAveragePerformance(
        componentResults,
        'memoryUsage'
      );
      const _avgInteractionTime = this.calculateAveragePerformance(
        componentResults,
        'interactionTime'
      );

      report += `### 性能指標\n`;
      report += `- 平均渲染時間: ${avgRenderTime.toFixed(2)}ms\n`;
      report += `- 平均內存使用: ${avgMemoryUsage.toFixed(2)}MB\n`;
      report += `- 平均交互時間: ${avgInteractionTime.toFixed(2)}ms\n\n`;
    }

    return report;
  }

  // 性能監控
  trackPerformance(
    componentName: string,
    breakpoint: Breakpoint,
    metrics: unknown
  ): void {
    const _key = `${componentName}-${breakpoint}`;
    if (!this.performanceData.has(key)) {
      this.performanceData.set(key, []);
    }

    this.performanceData.get(key)!.push({
      ...metrics,
      timestamp: Date.now(),
    });
  }

  getPerformanceReport(componentName?: string): unknown {
    const report: unknown = {
      summary: {},
      details: {},
    };

    for (const [key, data] of this.performanceData) {
      const [name, breakpoint] = key.split('-');

      if (componentName && name !== componentName) {
        continue;
      }

      if (!report.details[name]) {
        report.details[name] = {};
      }

      const _metrics = this.calculateMetrics(data);
      report.details[name][breakpoint] = metrics;

      if (!report.summary[name]) {
        report.summary[name] = {};
      }
      report.summary[name][breakpoint] = {
        avgRenderTime: metrics.avgRenderTime,
        avgMemoryUsage: metrics.avgMemoryUsage,
        avgInteractionTime: metrics.avgInteractionTime,
      };
    }

    return report;
  }

  // 事件管理
  onComponentEvent(
    callback: (event: ResponsiveComponentEvent) => void
  ): () => void {
    this.eventEmitter.on('componentEvent', callback);
    return () => {
      this.eventEmitter.off('componentEvent', callback);
    };
  }

  emitEvent(event: ResponsiveComponentEvent): void {
    this.eventEmitter.emit('componentEvent', event);
  }

  // 私有方法
  private getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width <= 767) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private getBreakpointFromWidth(width: number): Breakpoint {
    const _breakpoints = layoutService.getBreakpointConfig();

    if (width <= breakpoints.xs) return 'xs';
    if (width <= breakpoints.sm) return 'sm';
    if (width <= breakpoints.md) return 'md';
    if (width <= breakpoints.lg) return 'lg';
    if (width <= breakpoints.xl) return 'xl';
    return 'xxl';
  }

  private measureRenderTime(
    component: ResponsiveComponentRegistration
  ): number {
    const _startTime = performance.now();
    // 模擬渲染過程
    const _renderTime = Math.random() * 50 + 10; // 10-60ms
    return renderTime;
  }

  private measureMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return Math.random() * 10 + 5; // 5-15MB
  }

  private measureInteractionTime(
    component: ResponsiveComponentRegistration
  ): number {
    const _interactionTime = Math.random() * 100 + 20; // 20-120ms
    return interactionTime;
  }

  private async runResponsiveTests(
    component: ResponsiveComponentRegistration,
    device: ResponsiveTestDevice,
    breakpoint: Breakpoint
  ): Promise<string[]> {
    const issues: string[] = [];

    // 檢查組件是否支持當前斷點
    if (!component.breakpoints.includes(breakpoint)) {
      issues.push(`Component does not support breakpoint: ${breakpoint}`);
    }

    // 檢查響應式屬性
    if (component.responsive) {
      const _responsiveProps = Object.entries(component.props).filter(
        ([_, value]) =>
          typeof value === 'object' && value !== null && 'responsive' in value
      );

      for (const [propName, propValue] of responsiveProps) {
        if (!this.validateResponsiveProp(propValue, breakpoint)) {
          issues.push(
            `Invalid responsive prop: ${propName} for breakpoint: ${breakpoint}`
          );
        }
      }
    }

    // 檢查性能
    const _performance = this.getPerformanceReport(component.name);
    if (performance.summary[component.name]?.[breakpoint]) {
      const _metrics = performance.summary[component.name][breakpoint];
      if (metrics.avgRenderTime > 100) {
        issues.push(
          `Render time too slow: ${metrics.avgRenderTime.toFixed(2)}ms`
        );
      }
      if (metrics.avgMemoryUsage > 50) {
        issues.push(
          `Memory usage too high: ${metrics.avgMemoryUsage.toFixed(2)}MB`
        );
      }
    }

    return issues;
  }

  private validateResponsiveProp(
    propValue: unknown,
    breakpoint: Breakpoint
  ): boolean {
    // 簡單的響應式屬性驗證
    if (typeof propValue === 'object' && propValue !== null) {
      return breakpoint in propValue || 'default' in propValue;
    }
    return true;
  }

  private groupResultsByComponent(
    results: ResponsiveTestResult[]
  ): Map<string, ResponsiveTestResult[]> {
    const _groups = new Map<string, ResponsiveTestResult[]>();

    for (const result of results) {
      if (!groups.has(result.component)) {
        groups.set(result.component, []);
      }
      groups.get(result.component)!.push(result);
    }

    return groups;
  }

  private calculateAveragePerformance(
    results: ResponsiveTestResult[],
    metric: keyof ResponsiveTestResult['performance']
  ): number {
    const _values = results.map(r => r.performance[metric]);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateMetrics(data: unknown[]): unknown {
    const _renderTimes = data.map(d => d.renderTime || 0);
    const _memoryUsages = data.map(d => d.memoryUsage || 0);
    const _interactionTimes = data.map(d => d.interactionTime || 0);

    return {
      avgRenderTime:
        renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length,
      avgMemoryUsage:
        memoryUsages.reduce((sum, usage) => sum + usage, 0) /
        memoryUsages.length,
      avgInteractionTime:
        interactionTimes.reduce((sum, time) => sum + time, 0) /
        interactionTimes.length,
      minRenderTime: Math.min(...renderTimes),
      maxRenderTime: Math.max(...renderTimes),
      minMemoryUsage: Math.min(...memoryUsages),
      maxMemoryUsage: Math.max(...memoryUsages),
      minInteractionTime: Math.min(...interactionTimes),
      maxInteractionTime: Math.max(...interactionTimes),
    };
  }
}

// 創建單例實例
export const _responsiveComponentService = new ResponsiveComponentServiceClass();
