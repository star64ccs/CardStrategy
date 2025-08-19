import { FullConfig } from '@playwright/test';
import { cleanupTestEnvironment } from './e2e-setup';

/**
 * 全局清理 - 在所有測試結束後執行
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 開始全局測試環境清理...');

  try {
    // 清理測試環境
    await cleanupTestEnvironment();
    console.log('✅ 測試環境清理完成');

    // 生成測試報告摘要
    await generateTestSummary();

    // 清理臨時文件
    await cleanupTempFiles();

    // 重置環境變數
    process.env.NODE_ENV = 'development';
    delete process.env.TEST_MODE;
    delete process.env.API_BASE_URL;

    console.log('🔧 環境變數重置完成');

    console.log('🎉 全局清理完成！');

  } catch (error) {
    console.error('❌ 全局清理失敗:', error);
    // 不拋出錯誤，避免影響測試結果
  }
}

/**
 * 生成測試報告摘要
 */
async function generateTestSummary() {
  const fs = require('fs');
  const path = require('path');

  try {
    const testResultsPath = path.join(process.cwd(), 'test-results');
    const jsonReportPath = path.join(testResultsPath, 'test-results.json');

    if (fs.existsSync(jsonReportPath)) {
      const testResults = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));

      const summary = {
        totalTests: testResults.suites?.reduce((acc: number, suite: any) =>
          acc + (suite.specs?.reduce((specAcc: number, spec: any) =>
            specAcc + spec.tests.length, 0) || 0), 0) || 0,
        passedTests: testResults.suites?.reduce((acc: number, suite: any) =>
          acc + (suite.specs?.reduce((specAcc: number, spec: any) =>
            specAcc + spec.tests.filter((test: any) => test.outcome === 'passed').length, 0) || 0), 0) || 0,
        failedTests: testResults.suites?.reduce((acc: number, suite: any) =>
          acc + (suite.specs?.reduce((specAcc: number, spec: any) =>
            specAcc + spec.tests.filter((test: any) => test.outcome === 'failed').length, 0) || 0), 0) || 0,
        skippedTests: testResults.suites?.reduce((acc: number, suite: any) =>
          acc + (suite.specs?.reduce((specAcc: number, spec: any) =>
            specAcc + spec.tests.filter((test: any) => test.outcome === 'skipped').length, 0) || 0), 0) || 0,
        totalDuration: testResults.suites?.reduce((acc: number, suite: any) =>
          acc + (suite.specs?.reduce((specAcc: number, spec: any) =>
            specAcc + spec.tests.reduce((testAcc: number, test: any) =>
              testAcc + (test.duration || 0), 0), 0) || 0), 0) || 0,
        timestamp: new Date().toISOString()
      };

      const summaryPath = path.join(testResultsPath, 'test-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

      console.log('📊 測試摘要:');
      console.log(`   總測試數: ${summary.totalTests}`);
      console.log(`   通過測試: ${summary.passedTests}`);
      console.log(`   失敗測試: ${summary.failedTests}`);
      console.log(`   跳過測試: ${summary.skippedTests}`);
      console.log(`   總耗時: ${(summary.totalDuration / 1000).toFixed(2)}s`);

      // 計算通過率
      const passRate = summary.totalTests > 0 ? (summary.passedTests / summary.totalTests * 100).toFixed(2) : '0.00';
      console.log(`   通過率: ${passRate}%`);
    }
  } catch (error) {
    console.warn('⚠️ 生成測試摘要失敗:', error.message);
  }
}

/**
 * 清理臨時文件
 */
async function cleanupTempFiles() {
  const fs = require('fs');
  const path = require('path');

  try {
    const tempDirs = [
      'test-results/traces',
      'test-results/videos',
      'test-results/screenshots'
    ];

    for (const dir of tempDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);

        // 只保留失敗的測試文件
        for (const file of files) {
          const filePath = path.join(fullPath, file);
          const stats = fs.statSync(filePath);

          // 刪除超過 24 小時的文件
          const fileAge = Date.now() - stats.mtime.getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24 小時

          if (fileAge > maxAge) {
            if (stats.isFile()) {
              fs.unlinkSync(filePath);
              console.log(`🗑️ 清理過期文件: ${dir}/${file}`);
            } else if (stats.isDirectory()) {
              fs.rmdirSync(filePath, { recursive: true });
              console.log(`🗑️ 清理過期目錄: ${dir}/${file}`);
            }
          }
        }
      }
    }

    console.log('🧹 臨時文件清理完成');

  } catch (error) {
    console.warn('⚠️ 清理臨時文件失敗:', error.message);
  }
}

export default globalTeardown;
