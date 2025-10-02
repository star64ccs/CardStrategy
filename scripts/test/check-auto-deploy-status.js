// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// logger.info('🔍 AutoDeployStatusCheckTool');
// logger.info('='.repeat(50));

// Check GitHub Actions 工作流程
function checkGitHubWorkflows() {
  // logger.info('\n📋 Check GitHub Actions 工作流程...');

  const workflowsDir = '.github/workflows';
  const workflows = [
    'deploy.yml',
    'ci-cd.yml',
    'backend-ci-cd.yml',
    'frontend-ci-cd.yml',
  ];

  const foundWorkflows = [];

  workflows.forEach((workflow) => {
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

// CheckDeploy腳本
function checkDeployScripts() {
  // logger.info('\n📋 CheckDeploy腳本...');

  const scriptsDir = 'scripts';
  const deployScripts = [
    'deploy-production.sh',
    'deploy-staging.sh',
    'deploy-digitalocean.sh',
  ];

  const foundScripts = [];

  deployScripts.forEach((script) => {
    const scriptPath = path.join(scriptsDir, script);
    if (fs.existsSync(scriptPath)) {
      foundScripts.push(script);
      // logger.info(`✅ 找到Deploy腳本: ${script}`);

      // Check腳本權限
      try {
        const stats = fs.statSync(scriptPath);
        if (stats.mode & 0o111) {
          // logger.info(`  ✅ 腳本具有執Row權限`);
        } else {
          // logger.info(`  ⚠️  腳本缺少執Row權限`);
        }
      } catch (error) {
        // logger.info(`  ❌ 無法Check腳本權限`);
      }
    } else {
      // logger.info(`❌ 缺少Deploy腳本: ${script}`);
    }
  });

  return foundScripts;
}

// Check環境變數File
function checkEnvironmentFiles() {
  // logger.info('\n📋 Check環境變數File...');

  const envFiles = [
    '.env.production',
    '.env.staging',
    'env.production',
    'cloudflare-config.env',
  ];

  const foundEnvFiles = [];

  envFiles.forEach((envFile) => {
    if (fs.existsSync(envFile)) {
      foundEnvFiles.push(envFile);
      // logger.info(`✅ 找到環境File: ${envFile}`);
    } else {
      // logger.info(`❌ 缺少環境File: ${envFile}`);
    }
  });

  return foundEnvFiles;
}

// Check package.json 腳本
function checkPackageScripts() {
  // logger.info('\n📋 Check package.json 腳本...');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};

    const deployScripts = [
      'deploy:render',
      'deploy:digitalocean',
      'render:staging',
      'setup:cloudflare',
    ];

    const foundScripts = [];

    deployScripts.forEach((script) => {
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
    // logger.info(`❌ 無法Read package.json: ${error.message}`);
    return [];
  }
}

// Check Docker Configure
function checkDockerConfig() {
  // logger.info('\n📋 Check Docker Configure...');

  const dockerFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.prod.yml',
  ];

  const foundFiles = [];

  dockerFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
      // logger.info(`✅ 找到 Docker File: ${file}`);
    } else {
      // logger.info(`❌ 缺少 Docker File: ${file}`);
    }
  });

  return foundFiles;
}

// Check Render Configure
function checkRenderConfig() {
  // logger.info('\n📋 Check Render Configure...');

  const renderFiles = ['render.yaml', 'render.yml'];

  const foundFiles = [];

  renderFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
      // logger.info(`✅ 找到 Render Configure: ${file}`);
    } else {
      // logger.info(`❌ 缺少 Render Configure: ${file}`);
    }
  });

  return foundFiles;
}

// AnalysisDeploy流程
function analyzeDeployFlow() {
  // logger.info('\n📋 AnalysisDeploy流程...');
  // logger.info('\n🔄 當前Deploy流程:');
  // logger.info('1. Push到 develop Branch');
  // logger.info('   → 觸發 GitHub Actions');
  // logger.info('   → 運RowTest');
  // logger.info('   → Deploy到 Render (Test環境)');
  // logger.info('\n2. Merge到 main Branch');
  // logger.info('   → 觸發 GitHub Actions');
  // logger.info('   → 運RowTest');
  // logger.info('   → Deploy到 DigitalOcean (生產環境)');
  // logger.info('\n📊 Deploy觸發Condition:');
  // logger.info('- develop BranchPush → Render Test環境');
  // logger.info('- main BranchPush → DigitalOcean 生產環境');
  // logger.info('- Pull Request 到 main → 只運RowTest');
}

// Check GitHub Secrets 需求
function checkRequiredSecrets() {
  // logger.info('\n📋 Check所需的 GitHub Secrets...');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const requiredSecrets = [
    'RENDER_TOKEN',
    'RENDER_STAGING_SERVICE_ID',
    'DIGITALOCEAN_ACCESS_TOKEN',
    'DROPLET_ID',
    'PRODUCTION_SSH_KEY',
    'PRODUCTION_USER',
    'PRODUCTION_HOST',
    'SLACK_WEBHOOK_URL',
  ];

  // logger.info('需要在 GitHub Secrets 中Settings以下變數:');
  requiredSecrets.forEach((secret) => {
    // logger.info(`  - ${secret}`);
  });

  // logger.info('\n💡 SettingsMethod:');
  // logger.info('1. 前往 GitHub 倉Library');
  // logger.info('2. Settings → Secrets and variables → Actions');
  // logger.info('3. 點擊 "New repository secret"');
  // logger.info('4. Add上述變數');
}

// 主Function
function checkAutoDeployStatus() {
  // logger.info('\n🚀 BeginCheckAutoDeployStatus...\n');

  try {
    // Check各個Component
    const workflows = checkGitHubWorkflows();
    const deployScripts = checkDeployScripts();
    const envFiles = checkEnvironmentFiles();
    const packageScripts = checkPackageScripts();
    const dockerFiles = checkDockerConfig();
    const renderFiles = checkRenderConfig();

    // AnalysisDeploy流程
    analyzeDeployFlow();

    // Check Secrets 需求
    checkRequiredSecrets();

    // 總結
    // logger.info('\n📊 Check總結:');
    // logger.info('='.repeat(50));
    // logger.info(`✅ GitHub 工作流程: ${workflows.length}/4`);
    // logger.info(`✅ Deploy腳本: ${deployScripts.length}/3`);
    // logger.info(`✅ 環境File: ${envFiles.length}/4`);
    // logger.info(`✅ npm 腳本: ${packageScripts.length}/4`);
    // logger.info(`✅ Docker Configure: ${dockerFiles.length}/3`);
    // logger.info(`✅ Render Configure: ${renderFiles.length}/2`);
    // logger.info('='.repeat(50));

    // 評估AutoDeployStatus
    const totalComponents = 20; // 總Component數
    const foundComponents =
      workflows.length +
      deployScripts.length +
      envFiles.length +
      packageScripts.length +
      dockerFiles.length +
      renderFiles.length;

    const completionRate = (foundComponents / totalComponents) * 100;

    // logger.info(`\n🎯 AutoDeployComplete度: ${completionRate.toFixed(1)}%`);

    if (completionRate >= 80) {
      // logger.info('🎉 您的專案已具備完整的AutoDeploy能力！');
      // logger.info('\n📋 下一步:');
      // logger.info('1. Settings GitHub Secrets');
      // logger.info('2. Push到 develop BranchTest');
      // logger.info('3. Merge到 main BranchDeploy到生產環境');
    } else if (completionRate >= 60) {
      // logger.info('⚠️  您的專案具備基本的AutoDeploy能力，但需要完善一些Configure。');
      // logger.info('\n📋 需要Complete:');
      // logger.info('1. 補充缺少的ConfigureFile');
      // logger.info('2. Settings GitHub Secrets');
      // logger.info('3. TestDeploy流程');
    } else {
      // logger.info('❌ 您的專案需要更多Configure才能實現AutoDeploy。');
      // logger.info('\n📋 建議:');
      // logger.info('1. 完善所有必要的ConfigureFile');
      // logger.info('2. Settings GitHub Secrets');
      // logger.info('3. TestDeploy腳本');
    }
  } catch (error) {
    // logger.info('❌ Check過程中發生Error:', error.message);
  }
}

// 如果直接運Row此腳本
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
  checkRenderConfig,
};
