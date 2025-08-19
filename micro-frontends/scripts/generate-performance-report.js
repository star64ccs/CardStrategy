#!/usr/bin/env node

/**
 * 性能報告生成腳本
 * 用於生成綜合性能測試報告
 */

const fs = require('fs');
const path = require('path');

// 性能基準配置
const PERFORMANCE_BENCHMARKS = {
  pageLoad: {
    domContentLoaded: 1500,
    loadComplete: 2500,
    firstContentfulPaint: 1000,
    largestContentfulPaint: 2000,
    firstInputDelay: 100
  },
  apiPerformance: {
    averageResponseTime: 1000,
    errorRate: 0.05
  },
  memoryUsage: {
    maxMemoryGrowth: 100,
    maxMemoryUsage: 512
  },
  rendering: {
    minFrameRate: 30,
    maxDroppedFrames: 10
  }
};

/**
 * 生成性能報告
 */
function generatePerformanceReport() {
  console.log('📊 開始生成性能報告...');

  const reportDir = path.join(process.cwd(), 'test-results');
  const performanceDir = path.join(reportDir, 'performance');

  // 確保目錄存在
  if (!fs.existsSync(performanceDir)) {
    fs.mkdirSync(performanceDir, { recursive: true });
  }

  // 收集測試結果
  const testResults = collectTestResults();

  // 生成報告
  const report = generateReport(testResults);

  // 保存報告
  saveReport(report, performanceDir);

  // 輸出摘要
  printSummary(report);
}

/**
 * 收集測試結果
 */
function collectTestResults() {
  const results = {
    benchmark: null,
    load: null,
    optimization: null,
    lighthouse: null,
    timestamp: new Date().toISOString()
  };

  // 讀取 Playwright 測試結果
  const playwrightReportPath = path.join(process.cwd(), 'test-results', 'test-results.json');
  if (fs.existsSync(playwrightReportPath)) {
    try {
      const playwrightResults = JSON.parse(fs.readFileSync(playwrightReportPath, 'utf8'));
      results.playwright = playwrightResults;
    } catch (error) {
      console.warn('⚠️ 無法讀取 Playwright 測試結果:', error.message);
    }
  }

  // 讀取 Lighthouse 報告
  const lighthouseReportPath = path.join(process.cwd(), 'test-results', 'lighthouse-report.json');
  if (fs.existsSync(lighthouseReportPath)) {
    try {
      const lighthouseResults = JSON.parse(fs.readFileSync(lighthouseReportPath, 'utf8'));
      results.lighthouse = lighthouseResults;
    } catch (error) {
      console.warn('⚠️ 無法讀取 Lighthouse 報告:', error.message);
    }
  }

  return results;
}

/**
 * 生成報告
 */
function generateReport(testResults) {
  const report = {
    metadata: {
      timestamp: testResults.timestamp,
      version: '1.0.0',
      project: 'CardStrategy',
      environment: process.env.NODE_ENV || 'development'
    },
    summary: {
      overallScore: 0,
      passedTests: 0,
      totalTests: 0,
      criticalIssues: 0,
      warnings: 0,
      recommendations: []
    },
    metrics: {
      pageLoad: {},
      apiPerformance: {},
      memoryUsage: {},
      rendering: {},
      optimization: {}
    },
    details: {
      benchmark: {},
      load: {},
      optimization: {},
      lighthouse: {}
    },
    recommendations: []
  };

  // 分析 Playwright 測試結果
  if (testResults.playwright) {
    analyzePlaywrightResults(testResults.playwright, report);
  }

  // 分析 Lighthouse 結果
  if (testResults.lighthouse) {
    analyzeLighthouseResults(testResults.lighthouse, report);
  }

  // 計算總分
  calculateOverallScore(report);

  // 生成建議
  generateRecommendations(report);

  return report;
}

/**
 * 分析 Playwright 測試結果
 */
function analyzePlaywrightResults(playwrightResults, report) {
  if (!playwrightResults.suites) return;

  let passedTests = 0;
  let totalTests = 0;
  let criticalIssues = 0;
  let warnings = 0;

  playwrightResults.suites.forEach(suite => {
    if (suite.specs) {
      suite.specs.forEach(spec => {
        if (spec.tests) {
          spec.tests.forEach(test => {
            totalTests++;

            if (test.outcome === 'passed') {
              passedTests++;
            } else if (test.outcome === 'failed') {
              // 檢查是否為關鍵問題
              if (test.title.includes('critical') || test.title.includes('memory') || test.title.includes('error')) {
                criticalIssues++;
              } else {
                warnings++;
              }
            }
          });
        }
      });
    }
  });

  report.summary.passedTests = passedTests;
  report.summary.totalTests = totalTests;
  report.summary.criticalIssues = criticalIssues;
  report.summary.warnings = warnings;

  // 提取性能指標
  extractPerformanceMetrics(playwrightResults, report);
}

/**
 * 分析 Lighthouse 結果
 */
function analyzeLighthouseResults(lighthouseResults, report) {
  if (!lighthouseResults.audits) return;

  const {audits} = lighthouseResults;

  // 提取核心指標
  if (audits['first-contentful-paint']) {
    report.metrics.pageLoad.firstContentfulPaint = audits['first-contentful-paint'].numericValue;
  }

  if (audits['largest-contentful-paint']) {
    report.metrics.pageLoad.largestContentfulPaint = audits['largest-contentful-paint'].numericValue;
  }

  if (audits['first-input-delay']) {
    report.metrics.pageLoad.firstInputDelay = audits['first-input-delay'].numericValue;
  }

  if (audits['cumulative-layout-shift']) {
    report.metrics.pageLoad.cumulativeLayoutShift = audits['cumulative-layout-shift'].numericValue;
  }

  // 提取性能分數
  if (lighthouseResults.categories && lighthouseResults.categories.performance) {
    report.details.lighthouse.performanceScore = lighthouseResults.categories.performance.score * 100;
  }

  // 提取優化建議
  if (lighthouseResults.audits) {
    const opportunities = Object.values(lighthouseResults.audits).filter(audit =>
      audit.details && audit.details.type === 'opportunity'
    );

    report.details.lighthouse.opportunities = opportunities.map(opportunity => ({
      title: opportunity.title,
      description: opportunity.description,
      score: opportunity.score,
      numericValue: opportunity.numericValue,
      displayValue: opportunity.displayValue
    }));
  }
}

/**
 * 提取性能指標
 */
function extractPerformanceMetrics(playwrightResults, report) {
  // 這裡可以從 Playwright 測試結果中提取具體的性能指標
  // 由於 Playwright 結果的結構可能因測試而異，這裡提供一個基本框架

  report.metrics.pageLoad = {
    domContentLoaded: 0,
    loadComplete: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0
  };

  report.metrics.apiPerformance = {
    averageResponseTime: 0,
    errorRate: 0,
    totalRequests: 0
  };

  report.metrics.memoryUsage = {
    initialMemory: 0,
    finalMemory: 0,
    memoryGrowth: 0
  };

  report.metrics.rendering = {
    frameRate: 0,
    droppedFrames: 0,
    animationSmoothness: 0
  };
}

/**
 * 計算總分
 */
function calculateOverallScore(report) {
  let score = 0;
  let totalWeight = 0;

  // 頁面加載性能 (30%)
  const pageLoadScore = calculatePageLoadScore(report.metrics.pageLoad);
  score += pageLoadScore * 0.3;
  totalWeight += 0.3;

  // API 性能 (25%)
  const apiScore = calculateApiScore(report.metrics.apiPerformance);
  score += apiScore * 0.25;
  totalWeight += 0.25;

  // 內存使用 (20%)
  const memoryScore = calculateMemoryScore(report.metrics.memoryUsage);
  score += memoryScore * 0.2;
  totalWeight += 0.2;

  // 渲染性能 (15%)
  const renderingScore = calculateRenderingScore(report.metrics.rendering);
  score += renderingScore * 0.15;
  totalWeight += 0.15;

  // 測試通過率 (10%)
  const testScore = report.summary.totalTests > 0 ?
    (report.summary.passedTests / report.summary.totalTests) * 100 : 0;
  score += testScore * 0.1;
  totalWeight += 0.1;

  report.summary.overallScore = Math.round(score / totalWeight);
}

/**
 * 計算頁面加載分數
 */
function calculatePageLoadScore(metrics) {
  let score = 100;

  if (metrics.domContentLoaded > PERFORMANCE_BENCHMARKS.pageLoad.domContentLoaded) {
    score -= 20;
  }

  if (metrics.largestContentfulPaint > PERFORMANCE_BENCHMARKS.pageLoad.largestContentfulPaint) {
    score -= 30;
  }

  if (metrics.firstInputDelay > PERFORMANCE_BENCHMARKS.pageLoad.firstInputDelay) {
    score -= 25;
  }

  return Math.max(0, score);
}

/**
 * 計算 API 性能分數
 */
function calculateApiScore(metrics) {
  let score = 100;

  if (metrics.averageResponseTime > PERFORMANCE_BENCHMARKS.apiPerformance.averageResponseTime) {
    score -= 30;
  }

  if (metrics.errorRate > PERFORMANCE_BENCHMARKS.apiPerformance.errorRate) {
    score -= 40;
  }

  return Math.max(0, score);
}

/**
 * 計算內存使用分數
 */
function calculateMemoryScore(metrics) {
  let score = 100;

  const memoryGrowthMB = metrics.memoryGrowth / (1024 * 1024);

  if (memoryGrowthMB > PERFORMANCE_BENCHMARKS.memoryUsage.maxMemoryGrowth) {
    score -= 50;
  }

  const finalMemoryMB = metrics.finalMemory / (1024 * 1024);
  if (finalMemoryMB > PERFORMANCE_BENCHMARKS.memoryUsage.maxMemoryUsage) {
    score -= 30;
  }

  return Math.max(0, score);
}

/**
 * 計算渲染性能分數
 */
function calculateRenderingScore(metrics) {
  let score = 100;

  if (metrics.frameRate < PERFORMANCE_BENCHMARKS.rendering.minFrameRate) {
    score -= 40;
  }

  if (metrics.droppedFrames > PERFORMANCE_BENCHMARKS.rendering.maxDroppedFrames) {
    score -= 30;
  }

  return Math.max(0, score);
}

/**
 * 生成建議
 */
function generateRecommendations(report) {
  const recommendations = [];

  // 基於總分生成建議
  if (report.summary.overallScore < 60) {
    recommendations.push('性能表現較差，需要立即優化');
  } else if (report.summary.overallScore < 80) {
    recommendations.push('性能表現一般，建議進行優化');
  } else if (report.summary.overallScore < 90) {
    recommendations.push('性能表現良好，可以進一步優化');
  } else {
    recommendations.push('性能表現優秀，保持當前水平');
  }

  // 基於具體指標生成建議
  if (report.metrics.pageLoad.largestContentfulPaint > PERFORMANCE_BENCHMARKS.pageLoad.largestContentfulPaint) {
    recommendations.push('優化最大內容繪製時間：考慮圖片優化和關鍵資源預加載');
  }

  if (report.metrics.apiPerformance.averageResponseTime > PERFORMANCE_BENCHMARKS.apiPerformance.averageResponseTime) {
    recommendations.push('優化 API 響應時間：考慮使用緩存和數據庫優化');
  }

  if (report.metrics.apiPerformance.errorRate > PERFORMANCE_BENCHMARKS.apiPerformance.errorRate) {
    recommendations.push('降低 API 錯誤率：檢查服務器穩定性和錯誤處理');
  }

  if (report.summary.criticalIssues > 0) {
    recommendations.push(`解決 ${report.summary.criticalIssues} 個關鍵性能問題`);
  }

  if (report.summary.warnings > 0) {
    recommendations.push(`處理 ${report.summary.warnings} 個性能警告`);
  }

  report.recommendations = recommendations;
}

/**
 * 保存報告
 */
function saveReport(report, outputDir) {
  // 保存 JSON 報告
  const jsonPath = path.join(outputDir, 'performance-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  // 生成 HTML 報告
  const htmlReport = generateHtmlReport(report);
  const htmlPath = path.join(outputDir, 'performance-report.html');
  fs.writeFileSync(htmlPath, htmlReport);

  // 生成 Markdown 報告
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(outputDir, 'performance-report.md');
  fs.writeFileSync(markdownPath, markdownReport);

  console.log(`📄 報告已保存到: ${outputDir}`);
}

/**
 * 生成 HTML 報告
 */
function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CardStrategy 性能報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .score { font-size: 48px; font-weight: bold; color: #007bff; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .good { border-left: 4px solid #28a745; }
        .warning { border-left: 4px solid #ffc107; }
        .critical { border-left: 4px solid #dc3545; }
        .recommendations { background: #e9ecef; padding: 15px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CardStrategy 性能報告</h1>
        <p>生成時間: ${report.metadata.timestamp}</p>
        <div class="score">${report.summary.overallScore}/100</div>
    </div>
    
    <h2>測試摘要</h2>
    <div class="metric">
        <strong>通過測試:</strong> ${report.summary.passedTests}/${report.summary.totalTests}
    </div>
    <div class="metric">
        <strong>關鍵問題:</strong> ${report.summary.criticalIssues}
    </div>
    <div class="metric">
        <strong>警告:</strong> ${report.summary.warnings}
    </div>
    
    <h2>性能指標</h2>
    <div class="metric">
        <strong>頁面加載:</strong> ${JSON.stringify(report.metrics.pageLoad, null, 2)}
    </div>
    <div class="metric">
        <strong>API 性能:</strong> ${JSON.stringify(report.metrics.apiPerformance, null, 2)}
    </div>
    <div class="metric">
        <strong>內存使用:</strong> ${JSON.stringify(report.metrics.memoryUsage, null, 2)}
    </div>
    <div class="metric">
        <strong>渲染性能:</strong> ${JSON.stringify(report.metrics.rendering, null, 2)}
    </div>
    
    <h2>優化建議</h2>
    <div class="recommendations">
        ${report.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
    </div>
</body>
</html>
  `;
}

/**
 * 生成 Markdown 報告
 */
function generateMarkdownReport(report) {
  return `# CardStrategy 性能報告

## 概述
- **生成時間**: ${report.metadata.timestamp}
- **項目版本**: ${report.metadata.version}
- **環境**: ${report.metadata.environment}

## 性能評分
**總分: ${report.summary.overallScore}/100**

## 測試摘要
- **通過測試**: ${report.summary.passedTests}/${report.summary.totalTests}
- **關鍵問題**: ${report.summary.criticalIssues}
- **警告**: ${report.summary.warnings}

## 性能指標

### 頁面加載性能
\`\`\`json
${JSON.stringify(report.metrics.pageLoad, null, 2)}
\`\`\`

### API 性能
\`\`\`json
${JSON.stringify(report.metrics.apiPerformance, null, 2)}
\`\`\`

### 內存使用
\`\`\`json
${JSON.stringify(report.metrics.memoryUsage, null, 2)}
\`\`\`

### 渲染性能
\`\`\`json
${JSON.stringify(report.metrics.rendering, null, 2)}
\`\`\`

## 優化建議
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 詳細報告
完整的 JSON 報告請查看 \`performance-report.json\` 文件。
  `;
}

/**
 * 輸出摘要
 */
function printSummary(report) {
  console.log('\n📊 性能報告摘要');
  console.log('='.repeat(50));
  console.log(`總分: ${report.summary.overallScore}/100`);
  console.log(`通過測試: ${report.summary.passedTests}/${report.summary.totalTests}`);
  console.log(`關鍵問題: ${report.summary.criticalIssues}`);
  console.log(`警告: ${report.summary.warnings}`);
  console.log('\n💡 主要建議:');
  report.recommendations.slice(0, 3).forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  console.log('='.repeat(50));
}

// 執行報告生成
if (require.main === module) {
  generatePerformanceReport();
}

module.exports = {
  generatePerformanceReport,
  generateReport,
  calculateOverallScore
};
