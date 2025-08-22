#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// 顏色輸出
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
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

class TestSuiteRunner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.backendDir = path.join(this.projectRoot, 'backend');
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: [],
    };
  }

  async runAllTests() {
    log.header('🧪 開始執行測試套件');

    try {
      // 1. 單元測試
      await this.runUnitTests();

      // 2. 集成測試
      await this.runIntegrationTests();

      // 3. API 測試
      await this.runAPITests();

      // 4. 性能測試
      await this.runPerformanceTests();

      // 5. 安全測試
      await this.runSecurityTests();

      this.printResults();
    } catch (error) {
      log.error(`測試執行失敗: ${error.message}`);
      process.exit(1);
    }
  }

  async runUnitTests() {
    log.info('📋 執行單元測試...');

    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = this.runCommand('npm run test:unit', this.backendDir);
      this.addSuiteResult('單元測試', 'PASS', result);
      log.success('單元測試完成');
    } catch (error) {
      this.addSuiteResult('單元測試', 'FAIL', error.message);
      log.error(`單元測試失敗: ${error.message}`);
    }
  }

  async runIntegrationTests() {
    log.info('🔗 執行集成測試...');

    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = this.runCommand(
        'npm run test:integration',
        this.backendDir
      );
      this.addSuiteResult('集成測試', 'PASS', result);
      log.success('集成測試完成');
    } catch (error) {
      this.addSuiteResult('集成測試', 'FAIL', error.message);
      log.error(`集成測試失敗: ${error.message}`);
    }
  }

  async runAPITests() {
    log.info('🌐 執行 API 測試...');

    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = this.runCommand('npm run test:api', this.backendDir);
      this.addSuiteResult('API 測試', 'PASS', result);
      log.success('API 測試完成');
    } catch (error) {
      this.addSuiteResult('API 測試', 'FAIL', error.message);
      log.error(`API 測試失敗: ${error.message}`);
    }
  }

  async runPerformanceTests() {
    log.info('⚡ 執行性能測試...');

    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = this.runCommand(
        'npm run test:performance',
        this.backendDir
      );
      this.addSuiteResult('性能測試', 'PASS', result);
      log.success('性能測試完成');
    } catch (error) {
      this.addSuiteResult('性能測試', 'FAIL', error.message);
      log.error(`性能測試失敗: ${error.message}`);
    }
  }

  async runSecurityTests() {
    log.info('🔒 執行安全測試...');

    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = this.runCommand('npm run test:security', this.backendDir);
      this.addSuiteResult('安全測試', 'PASS', result);
      log.success('安全測試完成');
    } catch (error) {
      this.addSuiteResult('安全測試', 'FAIL', error.message);
      log.error(`安全測試失敗: ${error.message}`);
    }
  }

  runCommand(command, cwd) {
    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
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

  addSuiteResult(name, status, result) {
    this.results.total++;
    if (status === 'PASS') {
      this.results.passed++;
    } else {
      this.results.failed++;
    }

    this.results.suites.push({
      name,
      status,
      result: status === 'PASS' ? '成功' : result,
    });
  }

  printResults() {
    const successRate = (
      (this.results.passed / this.results.total) *
      100
    ).toFixed(1);

    log.header('\n📊 測試套件執行結果');
    log.info(`總測試套件: ${this.results.total}`);
    log.info(`通過: ${this.results.passed}`);
    log.info(`失敗: ${this.results.failed}`);
    log.info(`成功率: ${successRate}%`);

    log.info('\n📋 詳細結果:');
    this.results.suites.forEach((suite) => {
      if (suite.status === 'PASS') {
        log.success(`${suite.name}: ${suite.result}`);
      } else {
        log.error(`${suite.name}: ${suite.result}`);
      }
    });

    if (this.results.failed > 0) {
      log.warning('\n⚠️ 有測試套件失敗，請檢查錯誤信息');
    }

    if (successRate >= 80) {
      log.success('\n🎉 測試套件執行成功！');
    } else {
      log.error('\n❌ 測試套件執行失敗，請修復問題後重試');
      process.exit(1);
    }
  }
}

// 執行測試套件
if (require.main === module) {
  const runner = new TestSuiteRunner();
  runner.runAllTests().catch((error) => {
    log.error(`測試套件執行失敗: ${error.message}`);
    process.exit(1);
  });
}

module.exports = TestSuiteRunner;
