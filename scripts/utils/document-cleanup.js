#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

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

class DocumentCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.docsDir = path.join(this.projectRoot, 'docs');
    this.backupDir = path.join(this.projectRoot, 'docs-backup');
  }

  // 創建備份目錄
  createBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      log.success('創建備份目錄');
    }
  }

  // 識別重複文檔
  identifyDuplicateDocs() {
    log.header('🔍 識別重複文檔');

    const duplicateGroups = {
      deployment: [
        'DEPLOYMENT_GUIDE.md',
        'DEPLOYMENT_SETUP_GUIDE.md',
        'DIGITALOCEAN_DEPLOYMENT_GUIDE.md',
        'RENDER_STAGING_GUIDE.md',
      ],
      setup: [
        'ENVIRONMENT_SETUP_GUIDE.md',
        'POSTGRESQL_SETUP_GUIDE.md',
        'REDIS_SETUP_GUIDE.md',
        'CLOUDFLARE_SETUP_GUIDE.md',
        'DIGITALOCEAN_DROPLET_SETUP_GUIDE.md',
        'DIGITALOCEAN_DOMAIN_SETUP_GUIDE.md',
      ],
      api: [
        'API_DOCUMENTATION.md',
        'API_INTEGRATION.md',
        'AUTH_API_DOCUMENTATION.md',
        'CARDS_API_DOCUMENTATION.md',
        'COLLECTIONS_API_DOCUMENTATION.md',
        'INVESTMENTS_API_DOCUMENTATION.md',
        'MARKET_API_DOCUMENTATION.md',
        'AI_API_DOCUMENTATION.md',
        'DEEP_LEARNING_API_DOCUMENTATION.md',
        'ADVANCED_FEATURES_API_DOCUMENTATION.md',
      ],
      status: [
        'PROJECT_COMPLETION_REPORT.md',
        'FINAL_PROJECT_STATUS_REPORT.md',
        'FINAL_DEPLOYMENT_STATUS.md',
        'FEATURE_COMPLETION_STATUS.md',
        'API_CONNECTION_STATUS.md',
        'SERVICES_CONNECTION_STATUS.md',
      ],
    };

    return duplicateGroups;
  }

  // 合併部署文檔
  async mergeDeploymentDocs() {
    log.header('📚 合併部署文檔');

    const deploymentFiles = [
      'DEPLOYMENT_GUIDE.md',
      'DEPLOYMENT_SETUP_GUIDE.md',
      'DIGITALOCEAN_DEPLOYMENT_GUIDE.md',
      'RENDER_STAGING_GUIDE.md',
    ];

    let mergedContent = `# 🚀 CardStrategy 部署指南

## 📋 目錄
1. [快速開始](#快速開始)
2. [環境設置](#環境設置)
3. [本地部署](#本地部署)
4. [雲端部署](#雲端部署)
5. [監控和維護](#監控和維護)

`;

    for (const file of deploymentFiles) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
          const content = fs.readFileSync(filePath, 'utf8');
          mergedContent += `\n## ${file.replace('.md', '')}\n\n`;
          mergedContent += content;
          log.success(`已合併: ${file}`);
        } catch (error) {
          log.error(`讀取文件失敗: ${file} - ${error.message}`);
        }
      }
    }

    const outputPath = path.join(this.docsDir, 'DEPLOYMENT_GUIDE.md');
    fs.writeFileSync(outputPath, mergedContent);
    log.success(`部署指南已合併到: ${outputPath}`);
  }

  // 合併設置文檔
  async mergeSetupDocs() {
    log.header('⚙️ 合併設置文檔');

    const setupFiles = [
      'ENVIRONMENT_SETUP_GUIDE.md',
      'POSTGRESQL_SETUP_GUIDE.md',
      'REDIS_SETUP_GUIDE.md',
      'CLOUDFLARE_SETUP_GUIDE.md',
    ];

    let mergedContent = `# ⚙️ CardStrategy 環境設置指南

## 📋 目錄
1. [環境要求](#環境要求)
2. [數據庫設置](#數據庫設置)
3. [緩存設置](#緩存設置)
4. [CDN 設置](#cdn-設置)
5. [故障排除](#故障排除)

`;

    for (const file of setupFiles) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
          const content = fs.readFileSync(filePath, 'utf8');
          mergedContent += `\n## ${file.replace('.md', '')}\n\n`;
          mergedContent += content;
          log.success(`已合併: ${file}`);
        } catch (error) {
          log.error(`讀取文件失敗: ${file} - ${error.message}`);
        }
      }
    }

    const outputPath = path.join(this.docsDir, 'SETUP_GUIDE.md');
    fs.writeFileSync(outputPath, mergedContent);
    log.success(`設置指南已合併到: ${outputPath}`);
  }

  // 合併 API 文檔
  async mergeApiDocs() {
    log.header('🔌 合併 API 文檔');

    const apiFiles = [
      'API_DOCUMENTATION.md',
      'AUTH_API_DOCUMENTATION.md',
      'CARDS_API_DOCUMENTATION.md',
      'COLLECTIONS_API_DOCUMENTATION.md',
      'INVESTMENTS_API_DOCUMENTATION.md',
      'MARKET_API_DOCUMENTATION.md',
      'AI_API_DOCUMENTATION.md',
    ];

    let mergedContent = `# 🔌 CardStrategy API 文檔

## 📋 目錄
1. [認證 API](#認證-api)
2. [卡片管理 API](#卡片管理-api)
3. [收藏管理 API](#收藏管理-api)
4. [投資管理 API](#投資管理-api)
5. [市場數據 API](#市場數據-api)
6. [AI 服務 API](#ai-服務-api)

## 🔑 認證

所有 API 請求都需要在 Header 中包含 JWT Token：

\`\`\`bash
Authorization: Bearer <your-jwt-token>
\`\`\`

## 📊 響應格式

所有 API 響應都遵循以下格式：

\`\`\`json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

`;

    for (const file of apiFiles) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
          const content = fs.readFileSync(filePath, 'utf8');
          mergedContent += `\n## ${file.replace('_API_DOCUMENTATION.md', ' API')}\n\n`;
          mergedContent += content;
          log.success(`已合併: ${file}`);
        } catch (error) {
          log.error(`讀取文件失敗: ${file} - ${error.message}`);
        }
      }
    }

    const outputPath = path.join(this.docsDir, 'API_DOCUMENTATION.md');
    fs.writeFileSync(outputPath, mergedContent);
    log.success(`API 文檔已合併到: ${outputPath}`);
  }

  // 移動重複文檔到備份目錄
  async moveDuplicateDocs() {
    log.header('📦 移動重複文檔到備份目錄');

    const duplicateFiles = [
      'DEPLOYMENT_GUIDE.md',
      'DEPLOYMENT_SETUP_GUIDE.md',
      'DIGITALOCEAN_DEPLOYMENT_GUIDE.md',
      'RENDER_STAGING_GUIDE.md',
      'ENVIRONMENT_SETUP_GUIDE.md',
      'POSTGRESQL_SETUP_GUIDE.md',
      'REDIS_SETUP_GUIDE.md',
      'CLOUDFLARE_SETUP_GUIDE.md',
      'DIGITALOCEAN_DROPLET_SETUP_GUIDE.md',
      'DIGITALOCEAN_DOMAIN_SETUP_GUIDE.md',
      'API_DOCUMENTATION.md',
      'API_INTEGRATION.md',
      'AUTH_API_DOCUMENTATION.md',
      'CARDS_API_DOCUMENTATION.md',
      'COLLECTIONS_API_DOCUMENTATION.md',
      'INVESTMENTS_API_DOCUMENTATION.md',
      'MARKET_API_DOCUMENTATION.md',
      'AI_API_DOCUMENTATION.md',
      'DEEP_LEARNING_API_DOCUMENTATION.md',
      'ADVANCED_FEATURES_API_DOCUMENTATION.md',
      'PROJECT_COMPLETION_REPORT.md',
      'FINAL_PROJECT_STATUS_REPORT.md',
      'FINAL_DEPLOYMENT_STATUS.md',
      'FEATURE_COMPLETION_STATUS.md',
      'API_CONNECTION_STATUS.md',
      'SERVICES_CONNECTION_STATUS.md',
    ];

    for (const file of duplicateFiles) {
      const sourcePath = path.join(this.projectRoot, file);
      const destPath = path.join(this.backupDir, file);

      if (fs.existsSync(sourcePath)) {
        try {
          fs.renameSync(sourcePath, destPath);
          log.success(`已移動: ${file}`);
        } catch (error) {
          log.error(`移動文件失敗: ${file} - ${error.message}`);
        }
      }
    }
  }

  // 更新 README.md
  async updateReadme() {
    log.header('📝 更新 README.md');

    const readmePath = path.join(this.projectRoot, 'README.md');
    if (fs.existsSync(readmePath)) {
      try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        let content = fs.readFileSync(readmePath, 'utf8');

        // 更新文檔鏈接
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
        const newDocsSection = `
## 📚 文檔

- [快速開始](docs/QUICK_START.md)
- [環境設置](docs/SETUP_GUIDE.md)
- [部署指南](docs/DEPLOYMENT_GUIDE.md)
- [API 文檔](docs/API_DOCUMENTATION.md)
- [開發指南](docs/DEVELOPER_GUIDE.md)
- [用戶手冊](docs/USER_MANUAL.md)

## 🔧 開發

\`\`\`bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev:full

# 運行測試
npm test

# 構建生產版本
npm run build
\`\`\`
`;

        // 替換舊的文檔部分
        content = content.replace(
          /## 📚 文檔[\s\S]*?## 🔧 開發/s,
          newDocsSection
        );

        fs.writeFileSync(readmePath, content);
        log.success('README.md 已更新');
      } catch (error) {
        log.error(`更新 README.md 失敗: ${error.message}`);
      }
    }
  }

  // 創建文檔索引
  async createDocsIndex() {
    log.header('📋 創建文檔索引');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const indexContent = `# 📚 CardStrategy 文檔索引

## 🚀 快速開始
- [快速開始指南](QUICK_START.md) - 5分鐘內啟動項目
- [環境設置](SETUP_GUIDE.md) - 完整的環境配置指南

## 🛠️ 開發
- [開發指南](DEVELOPER_GUIDE.md) - 開發環境設置和最佳實踐
- [API 文檔](API_DOCUMENTATION.md) - 完整的 API 參考
- [代碼規範](CODE_STANDARDS.md) - 代碼風格和規範

## 🚀 部署
- [部署指南](DEPLOYMENT_GUIDE.md) - 生產環境部署
- [監控指南](MONITORING_GUIDE.md) - 系統監控和維護

## 👥 用戶
- [用戶手冊](USER_MANUAL.md) - 用戶功能指南
- [故障排除](TROUBLESHOOTING.md) - 常見問題解決

## 📊 報告
- [項目狀態報告](PROJECT_STATUS.md) - 當前項目狀態
- [性能報告](PERFORMANCE_REPORT.md) - 性能優化報告

## 🔧 維護
- [維護指南](MAINTENANCE_GUIDE.md) - 系統維護和更新
- [備份恢復](BACKUP_RESTORE.md) - 數據備份和恢復
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const indexPath = path.join(this.docsDir, 'README.md');
    fs.writeFileSync(indexPath, indexContent);
    log.success('文檔索引已創建');
  }

  // 執行清理
  async run() {
    log.header('🚀 開始文檔清理');

    try {
      this.createBackup();
      await this.mergeDeploymentDocs();
      await this.mergeSetupDocs();
      await this.mergeApiDocs();
      await this.moveDuplicateDocs();
      await this.updateReadme();
      await this.createDocsIndex();

      log.header('🎉 文檔清理完成！');
      log.success('重複文檔已合併並移動到 docs-backup 目錄');
      log.success('新的文檔結構已創建在 docs 目錄');
    } catch (error) {
      log.error(`文檔清理過程中發生錯誤: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執行清理
if (require.main === module) {
  const cleanup = new DocumentCleanup();
  cleanup.run();
}

module.exports = DocumentCleanup;
