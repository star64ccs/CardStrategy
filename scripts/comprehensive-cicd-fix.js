#!/usr/bin/env node

/**
 * Comprehensive CI/CD Error Diagnosis and Repair Script
 * Check and fix all common CI/CD issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive CI/CD Error Diagnosis and Repair Script');
console.log('=====================================\n');

// List of issues to check and fix
const issues = [];

// 1. Check workflow file integrity
function checkWorkflowFiles() {
  console.log('📋 Checking workflow file integrity...\n');

  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
    '.github/workflows/ci-cd-simplified.yml',
    '.github/workflows/ci-cd-fixed.yml',
  ];

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      issues.push(`Missing workflow file: ${file}`);
    }
  });
  console.log('');
}

// 2. Check GitHub Secrets references
function checkSecretsReferences() {
  console.log('🔐 Checking GitHub Secrets references...\n');

  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
    '.github/workflows/ci-cd-simplified.yml',
  ];

  const requiredSecrets = {
    DIGITOCEAN_CardStrategy_CI_CD_Token: 'DigitalOcean API Token',
    RENDER_TOKEN: 'Render API Token',
    SNYK_TOKEN: 'Snyk Security Scan Token (Optional)',
    SLACK_WEBHOOK_URL: 'Slack Notification Webhook (Optional)',
    DIGITALOCEAN_APP_ID: 'DigitalOcean App Platform ID (Optional)',
  };

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 Checking ${file}:`);
      const content = fs.readFileSync(file, 'utf8');

      Object.keys(requiredSecrets).forEach(secret => {
        if (content.includes('${{ secrets.' + secret + ' }}')) {
          console.log(`  ✅ References ${secret}`);
        } else {
          console.log(`  ⚠️ Missing ${secret} (${requiredSecrets[secret]})`);
        }
      });
      console.log('');
    }
  });
}

// 3. Check package.json scripts
function checkPackageScripts() {
  console.log('📦 Checking package.json scripts...\n');

  const packageFiles = ['package.json', 'backend/package.json'];

  packageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 Checking ${file}:`);
      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const scripts = content.scripts || {};

        const requiredScripts = ['test', 'lint', 'build'];

        requiredScripts.forEach(script => {
          if (scripts[script]) {
            console.log(`  ✅ ${script}: ${scripts[script]}`);
          } else {
            console.log(`  ❌ Missing ${script} script`);
            issues.push(`Missing ${script} script in ${file}`);
          }
        });

        // Check CI-specific scripts
        if (scripts['test:ci']) {
          console.log(`  ✅ test:ci: ${scripts['test:ci']}`);
        } else {
          console.log(`  ⚠️ Recommend adding test:ci script`);
        }

        console.log('');
      } catch (error) {
        console.log(`  ❌ Error parsing ${file}: ${error.message}`);
        issues.push(`Invalid JSON in ${file}`);
      }
    }
  });
}

// 4. Check environment configurations
function checkEnvironmentConfigs() {
  console.log('🌍 Checking environment configuration files...\n');

  const configFiles = [
    'render.yml',
    'docker-compose.yml',
    'env.production.config',
    'env.staging.config',
  ];

  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      issues.push(`Missing environment config: ${file}`);
    }
  });
  console.log('');
}

// 5. Check workflow logic
function checkWorkflowLogic() {
  console.log('🔍 Checking workflow logic...\n');

  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/ci-cd-simplified.yml',
  ];

  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 Checking ${file}:`);
      const content = fs.readFileSync(file, 'utf8');

      // Check conditional logic
      if (content.includes('needs:')) {
        console.log(`  ✅ Contains dependencies`);
      } else {
        console.log(`  ⚠️ Missing dependencies`);
      }

      // Check environment variables
      if (content.includes('env:')) {
        console.log(`  ✅ Contains environment variables`);
      } else {
        console.log(`  ⚠️ Missing environment variables`);
      }

      // Check error handling
      if (
        content.includes('|| echo') ||
        content.includes('continue-on-error')
      ) {
        console.log(`  ✅ Contains error handling`);
      } else {
        console.log(`  ⚠️ Missing error handling`);
      }

      console.log('');
    }
  });
}

// 6. Generate fix recommendations
function generateFixRecommendations() {
  console.log('🛠️ Fix recommendations:\n');

  if (issues.length === 0) {
    console.log('🎉 No serious issues found!');
    console.log('Your CI/CD configuration looks healthy.');
    console.log('');
  } else {
    console.log(`Found ${issues.length} issues:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.log('');
  }

  console.log('📋 Recommended fix steps:\n');
  console.log('1. Use the fixed workflow:');
  console.log(
    '   cp .github/workflows/ci-cd-fixed.yml .github/workflows/ci-cd-main.yml\n'
  );

  console.log('2. Ensure GitHub Secrets are configured:');
  console.log('   - DIGITOCEAN_CardStrategy_CI_CD_Token');
  console.log('   - RENDER_TOKEN');
  console.log('   - SNYK_TOKEN (Optional)');
  console.log('   - SLACK_WEBHOOK_URL (Optional)\n');

  console.log('3. Test CI/CD workflow:');
  console.log('   git checkout -b test-cicd-fix');
  console.log('   git add .');
  console.log('   git commit -m "test: CI/CD fix test"');
  console.log('   git push origin test-cicd-fix\n');

  console.log('4. Monitor deployment status:');
  console.log('   - GitHub Actions: https://github.com/your-repo/actions');
  console.log('   - Render Dashboard: https://dashboard.render.com');
  console.log('   - DigitalOcean Dashboard: https://cloud.digitalocean.com');
  console.log('');
}

// 7. Check service health
function checkServiceHealth() {
  console.log('🏥 Checking service health status...\n');

  const services = [
    {
      name: 'Render API',
      url: 'https://cardstrategy-api.onrender.com/api/health',
      description: 'Testing environment API',
    },
    {
      name: 'DigitalOcean API',
      url: 'https://api.cardstrategy.com/api/health',
      description: 'Production environment API',
    },
  ];

  services.forEach(service => {
    console.log(`🔍 ${service.name}:`);
    console.log(`   URL: ${service.url}`);
    console.log(`   Description: ${service.description}`);
    console.log(`   Status: Requires manual check`);
    console.log('');
  });
}

// 8. Generate final report
function generateFinalReport() {
  console.log('📊 Final diagnosis report:\n');

  const report = {
    timestamp: new Date().toISOString(),
    issues: issues.length,
    status: issues.length === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION',
    recommendations: [],
  };

  if (issues.length > 0) {
    report.recommendations.push('Fix discovered issues');
    report.recommendations.push('Run the script again after fixes');
  } else {
    report.recommendations.push('CI/CD configuration is healthy');
    report.recommendations.push('Ready to start deployment testing');
  }

  console.log(`Status: ${report.status}`);
  console.log(`Issue count: ${report.issues}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Recommendations: ${report.recommendations.join(', ')}`);
  console.log('');
}

// Main execution
function main() {
  try {
    checkWorkflowFiles();
    checkSecretsReferences();
    checkPackageScripts();
    checkEnvironmentConfigs();
    checkWorkflowLogic();
    generateFixRecommendations();
    generateFinalReport();

    console.log('🎊 CI/CD diagnosis complete!');
    console.log('If issues are found, please fix them according to the recommendations.\n');
  } catch (error) {
    console.error('❌ Diagnosis script execution failed:', error.message);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  checkWorkflowFiles,
  checkSecretsReferences,
  checkPackageScripts,
  checkEnvironmentConfigs,
  checkWorkflowLogic,
  generateFixRecommendations,
};

// Run if called directly
if (require.main === module) {
  main();
}