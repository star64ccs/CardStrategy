#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色Output
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const log = {
  info: (msg) => {
    /* logger.info(`${colors.blue}ℹ️  ${msg}${colors.reset}`) */
  },
  success: (msg) => {
    /* logger.info(`${colors.green}✅ ${msg}${colors.reset}`) */
  },
  warning: (msg) => {
    /* logger.info(`${colors.yellow}⚠️  ${msg}${colors.reset}`) */
  },
  error: (msg) => {
    /* logger.info(`${colors.red}❌ ${msg}${colors.reset}`) */
  },
  header: (msg) => {
    /* logger.info(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`) */
  },
};

class Phase1Optimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.stats = {
      todosFound: 0,
      consoleStatementsFound: 0,
      duplicateDocsFound: 0,
      unusedDepsFound: 0,
    };
  }

  // 1. 清理 TODO Comment
  async cleanTodos() {
    log.header('🔍 清理 TODO 註釋');

    const todoPatterns = [
      /\/\/\s*TODO[:\s]/gi,
      /\/\*\s*TODO[:\s]/gi,
      /#\s*TODO[:\s]/gi,
    ];

    const files = this.getAllFiles(['.js', '.ts', '.tsx', '.md']);
    let todosFound = 0;

    for (const file of files) {
      try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        let modified = false;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const newLines = lines.map((line, index) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
          for (const pattern of todoPatterns) {
            if (pattern.test(line)) {
              todosFound++;
              log.info(`發現 TODO: ${file}:${index + 1} - ${line.trim()}`);

              // 如果Yes簡單的 TODO，直接Remove
              if (line.trim().match(/^\s*\/\/\s*TODO[:\s].*$/)) {
                modified = true;
                return ''; // Remove整Row
              }

              // 如果Yes複雜的 TODO，Mark為需要ManualHandle
              if (!line.includes('FIXME')) {
                modified = true;
                return line.replace(/TODO/gi, 'FIXME');
              }
            }
          }
          return line;
        });

        if (modified) {
          fs.writeFileSync(file, newLines.join('\n'));
          log.success(`已處理: ${file}`);
        }
      } catch (error) {
        log.error(`Handle文件Failed: ${file} - ${error.message}`);
      }
    }

    this.stats.todosFound = todosFound;
    log.success(`找到並處理了 ${todosFound} 個 TODO 註釋`);
  }

  // 2. 清理 Console 語句
  async cleanConsoleStatements() {
    log.header('🧹 清理 Console 語句');

    const consolePatterns = [
      /console\.log\(/g,
      /console\.error\(/g,
      /console\.warn\(/g,
      /console\.info\(/g,
      /console\.debug\(/g,
    ];

    const files = this.getAllFiles(['.js', '.ts', '.tsx']);
    let consoleStatementsFound = 0;

    for (const file of files) {
      // SkipTestFile，保留必要的 console 語句
      if (
        file.includes('test') ||
        file.includes('spec') ||
        file.includes('__tests__')
      ) {
        continue;
      }

      try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const content = fs.readFileSync(file, 'utf8');
        let modified = false;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        let newContent = content;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        for (const pattern of consolePatterns) {
          const matches = newContent.match(pattern);
          if (matches) {
            consoleStatementsFound += matches.length;
            // Replace為 logger 或Remove
            newContent = newContent.replace(pattern, '// logger.info(');
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(file, newContent);
          log.success(`已處理: ${file}`);
        }
      } catch (error) {
        log.error(`Handle文件Failed: ${file} - ${error.message}`);
      }
    }

    this.stats.consoleStatementsFound = consoleStatementsFound;
    log.success(`找到並處理了 ${consoleStatementsFound} 個 console 語句`);
  }

  // 3. 識別DuplicateDocumentation
  async identifyDuplicateDocs() {
    log.header('📚 識別重複文檔');

    const docFiles = this.getAllFiles(['.md']).filter(
      (file) => !file.includes('node_modules') && !file.includes('.git')
    );

    const duplicateGroups = this.findDuplicateContent(docFiles);

    for (const [group, files] of duplicateGroups.entries()) {
      if (files.length > 1) {
        log.warning(`發現重複內容組 ${group + 1}:`);
        files.forEach((file) => log.info(`  - ${file}`));
        this.stats.duplicateDocsFound += files.length;
      }
    }

    log.success(`發現 ${this.stats.duplicateDocsFound} 個重複文檔`);
  }

  // 4. Check未使用的依賴
  async checkUnusedDependencies() {
    log.header('📦 檢查未使用的依賴');

    try {
      // 使用 npm-check Check未使用的依賴
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = execSync('npx npm-check --production', {
        encoding: 'utf8',
        cwd: this.projectRoot,
      });

      log.info('依賴檢查結果:');
      // logger.info(result);
    } catch (error) {
      log.warning('無法執行 npm-check，請手動檢查依賴');
      log.info('建議使用: npx npm-check --production');
    }
  }

  // 5. 生成優化Report
  generateReport() {
    log.header('📊 第一階段優化報告');

    const report = `
# 第一階段優化報告

## 📈 統計數據
- TODO 註釋處理: ${this.stats.todosFound} 個
- Console 語句清理: ${this.stats.consoleStatementsFound} 個
- 重複文檔發現: ${this.stats.duplicateDocsFound} 個

## 🎯 下一步建議
1. 手動檢查 FIXME 標記的文件
2. 合併重複文檔
3. 更新依賴版本
4. 運行測試確保功能正常

## 📝 注意事項
- 部分 TODO 已轉換為 FIXME，需要手動處理
- Console 語句已替換為註釋，需要實現適當的日誌系統
- 建議使用 logger 替代 console 語句
    `;

    const reportPath = path.join(
      this.projectRoot,
      'PHASE1_OPTIMIZATION_REPORT.md'
    );
    fs.writeFileSync(reportPath, report);
    log.success(`優化報告已生成: ${reportPath}`);
  }

  // 輔助Method
  getAllFiles(extensions) {
    const files = [];

    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!item.startsWith('.') && item !== 'node_modules') {
            walkDir(fullPath);
          }
        } else if (extensions.some((ext) => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    walkDir(this.projectRoot);
    return files;
  }

  findDuplicateContent(files) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const contentMap = new Map();
    const duplicateGroups = new Map();
    let groupId = 0;

    for (const file of files) {
      try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const content = fs.readFileSync(file, 'utf8');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const normalizedContent = content.replace(/\s+/g, ' ').trim();

        if (contentMap.has(normalizedContent)) {
          const existingGroup = contentMap.get(normalizedContent);
          if (!duplicateGroups.has(existingGroup)) {
            duplicateGroups.set(existingGroup, []);
          }
          duplicateGroups.get(existingGroup).push(file);
        } else {
          contentMap.set(normalizedContent, groupId++);
        }
      } catch (error) {
        log.error(`讀取文件Failed: ${file}`);
      }
    }

    return duplicateGroups;
  }

  // 執Row所有優化
  async run() {
    log.header('🚀 開始第一階段優化');

    try {
      await this.cleanTodos();
      await this.cleanConsoleStatements();
      await this.identifyDuplicateDocs();
      await this.checkUnusedDependencies();
      this.generateReport();

      log.header('🎉 第一階段優化完成！');
      log.success('請查看 PHASE1_OPTIMIZATION_REPORT.md 了解詳細結果');
    } catch (error) {
      log.error(`優化過程中發生Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執Row優化
if (require.main === module) {
  const optimizer = new Phase1Optimizer();
  optimizer.run();
}

module.exports = Phase1Optimizer;
