#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 數據保留管理基準
const DATA_RETENTION_BENCHMARKS = {
  // 保留策略評分
  retentionPolicyScores: {
    excellent: 90,
    good: 80,
    fair: 70,
    poor: 60,
  },
  // 合規框架權重
  complianceFrameworkWeights: {
    gdpr: 0.3,
    ccpa: 0.25,
    sox: 0.25,
    hipaa: 0.2,
  },
  // 數據保留等級標準
  retentionGrades: {
    A: { min: 90, description: '優秀 - 數據保留管理極佳' },
    B: { min: 80, description: '良好 - 數據保留管理良好' },
    C: { min: 70, description: '一般 - 數據保留管理中等' },
    D: { min: 60, description: '較差 - 存在數據保留問題' },
    F: { min: 0, description: '危險 - 存在嚴重數據保留問題' },
  },
  // 數據類型保留標準
  dataTypeRetentionStandards: {
    userLogs: { minDays: 30, maxDays: 365, recommended: 90 },
    auditTrails: { minDays: 90, maxDays: 2555, recommended: 365 },
    tempFiles: { minDays: 1, maxDays: 30, recommended: 7 },
    cacheData: { minDays: 1, maxDays: 90, recommended: 30 },
    sessionData: { minDays: 1, maxDays: 7, recommended: 1 },
    analyticsData: { minDays: 30, maxDays: 730, recommended: 180 },
    backupData: { minDays: 30, maxDays: 2555, recommended: 730 },
    testData: { minDays: 1, maxDays: 7, recommended: 1 },
  },
};

/**
 * 生成數據保留管理報告
 */
function generateDataRetentionReport() {
  // logger.info('🗂️ 開始生成數據保留管理報告...');

  try {
    // 收集測試結果
    const testResults = collectDataRetentionTestResults();

    // 生成報告數據
    const report = generateDataRetentionReportData(testResults);

    // 保存報告
    saveDataRetentionReport(report, 'test-results');

    // 打印摘要
    printDataRetentionSummary(report);

    // logger.info('✅ 數據保留管理報告生成完成！');
  } catch (error) {
    // logger.info('❌ 生成數據保留管理報告失敗:', error.message);
    process.exit(1);
  }
}

/**
 * 收集數據保留測試結果
 */
function collectDataRetentionTestResults() {
  const resultsDir = path.join(__dirname, '..', 'test-results');
  const results = {
    basic: null,
    advanced: null,
    totalViolations: 0,
    violationsByType: {},
    violationsByCompliance: {},
    retentionPolicies: {},
    complianceStatus: {},
  };

  // 讀取基本數據保留測試結果
  const basicReportPath = path.join(
    resultsDir,
    'data-retention-basic-report.json'
  );
  if (fs.existsSync(basicReportPath)) {
    try {
      results.basic = JSON.parse(fs.readFileSync(basicReportPath, 'utf8'));
      // logger.info('📄 讀取基本數據保留測試結果');
    } catch (error) {
      // logger.info('⚠️ 無法讀取基本數據保留測試結果:', error.message);
    }
  }

  // 讀取高級數據保留測試結果
  const advancedReportPath = path.join(
    resultsDir,
    'data-retention-advanced-report.json'
  );
  if (fs.existsSync(advancedReportPath)) {
    try {
      results.advanced = JSON.parse(
        fs.readFileSync(advancedReportPath, 'utf8')
      );
      // logger.info('📄 讀取高級數據保留測試結果');
    } catch (error) {
      // logger.info('⚠️ 無法讀取高級數據保留測試結果:', error.message);
    }
  }

  // 合併結果
  if (results.basic) {
    results.totalViolations += results.basic.totalViolations || 0;
    mergeViolations(results.violationsByType, results.basic.violationsByType);
    mergeViolations(
      results.violationsByCompliance,
      results.basic.violationsByCompliance
    );
  }

  if (results.advanced) {
    results.totalViolations += results.advanced.totalViolations || 0;
    mergeViolations(
      results.violationsByType,
      results.advanced.violationsByType
    );
    mergeViolations(
      results.violationsByCompliance,
      results.advanced.violationsByCompliance
    );
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
 * 生成數據保留管理報告數據
 */
function generateDataRetentionReportData(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalViolations: testResults.totalViolations,
      retentionScore: calculateRetentionScore(testResults),
      retentionGrade: calculateRetentionGrade(testResults),
      complianceStatus: calculateComplianceStatus(testResults),
      policyEffectiveness: calculatePolicyEffectiveness(testResults),
    },
    violations: {
      byType: testResults.violationsByType,
      byCompliance: testResults.violationsByCompliance,
      details: [],
    },
    recommendations: generateDataRetentionRecommendations(testResults),
    testResults: {
      basic: testResults.basic,
      advanced: testResults.advanced,
    },
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
 * 計算數據保留評分
 */
function calculateRetentionScore(testResults) {
  let totalScore = 100;

  // 根據違規類型扣分
  for (const [type, count] of Object.entries(
    testResults.violationsByType || {}
  )) {
    const weight = getViolationWeight(type);
    totalScore -= weight * count;
  }

  // 根據合規違規扣分
  for (const [compliance, count] of Object.entries(
    testResults.violationsByCompliance || {}
  )) {
    const weight =
      DATA_RETENTION_BENCHMARKS.complianceFrameworkWeights[compliance] || 0.1;
    totalScore -= weight * 10 * count;
  }

  return Math.max(0, Math.round(totalScore));
}

/**
 * 獲取違規權重
 */
function getViolationWeight(type) {
  const weights = {
    retention_policy: 5,
    data_cleanup: 4,
    compliance: 8,
    size_monitoring: 3,
    automated_scheduling: 4,
    data_recovery: 6,
    intelligent_cleanup: 3,
    selective_archiving: 4,
    incremental_backup: 5,
    data_classification: 4,
    lifecycle_management: 5,
    deduplication: 3,
    disaster_recovery: 7,
    governance_audit: 6,
  };

  return weights[type] || 2;
}

/**
 * 計算數據保留等級
 */
function calculateRetentionGrade(testResults) {
  const score = calculateRetentionScore(testResults);

  for (const [grade, criteria] of Object.entries(
    DATA_RETENTION_BENCHMARKS.retentionGrades
  )) {
    if (score >= criteria.min) {
      return {
        grade,
        score,
        description: criteria.description,
      };
    }
  }

  return {
    grade: 'F',
    score,
    description: '危險 - 存在嚴重數據保留問題',
  };
}

/**
 * 計算合規狀態
 */
function calculateComplianceStatus(testResults) {
  const complianceFrameworks = ['gdpr', 'ccpa', 'sox', 'hipaa'];
  const status = {};

  for (const framework of complianceFrameworks) {
    const violations = testResults.violationsByCompliance[framework] || 0;
    status[framework] = {
      violations,
      compliant: violations === 0,
      score: Math.max(0, 100 - violations * 10),
    };
  }

  return status;
}

/**
 * 計算策略有效性
 */
function calculatePolicyEffectiveness(testResults) {
  const policyTypes = [
    'retention_policy',
    'data_cleanup',
    'size_monitoring',
    'automated_scheduling',
    'data_recovery',
  ];

  const effectiveness = {};

  for (const policy of policyTypes) {
    const violations = testResults.violationsByType[policy] || 0;
    effectiveness[policy] = {
      violations,
      effective: violations <= 2,
      score: Math.max(0, 100 - violations * 15),
    };
  }

  return effectiveness;
}

/**
 * 生成數據保留建議
 */
function generateDataRetentionRecommendations(testResults) {
  const recommendations = [];

  // 根據違規類型生成建議
  for (const [type, count] of Object.entries(
    testResults.violationsByType || {}
  )) {
    if (count > 0) {
      switch (type) {
        case 'retention_policy':
          recommendations.push({
            priority: 'high',
            category: 'Retention Policy',
            title: '修復數據保留策略問題',
            description: `發現 ${count} 個數據保留策略相關問題`,
            actions: [
              '審查並更新數據保留策略',
              '確保策略符合合規要求',
              '實施自動化策略執行',
              '定期審計策略有效性',
            ],
          });
          break;

        case 'data_cleanup':
          recommendations.push({
            priority: 'high',
            category: 'Data Cleanup',
            title: '修復數據清理機制問題',
            description: `發現 ${count} 個數據清理機制問題`,
            actions: [
              '實施自動化數據清理',
              '建立清理日誌和審計',
              '確保清理過程的安全性',
              '定期測試清理機制',
            ],
          });
          break;

        case 'compliance':
          recommendations.push({
            priority: 'critical',
            category: 'Compliance',
            title: '修復合規性問題',
            description: `發現 ${count} 個合規性問題`,
            actions: [
              '立即審查合規要求',
              '實施必要的合規措施',
              '建立合規監控機制',
              '進行合規培訓',
            ],
          });
          break;

        case 'size_monitoring':
          recommendations.push({
            priority: 'medium',
            category: 'Size Monitoring',
            title: '改進數據大小監控',
            description: `發現 ${count} 個數據大小監控問題`,
            actions: [
              '實施實時大小監控',
              '設置大小限制警報',
              '優化數據存儲策略',
              '定期分析存儲趨勢',
            ],
          });
          break;

        case 'automated_scheduling':
          recommendations.push({
            priority: 'medium',
            category: 'Automated Scheduling',
            title: '改進自動化調度',
            description: `發現 ${count} 個自動化調度問題`,
            actions: [
              '優化清理調度頻率',
              '實施智能調度算法',
              '監控調度執行效果',
              '建立調度備份機制',
            ],
          });
          break;

        case 'data_recovery':
          recommendations.push({
            priority: 'high',
            category: 'Data Recovery',
            title: '改進數據恢復機制',
            description: `發現 ${count} 個數據恢復機制問題`,
            actions: [
              '測試數據恢復流程',
              '優化恢復時間目標',
              '建立多站點備份',
              '定期進行恢復演練',
            ],
          });
          break;

        default:
          recommendations.push({
            priority: 'medium',
            category: type,
            title: `修復 ${type} 問題`,
            description: `發現 ${count} 個 ${type} 相關問題`,
            actions: [
              '進行詳細的數據保留審計',
              '實施相應的改進措施',
              '定期進行數據保留測試',
            ],
          });
      }
    }
  }

  // 根據合規違規添加建議
  for (const [compliance, count] of Object.entries(
    testResults.violationsByCompliance || {}
  )) {
    if (count > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Compliance',
        title: `修復 ${compliance.toUpperCase()} 合規問題`,
        description: `發現 ${count} 個 ${compliance.toUpperCase()} 合規問題`,
        actions: [
          `審查 ${compliance.toUpperCase()} 合規要求`,
          '實施必要的合規措施',
          '建立合規監控和報告',
          '進行合規培訓和意識提升',
        ],
      });
    }
  }

  return recommendations;
}

/**
 * 保存數據保留管理報告
 */
function saveDataRetentionReport(report, outputDir) {
  const outputPath = path.join(__dirname, '..', outputDir);

  // 確保輸出目錄存在
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // 保存 JSON 報告
  const jsonPath = path.join(outputPath, 'data-retention-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  // logger.info(`📄 JSON 報告已保存: ${jsonPath}`);

  // 保存 HTML 報告
  const htmlPath = path.join(outputPath, 'data-retention-report.html');
  const htmlContent = generateDataRetentionHtmlReport(report);
  fs.writeFileSync(htmlPath, htmlContent);
  // logger.info(`📄 HTML 報告已保存: ${htmlPath}`);

  // 保存 Markdown 報告
  const mdPath = path.join(outputPath, 'data-retention-report.md');
  const mdContent = generateDataRetentionMarkdownReport(report);
  fs.writeFileSync(mdPath, mdContent);
  // logger.info(`📄 Markdown 報告已保存: ${mdPath}`);
}

/**
 * 生成 HTML 報告
 */
function generateDataRetentionHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CardStrategy 數據保留管理報告</title>
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
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
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
        .compliance-section {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .compliance-section h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .compliance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        .compliance-card {
            background: white;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            border-left: 4px solid #4CAF50;
        }
        .compliance-card.non-compliant {
            border-left-color: #F44336;
        }
        .violations {
            padding: 30px;
        }
        .violations h2 {
            color: #333;
            border-bottom: 2px solid #2196F3;
            padding-bottom: 10px;
        }
        .recommendations {
            padding: 30px;
            background: #f8f9fa;
        }
        .recommendation {
            background: white;
            margin: 15px 0;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #2196F3;
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
            <h1>🗂️ CardStrategy 數據保留管理報告</h1>
            <div class="timestamp">生成時間: ${new Date(report.timestamp).toLocaleString('zh-TW')}</div>
        </div>
        
        <div class="summary">
            <div class="score-card">
                <div class="score-circle score-grade-${report.summary.retentionGrade.grade}">
                    ${report.summary.retentionGrade.grade}
                </div>
                <div class="score-details">
                    <h3>數據保留評分: ${report.summary.retentionGrade.score}/100</h3>
                    <p>${report.summary.retentionGrade.description}</p>
                    <p>總違規數: ${report.summary.totalViolations}</p>
                </div>
            </div>
            
            <div class="compliance-section">
                <h3>合規狀態</h3>
                <div class="compliance-grid">
                    ${Object.entries(report.summary.complianceStatus)
                      .map(
                        ([framework, status]) => `
                        <div class="compliance-card ${status.compliant ? '' : 'non-compliant'}">
                            <div style="font-size: 1.2em; font-weight: bold;">${framework.toUpperCase()}</div>
                            <div>${status.compliant ? '合規' : '不合規'}</div>
                            <div style="font-size: 0.9em; color: #666;">${status.score}/100</div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${report.summary.totalViolations}</div>
                    <div class="stat-label">總違規數</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Object.keys(report.violations.byType).length}</div>
                    <div class="stat-label">違規類型</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Object.keys(report.summary.complianceStatus).filter((k) => report.summary.complianceStatus[k].compliant).length}</div>
                    <div class="stat-label">合規框架</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${report.recommendations.length}</div>
                    <div class="stat-label">建議數量</div>
                </div>
            </div>
        </div>
        
        <div class="violations">
            <h2>違規詳情</h2>
            
            <h3>按類型分類</h3>
            <div class="stats-grid">
                ${Object.entries(report.violations.byType)
                  .map(
                    ([type, count]) => `
                    <div class="stat-card">
                        <div class="stat-number">${count}</div>
                        <div class="stat-label">${type.replace(/_/g, ' ').toUpperCase()}</div>
                    </div>
                `
                  )
                  .join('')}
            </div>
            
            <h3>按合規框架分類</h3>
            <div class="stats-grid">
                ${Object.entries(report.violations.byCompliance)
                  .map(
                    ([compliance, count]) => `
                    <div class="stat-card">
                        <div class="stat-number">${count}</div>
                        <div class="stat-label">${compliance.toUpperCase()}</div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
        
        <div class="recommendations">
            <h2>數據保留建議</h2>
            ${report.recommendations
              .map(
                (rec) => `
                <div class="recommendation">
                    <span class="priority priority-${rec.priority}">${rec.priority.toUpperCase()}</span>
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.actions.map((action) => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `
              )
              .join('')}
        </div>
    </div>
</body>
</html>`;
}

/**
 * 生成 Markdown 報告
 */
function generateDataRetentionMarkdownReport(report) {
  return `# 🗂️ CardStrategy 數據保留管理報告

**生成時間:** ${new Date(report.timestamp).toLocaleString('zh-TW')}

## 📊 執行摘要

| 項目 | 數值 |
|------|------|
| 數據保留評分 | **${report.summary.retentionGrade.score}/100** |
| 數據保留等級 | **${report.summary.retentionGrade.grade}** |
| 總違規數 | **${report.summary.totalViolations}** |
| 合規框架數 | **${Object.keys(report.summary.complianceStatus).length}** |

### 數據保留等級說明
**${report.summary.retentionGrade.description}**

### 合規狀態
${Object.entries(report.summary.complianceStatus)
  .map(
    ([framework, status]) =>
      `- **${framework.toUpperCase()}**: ${status.compliant ? '✅ 合規' : '❌ 不合規'} (${status.score}/100)`
  )
  .join('\n')}

## 🚨 違規統計

### 按類型分類
${Object.entries(report.violations.byType)
  .map(
    ([type, count]) =>
      `- **${type.replace(/_/g, ' ').toUpperCase()}**: ${count} 個`
  )
  .join('\n')}

### 按合規框架分類
${Object.entries(report.violations.byCompliance)
  .map(
    ([compliance, count]) => `- **${compliance.toUpperCase()}**: ${count} 個`
  )
  .join('\n')}

## 📋 詳細違規

${report.violations.details
  .map(
    (violation, index) => `
### ${index + 1}. ${violation.type} - ${violation.severity.toUpperCase()}

**描述:** ${violation.description}

**時間:** ${new Date(violation.timestamp).toLocaleString('zh-TW')}

${violation.complianceFramework ? `**合規框架:** ${violation.complianceFramework.toUpperCase()}` : ''}

${violation.dataType ? `**數據類型:** ${violation.dataType}` : ''}

**詳情:** \`\`\`json
${JSON.stringify(violation.details, null, 2)}
\`\`\`
`
  )
  .join('\n')}

## 💡 數據保留建議

${report.recommendations
  .map(
    (rec, index) => `
### ${index + 1}. ${rec.title} [${rec.priority.toUpperCase()}]

**類別:** ${rec.category}

**描述:** ${rec.description}

**建議行動:**
${rec.actions.map((action) => `- ${action}`).join('\n')}
`
  )
  .join('\n')}

## 📈 策略有效性

${Object.entries(report.summary.policyEffectiveness)
  .map(
    ([policy, effectiveness]) => `
### ${policy.replace(/_/g, ' ').toUpperCase()}
- **違規數:** ${effectiveness.violations}
- **有效性:** ${effectiveness.effective ? '✅ 有效' : '❌ 需要改進'}
- **評分:** ${effectiveness.score}/100
`
  )
  .join('\n')}

## 🔒 合規要求

### GDPR (通用數據保護條例)
- **數據最小化**: 只收集必要的個人數據
- **存儲限制**: 數據保留時間不超過必要期限
- **刪除權**: 用戶有權要求刪除其個人數據
- **數據可攜性**: 用戶有權獲取其數據的副本

### CCPA (加州消費者隱私法案)
- **披露權**: 消費者有權了解收集的個人信息
- **刪除權**: 消費者有權要求刪除個人信息
- **選擇退出權**: 消費者有權選擇退出數據銷售

### SOX (薩班斯-奧克斯利法案)
- **記錄保留**: 財務記錄必須保留7年
- **內部控制**: 建立有效的內部控制系統
- **審計追蹤**: 維護完整的審計日誌

### HIPAA (健康保險可攜性和責任法案)
- **最小必要標準**: 只使用或披露必要的健康信息
- **保留標準**: 保留記錄6年
- **安全措施**: 實施適當的技術和物理安全措施

## 🎯 數據保留最佳實踐

### 數據分類
1. **敏感數據**: 個人信息、財務數據、醫療數據
2. **機密數據**: 商業機密、法律文件、審計記錄
3. **內部數據**: 日誌、分析數據、臨時文件
4. **公開數據**: 營銷材料、幫助文檔、公開文檔

### 保留策略
1. **基於風險**: 根據數據敏感度制定保留策略
2. **合規驅動**: 確保符合相關法規要求
3. **成本效益**: 平衡存儲成本與合規需求
4. **自動化**: 實施自動化數據清理機制

### 監控和審計
1. **定期審計**: 定期審計數據保留策略
2. **合規監控**: 持續監控合規狀態
3. **性能監控**: 監控數據清理性能
4. **報告生成**: 生成定期合規報告

---

*此報告由 CardStrategy 數據保留管理系統自動生成*
`;
}

/**
 * 打印數據保留管理摘要
 */
function printDataRetentionSummary(report) {
  // logger.info('\n📊 數據保留管理報告摘要');
  // logger.info('='.repeat(50));
  // logger.info(`數據保留評分: ${report.summary.retentionGrade.score}/100`);
  // logger.info(`數據保留等級: ${report.summary.retentionGrade.grade}`);
  // logger.info(`等級說明: ${report.summary.retentionGrade.description}`);
  // logger.info(`總違規數: ${report.summary.totalViolations}`);

  // logger.info('\n🔒 合規狀態:');
  for (const [, status] of Object.entries(
    report.summary.complianceStatus
  )) {
    // eslint-disable-next-line no-unused-vars
    // logger.info(`  ${framework.toUpperCase()}: ${status.compliant ? '✅ 合規' : '❌ 不合規'} (${status.score}/100)`);
  }

  // logger.info('\n🚨 違規統計:');
  for (const [, count] of Object.entries(report.violations.byType)) {
    // eslint-disable-next-line no-unused-vars
    // logger.info(`  ${type.replace(/_/g, ' ').toUpperCase()}: ${count} 個`);
  }

  // logger.info('\n💡 主要建議:');
  const criticalRecs = report.recommendations.filter(
    (r) => r.priority === 'critical'
  );
  const highRecs = report.recommendations.filter((r) => r.priority === 'high');

  if (criticalRecs.length > 0) {
    // logger.info('  緊急修復:');
    criticalRecs.forEach((rec) => {
      // eslint-disable-next-line no-unused-vars
      /* logger.info(`    - ${rec.title}`) */
    });
  }

  if (highRecs.length > 0) {
    // logger.info('  高優先級:');
    highRecs.forEach((rec) => {
      // eslint-disable-next-line no-unused-vars
      /* logger.info(`    - ${rec.title}`) */
    });
  }

  // logger.info('\n📄 報告文件:');
  // logger.info('  - test-results/data-retention-report.json');
  // logger.info('  - test-results/data-retention-report.html');
  // logger.info('  - test-results/data-retention-report.md');
}

// 如果直接運行此腳本
if (require.main === module) {
  generateDataRetentionReport();
}

module.exports = {
  generateDataRetentionReport,
  generateDataRetentionReportData,
  calculateRetentionScore,
};
