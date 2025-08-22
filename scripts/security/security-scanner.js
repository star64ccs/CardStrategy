#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
// eslint-disable-next-line no-unused-vars
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// eslint-disable-next-line no-unused-vars
const log = {
// eslint-disable-next-line no-console
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
// eslint-disable-next-line no-console
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
// eslint-disable-next-line no-console
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
// eslint-disable-next-line no-console
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
// eslint-disable-next-line no-console
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

class SecurityScanner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.backendDir = path.join(this.projectRoot, 'backend');
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [],
    };
  }

  async runSecurityScan() {
    log.header('🔒 開始安全掃描');

    try {
      // 1. 依賴安全掃描
      await this.scanDependencies();

      // 2. 代碼安全掃描
      await this.scanCode();

      // 3. 配置安全掃描
      await this.scanConfiguration();

      // 4. 環境變量安全掃描
      await this.scanEnvironmentVariables();

      // 5. 文件權限掃描
      await this.scanFilePermissions();

      this.printResults();
    } catch (error) {
      log.error(`安全掃描失敗: ${error.message}`);
      process.exit(1);
    }
  }

  async scanDependencies() {
    log.info('📦 掃描依賴安全...');

    try {
      // 檢查 npm audit
// eslint-disable-next-line no-unused-vars
      const auditResult = this.runCommand(
        'npm audit --audit-level=moderate',
        this.backendDir
      );
      this.addResult('依賴安全掃描', 'PASS', '未發現高危漏洞');
      log.success('依賴安全掃描完成');
    } catch (error) {
      this.addResult('依賴安全掃描', 'FAIL', error.message);
      log.error(`依賴安全掃描失敗: ${error.message}`);
    }
  }

  async scanCode() {
    log.info('🔍 掃描代碼安全...');

    const issues = [];

    // 檢查硬編碼密鑰
    const hardcodedSecrets = this.findHardcodedSecrets();
    if (hardcodedSecrets.length > 0) {
      issues.push(`發現 ${hardcodedSecrets.length} 個硬編碼密鑰`);
    }

    // 檢查 SQL 注入風險
    const sqlInjectionRisks = this.findSQLInjectionRisks();
    if (sqlInjectionRisks.length > 0) {
      issues.push(`發現 ${sqlInjectionRisks.length} 個 SQL 注入風險`);
    }

    // 檢查 XSS 風險
    const xssRisks = this.findXSSRisks();
    if (xssRisks.length > 0) {
      issues.push(`發現 ${xssRisks.length} 個 XSS 風險`);
    }

    if (issues.length === 0) {
      this.addResult('代碼安全掃描', 'PASS', '未發現安全問題');
      log.success('代碼安全掃描完成');
    } else {
      this.addResult('代碼安全掃描', 'FAIL', issues.join(', '));
      log.error(`代碼安全掃描發現問題: ${issues.join(', ')}`);
    }
  }

  async scanConfiguration() {
    log.info('⚙️ 掃描配置安全...');

    const issues = [];

    // 檢查 CORS 配置
    if (!this.checkCORSConfiguration()) {
      issues.push('CORS 配置不安全');
    }

    // 檢查 Helmet 配置
    if (!this.checkHelmetConfiguration()) {
      issues.push('缺少安全頭配置');
    }

    // 檢查速率限制
    if (!this.checkRateLimiting()) {
      issues.push('缺少速率限制配置');
    }

    if (issues.length === 0) {
      this.addResult('配置安全掃描', 'PASS', '安全配置正確');
      log.success('配置安全掃描完成');
    } else {
      this.addResult('配置安全掃描', 'FAIL', issues.join(', '));
      log.error(`配置安全掃描發現問題: ${issues.join(', ')}`);
    }
  }

  async scanEnvironmentVariables() {
    log.info('🔐 掃描環境變量安全...');

    const issues = [];

    // 檢查敏感環境變量
    const sensitiveVars = this.checkSensitiveEnvironmentVariables();
    if (sensitiveVars.length > 0) {
      issues.push(`發現 ${sensitiveVars.length} 個敏感環境變量`);
    }

    // 檢查默認密鑰
    const defaultKeys = this.checkDefaultKeys();
    if (defaultKeys.length > 0) {
      issues.push(`發現 ${defaultKeys.length} 個默認密鑰`);
    }

    if (issues.length === 0) {
      this.addResult('環境變量安全掃描', 'PASS', '環境變量配置安全');
      log.success('環境變量安全掃描完成');
    } else {
      this.addResult('環境變量安全掃描', 'FAIL', issues.join(', '));
      log.error(`環境變量安全掃描發現問題: ${issues.join(', ')}`);
    }
  }

  async scanFilePermissions() {
    log.info('📁 掃描文件權限...');

    const issues = [];

    // 檢查敏感文件權限
    const sensitiveFiles = this.checkSensitiveFilePermissions();
    if (sensitiveFiles.length > 0) {
      issues.push(`發現 ${sensitiveFiles.length} 個權限不當的文件`);
    }

    if (issues.length === 0) {
      this.addResult('文件權限掃描', 'PASS', '文件權限配置正確');
      log.success('文件權限掃描完成');
    } else {
      this.addResult('文件權限掃描', 'FAIL', issues.join(', '));
      log.error(`文件權限掃描發現問題: ${issues.join(', ')}`);
    }
  }

  findHardcodedSecrets() {
// eslint-disable-next-line no-unused-vars
    const patterns = [
      /api[_-]?key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      /token\s*[:=]\s*['"`][^'"`]+['"`]/gi,
    ];

    const files = this.getAllJSFiles();
// eslint-disable-next-line no-unused-vars
    const secrets = [];

    files.forEach((file) => {
// eslint-disable-next-line no-unused-vars
      const content = fs.readFileSync(file, 'utf8');
      patterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          secrets.push({
            file,
            matches: matches.length,
          });
        }
      });
    });

    return secrets;
  }

  findSQLInjectionRisks() {
// eslint-disable-next-line no-unused-vars
    const patterns = [
      /query\s*\(\s*['"`]\s*SELECT.*\$\{/gi,
      /execute\s*\(\s*['"`]\s*SELECT.*\$\{/gi,
      /raw\s*\(\s*['"`]\s*SELECT.*\$\{/gi,
    ];

    const files = this.getAllJSFiles();
    const risks = [];

    files.forEach((file) => {
// eslint-disable-next-line no-unused-vars
      const content = fs.readFileSync(file, 'utf8');
      patterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          risks.push({
            file,
            matches: matches.length,
          });
        }
      });
    });

    return risks;
  }

  findXSSRisks() {
// eslint-disable-next-line no-unused-vars
    const patterns = [
      /innerHTML\s*=\s*[^;]+/gi,
      /outerHTML\s*=\s*[^;]+/gi,
      /document\.write\s*\(/gi,
    ];

    const files = this.getAllJSFiles();
    const risks = [];

    files.forEach((file) => {
// eslint-disable-next-line no-unused-vars
      const content = fs.readFileSync(file, 'utf8');
      patterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          risks.push({
            file,
            matches: matches.length,
          });
        }
      });
    });

    return risks;
  }

  checkCORSConfiguration() {
    const files = this.getAllJSFiles();

    for (const file of files) {
// eslint-disable-next-line no-unused-vars
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('cors') && content.includes('origin')) {
        return true;
      }
    }

    return false;
  }

  checkHelmetConfiguration() {
    const files = this.getAllJSFiles();

    for (const file of files) {
// eslint-disable-next-line no-unused-vars
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('helmet')) {
        return true;
      }
    }

    return false;
  }

  checkRateLimiting() {
    const files = this.getAllJSFiles();

    for (const file of files) {
// eslint-disable-next-line no-unused-vars
      const content = fs.readFileSync(file, 'utf8');
      if (
        content.includes('rateLimit') ||
        content.includes('express-rate-limit')
      ) {
        return true;
      }
    }

    return false;
  }

  checkSensitiveEnvironmentVariables() {
    const sensitiveVars = [
      'JWT_SECRET',
      'DB_PASSWORD',
      'REDIS_PASSWORD',
      'API_KEY',
      'SECRET_KEY',
    ];

    const envFile = path.join(this.backendDir, '.env');
    if (!fs.existsSync(envFile)) {
      return [];
    }

// eslint-disable-next-line no-unused-vars
    const content = fs.readFileSync(envFile, 'utf8');
    const found = [];

    sensitiveVars.forEach((varName) => {
      if (content.includes(varName)) {
        found.push(varName);
      }
    });

    return found;
  }

  checkDefaultKeys() {
    const defaultKeys = [
      'your-super-secret-jwt-key-here',
      'your-encryption-key-here',
      'your-api-key-here',
    ];

    const files = this.getAllJSFiles();
    const found = [];

    files.forEach((file) => {
// eslint-disable-next-line no-unused-vars
      const content = fs.readFileSync(file, 'utf8');
      defaultKeys.forEach((key) => {
        if (content.includes(key)) {
          found.push({
            file,
            key,
          });
        }
      });
    });

    return found;
  }

  checkSensitiveFilePermissions() {
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'package-lock.json',
    ];

    const issues = [];

    sensitiveFiles.forEach((filename) => {
      const filepath = path.join(this.backendDir, filename);
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const mode = stats.mode.toString(8);

        // 檢查權限是否過於開放
        if (mode.endsWith('666') || mode.endsWith('777')) {
          issues.push({
            file: filename,
            mode,
          });
        }
      }
    });

    return issues;
  }

  getAllJSFiles() {
    const files = [];

    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);

      items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      });
    };

    scanDirectory(this.backendDir);
    return files;
  }

  runCommand(command, cwd) {
    try {
// eslint-disable-next-line no-unused-vars
      const result = execSync(command, {
        cwd,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return result;
    } catch (error) {
      throw new Error(error.stdout || error.message);
    }
  }

  addResult(name, status, message) {
    this.results.total++;

    if (status === 'PASS') {
      this.results.passed++;
    } else if (status === 'FAIL') {
      this.results.failed++;
    } else {
      this.results.warnings++;
    }

    this.results.issues.push({
      name,
      status,
      message,
    });
  }

  printResults() {
    const successRate = (
      (this.results.passed / this.results.total) *
      100
    ).toFixed(1);

    log.header('\n📊 安全掃描結果');
    log.info(`總檢查項目: ${this.results.total}`);
    log.info(`通過: ${this.results.passed}`);
    log.info(`失敗: ${this.results.failed}`);
    log.info(`警告: ${this.results.warnings}`);
    log.info(`安全評分: ${successRate}%`);

    log.info('\n📋 詳細結果:');
    this.results.issues.forEach((issue) => {
      if (issue.status === 'PASS') {
        log.success(`${issue.name}: ${issue.message}`);
      } else if (issue.status === 'FAIL') {
        log.error(`${issue.name}: ${issue.message}`);
      } else {
        log.warning(`${issue.name}: ${issue.message}`);
      }
    });

    if (this.results.failed > 0) {
      log.warning('\n⚠️ 發現安全問題，請立即修復');
    }

    if (successRate >= 80) {
      log.success('\n🎉 安全掃描通過！');
    } else {
      log.error('\n❌ 安全掃描失敗，請修復問題後重試');
      process.exit(1);
    }
  }
}

// 執行安全掃描
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.runSecurityScan().catch((error) => {
    log.error(`安全掃描失敗: ${error.message}`);
    process.exit(1);
  });
}

module.exports = SecurityScanner;
