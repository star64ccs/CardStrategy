const fs = require('fs');
const path = require('path');

// logger.info('🔍 自動部署狀態檢查工具');
// logger.info('='.repeat(50));

// 檢查 GitHub Actions 工作流程
function checkGitHubWorkflows() {
  // logger.info('\n📋 檢查 GitHub Actions 工作流程...');
  
  const workflowsDir = '.github/workflows';
  const workflows = [
    'deploy.yml',
    'ci-cd.yml',
    'backend-ci-cd.yml',
    'frontend-ci-cd.yml'
  ];
  
  let foundWorkflows = [];
  
  workflows.forEach(workflow => {
    const workflowPath = path.join(workflowsDir, workflow);
    if (fs.existsSync(workflowPath)) {
      foundWorkflows.push(workflow);
      // logger.info(`✅ 找到工作流程: ${workflow}`);
    } else {
      // logger.info(`❌ 缺少工作流程: ${workflow}`);
    }
  });
  
  return foundWorkflows;
}

// 檢查部署腳本
function checkDeployScripts() {
  // logger.info('\n📋 檢查部署腳本...');
  
  const scriptsDir = 'scripts';
  const deployScripts = [
    'deploy-production.sh',
    'deploy-staging.sh',
    'deploy-digitalocean.sh'
  ];
  
  let foundScripts = [];
  
  deployScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script);
    if (fs.existsSync(scriptPath)) {
      foundScripts.push(script);
      // logger.info(`✅ 找到部署腳本: ${script}`);
      
      // 檢查腳本權限
      try {
        const stats = fs.statSync(scriptPath);
        if (stats.mode & 0o111) {
          // logger.info(`  ✅ 腳本具有執行權限`);
        } else {
          // logger.info(`  ⚠️  腳本缺少執行權限`);
        }
      } catch (error) {
        // logger.info(`  ❌ 無法檢查腳本權限`);
      }
    } else {
      // logger.info(`❌ 缺少部署腳本: ${script}`);
    }
  });
  
  return foundScripts;
}

// 檢查環境變數文件
function checkEnvironmentFiles() {
  // logger.info('\n📋 檢查環境變數文件...');
  
  const envFiles = [
    '.env.production',
    '.env.staging',
    'env.production',
    'cloudflare-config.env'
  ];
  
  let foundEnvFiles = [];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      foundEnvFiles.push(envFile);
      // logger.info(`✅ 找到環境文件: ${envFile}`);
    } else {
      // logger.info(`❌ 缺少環境文件: ${envFile}`);
    }
  });
  
  return foundEnvFiles;
}

// 檢查 package.json 腳本
function checkPackageScripts() {
  // logger.info('\n📋 檢查 package.json 腳本...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const deployScripts = [
      'deploy:render',
      'deploy:digitalocean',
      'render:staging',
      'setup:cloudflare'
    ];
    
    let foundScripts = [];
    
    deployScripts.forEach(script => {
      if (scripts[script]) {
        foundScripts.push(script);
        // logger.info(`✅ 找到 npm 腳本: ${script}`);
        // logger.info(`  命令: ${scripts[script]}`);
      } else {
        // logger.info(`❌ 缺少 npm 腳本: ${script}`);
      }
    });
    
    return foundScripts;
  } catch (error) {
    // logger.info(`❌ 無法讀取 package.json: ${error.message}`);
    return [];
  }
}

// 檢查 Docker 配置
function checkDockerConfig() {
  // logger.info('\n📋 檢查 Docker 配置...');
  
  const dockerFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.prod.yml'
  ];
  
  let foundFiles = [];
  
  dockerFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
      // logger.info(`✅ 找到 Docker 文件: ${file}`);
    } else {
      // logger.info(`❌ 缺少 Docker 文件: ${file}`);
    }
  });
  
  return foundFiles;
}

// 檢查 Render 配置
function checkRenderConfig() {
  // logger.info('\n📋 檢查 Render 配置...');
  
  const renderFiles = [
    'render.yaml',
    'render.yml'
  ];
  
  let foundFiles = [];
  
  renderFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
      // logger.info(`✅ 找到 Render 配置: ${file}`);
    } else {
      // logger.info(`❌ 缺少 Render 配置: ${file}`);
    }
  });
  
  return foundFiles;
}

// 分析部署流程
function analyzeDeployFlow() {
  // logger.info('\n📋 分析部署流程...');
  
  // logger.info('\n🔄 當前部署流程:');
  // logger.info('1. 推送到 develop 分支');
  // logger.info('   → 觸發 GitHub Actions');
  // logger.info('   → 運行測試');
  // logger.info('   → 部署到 Render (測試環境)');
  
  // logger.info('\n2. 合併到 main 分支');
  // logger.info('   → 觸發 GitHub Actions');
  // logger.info('   → 運行測試');
  // logger.info('   → 部署到 DigitalOcean (生產環境)');
  
  // logger.info('\n📊 部署觸發條件:');
  // logger.info('- develop 分支推送 → Render 測試環境');
  // logger.info('- main 分支推送 → DigitalOcean 生產環境');
  // logger.info('- Pull Request 到 main → 只運行測試');
}

// 檢查 GitHub Secrets 需求
function checkRequiredSecrets() {
  // logger.info('\n📋 檢查所需的 GitHub Secrets...');
  
  const requiredSecrets = [
    'RENDER_TOKEN',
    'RENDER_STAGING_SERVICE_ID',
    'DIGITALOCEAN_ACCESS_TOKEN',
    'DROPLET_ID',
    'PRODUCTION_SSH_KEY',
    'PRODUCTION_USER',
    'PRODUCTION_HOST',
    'SLACK_WEBHOOK_URL'
  ];
  
  // logger.info('需要在 GitHub Secrets 中設置以下變數:');
  requiredSecrets.forEach(secret => {
    // logger.info(`  - ${secret}`);
  });
  
  // logger.info('\n💡 設置方法:');
  // logger.info('1. 前往 GitHub 倉庫');
  // logger.info('2. Settings → Secrets and variables → Actions');
  // logger.info('3. 點擊 "New repository secret"');
  // logger.info('4. 添加上述變數');
}

// 主函數
function checkAutoDeployStatus() {
  // logger.info('\n🚀 開始檢查自動部署狀態...\n');
  
  try {
    // 檢查各個組件
    const workflows = checkGitHubWorkflows();
    const deployScripts = checkDeployScripts();
    const envFiles = checkEnvironmentFiles();
    const packageScripts = checkPackageScripts();
    const dockerFiles = checkDockerConfig();
    const renderFiles = checkRenderConfig();
    
    // 分析部署流程
    analyzeDeployFlow();
    
    // 檢查 Secrets 需求
    checkRequiredSecrets();
    
    // 總結
    // logger.info('\n📊 檢查總結:');
    // logger.info('='.repeat(50));
    // logger.info(`✅ GitHub 工作流程: ${workflows.length}/4`);
    // logger.info(`✅ 部署腳本: ${deployScripts.length}/3`);
    // logger.info(`✅ 環境文件: ${envFiles.length}/4`);
    // logger.info(`✅ npm 腳本: ${packageScripts.length}/4`);
    // logger.info(`✅ Docker 配置: ${dockerFiles.length}/3`);
    // logger.info(`✅ Render 配置: ${renderFiles.length}/2`);
    // logger.info('='.repeat(50));
    
    // 評估自動部署狀態
    const totalComponents = 20; // 總組件數
    const foundComponents = workflows.length + deployScripts.length + envFiles.length + 
                           packageScripts.length + dockerFiles.length + renderFiles.length;
    
    const completionRate = (foundComponents / totalComponents) * 100;
    
    // logger.info(`\n🎯 自動部署完成度: ${completionRate.toFixed(1)}%`);
    
    if (completionRate >= 80) {
      // logger.info('🎉 您的專案已具備完整的自動部署能力！');
      // logger.info('\n📋 下一步:');
      // logger.info('1. 設置 GitHub Secrets');
      // logger.info('2. 推送到 develop 分支測試');
      // logger.info('3. 合併到 main 分支部署到生產環境');
    } else if (completionRate >= 60) {
      // logger.info('⚠️  您的專案具備基本的自動部署能力，但需要完善一些配置。');
      // logger.info('\n📋 需要完成:');
      // logger.info('1. 補充缺少的配置文件');
      // logger.info('2. 設置 GitHub Secrets');
      // logger.info('3. 測試部署流程');
    } else {
      // logger.info('❌ 您的專案需要更多配置才能實現自動部署。');
      // logger.info('\n📋 建議:');
      // logger.info('1. 完善所有必要的配置文件');
      // logger.info('2. 設置 GitHub Secrets');
      // logger.info('3. 測試部署腳本');
    }
    
  } catch (error) {
    // logger.info('❌ 檢查過程中發生錯誤:', error.message);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  checkAutoDeployStatus();
}

module.exports = {
  checkAutoDeployStatus,
  checkGitHubWorkflows,
  checkDeployScripts,
  checkEnvironmentFiles,
  checkPackageScripts,
  checkDockerConfig,
  checkRenderConfig
};
