import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// 測試配置
interface TestConfig {
  testSuites: string[];
  timeout: number;
  parallel: boolean;
  coverage: boolean;
  reportFormat: 'json' | 'html' | 'junit';
  outputDir: string;
}

// 測試結果
interface TestResult {
  suite: string;
  test: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  timestamp: string;
}

// 測試報告
interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: TestResult[];
  timestamp: string;
  coverage?: any;
}

class IntegrationTestRunner {
  private config: TestConfig;
  private results: TestResult[] = [];

  constructor(config: TestConfig) {
    this.config = config;
  }

  /**
   * 運行所有集成測試
   */
  async runAllTests(): Promise<TestReport> {
    console.log('🚀 開始運行微前端集成測試...');

    const startTime = Date.now();

    try {
      // 確保輸出目錄存在
      await this.ensureOutputDir();

      // 運行測試套件
      if (this.config.parallel) {
        await this.runTestsInParallel();
      } else {
        await this.runTestsSequentially();
      }

      // 生成覆蓋率報告
      let coverage = undefined;
      if (this.config.coverage) {
        coverage = await this.generateCoverageReport();
      }

      // 生成測試報告
      const report = this.generateReport(startTime, coverage);

      // 保存報告
      await this.saveReport(report);

      console.log('✅ 集成測試完成');
      this.printSummary(report);

      return report;
    } catch (error) {
      console.error('❌ 集成測試失敗:', error);
      throw error;
    }
  }

  /**
   * 並行運行測試
   */
  private async runTestsInParallel(): Promise<void> {
    console.log('🔄 並行運行測試套件...');

    const testPromises = this.config.testSuites.map((suite) =>
      this.runTestSuite(suite)
    );
    await Promise.all(testPromises);
  }

  /**
   * 順序運行測試
   */
  private async runTestsSequentially(): Promise<void> {
    console.log('🔄 順序運行測試套件...');

    for (const suite of this.config.testSuites) {
      await this.runTestSuite(suite);
    }
  }

  /**
   * 運行單個測試套件
   */
  private async runTestSuite(suiteName: string): Promise<void> {
    console.log(`📋 運行測試套件: ${suiteName}`);

    const testFile = path.join(__dirname, `${suiteName}.test.ts`);

    if (!fs.existsSync(testFile)) {
      console.warn(`⚠️  測試文件不存在: ${testFile}`);
      return;
    }

    try {
      const startTime = Date.now();

      // 使用 Jest 運行測試
      const { stdout, stderr } = await execAsync(
        `npx jest ${testFile} --json --testTimeout=${this.config.timeout}`,
        { cwd: process.cwd() }
      );

      const duration = Date.now() - startTime;

      // 解析 Jest 輸出
      const jestResults = JSON.parse(stdout);
      this.processJestResults(suiteName, jestResults, duration);

      if (stderr) {
        console.warn(`⚠️  ${suiteName} 測試警告:`, stderr);
      }
    } catch (error) {
      console.error(`❌ ${suiteName} 測試失敗:`, error);

      // 記錄失敗的測試
      this.results.push({
        suite: suiteName,
        test: 'Test Suite',
        status: 'failed',
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 處理 Jest 測試結果
   */
  private processJestResults(
    suiteName: string,
    jestResults: any,
    duration: number
  ): void {
    if (jestResults.testResults && jestResults.testResults.length > 0) {
      const testResult = jestResults.testResults[0];

      testResult.testResults.forEach((test: any) => {
        this.results.push({
          suite: suiteName,
          test: test.fullName,
          status:
            test.status === 'passed'
              ? 'passed'
              : test.status === 'skipped'
                ? 'skipped'
                : 'failed',
          duration: test.duration || 0,
          error: test.failureMessages
            ? test.failureMessages.join('\n')
            : undefined,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }

  /**
   * 生成覆蓋率報告
   */
  private async generateCoverageReport(): Promise<any> {
    console.log('📊 生成覆蓋率報告...');

    try {
      const { stdout } = await execAsync(
        'npx jest --coverage --json --coverageDirectory=coverage',
        { cwd: process.cwd() }
      );

      const coverageResults = JSON.parse(stdout);
      return coverageResults.coverageMap || {};
    } catch (error) {
      console.warn('⚠️  覆蓋率報告生成失敗:', error);
      return undefined;
    }
  }

  /**
   * 生成測試報告
   */
  private generateReport(startTime: number, coverage?: any): TestReport {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;
    const duration = Date.now() - startTime;

    return {
      summary: {
        total,
        passed,
        failed,
        skipped,
        duration,
      },
      results: this.results,
      timestamp: new Date().toISOString(),
      coverage,
    };
  }

  /**
   * 保存測試報告
   */
  private async saveReport(report: TestReport): Promise<void> {
    const reportPath = path.join(
      this.config.outputDir,
      `integration-test-report-${Date.now()}.json`
    );

    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));

    // 生成 HTML 報告
    if (this.config.reportFormat === 'html') {
      await this.generateHtmlReport(
        report,
        reportPath.replace('.json', '.html')
      );
    }

    console.log(`📄 測試報告已保存: ${reportPath}`);
  }

  /**
   * 生成 HTML 報告
   */
  private async generateHtmlReport(
    report: TestReport,
    outputPath: string
  ): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微前端集成測試報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .summary-item { background: white; padding: 15px; border-radius: 5px; text-align: center; }
        .passed { border-left: 4px solid #4caf50; }
        .failed { border-left: 4px solid #f44336; }
        .skipped { border-left: 4px solid #ff9800; }
        .results { margin-top: 30px; }
        .test-item { margin: 10px 0; padding: 10px; border-radius: 3px; }
        .error { background: #ffebee; color: #c62828; }
    </style>
</head>
<body>
    <div class="header">
        <h1>微前端集成測試報告</h1>
        <p>生成時間: ${new Date(report.timestamp).toLocaleString('zh-TW')}</p>
    </div>
    
    <div class="summary">
        <div class="summary-item">
            <h3>總測試數</h3>
            <p>${report.summary.total}</p>
        </div>
        <div class="summary-item passed">
            <h3>通過</h3>
            <p>${report.summary.passed}</p>
        </div>
        <div class="summary-item failed">
            <h3>失敗</h3>
            <p>${report.summary.failed}</p>
        </div>
        <div class="summary-item skipped">
            <h3>跳過</h3>
            <p>${report.summary.skipped}</p>
        </div>
    </div>
    
    <div class="results">
        <h2>詳細結果</h2>
        ${report.results
          .map(
            (result) => `
            <div class="test-item ${result.status}">
                <strong>${result.suite} - ${result.test}</strong>
                <br>
                狀態: ${result.status} | 耗時: ${result.duration}ms
                ${result.error ? `<br><div class="error">錯誤: ${result.error}</div>` : ''}
            </div>
        `
          )
          .join('')}
    </div>
</body>
</html>
    `;

    await fs.promises.writeFile(outputPath, html);
    console.log(`📄 HTML 報告已生成: ${outputPath}`);
  }

  /**
   * 確保輸出目錄存在
   */
  private async ensureOutputDir(): Promise<void> {
    if (!fs.existsSync(this.config.outputDir)) {
      await fs.promises.mkdir(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * 打印測試摘要
   */
  private printSummary(report: TestReport): void {
    console.log('\n📊 測試摘要:');
    console.log(`總測試數: ${report.summary.total}`);
    console.log(`✅ 通過: ${report.summary.passed}`);
    console.log(`❌ 失敗: ${report.summary.failed}`);
    console.log(`⏭️  跳過: ${report.summary.skipped}`);
    console.log(`⏱️  總耗時: ${report.summary.duration}ms`);

    if (report.summary.failed > 0) {
      console.log('\n❌ 失敗的測試:');
      report.results
        .filter((r) => r.status === 'failed')
        .forEach((r) => {
          console.log(`  - ${r.suite}: ${r.test}`);
          if (r.error) {
            console.log(`    錯誤: ${r.error}`);
          }
        });
    }
  }

  /**
   * 清理測試環境
   */
  async cleanup(): Promise<void> {
    console.log('🧹 清理測試環境...');

    try {
      // 清理臨時文件
      const tempFiles = ['coverage', '.nyc_output', 'test-results'];

      for (const file of tempFiles) {
        if (fs.existsSync(file)) {
          await fs.promises.rm(file, { recursive: true, force: true });
        }
      }

      console.log('✅ 環境清理完成');
    } catch (error) {
      console.warn('⚠️  環境清理警告:', error);
    }
  }
}

// 預設測試配置
const defaultConfig: TestConfig = {
  testSuites: [
    'module-communication',
    'shared-state',
    'module-federation',
    'end-to-end-workflow',
  ],
  timeout: 30000, // 30 秒
  parallel: true,
  coverage: true,
  reportFormat: 'html',
  outputDir: './test-reports',
};

// 導出測試運行器
export { IntegrationTestRunner, TestConfig, TestReport, defaultConfig };

// 如果直接運行此文件
if (require.main === module) {
  const runner = new IntegrationTestRunner(defaultConfig);

  runner
    .runAllTests()
    .then(() => runner.cleanup())
    .catch((error) => {
      console.error('測試運行失敗:', error);
      process.exit(1);
    });
}
