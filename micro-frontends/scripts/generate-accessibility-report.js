#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 可訪問性測試基準
const ACCESSIBILITY_BENCHMARKS = {
  // 違規嚴重程度評分
  severityScores: {
    critical: 10,
    high: 7,
    medium: 4,
    low: 1
  },
  // 可訪問性測試類型權重
  testTypeWeights: {
    'Page Title': 0.10,
    'Image Alt Text': 0.15,
    'Form Labels': 0.15,
    'Keyboard Navigation': 0.15,
    'Color Contrast': 0.10,
    'ARIA Attributes': 0.10,
    'Heading Structure': 0.10,
    'Language Attributes': 0.05
  },
  // 可訪問性等級標準
  accessibilityGrades: {
    A: { min: 90, description: '優秀 - 可訪問性極高' },
    B: { min: 80, description: '良好 - 可訪問性高' },
    C: { min: 70, description: '一般 - 可訪問性中等' },
    D: { min: 60, description: '較差 - 存在可訪問性問題' },
    F: { min: 0, description: '危險 - 存在嚴重可訪問性問題' }
  },
  // WCAG 2.1 AA 標準
  wcagGuidelines: {
    '1.1.1': '非文本內容',
    '1.2.1': '音頻和視頻',
    '1.3.1': '信息和關係',
    '1.4.1': '顏色使用',
    '2.1.1': '鍵盤',
    '2.1.2': '無鍵盤陷阱',
    '2.4.1': '跳過塊',
    '2.4.2': '頁面標題',
    '2.4.3': '焦點順序',
    '2.4.4': '鏈接目的',
    '3.2.1': '焦點變化',
    '3.2.2': '輸入變化',
    '4.1.1': '解析',
    '4.1.2': '名稱、角色、值'
  }
};

/**
 * 生成可訪問性測試報告
 */
function generateAccessibilityReport() {
  // logger.info('♿ 開始生成可訪問性測試報告...');

  try {
    // 收集測試結果
    const testResults = collectAccessibilityTestResults();

    // 生成報告數據
    const report = generateAccessibilityReportData(testResults);

    // 保存報告
    saveAccessibilityReport(report, 'test-results');

    // 打印摘要
    printAccessibilitySummary(report);

    // logger.info('✅ 可訪問性測試報告生成完成！');

  } catch (error) {
    // logger.info('❌ 生成可訪問性測試報告失敗:', error.message);
    process.exit(1);
  }
}

/**
 * 收集可訪問性測試結果
 */
function collectAccessibilityTestResults() {
  const resultsDir = path.join(__dirname, '..', 'test-results');
  const results = {
    basic: null,
    advanced: null,
    totalViolations: 0,
    violationsBySeverity: {},
    violationsByType: {},
    violationsByWCAG: {},
    testCoverage: {}
  };

  // 讀取基本可訪問性測試結果
  const basicReportPath = path.join(resultsDir, 'accessibility-basic-report.json');
  if (fs.existsSync(basicReportPath)) {
    try {
      results.basic = JSON.parse(fs.readFileSync(basicReportPath, 'utf8'));
      // logger.info('📄 讀取基本可訪問性測試結果');
    } catch (error) {
      // logger.info('⚠️ 無法讀取基本可訪問性測試結果:', error.message);
    }
  }

  // 讀取高級可訪問性測試結果
  const advancedReportPath = path.join(resultsDir, 'accessibility-advanced-report.json');
  if (fs.existsSync(advancedReportPath)) {
    try {
      results.advanced = JSON.parse(fs.readFileSync(advancedReportPath, 'utf8'));
      // logger.info('📄 讀取高級可訪問性測試結果');
    } catch (error) {
      // logger.info('⚠️ 無法讀取高級可訪問性測試結果:', error.message);
    }
  }

  // 合併結果
  if (results.basic) {
    results.totalViolations += results.basic.totalViolations || 0;
    mergeViolations(results.violationsBySeverity, results.basic.violationsBySeverity);
    mergeViolations(results.violationsByType, results.basic.violationsByType);
    mergeViolations(results.violationsByWCAG, results.basic.violationsByWCAG);
  }

  if (results.advanced) {
    results.totalViolations += results.advanced.totalViolations || 0;
    mergeViolations(results.violationsBySeverity, results.advanced.violationsBySeverity);
    mergeViolations(results.violationsByType, results.advanced.violationsByType);
    mergeViolations(results.violationsByWCAG, results.advanced.violationsByWCAG);
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
 * 生成可訪問性測試報告數據
 */
function generateAccessibilityReportData(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalViolations: testResults.totalViolations,
      accessibilityScore: calculateAccessibilityScore(testResults),
      accessibilityGrade: calculateAccessibilityGrade(testResults),
      testCoverage: calculateTestCoverage(testResults),
      wcagCompliance: calculateWCAGCompliance(testResults)
    },
    violations: {
      bySeverity: testResults.violationsBySeverity,
      byType: testResults.violationsByType,
      byWCAG: testResults.violationsByWCAG,
      details: []
    },
    recommendations: generateAccessibilityRecommendations(testResults),
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
 * 計算可訪問性評分
 */
function calculateAccessibilityScore(testResults) {
  let totalScore = 100;

  // 根據違規嚴重程度扣分
  for (const [severity, count] of Object.entries(testResults.violationsBySeverity || {})) {
    const score = ACCESSIBILITY_BENCHMARKS.severityScores[severity] || 0;
    totalScore -= score * count;
  }

  // 根據違規類型扣分
  for (const [type, count] of Object.entries(testResults.violationsByType || {})) {
    const weight = ACCESSIBILITY_BENCHMARKS.testTypeWeights[type] || 0.05;
    totalScore -= weight * 10 * count;
  }

  return Math.max(0, Math.round(totalScore));
}

/**
 * 計算可訪問性等級
 */
function calculateAccessibilityGrade(testResults) {
  const score = calculateAccessibilityScore(testResults);

  for (const [grade, criteria] of Object.entries(ACCESSIBILITY_BENCHMARKS.accessibilityGrades)) {
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
    description: '危險 - 存在嚴重可訪問性問題'
  };
}

/**
 * 計算測試覆蓋率
 */
function calculateTestCoverage(testResults) {
  const totalTests = 8; // 基本可訪問性測試數量
  const advancedTests = 8; // 高級可訪問性測試數量

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
 * 計算 WCAG 合規性
 */
function calculateWCAGCompliance(testResults) {
  const totalWCAGGuidelines = Object.keys(ACCESSIBILITY_BENCHMARKS.wcagGuidelines).length;
  const violatedGuidelines = Object.keys(testResults.violationsByWCAG || {}).length;
  const compliancePercentage = Math.round(((totalWCAGGuidelines - violatedGuidelines) / totalWCAGGuidelines) * 100);

  return {
    totalGuidelines: totalWCAGGuidelines,
    violatedGuidelines,
    compliancePercentage,
    level: compliancePercentage >= 95 ? 'AA' : compliancePercentage >= 80 ? 'A' : 'Non-Compliant'
  };
}

/**
 * 生成可訪問性建議
 */
function generateAccessibilityRecommendations(testResults) {
  const recommendations = [];

  // 根據違規類型生成建議
  for (const [type, count] of Object.entries(testResults.violationsByType || {})) {
    if (count > 0) {
      switch (type) {
        case 'Page Title':
          recommendations.push({
            priority: 'high',
            category: 'Page Title',
            title: '修復頁面標題問題',
            description: `發現 ${count} 個頁面標題相關問題`,
            actions: [
              '為每個頁面添加描述性標題',
              '確保標題長度適中（3-60字符）',
              '避免使用通用詞彙如"首頁"、"頁面"',
              '使用獨特且有意義的標題'
            ]
          });
          break;

        case 'Image Alt Text':
          recommendations.push({
            priority: 'high',
            category: 'Image Alt Text',
            title: '修復圖片替代文本問題',
            description: `發現 ${count} 個圖片替代文本問題`,
            actions: [
              '為所有圖片添加 alt 屬性',
              '為裝飾性圖片設置 alt=""',
              '為功能性圖片提供描述性文本',
              '避免使用"圖片"、"圖像"等通用詞彙'
            ]
          });
          break;

        case 'Form Labels':
          recommendations.push({
            priority: 'high',
            category: 'Form Labels',
            title: '修復表單標籤問題',
            description: `發現 ${count} 個表單標籤問題`,
            actions: [
              '為所有表單控件添加標籤',
              '使用 label 元素或 aria-label 屬性',
              '確保標籤與控件正確關聯',
              '為必填字段添加適當的指示'
            ]
          });
          break;

        case 'Keyboard Navigation':
          recommendations.push({
            priority: 'high',
            category: 'Keyboard Navigation',
            title: '修復鍵盤導航問題',
            description: `發現 ${count} 個鍵盤導航問題`,
            actions: [
              '確保所有功能都可以通過鍵盤訪問',
              '添加可見的焦點指示器',
              '避免鍵盤陷阱',
              '實現邏輯的 Tab 順序'
            ]
          });
          break;

        case 'Color Contrast':
          recommendations.push({
            priority: 'medium',
            category: 'Color Contrast',
            title: '修復顏色對比度問題',
            description: `發現 ${count} 個顏色對比度問題`,
            actions: [
              '確保文本與背景的對比度至少為 4.5:1',
              '大字體（18px+）的對比度至少為 3:1',
              '使用顏色對比度檢查工具',
              '不要僅依賴顏色傳達信息'
            ]
          });
          break;

        case 'ARIA Attributes':
          recommendations.push({
            priority: 'medium',
            category: 'ARIA Attributes',
            title: '修復 ARIA 屬性問題',
            description: `發現 ${count} 個 ARIA 屬性問題`,
            actions: [
              '正確使用 ARIA 標籤和描述',
              '確保 ARIA 角色有效',
              '驗證 ARIA 屬性的語法',
              '測試 ARIA 實現的效果'
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
              '進行詳細的可訪問性審計',
              '實施相應的可訪問性改進',
              '定期進行可訪問性測試'
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
      title: '緊急可訪問性修復',
      description: `發現 ${criticalCount} 個嚴重可訪問性問題，需要立即修復`,
      actions: [
        '立即修復所有嚴重可訪問性問題',
        '暫停相關功能直到修復完成',
        '通知相關團隊和用戶',
        '進行全面的可訪問性審計'
      ]
    });
  }

  if (highCount > 0) {
    recommendations.push({
      priority: 'high',
      category: 'General',
      title: '高優先級可訪問性改進',
      description: `發現 ${highCount} 個高風險可訪問性問題`,
      actions: [
        '優先修復高風險可訪問性問題',
        '加強可訪問性監控',
        '更新可訪問性策略',
        '進行可訪問性培訓'
      ]
    });
  }

  return recommendations;
}

/**
 * 保存可訪問性測試報告
 */
function saveAccessibilityReport(report, outputDir) {
  const outputPath = path.join(__dirname, '..', outputDir);

  // 確保輸出目錄存在
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // 保存 JSON 報告
  const jsonPath = path.join(outputPath, 'accessibility-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  // logger.info(`📄 JSON 報告已保存: ${jsonPath}`);

  // 保存 HTML 報告
  const htmlPath = path.join(outputPath, 'accessibility-report.html');
  const htmlContent = generateAccessibilityHtmlReport(report);
  fs.writeFileSync(htmlPath, htmlContent);
  // logger.info(`📄 HTML 報告已保存: ${htmlPath}`);

  // 保存 Markdown 報告
  const mdPath = path.join(outputPath, 'accessibility-report.md');
  const mdContent = generateAccessibilityMarkdownReport(report);
  fs.writeFileSync(mdPath, mdContent);
  // logger.info(`📄 Markdown 報告已保存: ${mdPath}`);
}

/**
 * 生成 HTML 報告
 */
function generateAccessibilityHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CardStrategy 可訪問性測試報告</title>
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
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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
            border-bottom: 2px solid #4CAF50;
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
            border-left: 4px solid #4CAF50;
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
        .wcag-compliance {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .wcag-compliance h3 {
            color: #2e7d32;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♿ CardStrategy 可訪問性測試報告</h1>
            <div class="timestamp">生成時間: ${new Date(report.timestamp).toLocaleString('zh-TW')}</div>
        </div>
        
        <div class="summary">
            <div class="score-card">
                <div class="score-circle score-grade-${report.summary.accessibilityGrade.grade}">
                    ${report.summary.accessibilityGrade.grade}
                </div>
                <div class="score-details">
                    <h3>可訪問性評分: ${report.summary.accessibilityGrade.score}/100</h3>
                    <p>${report.summary.accessibilityGrade.description}</p>
                    <p>測試覆蓋率: ${report.summary.testCoverage.percentage}%</p>
                    <p>WCAG 合規性: ${report.summary.wcagCompliance.level}</p>
                </div>
            </div>
            
            <div class="wcag-compliance">
                <h3>WCAG 2.1 AA 合規性</h3>
                <p>合規率: ${report.summary.wcagCompliance.compliancePercentage}%</p>
                <p>違規指南數: ${report.summary.wcagCompliance.violatedGuidelines}/${report.summary.wcagCompliance.totalGuidelines}</p>
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
                    <div class="stat-label">嚴重問題</div>
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
            
            <h3>WCAG 指南違規</h3>
            <div class="stats-grid">
                ${Object.entries(report.violations.byWCAG).map(([guideline, count]) => `
                    <div class="stat-card">
                        <div class="stat-number">${count}</div>
                        <div class="stat-label">${guideline}: ${ACCESSIBILITY_BENCHMARKS.wcagGuidelines[guideline] || '未知'}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="recommendations">
            <h2>可訪問性建議</h2>
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
function generateAccessibilityMarkdownReport(report) {
  return `# ♿ CardStrategy 可訪問性測試報告

**生成時間:** ${new Date(report.timestamp).toLocaleString('zh-TW')}

## 📊 執行摘要

| 項目 | 數值 |
|------|------|
| 可訪問性評分 | **${report.summary.accessibilityGrade.score}/100** |
| 可訪問性等級 | **${report.summary.accessibilityGrade.grade}** |
| 總違規數 | **${report.summary.totalViolations}** |
| 測試覆蓋率 | **${report.summary.testCoverage.percentage}%** |
| WCAG 合規性 | **${report.summary.wcagCompliance.level}** |

### 可訪問性等級說明
**${report.summary.accessibilityGrade.description}**

### WCAG 2.1 AA 合規性
- **合規率**: ${report.summary.wcagCompliance.compliancePercentage}%
- **違規指南數**: ${report.summary.wcagCompliance.violatedGuidelines}/${report.summary.wcagCompliance.totalGuidelines}
- **合規等級**: ${report.summary.wcagCompliance.level}

## 🚨 違規統計

### 按嚴重程度分類
${Object.entries(report.violations.bySeverity).map(([severity, count]) =>
    `- **${severity.toUpperCase()}**: ${count} 個`
  ).join('\n')}

### 按類型分類
${Object.entries(report.violations.byType).map(([type, count]) =>
    `- **${type}**: ${count} 個`
  ).join('\n')}

### 按 WCAG 指南分類
${Object.entries(report.violations.byWCAG).map(([guideline, count]) =>
    `- **${guideline} (${ACCESSIBILITY_BENCHMARKS.wcagGuidelines[guideline] || '未知'})**: ${count} 個`
  ).join('\n')}

## 📋 詳細違規

${report.violations.details.map((violation, index) => `
### ${index + 1}. ${violation.type} - ${violation.severity.toUpperCase()}

**描述:** ${violation.description}

**時間:** ${new Date(violation.timestamp).toLocaleString('zh-TW')}

${violation.wcagGuideline ? `**WCAG 指南:** ${violation.wcagGuideline} (${ACCESSIBILITY_BENCHMARKS.wcagGuidelines[violation.wcagGuideline] || '未知'})` : ''}

${violation.element ? `**元素:** ${violation.element}` : ''}

**詳情:** \`\`\`json
${JSON.stringify(violation.details, null, 2)}
\`\`\`
`).join('\n')}

## 💡 可訪問性建議

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

### 基本可訪問性測試
${report.testResults.basic ? `
- **狀態:** 已完成
- **違規數:** ${report.testResults.basic.totalViolations || 0}
` : '- **狀態:** 未執行'}

### 高級可訪問性測試
${report.testResults.advanced ? `
- **狀態:** 已完成
- **違規數:** ${report.testResults.advanced.totalViolations || 0}
` : '- **狀態:** 未執行'}

## ♿ WCAG 2.1 AA 指南

### 感知性 (Perceivable)
- **1.1.1 非文本內容**: 為非文本內容提供替代文本
- **1.2.1 音頻和視頻**: 為音頻和視頻內容提供替代方案
- **1.3.1 信息和關係**: 使用語義化標記傳達信息結構
- **1.4.1 顏色使用**: 不要僅依賴顏色傳達信息

### 可操作性 (Operable)
- **2.1.1 鍵盤**: 所有功能都可以通過鍵盤訪問
- **2.1.2 無鍵盤陷阱**: 避免鍵盤陷阱
- **2.4.1 跳過塊**: 提供跳過重複內容的機制
- **2.4.2 頁面標題**: 使用描述性頁面標題

### 可理解性 (Understandable)
- **3.2.1 焦點變化**: 焦點變化不會自動觸發上下文變化
- **3.2.2 輸入變化**: 輸入變化不會自動觸發上下文變化

### 健壯性 (Robust)
- **4.1.1 解析**: 內容可以被用戶代理解析
- **4.1.2 名稱、角色、值**: 為所有用戶界面組件提供名稱和角色

---

*此報告由 CardStrategy 可訪問性測試系統自動生成*
`;
}

/**
 * 打印可訪問性測試摘要
 */
function printAccessibilitySummary(report) {
  // logger.info('\n📊 可訪問性測試報告摘要');
  // logger.info('='.repeat(50));
  // logger.info(`可訪問性評分: ${report.summary.accessibilityGrade.score}/100`);
  // logger.info(`可訪問性等級: ${report.summary.accessibilityGrade.grade}`);
  // logger.info(`等級說明: ${report.summary.accessibilityGrade.description}`);
  // logger.info(`總違規數: ${report.summary.totalViolations}`);
  // logger.info(`測試覆蓋率: ${report.summary.testCoverage.percentage}%`);
  // logger.info(`WCAG 合規性: ${report.summary.wcagCompliance.level} (${report.summary.wcagCompliance.compliancePercentage}%)`);

  // logger.info('\n🚨 違規統計:');
  for (const [severity, count] of Object.entries(report.violations.bySeverity)) {
    // logger.info(`  ${severity.toUpperCase()}: ${count} 個`);
  }

  // logger.info('\n📋 違規類型:');
  for (const [type, count] of Object.entries(report.violations.byType)) {
    // logger.info(`  ${type}: ${count} 個`);
  }

  // logger.info('\n♿ WCAG 指南違規:');
  for (const [guideline, count] of Object.entries(report.violations.byWCAG)) {
    const guidelineName = ACCESSIBILITY_BENCHMARKS.wcagGuidelines[guideline] || '未知';
    // logger.info(`  ${guideline} (${guidelineName}): ${count} 個`);
  }

  // logger.info('\n💡 主要建議:');
  const criticalRecs = report.recommendations.filter(r => r.priority === 'critical');
  const highRecs = report.recommendations.filter(r => r.priority === 'high');

  if (criticalRecs.length > 0) {
    // logger.info('  緊急修復:');
    criticalRecs.forEach(rec => // logger.info(`    - ${rec.title}`));
  }

  if (highRecs.length > 0) {
    // logger.info('  高優先級:');
    highRecs.forEach(rec => // logger.info(`    - ${rec.title}`));
  }

  // logger.info('\n📄 報告文件:');
  // logger.info('  - test-results/accessibility-report.json');
  // logger.info('  - test-results/accessibility-report.html');
  // logger.info('  - test-results/accessibility-report.md');
}

// 如果直接運行此腳本
if (require.main === module) {
  generateAccessibilityReport();
}

module.exports = {
  generateAccessibilityReport,
  generateAccessibilityReportData,
  calculateAccessibilityScore
};
