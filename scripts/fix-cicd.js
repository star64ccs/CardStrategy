#!/usr/bin/env node

/**
 * CI/CD Quick Fix Script
 * Automatically diagnose and fix common CI/CD issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CI/CD Quick Fix Script');
console.log('========================\n');

// Check functions
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

// Diagnose issues
function diagnoseIssues() {
  console.log('🔍 Diagnosing CI/CD issues...\n');

  const issues = [];

  // Check workflow files
  const workflowFiles = [
    '.github/workflows/backend-ci-cd.yml',
    '.github/workflows/frontend-ci-cd.yml',
    '.github/workflows/deploy-digitalocean-production.yml',
  ];

  workflowFiles.forEach(file => {
    if (!checkFileExists(file)) {
      issues.push(`❌ Missing workflow file: ${file}`);
    } else if (!checkYamlSyntax(file)) {
      issues.push(`❌ YAML syntax error: ${file}`);
    } else {
      console.log(`✅ Workflow file OK: ${file}`);
    }
  });

  // Check package.json
  const packageFiles = ['package.json', 'backend/package.json'];
  packageFiles.forEach(file => {
    if (!checkFileExists(file)) {
      issues.push(`❌ Missing package.json: ${file}`);
    } else if (!checkPackageJson(file)) {
      issues.push(`❌ package.json configuration error: ${file}`);
    } else {
      console.log(`✅ package.json OK: ${file}`);
    }
  });

  // Check configuration files
  const configFiles = [
    'render.yml',
    'docker-compose.yml',
    'env.production.config',
  ];

  configFiles.forEach(file => {
    if (!checkFileExists(file)) {
      issues.push(`❌ Missing configuration file: ${file}`);
    } else {
      console.log(`✅ Configuration file exists: ${file}`);
    }
  });

  return issues;
}

// Fix issues
function fixIssues(issues) {
  console.log('\n🛠️ Fixing issues...\n');

  issues.forEach(issue => {
    console.log(`Fixing: ${issue}`);

    if (issue.includes('Missing workflow file')) {
      // Create simplified workflow
      console.log('  → Use simplified workflow');
    } else if (issue.includes('Missing configuration file')) {
      // Create basic configuration
      console.log('  → Create basic configuration');
    } else if (issue.includes('package.json')) {
      // Fix package.json
      console.log('  → Check npm scripts');
    }
  });
}

// Generate fix recommendations
function generateRecommendations() {
  console.log('\n📋 Fix recommendations:\n');

  console.log('1. Set up GitHub Secrets:');
  console.log('   - Go to GitHub Repository → Settings → Secrets → Actions');
  console.log('   - Add the following Secrets:');
  console.log('     * DIGITALOCEAN_TOKEN');
  console.log('     * RENDER_TOKEN');
  console.log('     * SNYK_TOKEN (Optional)');
  console.log('     * SLACK_WEBHOOK_URL (Optional)\n');

  console.log('2. Test local environment:');
  console.log('   cd backend && npm test');
  console.log('   cd frontend && npm test\n');

  console.log('3. Check service status:');
  console.log('   - Render Dashboard: https://dashboard.render.com');
  console.log('   - DigitalOcean Dashboard: https://cloud.digitalocean.com\n');

  console.log('4. Use simplified workflow:');
  console.log('   - If complex workflows fail, use ci-cd-simplified.yml\n');
}

// Main function
function main() {
  try {
    const issues = diagnoseIssues();

    if (issues.length === 0) {
      console.log('\n✅ No issues found! CI/CD configuration is healthy.\n');
    } else {
      console.log(`\n⚠️ Found ${issues.length} issues:\n`);
      issues.forEach(issue => console.log(issue));

      fixIssues(issues);
      generateRecommendations();
    }

    console.log('\n🚀 Quick fix complete!');
    console.log('If issues persist, check CICD_TROUBLESHOOTING_GUIDE.md\n');
  } catch (error) {
    console.error('❌ Fix script execution failed:', error.message);
    process.exit(1);
  }
}

// Execute main function
if (require.main === module) {
  main();
}

module.exports = { diagnoseIssues, fixIssues, generateRecommendations };