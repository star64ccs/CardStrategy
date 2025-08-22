
/**
 * 代碼質量檢查工具
 * 用於檢查代碼質量和性能問題
 */
export class CodeQualityChecker {
  private static instance: CodeQualityChecker;
  private issues: Array<{ type: string; message: string; file?: string; line?: number }> = [];

  static getInstance(): CodeQualityChecker {
    if (!CodeQualityChecker.instance) {
      CodeQualityChecker.instance = new CodeQualityChecker();
    }
    return CodeQualityChecker.instance;
  }

  checkComponentOptimization(componentName: string, props: any): void {
    // 檢查是否使用了 React.memo
    if (!componentName.includes('React.memo')) {
      this.addIssue('optimization', `組件 ${componentName} 建議使用 React.memo 優化`);
    }

    // 檢查 props 是否過多
    const propCount = Object.keys(props || {}).length;
    if (propCount > 10) {
      this.addIssue('performance', `組件 ${componentName} props 過多 (${propCount} 個)，建議拆分`);
    }
  }

  checkServicePerformance(serviceName: string, methodName: string, executionTime: number): void {
    if (executionTime > 1000) {
      this.addIssue('performance', `服務 ${serviceName}.${methodName} 執行時間過長 (${executionTime}ms)`);
    }
  }

  checkMemoryUsage(componentName: string, memoryUsage: number): void {
    if (memoryUsage > 50 * 1024 * 1024) { // 50MB
      this.addIssue('memory', `組件 ${componentName} 內存使用過高 (${Math.round(memoryUsage / 1024 / 1024)}MB)`);
    }
  }

  checkNetworkRequests(url: string, responseTime: number): void {
    if (responseTime > 5000) {
      this.addIssue('network', `網絡請求 ${url} 響應時間過長 (${responseTime}ms)`);
    }
  }

  private addIssue(type: string, message: string, file?: string, line?: number): void {
    this.issues.push({ type, message, file, line });
  }

  getIssues(): Array<{ type: string; message: string; file?: string; line?: number }> {
    return [...this.issues];
  }

  getIssuesByType(type: string): Array<{ type: string; message: string; file?: string; line?: number }> {
    return this.issues.filter(issue => issue.type === type);
  }

  clearIssues(): void {
    this.issues = [];
  }

  generateReport(): string {
    const report = {
      totalIssues: this.issues.length,
      byType: {
        optimization: this.getIssuesByType('optimization').length,
        performance: this.getIssuesByType('performance').length,
        memory: this.getIssuesByType('memory').length,
        network: this.getIssuesByType('network').length
      },
      issues: this.issues
    };

    return JSON.stringify(report, null, 2);
  }
}

export const codeQualityChecker = CodeQualityChecker.getInstance();
