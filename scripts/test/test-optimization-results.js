#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const log = {
  info: (msg) => {
    /* */
  },
  success: (msg) => {
    /* */
  },
  warning: (msg) => {
    /* */
  },
  error: (msg) => {
    /* */
  },
  header: (msg) => {
    /* */
  },
};

class OptimizationTester {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
    this.results = {
      configFiles: false,
      serverFiles: false,
      documentation: false,
      dependencies: false,
      performance: false,
    };
  }

  // 1. 檢查配置文件
  async checkConfigFiles() {
    log.header('⚙️ 檢查配置文件');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const configFiles = [
      'src/config/unified.js',
      'src/config/database-optimized.js',
      'src/config/redis-optimized.js',
    ];

    let allExist = true;
    for (const file of configFiles) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.backendDir, file);
      if (fs.existsSync(filePath)) {
        log.success(`✅ ${file} 存在`);
      } else {
        log.error(`❌ ${file} 缺失`);
        allExist = false;
      }
    }

    this.results.configFiles = allExist;
    return allExist;
  }

  // 2. 檢查服務器文件
  async checkServerFiles() {
    log.header('🔧 檢查服務器文件');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const serverFiles = ['src/server-unified.js'];

    let allExist = true;
    for (const file of serverFiles) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.backendDir, file);
      if (fs.existsSync(filePath)) {
        log.success(`✅ ${file} 存在`);

        // 檢查 package.json 是否已更新
        const packagePath = path.join(this.backendDir, 'package.json');
        if (fs.existsSync(packagePath)) {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          if (packageJson.scripts.start === 'node src/server-unified.js') {
            log.success('✅ package.json 已更新為使用統一服務器');
          } else {
            log.warning('⚠️ package.json 未更新為使用統一服務器');
            allExist = false;
          }
        }
      } else {
        log.error(`❌ ${file} 缺失`);
        allExist = false;
      }
    }

    this.results.serverFiles = allExist;
    return allExist;
  }

  // 3. 檢查文檔結構
  async checkDocumentation() {
    log.header('📚 檢查文檔結構');

    const docFiles = [
      'docs/README.md',
      'docs/DEPLOYMENT_GUIDE.md',
      'docs/SETUP_GUIDE.md',
      'docs/API_DOCUMENTATION.md',
    ];

    let allExist = true;
    for (const file of docFiles) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        log.success(`✅ ${file} 存在`);
      } else {
        log.error(`❌ ${file} 缺失`);
        allExist = false;
      }
    }

    // 檢查備份目錄
    const backupDir = path.join(this.projectRoot, 'docs-backup');
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir);
      log.success(`✅ 備份目錄存在，包含 ${backupFiles.length} 個文件`);
    } else {
      log.warning('⚠️ 備份目錄不存在');
    }

    this.results.documentation = allExist;
    return allExist;
  }

  // 4. 檢查依賴
  async checkDependencies() {
    log.header('📦 檢查依賴');

    const packagePath = path.join(this.backendDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // 檢查必要的依賴
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const requiredDeps = [
        'express',
        'cors',
        'sequelize',
        'ioredis',
        'winston',
      ];
      let allExist = true;

      for (const dep of requiredDeps) {
        if (packageJson.dependencies[dep]) {
          log.success(`✅ ${dep} 已安裝 (${packageJson.dependencies[dep]})`);
        } else {
          log.error(`❌ ${dep} 未安裝`);
          allExist = false;
        }
      }

      this.results.dependencies = allExist;
      return allExist;
    } else {
      log.error('❌ package.json 不存在');
      this.results.dependencies = false;
      return false;
    }
  }

  // 5. 檢查性能優化
  async checkPerformanceOptimizations() {
    log.header('⚡ 檢查性能優化');

    const optimizations = [
      {
        name: '數據庫連接池配置',
        file: 'src/config/database-optimized.js',
        check: (content) =>
          content.includes('pool:') && content.includes('max:'),
      },
      {
        name: 'Redis 緩存工具',
        file: 'src/config/redis-optimized.js',
        check: (content) =>
          content.includes('cacheUtils') && content.includes('setex'),
      },
      {
        name: '統一配置系統',
        file: 'src/config/unified.js',
        check: (content) =>
          content.includes('envConfigs') && content.includes('production'),
      },
    ];

    let allOptimized = true;
    for (const opt of optimizations) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.backendDir, opt.file);
      if (fs.existsSync(filePath)) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const content = fs.readFileSync(filePath, 'utf8');
        if (opt.check(content)) {
          log.success(`✅ ${opt.name} 已實現`);
        } else {
          log.warning(`⚠️ ${opt.name} 未完全實現`);
          allOptimized = false;
        }
      } else {
        log.error(`❌ ${opt.name} 文件不存在`);
        allOptimized = false;
      }
    }

    this.results.performance = allOptimized;
    return allOptimized;
  }

  // 6. 生成測試報告
  generateReport() {
    log.header('📊 優化效果測試報告');

    const totalTests = Object.keys(this.results).length;
    const passedTests = Object.values(this.results).filter(Boolean).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    log.info(`測試結果: ${passedTests}/${totalTests} (${successRate}%)`);

    const report = `
# 優化效果測試報告

## 📈 測試結果
- 配置文件檢查: ${this.results.configFiles ? '✅ 通過' : '❌ 失敗'}
- 服務器文件檢查: ${this.results.serverFiles ? '✅ 通過' : '❌ 失敗'}
- 文檔結構檢查: ${this.results.documentation ? '✅ 通過' : '❌ 失敗'}
- 依賴檢查: ${this.results.dependencies ? '✅ 通過' : '❌ 失敗'}
- 性能優化檢查: ${this.results.performance ? '✅ 通過' : '❌ 失敗'}

## 📊 成功率
- 總測試數: ${totalTests}
- 通過測試: ${passedTests}
- 成功率: ${successRate}%

## 🎯 建議
${this.generateRecommendations()}

## 📝 下一步
1. 修復失敗的測試項目
2. 運行實際功能測試
3. 進行性能基準測試
4. 部署到測試環境驗證
`;

    const reportPath = path.join(
      this.projectRoot,
      'OPTIMIZATION_TEST_REPORT.md'
    );
    fs.writeFileSync(reportPath, report);
    log.success(`測試報告已生成: ${reportPath}`);
  }

  generateRecommendations() {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const recommendations = [];

    if (!this.results.configFiles) {
      recommendations.push('- 重新運行第二階段優化腳本以創建配置文件');
    }

    if (!this.results.serverFiles) {
      recommendations.push('- 檢查並修復服務器文件創建問題');
    }

    if (!this.results.documentation) {
      recommendations.push('- 重新運行文檔清理腳本');
    }

    if (!this.results.dependencies) {
      recommendations.push('- 安裝缺失的依賴: `npm install`');
    }

    if (!this.results.performance) {
      recommendations.push('- 檢查性能優化配置是否正確實現');
    }

    if (recommendations.length === 0) {
      recommendations.push('- 所有測試通過，可以進行下一步優化');
    }

    return recommendations.join('\n');
  }

  // 執行所有測試
  async run() {
    log.header('🚀 開始優化效果測試');

    try {
      await this.checkConfigFiles();
      await this.checkServerFiles();
      await this.checkDocumentation();
      await this.checkDependencies();
      await this.checkPerformanceOptimizations();
      this.generateReport();

      log.header('🎉 優化效果測試完成！');
      log.success('請查看 OPTIMIZATION_TEST_REPORT.md 了解詳細結果');
    } catch (error) {
      log.error(`測試過程中發生錯誤: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執行測試
if (require.main === module) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const tester = new OptimizationTester();
  tester.run();
}

module.exports = OptimizationTester;
