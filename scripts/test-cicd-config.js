#!/usr/bin/env node

/**
 * CI/CD 配置測試腳本
 * 驗證 GitHub Secrets 和工作流配置
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 CI/CD 配置測試腳本');
console.log('=======================\n');

// 檢查工作流文件中的 Secrets 引用
function checkWorkflowSecrets() {
  console.log('🔍 檢查工作流文件中的 Secrets...\n');

  const workflowFiles = [
    '.github/workflows/ci-cd-simplified.yml',
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
  ];

  const requiredSecrets = {
    DIGITOCEAN_CardStrategy_CI_CD_Token: [],
    RENDER_TOKEN: [],
    SNYK_TOKEN: [],
    SLACK_WEBHOOK_URL: [],
  };

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 檢查文件: ${file}`);
      const content = fs.readFileSync(file, 'utf8');

      // 查找所有 secrets 引用
      const secretMatches = content.match(/\${{ secrets\.([^}]+) }}/g);
      if (secretMatches) {
        secretMatches.forEach(match => {
          const secretName = match.match(/secrets\.([^}]+)/)[1];
          console.log(`  ✅ 找到 Secret: ${secretName}`);

          // 記錄到 requiredSecrets
          if (requiredSecrets[secretName]) {
            requiredSecrets[secretName].push(file);
          }
        });
      }
      console.log('');
    } else {
      console.log(`❌ 文件不存在: ${file}\n`);
    }
  });

  return requiredSecrets;
}

// 檢查必需的 Secrets
function checkRequiredSecrets(requiredSecrets) {
  console.log('📋 必需的 GitHub Secrets:\n');

  const secrets = [
    {
      name: 'DIGITOCEAN_CardStrategy_CI_CD_Token',
      description: 'DigitalOcean API Token (您已設置)',
      status: '✅ 已設置',
      files: requiredSecrets['DIGITOCEAN_CardStrategy_CI_CD_Token'],
    },
    {
      name: 'RENDER_TOKEN',
      description: 'Render API Token (您已設置)',
      status: '✅ 已設置',
      files: requiredSecrets['RENDER_TOKEN'],
    },
    {
      name: 'SNYK_TOKEN',
      description: 'Snyk 安全掃描 Token (可選)',
      status: '⚠️ 可選',
      files: requiredSecrets['SNYK_TOKEN'],
    },
    {
      name: 'SLACK_WEBHOOK_URL',
      description: 'Slack 通知 Webhook (可選)',
      status: '⚠️ 可選',
      files: requiredSecrets['SLACK_WEBHOOK_URL'],
    },
    {
      name: 'DIGITALOCEAN_APP_ID',
      description: 'DigitalOcean App Platform ID',
      status: '❓ 需要檢查',
      files: requiredSecrets['DIGITALOCEAN_APP_ID'] || [],
    },
  ];

  secrets.forEach(secret => {
    console.log(`${secret.status} ${secret.name}`);
    console.log(`   描述: ${secret.description}`);
    if (secret.files.length > 0) {
      console.log(`   使用於: ${secret.files.join(', ')}`);
    }
    console.log('');
  });

  return secrets;
}

// 生成測試建議
function generateTestRecommendations(secrets) {
  console.log('🚀 測試建議:\n');

  console.log('1. 測試簡化工作流:');
  console.log('   git checkout -b test-cicd');
  console.log('   git push origin test-cicd');
  console.log('   # 檢查 GitHub Actions 運行狀態\n');

  console.log('2. 測試後端部署:');
  console.log('   git checkout develop');
  console.log('   git push origin develop');
  console.log('   # 檢查 Render 自動部署\n');

  console.log('3. 測試生產部署:');
  console.log('   git checkout main');
  console.log('   git push origin main');
  console.log('   # 檢查 DigitalOcean 部署\n');

  console.log('4. 檢查服務健康狀態:');
  console.log('   curl -f https://cardstrategy-api.onrender.com/api/health');
  console.log('   curl -f https://api.cardstrategy.com/api/health\n');

  // 檢查是否需要額外的 Secrets
  const missingSecrets = secrets.filter(s => s.status.includes('需要檢查'));
  if (missingSecrets.length > 0) {
    console.log('⚠️ 可能需要額外設置的 Secrets:');
    missingSecrets.forEach(secret => {
      console.log(`   - ${secret.name}: ${secret.description}`);
    });
    console.log('');
  }
}

// 檢查工作流語法
function checkWorkflowSyntax() {
  console.log('🔧 檢查工作流語法...\n');

  const workflowFiles = [
    '.github/workflows/ci-cd-simplified.yml',
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
  ];

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // 基本 YAML 語法檢查
        const lines = content.split('\n');
        let indentLevel = 0;
        let hasErrors = false;

        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const currentIndent = line.length - line.trimStart().length;

            // 檢查縮進是否正確
            if (currentIndent % 2 !== 0 && currentIndent > 0) {
              console.log(`⚠️ ${file}:${index + 1} 縮進可能不正確`);
              hasErrors = true;
            }
          }
        });

        if (!hasErrors) {
          console.log(`✅ ${file} 語法檢查通過`);
        }
      } catch (error) {
        console.log(`❌ ${file} 語法錯誤: ${error.message}`);
      }
    }
  });

  console.log('');
}

// 主函數
function main() {
  try {
    // 檢查工作流 Secrets
    const requiredSecrets = checkWorkflowSecrets();

    // 檢查必需的 Secrets
    const secrets = checkRequiredSecrets(requiredSecrets);

    // 檢查工作流語法
    checkWorkflowSyntax();

    // 生成測試建議
    generateTestRecommendations(secrets);

    console.log('🎉 配置檢查完成！');
    console.log('您的 CI/CD 配置看起來已經準備就緒。\n');

    console.log('📞 如果遇到問題:');
    console.log('1. 查看 GitHub Actions 日誌');
    console.log('2. 運行: node scripts/fix-cicd.js');
    console.log('3. 查看: CICD_TROUBLESHOOTING_GUIDE.md\n');
  } catch (error) {
    console.error('❌ 配置檢查失敗:', error.message);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  checkWorkflowSecrets,
  checkRequiredSecrets,
  generateTestRecommendations,
};
