#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

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
};

class SimpleServerTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: [],
    };
  }

  async testEndpoint(
    endpoint,
    method = 'GET',
    data = null,
    expectedStatus = 200
  ) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const testName = `${method} ${endpoint}`;
    this.results.total++;

    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const response = await axios({
        method,
        url: `${BASE_URL}${endpoint}`,
        data,
        timeout: 5000,
      });

      if (response.status === expectedStatus) {
        this.results.passed++;
        this.results.tests.push({
          name: testName,
          status: 'PASS',
          response: response.data,
        });
        log.success(`${testName} - Status: ${response.status}`);
        return true;
      } else {
        this.results.failed++;
        this.results.tests.push({
          name: testName,
          status: 'FAIL',
          expected: expectedStatus,
          actual: response.status,
        });
        log.error(
          `${testName} - Expected: ${expectedStatus}, Got: ${response.status}`
        );
        return false;
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({
        name: testName,
        status: 'ERROR',
        error: error.message,
      });
      log.error(`${testName} - Error: ${error.message}`);
      return false;
    }
  }

  async runTests() {
    log.info('🚀 開始增強版服務器基本功能測試');

    // 基本端點測試
    await this.testEndpoint('/');
    await this.testEndpoint('/health');
    await this.testEndpoint('/api/version');
    await this.testEndpoint('/api/test');

    // 404 測試
    await this.testEndpoint('/api/nonexistent', 'GET', null, 404);

    this.printResults();
  }

  printResults() {
    const successRate = (
      (this.results.passed / this.results.total) *
      100
    ).toFixed(1);

    log.info('\n📊 測試結果總結:');
    log.info(`總測試數: ${this.results.total}`);
    log.info(`通過: ${this.results.passed}`);
    log.info(`失敗: ${this.results.failed}`);
    log.info(`成功率: ${successRate}%`);

    if (this.results.failed > 0) {
      log.warning('\n❌ 失敗的測試:');
      this.results.tests
        .filter((test) => test.status !== 'PASS')
        .forEach((test) => {
          log.error(`${test.name}: ${test.status}`);
        });
    }

    if (successRate >= 80) {
      log.success('\n🎉 服務器基本功能測試通過！');
    } else {
      log.error('\n⚠️ 服務器測試發現問題，請檢查配置和依賴。');
    }
  }
}

// 執行測試
if (require.main === module) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const tester = new SimpleServerTester();
  tester.runTests().catch((error) => {
    log.error('測試執行失敗:', error.message);
    process.exit(1);
  });
}

module.exports = SimpleServerTester;
