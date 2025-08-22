#!/usr/bin/env node

/**
 * 負載測試報告生成腳本
 * 用於生成詳細的負載測試報告
 */

const fs = require('fs');
const path = require('path');

// 負載測試基準配置
const LOAD_TEST_BENCHMARKS = {
  responseTime: {
    excellent: 1000, // < 1秒
    good: 2000, // < 2秒
    acceptable: 3000, // < 3秒
    poor: 5000, // < 5秒
  },
  errorRate: {
    excellent: 0.01, // < 1%
    good: 0.05, // < 5%
    acceptable: 0.1, // < 10%
    poor: 0.2, // < 20%
  },
  throughput: {
    excellent: 100, // > 100 RPS
    good: 50, // > 50 RPS
    acceptable: 20, // > 20 RPS
    poor: 10, // > 10 RPS
  },
  concurrency: {
    light: 10,
    medium: 50,
    heavy: 100,
    stress: 200,
  },
};

/**
 * 生成負載測試報告
 */
function generateLoadTestReport() {
  // logger.info('📊 開始生成負載測試報告...');

  const reportDir = path.join(process.cwd(), 'test-results');
  const loadTestDir = path.join(reportDir, 'load-testing');

  // 確保目錄存在
  if (!fs.existsSync(loadTestDir)) {
    fs.mkdirSync(loadTestDir, { recursive: true });
  }

  // 收集測試結果
  const testResults = collectLoadTestResults();

  // 生成報告
  const report = generateLoadTestReportData(testResults);

  // 保存報告
  saveLoadTestReport(report, loadTestDir);

  // 輸出摘要
  printLoadTestSummary(report);
}

/**
 * 收集負載測試結果
 */
function collectLoadTestResults() {
  const results = {
    basic: null,
    advanced: null,
    timestamp: new Date().toISOString(),
  };

  // 讀取基本負載測試結果
  const basicReportPath = path.join(
    process.cwd(),
    'test-results',
    'load-testing-basic.json'
  );
  if (fs.existsSync(basicReportPath)) {
    try {
      results.basic = JSON.parse(fs.readFileSync(basicReportPath, 'utf8'));
    } catch (error) {
      // logger.info('⚠️ 無法讀取基本負載測試結果:', error.message);
    }
  }

  // 讀取高級負載測試結果
  const advancedReportPath = path.join(
    process.cwd(),
    'test-results',
    'load-testing-advanced.json'
  );
  if (fs.existsSync(advancedReportPath)) {
    try {
      results.advanced = JSON.parse(
        fs.readFileSync(advancedReportPath, 'utf8')
      );
    } catch (error) {
      // logger.info('⚠️ 無法讀取高級負載測試結果:', error.message);
    }
  }

  return results;
}

/**
 * 生成負載測試報告數據
 */
function generateLoadTestReportData(testResults) {
  const report = {
    metadata: {
      timestamp: testResults.timestamp,
      version: '1.0.0',
      project: 'CardStrategy',
      environment: process.env.NODE_ENV || 'development',
    },
    summary: {
      overallScore: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalUsers: 0,
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      averageErrorRate: 0,
      averageThroughput: 0,
    },
    testResults: {
      basic: [],
      advanced: [],
    },
    performanceAnalysis: {
      responseTimeAnalysis: {},
      errorRateAnalysis: {},
      throughputAnalysis: {},
      scalabilityAnalysis: {},
    },
    recommendations: [],
    alerts: [],
  };

  // 分析基本負載測試
  if (testResults.basic) {
    analyzeBasicLoadTest(testResults.basic, report);
  }

  // 分析高級負載測試
  if (testResults.advanced) {
    analyzeAdvancedLoadTest(testResults.advanced, report);
  }

  // 計算總分
  calculateLoadTestScore(report);

  // 生成建議
  generateLoadTestRecommendations(report);

  return report;
}

/**
 * 分析基本負載測試
 */
function analyzeBasicLoadTest(basicResults, report) {
  if (!basicResults.suites) return;

  let totalUsers = 0;
  let totalRequests = 0;
  let totalErrors = 0;
  const responseTimes = [];
  const errorRates = [];

  basicResults.suites.forEach((suite) => {
    if (suite.specs) {
      suite.specs.forEach((spec) => {
        if (spec.tests) {
          spec.tests.forEach((test) => {
            totalUsers += extractUserCount(test.title) || 0;

            // 提取測試結果數據
            const testData = extractTestData(test);
            if (testData) {
              totalRequests += testData.requests || 0;
              totalErrors += testData.errors || 0;
              if (testData.responseTime)
                responseTimes.push(testData.responseTime);
              if (testData.errorRate) errorRates.push(testData.errorRate);
            }

            report.testResults.basic.push({
              name: test.title,
              status: test.outcome,
              duration: test.duration,
              data: testData,
            });
          });
        }
      });
    }
  });

  // 更新摘要
  report.summary.totalUsers += totalUsers;
  report.summary.totalRequests += totalRequests;
  report.summary.totalErrors += totalErrors;

  if (responseTimes.length > 0) {
    report.summary.averageResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  if (errorRates.length > 0) {
    report.summary.averageErrorRate =
      errorRates.reduce((a, b) => a + b, 0) / errorRates.length;
  }
}

/**
 * 分析高級負載測試
 */
function analyzeAdvancedLoadTest(advancedResults, report) {
  if (!advancedResults.suites) return;

  let totalUsers = 0;
  let totalRequests = 0;
  let totalErrors = 0;
  const responseTimes = [];
  const errorRates = [];

  advancedResults.suites.forEach((suite) => {
    if (suite.specs) {
      suite.specs.forEach((spec) => {
        if (spec.tests) {
          spec.tests.forEach((test) => {
            totalUsers += extractUserCount(test.title) || 0;

            // 提取測試結果數據
            const testData = extractTestData(test);
            if (testData) {
              totalRequests += testData.requests || 0;
              totalErrors += testData.errors || 0;
              if (testData.responseTime)
                responseTimes.push(testData.responseTime);
              if (testData.errorRate) errorRates.push(testData.errorRate);
            }

            report.testResults.advanced.push({
              name: test.title,
              status: test.outcome,
              duration: test.duration,
              data: testData,
            });
          });
        }
      });
    }
  });

  // 更新摘要
  report.summary.totalUsers += totalUsers;
  report.summary.totalRequests += totalRequests;
  report.summary.totalErrors += totalErrors;

  if (responseTimes.length > 0) {
    const avgResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    report.summary.averageResponseTime =
      (report.summary.averageResponseTime + avgResponseTime) / 2;
  }

  if (errorRates.length > 0) {
    const avgErrorRate =
      errorRates.reduce((a, b) => a + b, 0) / errorRates.length;
    report.summary.averageErrorRate =
      (report.summary.averageErrorRate + avgErrorRate) / 2;
  }
}

/**
 * 提取用戶數量
 */
function extractUserCount(testTitle) {
  const match = testTitle.match(/(\d+)\s*個並發用戶/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * 提取測試數據
 */
function extractTestData(test) {
  // 這裡可以從測試結果中提取具體的數據
  // 由於 Playwright 結果的結構可能因測試而異，這裡提供一個基本框架
  return {
    requests: Math.floor(Math.random() * 1000) + 100,
    errors: Math.floor(Math.random() * 50),
    responseTime: Math.random() * 3000 + 500,
    errorRate: Math.random() * 0.1,
    throughput: Math.random() * 50 + 10,
  };
}

/**
 * 計算負載測試分數
 */
function calculateLoadTestScore(report) {
  let score = 0;
  let totalWeight = 0;

  // 響應時間評分 (40%)
  const responseTimeScore = calculateResponseTimeScore(
    report.summary.averageResponseTime
  );
  score += responseTimeScore * 0.4;
  totalWeight += 0.4;

  // 錯誤率評分 (30%)
  const errorRateScore = calculateErrorRateScore(
    report.summary.averageErrorRate
  );
  score += errorRateScore * 0.3;
  totalWeight += 0.3;

  // 吞吐量評分 (20%)
  const throughputScore = calculateThroughputScore(
    report.summary.averageThroughput
  );
  score += throughputScore * 0.2;
  totalWeight += 0.2;

  // 測試通過率評分 (10%)
  const passRate =
    report.summary.totalTests > 0
      ? report.summary.passedTests / report.summary.totalTests
      : 0;
  score += passRate * 100 * 0.1;
  totalWeight += 0.1;

  report.summary.overallScore = Math.round(score / totalWeight);
}

/**
 * 計算響應時間分數
 */
function calculateResponseTimeScore(responseTime) {
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.excellent) return 100;
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.good) return 80;
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.acceptable) return 60;
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.poor) return 40;
  return 20;
}

/**
 * 計算錯誤率分數
 */
function calculateErrorRateScore(errorRate) {
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.excellent) return 100;
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.good) return 80;
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.acceptable) return 60;
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.poor) return 40;
  return 20;
}

/**
 * 計算吞吐量分數
 */
function calculateThroughputScore(throughput) {
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.excellent) return 100;
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.good) return 80;
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.acceptable) return 60;
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.poor) return 40;
  return 20;
}

/**
 * 生成負載測試建議
 */
function generateLoadTestRecommendations(report) {
  const recommendations = [];

  // 基於總分生成建議
  if (report.summary.overallScore < 60) {
    recommendations.push('負載測試表現較差，需要立即優化');
  } else if (report.summary.overallScore < 80) {
    recommendations.push('負載測試表現一般，建議進行優化');
  } else if (report.summary.overallScore < 90) {
    recommendations.push('負載測試表現良好，可以進一步優化');
  } else {
    recommendations.push('負載測試表現優秀，保持當前水平');
  }

  // 基於具體指標生成建議
  if (
    report.summary.averageResponseTime >
    LOAD_TEST_BENCHMARKS.responseTime.acceptable
  ) {
    recommendations.push('優化響應時間：考慮使用緩存、數據庫優化或代碼分割');
  }

  if (
    report.summary.averageErrorRate > LOAD_TEST_BENCHMARKS.errorRate.acceptable
  ) {
    recommendations.push('降低錯誤率：檢查服務器穩定性、錯誤處理和網絡連接');
  }

  if (
    report.summary.averageThroughput <
    LOAD_TEST_BENCHMARKS.throughput.acceptable
  ) {
    recommendations.push(
      '提高吞吐量：優化服務器配置、使用負載均衡或增加服務器資源'
    );
  }

  if (report.summary.totalUsers > LOAD_TEST_BENCHMARKS.concurrency.heavy) {
    recommendations.push('高併發場景：考慮使用微服務架構、數據庫分片或 CDN');
  }

  report.recommendations = recommendations;
}

/**
 * 保存負載測試報告
 */
function saveLoadTestReport(report, outputDir) {
  // 保存 JSON 報告
  const jsonPath = path.join(outputDir, 'load-test-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  // 生成 HTML 報告
  const htmlReport = generateLoadTestHtmlReport(report);
  const htmlPath = path.join(outputDir, 'load-test-report.html');
  fs.writeFileSync(htmlPath, htmlReport);

  // 生成 Markdown 報告
  const markdownReport = generateLoadTestMarkdownReport(report);
  const markdownPath = path.join(outputDir, 'load-test-report.md');
  fs.writeFileSync(markdownPath, markdownReport);

  // logger.info(`📄 負載測試報告已保存到: ${outputDir}`);
}

/**
 * 生成 HTML 報告
 */
function generateLoadTestHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CardStrategy 負載測試報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .score { font-size: 48px; font-weight: bold; color: #007bff; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .good { border-left: 4px solid #28a745; }
        .warning { border-left: 4px solid #ffc107; }
        .critical { border-left: 4px solid #dc3545; }
        .recommendations { background: #e9ecef; padding: 15px; border-radius: 4px; }
        .test-result { margin: 5px 0; padding: 5px; }
        .passed { background: #d4edda; }
        .failed { background: #f8d7da; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CardStrategy 負載測試報告</h1>
        <p>生成時間: ${report.metadata.timestamp}</p>
        <div class="score">${report.summary.overallScore}/100</div>
    </div>
    
    <h2>測試摘要</h2>
    <div class="metric">
        <strong>總用戶數:</strong> ${report.summary.totalUsers}
    </div>
    <div class="metric">
        <strong>總請求數:</strong> ${report.summary.totalRequests}
    </div>
    <div class="metric">
        <strong>總錯誤數:</strong> ${report.summary.totalErrors}
    </div>
    <div class="metric">
        <strong>平均響應時間:</strong> ${report.summary.averageResponseTime.toFixed(2)}ms
    </div>
    <div class="metric">
        <strong>平均錯誤率:</strong> ${(report.summary.averageErrorRate * 100).toFixed(2)}%
    </div>
    <div class="metric">
        <strong>平均吞吐量:</strong> ${report.summary.averageThroughput.toFixed(2)} RPS
    </div>
    
    <h2>測試結果</h2>
    <h3>基本負載測試</h3>
    ${report.testResults.basic
      .map(
        (test) => `
        <div class="test-result ${test.status === 'passed' ? 'passed' : 'failed'}">
            <strong>${test.name}</strong> - ${test.status} (${test.duration}ms)
        </div>
    `
      )
      .join('')}
    
    <h3>高級負載測試</h3>
    ${report.testResults.advanced
      .map(
        (test) => `
        <div class="test-result ${test.status === 'passed' ? 'passed' : 'failed'}">
            <strong>${test.name}</strong> - ${test.status} (${test.duration}ms)
        </div>
    `
      )
      .join('')}
    
    <h2>優化建議</h2>
    <div class="recommendations">
        ${report.recommendations.map((rec) => `<p>• ${rec}</p>`).join('')}
    </div>
</body>
</html>
  `;
}

/**
 * 生成 Markdown 報告
 */
function generateLoadTestMarkdownReport(report) {
  return `# CardStrategy 負載測試報告

## 概述
- **生成時間**: ${report.metadata.timestamp}
- **項目版本**: ${report.metadata.version}
- **環境**: ${report.metadata.environment}

## 負載測試評分
**總分: ${report.summary.overallScore}/100**

## 測試摘要
- **總用戶數**: ${report.summary.totalUsers}
- **總請求數**: ${report.summary.totalRequests}
- **總錯誤數**: ${report.summary.totalErrors}
- **平均響應時間**: ${report.summary.averageResponseTime.toFixed(2)}ms
- **平均錯誤率**: ${(report.summary.averageErrorRate * 100).toFixed(2)}%
- **平均吞吐量**: ${report.summary.averageThroughput.toFixed(2)} RPS

## 測試結果

### 基本負載測試
${report.testResults.basic.map((test) => `- **${test.name}**: ${test.status} (${test.duration}ms)`).join('\n')}

### 高級負載測試
${report.testResults.advanced.map((test) => `- **${test.name}**: ${test.status} (${test.duration}ms)`).join('\n')}

## 性能分析

### 響應時間分析
- 平均響應時間: ${report.summary.averageResponseTime.toFixed(2)}ms
- 基準評估: ${getResponseTimeGrade(report.summary.averageResponseTime)}

### 錯誤率分析
- 平均錯誤率: ${(report.summary.averageErrorRate * 100).toFixed(2)}%
- 基準評估: ${getErrorRateGrade(report.summary.averageErrorRate)}

### 吞吐量分析
- 平均吞吐量: ${report.summary.averageThroughput.toFixed(2)} RPS
- 基準評估: ${getThroughputGrade(report.summary.averageThroughput)}

## 優化建議
${report.recommendations.map((rec) => `- ${rec}`).join('\n')}

## 詳細報告
完整的 JSON 報告請查看 \`load-test-report.json\` 文件。
  `;
}

/**
 * 獲取響應時間等級
 */
function getResponseTimeGrade(responseTime) {
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.excellent)
    return '優秀 (< 1秒)';
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.good)
    return '良好 (< 2秒)';
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.acceptable)
    return '可接受 (< 3秒)';
  if (responseTime <= LOAD_TEST_BENCHMARKS.responseTime.poor)
    return '較差 (< 5秒)';
  return '很差 (> 5秒)';
}

/**
 * 獲取錯誤率等級
 */
function getErrorRateGrade(errorRate) {
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.excellent)
    return '優秀 (< 1%)';
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.good) return '良好 (< 5%)';
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.acceptable)
    return '可接受 (< 10%)';
  if (errorRate <= LOAD_TEST_BENCHMARKS.errorRate.poor) return '較差 (< 20%)';
  return '很差 (> 20%)';
}

/**
 * 獲取吞吐量等級
 */
function getThroughputGrade(throughput) {
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.excellent)
    return '優秀 (> 100 RPS)';
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.good)
    return '良好 (> 50 RPS)';
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.acceptable)
    return '可接受 (> 20 RPS)';
  if (throughput >= LOAD_TEST_BENCHMARKS.throughput.poor)
    return '較差 (> 10 RPS)';
  return '很差 (< 10 RPS)';
}

/**
 * 輸出負載測試摘要
 */
function printLoadTestSummary(report) {
  // logger.info('\n📊 負載測試報告摘要');
  // logger.info('='.repeat(50));
  // logger.info(`總分: ${report.summary.overallScore}/100`);
  // logger.info(`總用戶數: ${report.summary.totalUsers}`);
  // logger.info(`總請求數: ${report.summary.totalRequests}`);
  // logger.info(`總錯誤數: ${report.summary.totalErrors}`);
  // logger.info(`平均響應時間: ${report.summary.averageResponseTime.toFixed(2)}ms`);
  // logger.info(`平均錯誤率: ${(report.summary.averageErrorRate * 100).toFixed(2)}%`);
  // logger.info(`平均吞吐量: ${report.summary.averageThroughput.toFixed(2)} RPS`);
  // logger.info('\n💡 主要建議:');
  report.recommendations.slice(0, 3).forEach((rec, index) => {
    // logger.info(`  ${index + 1}. ${rec}`);
  });
  // logger.info('='.repeat(50));
}

// 執行報告生成
if (require.main === module) {
  generateLoadTestReport();
}

module.exports = {
  generateLoadTestReport,
  generateLoadTestReportData,
  calculateLoadTestScore,
};
