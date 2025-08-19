#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 安全測試基準
const SECURITY_BENCHMARKS = {
  // 漏洞嚴重程度評分
  severityScores: {
    critical: 10,
    high: 7,
    medium: 4,
    low: 1
  },
  // 安全測試類型權重
  testTypeWeights: {
    'XSS': 0.20,
    'SQL Injection': 0.20,
    'CSRF': 0.15,
    'Authentication': 0.15,
    'Authorization': 0.10,
    'Input Validation': 0.10,
    'Session Management': 0.05,
    'HTTPS/SSL': 0.05
  },
  // 安全等級標準
  securityGrades: {
    A: { min: 90, description: '優秀 - 安全性極高' },
    B: { min: 80, description: '良好 - 安全性高' },
    C: { min: 70, description: '一般 - 安全性中等' },
    D: { min: 60, description: '較差 - 存在安全風險' },
    F: { min: 0, description: '危險 - 存在嚴重安全漏洞' }
  }
};

/**
 * 生成安全測試報告
 */
function generateSecurityReport() {
  console.log('🔒 開始生成安全測試報告...');

  try {
    // 收集測試結果
    const testResults = collectSecurityTestResults();

    // 生成報告數據
    const report = generateSecurityReportData(testResults);

    // 保存報告
    saveSecurityReport(report, 'test-results');

    // 打印摘要
    printSecuritySummary(report);

    console.log('✅ 安全測試報告生成完成！');

  } catch (error) {
    console.error('❌ 生成安全測試報告失敗:', error.message);
    process.exit(1);
  }
}

/**
 * 收集安全測試結果
 */
function collectSecurityTestResults() {
  const resultsDir = path.join(__dirname, '..', 'test-results');
  const results = {
    basic: null,
    advanced: null,
    totalViolations: 0,
    violationsBySeverity: {},
    violationsByType: {},
    testCoverage: {}
  };

  // 讀取基本安全測試結果
  const basicReportPath = path.join(resultsDir, 'security-basic-report.json');
  if (fs.existsSync(basicReportPath)) {
    try {
      results.basic = JSON.parse(fs.readFileSync(basicReportPath, 'utf8'));
      console.log('📄 讀取基本安全測試結果');
    } catch (error) {
      console.warn('⚠️ 無法讀取基本安全測試結果:', error.message);
    }
  }

  // 讀取高級安全測試結果
  const advancedReportPath = path.join(resultsDir, 'security-advanced-report.json');
  if (fs.existsSync(advancedReportPath)) {
    try {
      results.advanced = JSON.parse(fs.readFileSync(advancedReportPath, 'utf8'));
      console.log('📄 讀取高級安全測試結果');
    } catch (error) {
      console.warn('⚠️ 無法讀取高級安全測試結果:', error.message);
    }
  }

  // 合併結果
  if (results.basic) {
    results.totalViolations += results.basic.totalViolations || 0;
    mergeViolations(results.violationsBySeverity, results.basic.violationsBySeverity);
    mergeViolations(results.violationsByType, results.basic.violationsByType);
  }

  if (results.advanced) {
    results.totalViolations += results.advanced.totalViolations || 0;
    mergeViolations(results.violationsBySeverity, results.advanced.violationsBySeverity);
    mergeViolations(results.violationsByType, results.advanced.violationsByType);
  }

  return results;
}

/**
 * 合併違規統計
 */
function mergeViolations(target, source) {
  if (!source) return;

  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] || 0) + value;
  }
}

/**
 * 生成安全測試報告數據
 */
function generateSecurityReportData(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalViolations: testResults.totalViolations,
      securityScore: calculateSecurityScore(testResults),
      securityGrade: calculateSecurityGrade(testResults),
      testCoverage: calculateTestCoverage(testResults)
    },
    violations: {
      bySeverity: testResults.violationsBySeverity,
      byType: testResults.violationsByType,
      details: []
    },
    recommendations: generateSecurityRecommendations(testResults),
    testResults: {
      basic: testResults.basic,
      advanced: testResults.advanced
    }
  };

  // 添加詳細違規信息
  if (testResults.basic && testResults.basic.violations) {
    report.violations.details.push(...testResults.basic.violations);
  }

  if (testResults.advanced && testResults.advanced.violations) {
    report.violations.details.push(...testResults.advanced.violations);
  }

  return report;
}

/**
 * 計算安全評分
 */
function calculateSecurityScore(testResults) {
  let totalScore = 100;
  let totalWeight = 0;

  // 根據違規嚴重程度扣分
  for (const [severity, count] of Object.entries(testResults.violationsBySeverity || {})) {
    const score = SECURITY_BENCHMARKS.severityScores[severity] || 0;
    totalScore -= score * count;
    totalWeight += count;
  }

  // 根據違規類型扣分
  for (const [type, count] of Object.entries(testResults.violationsByType || {})) {
    const weight = SECURITY_BENCHMARKS.testTypeWeights[type] || 0.05;
    totalScore -= weight * 10 * count;
  }

  return Math.max(0, Math.round(totalScore));
}

/**
 * 計算安全等級
 */
function calculateSecurityGrade(testResults) {
  const score = calculateSecurityScore(testResults);

  for (const [grade, criteria] of Object.entries(SECURITY_BENCHMARKS.securityGrades)) {
    if (score >= criteria.min) {
      return {
        grade,
        score,
        description: criteria.description
      };
    }
  }

  return {
    grade: 'F',
    score,
    description: '危險 - 存在嚴重安全漏洞'
  };
}

/**
 * 計算測試覆蓋率
 */
function calculateTestCoverage(testResults) {
  const totalTests = 8; // 基本安全測試數量
  const advancedTests = 10; // 高級安全測試數量

  let coveredTests = 0;

  if (testResults.basic) coveredTests += totalTests;
  if (testResults.advanced) coveredTests += advancedTests;

  return {
    total: totalTests + advancedTests,
    covered: coveredTests,
    percentage: Math.round((coveredTests / (totalTests + advancedTests)) * 100)
  };
}

/**
 * 生成安全建議
 */
function generateSecurityRecommendations(testResults) {
  const recommendations = [];

  // 根據違規類型生成建議
  for (const [type, count] of Object.entries(testResults.violationsByType || {})) {
    if (count > 0) {
      switch (type) {
        case 'XSS':
          recommendations.push({
            priority: 'critical',
            category: 'XSS',
            title: '修復 XSS 漏洞',
            description: `發現 ${count} 個 XSS 漏洞，需要立即修復`,
            actions: [
              '實施輸入驗證和輸出編碼',
              '使用 CSP (Content Security Policy)',
              '避免使用 innerHTML 和 eval()',
              '對所有用戶輸入進行 HTML 實體編碼'
            ]
          });
          break;

        case 'SQL Injection':
          recommendations.push({
            priority: 'critical',
            category: 'SQL Injection',
            title: '修復 SQL 注入漏洞',
            description: `發現 ${count} 個 SQL 注入漏洞，需要立即修復`,
            actions: [
              '使用參數化查詢或預處理語句',
              '實施輸入驗證和過濾',
              '使用 ORM 框架',
              '限制數據庫用戶權限'
            ]
          });
          break;

        case 'CSRF':
          recommendations.push({
            priority: 'high',
            category: 'CSRF',
            title: '實施 CSRF 保護',
            description: `發現 ${count} 個 CSRF 漏洞`,
            actions: [
              '實施 CSRF token',
              '使用 SameSite cookie 屬性',
              '驗證 Referer 標頭',
              '實施雙重提交 cookie 模式'
            ]
          });
          break;

        case 'Authentication':
          recommendations.push({
            priority: 'high',
            category: 'Authentication',
            title: '加強認證機制',
            description: `發現 ${count} 個認證相關問題`,
            actions: [
              '實施強密碼策略',
              '添加多因素認證',
              '實施帳戶鎖定機制',
              '使用安全的會話管理'
            ]
          });
          break;

        case 'Authorization':
          recommendations.push({
            priority: 'high',
            category: 'Authorization',
            title: '加強授權控制',
            description: `發現 ${count} 個授權相關問題`,
            actions: [
              '實施基於角色的訪問控制 (RBAC)',
              '驗證所有 API 端點的權限',
              '實施最小權限原則',
              '定期審計用戶權限'
            ]
          });
          break;

        default:
          recommendations.push({
            priority: 'medium',
            category: type,
            title: `修復 ${type} 問題`,
            description: `發現 ${count} 個 ${type} 相關問題`,
            actions: [
              '進行詳細的安全審計',
              '實施相應的安全措施',
              '定期進行安全測試'
            ]
          });
      }
    }
  }

  // 根據嚴重程度添加一般建議
  const criticalCount = testResults.violationsBySeverity?.critical || 0;
  const highCount = testResults.violationsBySeverity?.high || 0;

  if (criticalCount > 0) {
    recommendations.unshift({
      priority: 'critical',
      category: 'General',
      title: '緊急安全修復',
      description: `發現 ${criticalCount} 個嚴重安全漏洞，需要立即修復`,
      actions: [
        '立即修復所有嚴重漏洞',
        '暫停相關功能直到修復完成',
        '通知相關團隊和用戶',
        '進行全面的安全審計'
      ]
    });
  }

  if (highCount > 0) {
    recommendations.push({
      priority: 'high',
      category: 'General',
      title: '高優先級安全改進',
      description: `發現 ${highCount} 個高風險安全問題`,
      actions: [
        '優先修復高風險問題',
        '加強安全監控',
        '更新安全策略',
        '進行安全培訓'
      ]
    });
  }

  return recommendations;
}

/**
 * 保存安全測試報告
 */
function saveSecurityReport(report, outputDir) {
  const outputPath = path.join(__dirname, '..', outputDir);

  // 確保輸出目錄存在
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // 保存 JSON 報告
  const jsonPath = path.join(outputPath, 'security-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON 報告已保存: ${jsonPath}`);

  // 保存 HTML 報告
  const htmlPath = path.join(outputPath, 'security-report.html');
  const htmlContent = generateSecurityHtmlReport(report);
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`📄 HTML 報告已保存: ${htmlPath}`);

  // 保存 Markdown 報告
  const mdPath = path.join(outputPath, 'security-report.md');
  const mdContent = generateSecurityMarkdownReport(report);
  fs.writeFileSync(mdPath, mdContent);
  console.log(`📄 Markdown 報告已保存: ${mdPath}`);
}

/**
 * 生成 HTML 報告
 */
function generateSecurityHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CardStrategy 安全測試報告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header .timestamp {
            opacity: 0.8;
            margin-top: 10px;
        }
        .summary {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .score-card {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            font-weight: bold;
            color: white;
            margin-right: 30px;
        }
        .score-grade-A { background: #4CAF50; }
        .score-grade-B { background: #8BC34A; }
        .score-grade-C { background: #FFC107; }
        .score-grade-D { background: #FF9800; }
        .score-grade-F { background: #F44336; }
        .score-details h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .score-details p {
            margin: 5px 0;
            color: #666;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .violations {
            padding: 30px;
        }
        .violations h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .severity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .severity-card {
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            color: white;
        }
        .severity-critical { background: #F44336; }
        .severity-high { background: #FF9800; }
        .severity-medium { background: #FFC107; }
        .severity-low { background: #4CAF50; }
        .recommendations {
            padding: 30px;
            background: #f8f9fa;
        }
        .recommendation {
            background: white;
            margin: 15px 0;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        .recommendation h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .recommendation .priority {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .priority-critical { background: #F44336; color: white; }
        .priority-high { background: #FF9800; color: white; }
        .priority-medium { background: #FFC107; color: black; }
        .priority-low { background: #4CAF50; color: white; }
        .recommendation ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .recommendation li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 CardStrategy 安全測試報告</h1>
            <div class="timestamp">生成時間: ${new Date(report.timestamp).toLocaleString('zh-TW')}</div>
        </div>
        
        <div class="summary">
            <div class="score-card">
                <div class="score-circle score-grade-${report.summary.securityGrade.grade}">
                    ${report.summary.securityGrade.grade}
                </div>
                <div class="score-details">
                    <h3>安全評分: ${report.summary.securityGrade.score}/100</h3>
                    <p>${report.summary.securityGrade.description}</p>
                    <p>測試覆蓋率: ${report.summary.testCoverage.percentage}%</p>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${report.summary.totalViolations}</div>
                    <div class="stat-label">總違規數</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${report.summary.testCoverage.covered}</div>
                    <div class="stat-label">已測試項目</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${report.violations.bySeverity.critical || 0}</div>
                    <div class="stat-label">嚴重漏洞</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${report.violations.bySeverity.high || 0}</div>
                    <div class="stat-label">高風險問題</div>
                </div>
            </div>
        </div>
        
        <div class="violations">
            <h2>違規詳情</h2>
            
            <div class="severity-grid">
                ${Object.entries(report.violations.bySeverity).map(([severity, count]) => `
                    <div class="severity-card severity-${severity}">
                        <div style="font-size: 1.5em; font-weight: bold;">${count}</div>
                        <div>${severity.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
            
            <h3>違規類型分布</h3>
            <div class="stats-grid">
                ${Object.entries(report.violations.byType).map(([type, count]) => `
                    <div class="stat-card">
                        <div class="stat-number">${count}</div>
                        <div class="stat-label">${type}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="recommendations">
            <h2>安全建議</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation">
                    <span class="priority priority-${rec.priority}">${rec.priority.toUpperCase()}</span>
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
}

/**
 * 生成 Markdown 報告
 */
function generateSecurityMarkdownReport(report) {
  return `# 🔒 CardStrategy 安全測試報告

**生成時間:** ${new Date(report.timestamp).toLocaleString('zh-TW')}

## 📊 執行摘要

| 項目 | 數值 |
|------|------|
| 安全評分 | **${report.summary.securityGrade.score}/100** |
| 安全等級 | **${report.summary.securityGrade.grade}** |
| 總違規數 | **${report.summary.totalViolations}** |
| 測試覆蓋率 | **${report.summary.testCoverage.percentage}%** |

### 安全等級說明
**${report.summary.securityGrade.description}**

## 🚨 違規統計

### 按嚴重程度分類
${Object.entries(report.violations.bySeverity).map(([severity, count]) =>
    `- **${severity.toUpperCase()}**: ${count} 個`
  ).join('\n')}

### 按類型分類
${Object.entries(report.violations.byType).map(([type, count]) =>
    `- **${type}**: ${count} 個`
  ).join('\n')}

## 📋 詳細違規

${report.violations.details.map((violation, index) => `
### ${index + 1}. ${violation.type} - ${violation.severity.toUpperCase()}

**描述:** ${violation.description}

**時間:** ${new Date(violation.timestamp).toLocaleString('zh-TW')}

**詳情:** \`\`\`json
${JSON.stringify(violation.details, null, 2)}
\`\`\`
`).join('\n')}

## 💡 安全建議

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} [${rec.priority.toUpperCase()}]

**類別:** ${rec.category}

**描述:** ${rec.description}

**建議行動:**
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## 📈 測試覆蓋率

- **總測試項目:** ${report.summary.testCoverage.total}
- **已測試項目:** ${report.summary.testCoverage.covered}
- **覆蓋率:** ${report.summary.testCoverage.percentage}%

## 🔍 測試結果詳情

### 基本安全測試
${report.testResults.basic ? `
- **狀態:** 已完成
- **違規數:** ${report.testResults.basic.totalViolations || 0}
` : '- **狀態:** 未執行'}

### 高級安全測試
${report.testResults.advanced ? `
- **狀態:** 已完成
- **違規數:** ${report.testResults.advanced.totalViolations || 0}
` : '- **狀態:** 未執行'}

---

*此報告由 CardStrategy 安全測試系統自動生成*
`;
}

/**
 * 打印安全測試摘要
 */
function printSecuritySummary(report) {
  console.log('\n📊 安全測試報告摘要');
  console.log('='.repeat(50));
  console.log(`安全評分: ${report.summary.securityGrade.score}/100`);
  console.log(`安全等級: ${report.summary.securityGrade.grade}`);
  console.log(`等級說明: ${report.summary.securityGrade.description}`);
  console.log(`總違規數: ${report.summary.totalViolations}`);
  console.log(`測試覆蓋率: ${report.summary.testCoverage.percentage}%`);

  console.log('\n🚨 違規統計:');
  for (const [severity, count] of Object.entries(report.violations.bySeverity)) {
    console.log(`  ${severity.toUpperCase()}: ${count} 個`);
  }

  console.log('\n📋 違規類型:');
  for (const [type, count] of Object.entries(report.violations.byType)) {
    console.log(`  ${type}: ${count} 個`);
  }

  console.log('\n💡 主要建議:');
  const criticalRecs = report.recommendations.filter(r => r.priority === 'critical');
  const highRecs = report.recommendations.filter(r => r.priority === 'high');

  if (criticalRecs.length > 0) {
    console.log('  緊急修復:');
    criticalRecs.forEach(rec => console.log(`    - ${rec.title}`));
  }

  if (highRecs.length > 0) {
    console.log('  高優先級:');
    highRecs.forEach(rec => console.log(`    - ${rec.title}`));
  }

  console.log('\n📄 報告文件:');
  console.log('  - test-results/security-report.json');
  console.log('  - test-results/security-report.html');
  console.log('  - test-results/security-report.md');
}

// 如果直接運行此腳本
if (require.main === module) {
  generateSecurityReport();
}

module.exports = {
  generateSecurityReport,
  generateSecurityReportData,
  calculateSecurityScore
};
