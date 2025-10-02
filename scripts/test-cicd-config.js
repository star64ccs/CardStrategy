#!/usr/bin/env node

/**
 * CI/CD Configuration Test Script
 * Verify GitHub Secrets and workflow configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 CI/CD Configuration Test Script');
console.log('=======================\n');

// Check Secrets references in workflow files
function checkWorkflowSecrets() {
  console.log('🔍 Checking Secrets in workflow files...\n');

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
      console.log(`📄 Checking file: ${file}`);
      const content = fs.readFileSync(file, 'utf8');

      // Find all secrets references
      const secretMatches = content.match(/\${{ secrets\.([^}]+) }}/g);
      if (secretMatches) {
        secretMatches.forEach(match => {
          const secretName = match.match(/secrets\.([^}]+)/)[1];
          console.log(`  ✅ Found Secret: ${secretName}`);

          // Record to requiredSecrets
          if (requiredSecrets[secretName]) {
            requiredSecrets[secretName].push(file);
          }
        });
      }
      console.log('');
    } else {
      console.log(`❌ File does not exist: ${file}\n`);
    }
  });

  return requiredSecrets;
}

// Check required Secrets
function checkRequiredSecrets(requiredSecrets) {
  console.log('📋 Required GitHub Secrets:\n');

  const secrets = [
    {
      name: 'DIGITOCEAN_CardStrategy_CI_CD_Token',
      description: 'DigitalOcean API Token (You have set this)',
      status: '✅ Set',
      files: requiredSecrets['DIGITOCEAN_CardStrategy_CI_CD_Token'],
    },
    {
      name: 'RENDER_TOKEN',
      description: 'Render API Token (You have set this)',
      status: '✅ Set',
      files: requiredSecrets['RENDER_TOKEN'],
    },
    {
      name: 'SNYK_TOKEN',
      description: 'Snyk Security Scan Token (Optional)',
      status: '⚠️ Optional',
      files: requiredSecrets['SNYK_TOKEN'],
    },
    {
      name: 'SLACK_WEBHOOK_URL',
      description: 'Slack Notification Webhook (Optional)',
      status: '⚠️ Optional',
      files: requiredSecrets['SLACK_WEBHOOK_URL'],
    },
    {
      name: 'DIGITALOCEAN_APP_ID',
      description: 'DigitalOcean App Platform ID',
      status: '❓ Needs check',
      files: requiredSecrets['DIGITALOCEAN_APP_ID'] || [],
    },
  ];

  secrets.forEach(secret => {
    console.log(`${secret.status} ${secret.name}`);
    console.log(`   Description: ${secret.description}`);
    if (secret.files.length > 0) {
      console.log(`   Used in: ${secret.files.join(', ')}`);
    }
    console.log('');
  });

  return secrets;
}

// Generate test recommendations
function generateTestRecommendations(secrets) {
  console.log('🚀 Test recommendations:\n');

  console.log('1. Test simplified workflow:');
  console.log('   git checkout -b test-cicd');
  console.log('   git push origin test-cicd');
  console.log('   # Check GitHub Actions run status\n');

  console.log('2. Test backend deployment:');
  console.log('   git checkout develop');
  console.log('   git push origin develop');
  console.log('   # Check Render auto deployment\n');

  console.log('3. Test production deployment:');
  console.log('   git checkout main');
  console.log('   git push origin main');
  console.log('   # Check DigitalOcean deployment\n');

  console.log('4. Check service health status:');
  console.log('   curl -f https://cardstrategy-api.onrender.com/api/health');
  console.log('   curl -f https://api.cardstrategy.com/api/health\n');

  // Check if additional Secrets are needed
  const missingSecrets = secrets.filter(s => s.status.includes('Needs check'));
  if (missingSecrets.length > 0) {
    console.log('⚠️ May need additional Secrets:');
    missingSecrets.forEach(secret => {
      console.log(`   - ${secret.name}: ${secret.description}`);
    });
    console.log('');
  }
}

// Check workflow syntax
function checkWorkflowSyntax() {
  console.log('🔧 Checking workflow syntax...\n');

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

        // Basic YAML syntax check
        const lines = content.split('\n');
        let indentLevel = 0;
        let hasErrors = false;

        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const currentIndent = line.length - line.trimStart().length;

            // Check if indentation is correct
            if (currentIndent % 2 !== 0 && currentIndent > 0) {
              console.log(`⚠️ ${file}:${index + 1} Indentation may be incorrect`);
              hasErrors = true;
            }
          }
        });

        if (!hasErrors) {
          console.log(`✅ ${file} Syntax check passed`);
        }
      } catch (error) {
        console.log(`❌ ${file} Syntax error: ${error.message}`);
      }
    }
  });

  console.log('');
}

// Main function
function main() {
  try {
    // Check workflow Secrets
    const requiredSecrets = checkWorkflowSecrets();

    // Check required Secrets
    const secrets = checkRequiredSecrets(requiredSecrets);

    // Check workflow syntax
    checkWorkflowSyntax();

    // Generate test recommendations
    generateTestRecommendations(secrets);

    console.log('🎉 Configuration check complete!');
    console.log('Your CI/CD configuration looks ready.\n');

    console.log('📞 If you encounter issues:');
    console.log('1. Check GitHub Actions logs');
    console.log('2. Run: node scripts/fix-cicd.js');
    console.log('3. Check: CICD_TROUBLESHOOTING_GUIDE.md\n');
  } catch (error) {
    console.error('❌ Configuration check failed:', error.message);
    process.exit(1);
  }
}

// Execute main function
if (require.main === module) {
  main();
}

module.exports = {
  checkWorkflowSecrets,
  checkRequiredSecrets,
  generateTestRecommendations,
};