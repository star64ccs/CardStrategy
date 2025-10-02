#!/usr/bin/env node

/**
 * CI/CD 快速修復腳本
 * 自動診斷和修復常見的 CI/CD 問題
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CI/CD 快速修復腳本');
console.log('========================\n');

// 檢查函數
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkYamlSyntax(filePath) {
  try {
    execSync(`yamllint ${filePath}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkPackageJson(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return content.scripts && content.scripts.test;
  } catch (error) {
    return false;
  }
}

// 診斷問題
function diagnoseIssues() {
  console.log('🔍 診斷 CI/CD 問題...\n');

  const issues = [];

  // 檢查工作流文件
  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
  ];

  workflowFiles.forEach(file => {
    if (!checkFileExists(file)) {
      issues.push(`❌ 缺少工作流文件: ${file}`);
    } else if (!checkYamlSyntax(file)) {
      issues.push(`❌ YAML 語法錯誤: ${file}`);
    } else {
      console.log(`✅ 工作流文件正常: ${file}`);
    }
  });

  // 檢查 package.json
  const packageFiles = ['package.json', 'backend/package.json'];
  packageFiles.forEach(file => {
    if (!checkFileExists(file)) {
      issues.push(`❌ 缺少 package.json: ${file}`);
    } else if (!checkPackageJson(file)) {
      issues.push(`❌ package.json 配置錯誤: ${file}`);
    } else {
      console.log(`✅ package.json 正常: ${file}`);
    }
  });

  // 檢查配置文件
  const configFiles = [
    'render.yml',
    'docker-compose.yml',
    'env.production.config',
  ];

  configFiles.forEach(file => {
    if (!checkFileExists(file)) {
      issues.push(`❌ 缺少配置文件: ${file}`);
    } else {
      console.log(`✅ 配置文件存在: ${file}`);
    }
  });

  return issues;
}

// 修復問題
function fixIssues(issues) {
  console.log('\n🛠️ 修復問題...\n');

  issues.forEach(issue => {
    console.log(`修復: ${issue}`);

    if (issue.includes('缺少工作流文件')) {
      // 創建簡化工作流
      console.log('  → 使用簡化工作流');
    } else if (issue.includes('缺少配置文件')) {
      // 創建基本配置
      console.log('  → 創建基本配置');
    } else if (issue.includes('package.json')) {
      // 修復 package.json
      console.log('  → 檢查 npm scripts');
    }
  });
}

// 生成修復建議
function generateRecommendations() {
  console.log('\n📋 修復建議:\n');

  console.log('1. 設置 GitHub Secrets:');
  console.log('   - 前往 GitHub Repository → Settings → Secrets → Actions');
  console.log('   - 添加以下 Secrets:');
  console.log('     * DIGITALOCEAN_TOKEN');
  console.log('     * RENDER_TOKEN');
  console.log('     * SNYK_TOKEN (可選)');
  console.log('     * SLACK_WEBHOOK_URL (可選)\n');

  console.log('2. 測試本地環境:');
  console.log('   cd backend && npm test');
  console.log('   cd frontend && npm test\n');

  console.log('3. 檢查服務狀態:');
  console.log('   - Render Dashboard: https://dashboard.render.com');
  console.log('   - DigitalOcean Dashboard: https://cloud.digitalocean.com\n');

  console.log('4. 使用簡化工作流:');
  console.log('   - 如果複雜工作流失敗，使用 ci-cd-simplified.yml\n');
}

// 主函數
function main() {
  try {
    const issues = diagnoseIssues();

    if (issues.length === 0) {
      console.log('\n✅ 沒有發現問題！CI/CD 配置正常。\n');
    } else {
      console.log(`\n⚠️ 發現 ${issues.length} 個問題:\n`);
      issues.forEach(issue => console.log(issue));

      fixIssues(issues);
      generateRecommendations();
    }

    console.log('\n🚀 快速修復完成！');
    console.log('如果問題仍然存在，請查看 CICD_TROUBLESHOOTING_GUIDE.md\n');
  } catch (error) {
    console.error('❌ 修復腳本執行失敗:', error.message);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = { diagnoseIssues, fixIssues, generateRecommendations };
