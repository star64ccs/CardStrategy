#!/usr/bin/env node

const {
  validateEnvironment,
  getConfig,
  isProduction,
  isDevelopment,
  isTest,
} = require('../../backend/src/config/environment');

// 顏色Output
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

class EnvironmentValidator {
  constructor() {
    this.config = getConfig();
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: [],
    };
  }

  async validate() {
    log.header('🔧 環境變量驗證');

    try {
      // 基本Verify
      this.testBasicValidation();

      // DatabaseConfigureVerify
      this.testDatabaseConfig();

      // Redis ConfigureVerify
      this.testRedisConfig();

      // JWT ConfigureVerify
      this.testJWTConfig();

      // AI API ConfigureVerify
      this.testAIConfig();

      // 安全ConfigureVerify
      this.testSecurityConfig();

      // 環境SpecificVerify
      this.testEnvironmentSpecific();

      this.printResults();
    } catch (error) {
      log.error(`Verify過程中發生Error: ${error.message}`);
      process.exit(1);
    }
  }

  testBasicValidation() {
    this.addTest('基本環境變量驗證', () => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const required = ['NODE_ENV', 'PORT', 'HOST'];
      const missing = required.filter((key) => !this.config[key]);

      if (missing.length > 0) {
        throw new Error(`缺少基本環境變量: ${missing.join(', ')}`);
      }

      return true;
    });
  }

  testDatabaseConfig() {
    this.addTest('數據庫配置驗證', () => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
      const missing = required.filter((key) => !this.config[key]);

      if (missing.length > 0) {
        throw new Error(`缺少數據庫配置: ${missing.join(', ')}`);
      }

      // CheckPortYesNo為有效數字
      if (isNaN(this.config.DB_PORT) || this.config.DB_PORT <= 0) {
        throw new Error('數據庫端口必須是有效的正整數');
      }

      return true;
    });
  }

  testRedisConfig() {
    this.addTest('Redis 配置驗證', () => {
      // Redis ConfigureYesOptional的，但如果有Configure就必須有效
      if (this.config.REDIS_HOST && this.config.REDIS_HOST !== 'localhost') {
        if (isNaN(this.config.REDIS_PORT) || this.config.REDIS_PORT <= 0) {
          throw new Error('Redis 端口必須是有效的正整數');
        }
      }

      return true;
    });
  }

  testJWTConfig() {
    this.addTest('JWT 配置驗證', () => {
      if (isProduction()) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
        const missing = required.filter((key) => !this.config[key]);

        if (missing.length > 0) {
          throw new Error(`生產環境缺少 JWT 配置: ${missing.join(', ')}`);
        }

        // CheckYesNo使用DefaultValue
        if (this.config.JWT_SECRET === 'your-super-secret-jwt-key-here') {
          throw new Error('生產環境不能使用默認的 JWT 密鑰');
        }
      }

      return true;
    });
  }

  testAIConfig() {
    this.addTest('AI API 配置驗證', () => {
      const aiKeys = ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'COHERE_API_KEY'];
      const hasAnyAIKey = aiKeys.some((key) => this.config[key]);

      if (!hasAnyAIKey) {
        this.addWarning('未配置任何 AI API 密鑰，AI 功能將不可用');
      }

      return true;
    });
  }

  testSecurityConfig() {
    this.addTest('安全配置驗證', () => {
      if (isProduction()) {
        if (this.config.ENCRYPTION_KEY === 'your-encryption-key-here') {
          throw new Error('生產環境不能使用默認的加密密鑰');
        }
      }

      return true;
    });
  }

  testEnvironmentSpecific() {
    this.addTest('環境特定配置驗證', () => {
      if (isProduction()) {
        // 生產環境SpecificCheck
        if (!this.config.REDIS_HOST || this.config.REDIS_HOST === 'localhost') {
          this.addWarning('生產環境建議使用外部 Redis Service');
        }

        if (!this.config.SMTP_HOST) {
          this.addWarning('生產環境建議Configure SMTP Service');
        }
      }

      if (isDevelopment()) {
        // On發環境SpecificCheck
        if (this.config.JWT_SECRET === 'your-super-secret-jwt-key-here') {
          this.addWarning('開發環境使用默認 JWT 密鑰，僅用於開發');
        }
      }

      return true;
    });
  }

  addTest(name, testFunction) {
    this.results.total++;

    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = testFunction();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS', result });
      log.success(`${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      log.error(`${name}: ${error.message}`);
    }
  }

  addWarning(message) {
    this.results.warnings++;
    log.warning(message);
  }

  printResults() {
    const successRate = (
      (this.results.passed / this.results.total) *
      100
    ).toFixed(1);

    log.header('\n📊 環境變量驗證結果');
    log.info(`總測試數: ${this.results.total}`);
    log.info(`通過: ${this.results.passed}`);
    log.info(`Failed: ${this.results.failed}`);
    log.info(`警告: ${this.results.warnings}`);
    log.info(`Success率: ${successRate}%`);

    if (this.results.failed > 0) {
      log.error('\n❌ Failed的測試:');
      this.results.tests
        .filter((test) => test.status === 'FAIL')
        .forEach((test) => {
          log.error(`${test.name}: ${test.error}`);
        });
    }

    if (this.results.warnings > 0) {
      log.warning('\n⚠️ 警告信息:');
      log.warning('請檢查上述警告並根據需要進行配置');
    }

    if (successRate >= 80) {
      log.success('\n🎉 環境變量驗證通過！');
    } else {
      log.error('\n⚠️ 環境變量驗證發現問題，請修復後重試。');
      process.exit(1);
    }
  }
}

// 執RowVerify
if (require.main === module) {
  const validator = new EnvironmentValidator();
  validator.validate().catch((error) => {
    log.error(`VerifyFailed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = EnvironmentValidator;
