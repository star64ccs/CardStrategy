#!/usr/bin/env node

/**
 * 綜合 CI/CD 錯誤診斷和修復腳本
 * 檢查並修復所有常見的 CI/CD 問題
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 綜合 CI/CD 錯誤診斷和修復腳本');
console.log('=====================================\n');

// 檢查並修復的問題列表
const issues = [];

// 1. 檢查工作流文件完整性
function checkWorkflowFiles() {
  console.log('📋 檢查工作流文件完整性...\n');

  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
    '.github/workflows/ci-cd-simplified.yml',
    '.github/workflows/ci-cd-fixed.yml',
  ];

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} 存在`);
    } else {
      console.log(`❌ ${file} 不存在`);
      issues.push(`缺少工作流文件: ${file}`);
    }
  });
  console.log('');
}

// 2. 檢查 GitHub Secrets 引用
function checkSecretsReferences() {
  console.log('🔐 檢查 GitHub Secrets 引用...\n');

  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
    '.github/workflows/ci-cd-simplified.yml',
  ];

  const requiredSecrets = {
    DIGITOCEAN_CardStrategy_CI_CD_Token: 'DigitalOcean API Token',
    RENDER_TOKEN: 'Render API Token',
    SNYK_TOKEN: 'Snyk 安全掃描 Token (可選)',
    SLACK_WEBHOOK_URL: 'Slack 通知 Webhook (可選)',
    DIGITALOCEAN_APP_ID: 'DigitalOcean App Platform ID (可選)',
  };

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 檢查 ${file}:`);
      const content = fs.readFileSync(file, 'utf8');

      Object.keys(requiredSecrets).forEach(secret => {
        if (content.includes('${{ secrets.' + secret + ' }}')) {
          console.log(`  ✅ 引用 ${secret}`);
        }
      });
      console.log('');
    }
  });
}

// 3. 檢查 package.json 腳本
function checkPackageScripts() {
  console.log('📦 檢查 package.json 腳本...\n');

  const packageFiles = ['package.json', 'backend/package.json'];

  packageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 檢查 ${file}:`);
      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const scripts = content.scripts || {};

        const requiredScripts = ['test', 'lint', 'build'];

        requiredScripts.forEach(script => {
          if (scripts[script]) {
            console.log(`  ✅ ${script}: ${scripts[script]}`);
          } else {
            console.log(`  ❌ 缺少腳本: ${script}`);
            issues.push(`缺少 npm 腳本: ${file} 中的 ${script}`);
          }
        });

        // 檢查 CI 相關腳本
        if (scripts['test:ci']) {
          console.log(`  ✅ test:ci: ${scripts['test:ci']}`);
        } else {
          console.log(`  ⚠️ 建議添加 test:ci 腳本`);
        }

        console.log('');
      } catch (error) {
        console.log(`  ❌ 解析錯誤: ${error.message}`);
        issues.push(`package.json 解析錯誤: ${file}`);
      }
    } else {
      console.log(`❌ 文件不存在: ${file}\n`);
      issues.push(`缺少 package.json: ${file}`);
    }
  });
}

// 4. 檢查環境配置文件
function checkEnvironmentConfigs() {
  console.log('🌍 檢查環境配置文件...\n');

  const configFiles = [
    'render.yml',
    'docker-compose.yml',
    'env.production.config',
    'env.staging.config',
  ];

  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} 存在`);
    } else {
      console.log(`⚠️ ${file} 不存在 (可選)`);
    }
  });
  console.log('');
}

// 5. 檢查工作流語法和邏輯
function checkWorkflowLogic() {
  console.log('🔍 檢查工作流邏輯...\n');

  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/ci-cd-simplified.yml',
  ];

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 檢查 ${file}:`);
      const content = fs.readFileSync(file, 'utf8');

      // 檢查條件邏輯
      if (content.includes('needs:')) {
        console.log(`  ✅ 包含依賴關係`);
      } else {
        console.log(`  ⚠️ 缺少依賴關係`);
      }

      // 檢查環境變數
      if (content.includes('env:')) {
        console.log(`  ✅ 包含環境變數`);
      } else {
        console.log(`  ⚠️ 缺少環境變數`);
      }

      // 檢查錯誤處理
      if (
        content.includes('|| echo') ||
        content.includes('continue-on-error')
      ) {
        console.log(`  ✅ 包含錯誤處理`);
      } else {
        console.log(`  ⚠️ 缺少錯誤處理`);
      }

      console.log('');
    }
  });
}

// 6. 生成修復建議
function generateFixRecommendations() {
  console.log('🛠️ 修復建議:\n');

  if (issues.length === 0) {
    console.log('🎉 沒有發現嚴重問題！');
    console.log('您的 CI/CD 配置看起來是健康的。\n');
  } else {
    console.log(`發現 ${issues.length} 個問題需要修復:\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.log('');
  }

  console.log('📋 推薦的修復步驟:\n');
  console.log('1. 使用修復後的工作流:');
  console.log(
    '   cp .github/workflows/ci-cd-fixed.yml .github/workflows/ci-cd-main.yml\n'
  );

  console.log('2. 確保 GitHub Secrets 已設置:');
  console.log('   - DIGITOCEAN_CardStrategy_CI_CD_Token');
  console.log('   - RENDER_TOKEN');
  console.log('   - SNYK_TOKEN (可選)');
  console.log('   - SLACK_WEBHOOK_URL (可選)\n');

  console.log('3. 測試 CI/CD 流程:');
  console.log('   git checkout -b test-cicd-fix');
  console.log('   git add .');
  console.log('   git commit -m "test: CI/CD 修復測試"');
  console.log('   git push origin test-cicd-fix\n');

  console.log('4. 監控部署狀態:');
  console.log('   - GitHub Actions: https://github.com/your-repo/actions');
  console.log('   - Render Dashboard: https://dashboard.render.com');
  console.log('   - DigitalOcean Dashboard: https://cloud.digitalocean.com\n');
}

// 7. 檢查服務健康狀態
function checkServiceHealth() {
  console.log('🏥 檢查服務健康狀態...\n');

  const services = [
    {
      name: 'Render API',
      url: 'https://cardstrategy-api.onrender.com/api/health',
      description: '測試環境 API',
    },
    {
      name: 'DigitalOcean API',
      url: 'https://api.cardstrategy.com/api/health',
      description: '生產環境 API',
    },
  ];

  services.forEach(service => {
    console.log(`🔍 ${service.name}:`);
    console.log(`   URL: ${service.url}`);
    console.log(`   描述: ${service.description}`);
    console.log(`   狀態: 需要手動檢查\n`);
  });
}

// 8. 生成最終報告
function generateFinalReport() {
  console.log('📊 最終診斷報告:\n');

  const report = {
    timestamp: new Date().toISOString(),
    issues: issues.length,
    status: issues.length === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION',
    recommendations: [],
  };

  if (issues.length > 0) {
    report.recommendations.push('修復發現的問題');
    report.recommendations.push('使用 ci-cd-fixed.yml 工作流');
    report.recommendations.push('設置必要的 GitHub Secrets');
  } else {
    report.recommendations.push('CI/CD 配置健康');
    report.recommendations.push('可以開始部署測試');
  }

  console.log(`狀態: ${report.status}`);
  console.log(`問題數量: ${report.issues}`);
  console.log(`時間戳: ${report.timestamp}`);
  console.log('\n建議:');
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  console.log('');
}

// 主函數
function main() {
  try {
    checkWorkflowFiles();
    checkSecretsReferences();
    checkPackageScripts();
    checkEnvironmentConfigs();
    checkWorkflowLogic();
    checkServiceHealth();
    generateFixRecommendations();
    generateFinalReport();

    console.log('🎊 CI/CD 診斷完成！');
    console.log('如果發現問題，請按照建議進行修復。\n');
  } catch (error) {
    console.error('❌ 診斷腳本執行失敗:', error.message);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  checkWorkflowFiles,
  checkSecretsReferences,
  checkPackageScripts,
  checkEnvironmentConfigs,
  checkWorkflowLogic,
  generateFixRecommendations,
};
