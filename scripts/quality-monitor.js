const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 質量監控腳本
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 * 監控和報告代碼質量指標
 */

console.log('🚀 開始質量監控...\n');

// 1. 收集質量指標
function collectQualityMetrics() {
  console.log('📋 收集質量指標...');
  
  const metrics = {
    timestamp: new Date().toISOString(),
    eslint: {},
    typescript: {},
    tests: {},
    build: {},
    coverage: {}
  };
  
  try {
    // ESLint指標
    const lintOutput = execSync('npm run lint', { encoding: 'utf8' });
    const lintLines = lintOutput.split('\n');
    let errors = 0;
    let warnings = 0;
    
    lintLines.forEach(line => {
      if (line.includes('error')) errors++;
      else if (line.includes('warning')) warnings++;
    });
    
    metrics.eslint = { errors, warnings, total: errors + warnings };
    
  } catch (error) {
    metrics.eslint = { error: 'ESLint檢查失敗' };
  }
  
  try {
    // TypeScript指標
    const typeCheckOutput = execSync('npm run type-check', { encoding: 'utf8' });
    metrics.typescript = { status: 'success', output: typeCheckOutput };
  } catch (error) {
    metrics.typescript = { status: 'error', output: error.message };
  }
  
  try {
    // 測試指標
    const testOutput = execSync('npm run test -- --passWithNoTests', { encoding: 'utf8' });
    const testMatch = testOutput.match(/(\d+) tests? passed/);
    const passedTests = testMatch ? parseInt(testMatch[1]) : 0;
    
    metrics.tests = { passed: passedTests, status: 'success' };
  } catch (error) {
    metrics.tests = { status: 'error', output: error.message };
  }
  
  try {
    // 構建指標
    const buildOutput = execSync('npm run build', { encoding: 'utf8' });
    metrics.build = { status: 'success', output: buildOutput };
  } catch (error) {
    metrics.build = { status: 'error', output: error.message };
  }
  
  console.log('✅ 質量指標收集完成');
  return metrics;
}

// 2. 生成質量報告
function generateQualityReport(metrics) {
  console.log('📋 生成質量報告...');
  
  const report = {
    summary: {
      timestamp: metrics.timestamp,
      overallStatus: 'unknown',
      score: 0
    },
    details: metrics,
    recommendations: []
  };
  
  // 計算總體狀態
  let score = 100;
  let issues = 0;
  
  // ESLint評分
  if (metrics.eslint.errors > 0) {
    score -= metrics.eslint.errors * 5;
    issues += metrics.eslint.errors;
    report.recommendations.push(`修復 ${metrics.eslint.errors} 個ESLint錯誤`);
  }
  
  if (metrics.eslint.warnings > 50) {
    score -= 10;
    report.recommendations.push('減少ESLint警告數量');
  }
  
  // TypeScript評分
  if (metrics.typescript.status === 'error') {
    score -= 20;
    issues += 1;
    report.recommendations.push('修復TypeScript類型錯誤');
  }
  
  // 測試評分
  if (metrics.tests.status === 'error') {
    score -= 15;
    issues += 1;
    report.recommendations.push('修復測試失敗');
  }
  
  if (metrics.tests.passed < 10) {
    score -= 10;
    report.recommendations.push('增加測試覆蓋率');
  }
  
  // 構建評分
  if (metrics.build.status === 'error') {
    score -= 25;
    issues += 1;
    report.recommendations.push('修復構建錯誤');
  }
  
  // 確定總體狀態
  let overallStatus = 'excellent';
  if (score < 80) overallStatus = 'good';
  if (score < 60) overallStatus = 'warning';
  if (score < 40) overallStatus = 'critical';
  
  report.summary.overallStatus = overallStatus;
  report.summary.score = Math.max(0, score);
  report.summary.issues = issues;
  
  console.log('✅ 質量報告生成完成');
  return report;
}

// 3. 保存監控數據
function saveMonitoringData(report) {
  console.log('📋 保存監控數據...');
  
  const monitoringDir = path.join(__dirname, '..', 'monitoring');
  if (!fs.existsSync(monitoringDir)) {
    fs.mkdirSync(monitoringDir, { recursive: true });
  }
  
  // 保存詳細報告
  const reportPath = path.join(monitoringDir, `quality-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 更新最新報告
  const latestReportPath = path.join(monitoringDir, 'latest-quality-report.json');
  fs.writeFileSync(latestReportPath, JSON.stringify(report, null, 2));
  
  // 保存歷史數據
  const historyPath = path.join(monitoringDir, 'quality-history.json');
  let history = [];
  
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  }
  
  history.push({
    timestamp: report.summary.timestamp,
    score: report.summary.score,
    status: report.summary.overallStatus,
    issues: report.summary.issues
  });
  
  // 只保留最近30天的數據
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  history = history.filter(entry => 
    new Date(entry.timestamp) > thirtyDaysAgo
  );
  
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  
  console.log('✅ 監控數據保存完成');
  console.log(`  詳細報告: ${reportPath}`);
  console.log(`  最新報告: ${latestReportPath}`);
  console.log(`  歷史數據: ${historyPath}`);
  
  return { reportPath, latestReportPath, historyPath };
}

// 4. 生成趨勢分析
function generateTrendAnalysis(historyPath) {
  console.log('📋 生成趨勢分析...');
  
  if (!fs.existsSync(historyPath)) {
    console.log('⚠️ 沒有歷史數據可供分析');
    return null;
  }
  
  const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  
  if (history.length < 2) {
    console.log('⚠️ 歷史數據不足，無法生成趨勢分析');
    return null;
  }
  
  const trend = {
    totalEntries: history.length,
    averageScore: 0,
    scoreTrend: 'stable',
    issuesTrend: 'stable',
    recommendations: []
  };
  
  // 計算平均分數
  const totalScore = history.reduce((sum, entry) => sum + entry.score, 0);
  trend.averageScore = Math.round(totalScore / history.length);
  
  // 分析分數趨勢
  const recentScores = history.slice(-7).map(entry => entry.score);
  const olderScores = history.slice(0, -7).map(entry => entry.score);
  
  if (recentScores.length > 0 && olderScores.length > 0) {
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
    
    if (recentAvg > olderAvg + 5) {
      trend.scoreTrend = 'improving';
    } else if (recentAvg < olderAvg - 5) {
      trend.scoreTrend = 'declining';
    }
  }
  
  // 分析問題趨勢
  const recentIssues = history.slice(-7).map(entry => entry.issues);
  const olderIssues = history.slice(0, -7).map(entry => entry.issues);
  
  if (recentIssues.length > 0 && olderIssues.length > 0) {
    const recentAvg = recentIssues.reduce((sum, issues) => sum + issues, 0) / recentIssues.length;
    const olderAvg = olderIssues.reduce((sum, issues) => sum + issues, 0) / olderIssues.length;
    
    if (recentAvg < olderAvg - 2) {
      trend.issuesTrend = 'improving';
    } else if (recentAvg > olderAvg + 2) {
      trend.issuesTrend = 'declining';
    }
  }
  
  // 生成建議
  if (trend.scoreTrend === 'declining') {
    trend.recommendations.push('代碼質量正在下降，建議加強代碼審查');
  }
  
  if (trend.issuesTrend === 'declining') {
    trend.recommendations.push('問題數量正在增加，建議優先修復關鍵問題');
  }
  
  if (trend.averageScore < 70) {
    trend.recommendations.push('平均質量分數較低，建議實施質量改進計劃');
  }
  
  console.log('✅ 趨勢分析生成完成');
  return trend;
}

// 5. 輸出監控報告
function outputMonitoringReport(report, trend) {
  console.log('\n📊 質量監控報告');
  console.log('='.repeat(60));
  
  console.log(`📅 監控時間: ${report.summary.timestamp}`);
  console.log(`📈 總體狀態: ${report.summary.overallStatus.toUpperCase()}`);
  console.log(`🎯 質量分數: ${report.summary.score}/100`);
  console.log(`⚠️ 問題數量: ${report.summary.issues}`);
  
  console.log('\n📋 詳細指標:');
  console.log(`  ESLint: ${report.details.eslint.errors} 錯誤, ${report.details.eslint.warnings} 警告`);
  console.log(`  TypeScript: ${report.details.typescript.status}`);
  console.log(`  測試: ${report.details.tests.passed} 通過, 狀態: ${report.details.tests.status}`);
  console.log(`  構建: ${report.details.build.status}`);
  
  if (trend) {
    console.log('\n📈 趨勢分析:');
    console.log(`  平均分數: ${trend.averageScore}/100`);
    console.log(`  分數趨勢: ${trend.scoreTrend}`);
    console.log(`  問題趨勢: ${trend.issuesTrend}`);
    console.log(`  數據點數: ${trend.totalEntries}`);
  }
  
  console.log('\n💡 改進建議:');
  report.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  if (trend && trend.recommendations.length > 0) {
    trend.recommendations.forEach((rec, index) => {
      console.log(`  ${index + report.recommendations.length + 1}. ${rec}`);
    });
  }
  
  console.log('\n🚀 下一步行動:');
  if (report.summary.score >= 80) {
    console.log('  ✅ 代碼質量良好，繼續保持');
  } else if (report.summary.score >= 60) {
    console.log('  ⚠️ 代碼質量需要改進，優先處理建議事項');
  } else {
    console.log('  ❌ 代碼質量較差，需要立即採取行動');
  }
}

// 主函數
function main() {
  try {
    console.log('🚀 開始質量監控...\n');
    
    // 階段1：收集指標
    const metrics = collectQualityMetrics();
    
    // 階段2：生成報告
    const report = generateQualityReport(metrics);
    
    // 階段3：保存數據
    const dataPaths = saveMonitoringData(report);
    
    // 階段4：趨勢分析
    const trend = generateTrendAnalysis(dataPaths.historyPath);
    
    // 階段5：輸出報告
    outputMonitoringReport(report, trend);
    
    console.log('\n🎯 質量監控完成！');
    console.log('📋 監控內容：');
    console.log('  - 代碼質量指標收集');
    console.log('  - 質量報告生成');
    console.log('  - 監控數據保存');
    console.log('  - 趨勢分析');
    console.log('  - 改進建議');
    
    console.log('\n🚀 下一步行動：');
    console.log('  1. 根據建議改進代碼質量');
    console.log('  2. 定期運行監控腳本');
    console.log('  3. 追蹤改進效果');
    console.log('  4. 調整監控策略');
    
  } catch (error) {
    console.error('❌ 質量監控失敗:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  collectQualityMetrics,
  generateQualityReport,
  saveMonitoringData,
  generateTrendAnalysis,
  outputMonitoringReport,
  main,
};
