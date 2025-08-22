#!/usr/bin/env node

/**
 * 錯誤處理系統集成腳本
 * 用於在所有服務中自動集成 errorHandler
 */

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 需要集成的服務文件列表
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const serviceFiles = [
  'src/services/authService.ts',
  'src/services/cardService.ts',
  'src/services/predictionService.ts',
  'src/services/aiService.ts',
  'src/services/notificationService.ts',
  'src/services/collectionService.ts',
  'src/services/marketService.ts',
  'src/services/portfolioService.ts',
  'src/services/analyticsService.ts',
  'src/services/feedbackService.ts',
  'src/services/privacyService.ts',
  'src/services/termsService.ts',
  'src/services/scanHistoryService.ts',
  'src/services/simulatedGradingService.ts',
  'src/services/antiCounterfeitService.ts',
  'src/services/auditLogService.ts',
  'src/services/dataQualityService.ts',
  'src/services/advancedAnalyticsService.ts',
  'src/services/advancedPredictionService.ts',
  'src/services/enhancedAIService.ts',
  'src/services/multiAIService.ts',
  'src/services/aiRecognitionService.ts',
  'src/services/aiModelManager.ts',
  'src/services/aiEcosystem.ts',
  'src/services/aiEcosystemMonitor.ts',
  'src/services/optimizedApiService.ts',
  'src/services/performanceMonitorService.ts',
  'src/services/memoryMonitorService.ts',
  'src/services/logService.ts',
  'src/services/appInitializationService.ts',
  'src/services/navigationService.ts',
  'src/services/notificationManager.ts',
  'src/services/smartNotificationService.ts',
  'src/services/priceMonitorService.ts',
  'src/services/investmentService.ts',
  'src/services/paymentService.ts',
  'src/services/socialService.ts',
  'src/services/socialMediaIntegrationService.ts',
  'src/services/gamificationService.ts',
  'src/services/cardGameSupportService.ts',
  'src/services/dataBreachNotificationService.ts',
  'src/services/reportGenerationService.ts',
  'src/services/settingsService.ts',
  'src/services/shareVerificationService.ts',
  'src/services/backgroundSyncManager.ts',
  'src/services/offlineSyncManager.ts',
  'src/services/incrementalSyncManager.ts',
];

// 錯誤處理導入模板
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorHandlerImport = `import { errorHandler, withErrorHandling } from '@/utils/errorHandler';`;

// 錯誤處理包裝模板函數
function createErrorHandlerWrapper(
  methodName,
  params,
  originalMethodBody,
  serviceName
) {
  return `
  // 使用錯誤處理包裝器
  ${methodName}: withErrorHandling(async ${params} => {
    try {
      ${originalMethodBody}
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: '${serviceName}',
        method: '${methodName}',
        params: ${params}
      });
      throw error;
    }
  }, { service: '${serviceName}' }),`;
}

/**
 * 檢查文件是否存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 讀取文件內容
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    // logger.info(`無法讀取文件 ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 寫入文件內容
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    // logger.info(`✅ 已更新文件: ${filePath}`);
    return true;
  } catch (error) {
    // logger.info(`❌ 無法寫入文件 ${filePath}:`, error.message);
    return false;
  }
}

/**
 * 檢查是否已經導入了 errorHandler
 */
function hasErrorHandlerImport(content) {
  return (
    content.includes('errorHandler') || content.includes('withErrorHandling')
  );
}

/**
 * 添加錯誤處理導入
 */
function addErrorHandlerImport(content) {
  // 找到最後一個 import 語句
  const importRegex = /^import.*$/gm;
  const imports = content.match(importRegex) || [];

  if (imports.length === 0) {
    // 如果沒有 import 語句，在文件開頭添加
    return `${errorHandlerImport}\n\n${content}`;
  }

  // 在最後一個 import 語句後添加
  const lastImport = imports[imports.length - 1];
  const lastImportIndex = content.lastIndexOf(lastImport);
  const insertIndex = lastImportIndex + lastImport.length;

  return (
    content.slice(0, insertIndex) +
    '\n' +
    errorHandlerImport +
    content.slice(insertIndex)
  );
}

/**
 * 為方法添加錯誤處理
 */
function addErrorHandlingToMethod(content, methodName, serviceName) {
  // 簡單的錯誤處理包裝
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const errorHandlingWrapper = `
    try {
      ${content}
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: '${serviceName}',
        method: '${methodName}'
      });
      throw error;
    }`;

  return errorHandlingWrapper;
}

/**
 * 處理單個服務文件
 */
function processServiceFile(filePath) {
  // logger.info(`\n🔧 處理文件: ${filePath}`);

  if (!fileExists(filePath)) {
    // logger.info(`⚠️  文件不存在: ${filePath}`);
    return false;
  }

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let content = readFile(filePath);
  if (!content) {
    return false;
  }

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const serviceName = path.basename(filePath, '.ts');
  let modified = false;

  // 檢查是否已經有錯誤處理
  if (hasErrorHandlerImport(content)) {
    // logger.info(`ℹ️  文件已包含錯誤處理: ${filePath}`);
    return true;
  }

  // 添加錯誤處理導入
  content = addErrorHandlerImport(content);
  modified = true;

  // 為主要的異步方法添加錯誤處理
  const asyncMethodRegex =
    /async\s+(\w+)\s*\([^)]*\)\s*:\s*Promise<[^>]*>\s*{/g;
  let match;

  while ((match = asyncMethodRegex.exec(content)) !== null) {
    const methodName = match[1];
    // logger.info(`  📝 為方法添加錯誤處理: ${methodName}`);

    // 這裡可以添加更複雜的錯誤處理邏輯
    // 目前只是簡單地記錄已處理
  }

  if (modified) {
    return writeFile(filePath, content);
  }

  return true;
}

/**
 * 主函數
 */
function main() {
  // logger.info('🚀 開始集成錯誤處理系統...\n');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let successCount = 0;
  const totalCount = serviceFiles.length;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  for (const filePath of serviceFiles) {
    if (processServiceFile(filePath)) {
      successCount++;
    }
  }

  // logger.info(`\n📊 集成完成統計:`);
  // logger.info(`✅ 成功處理: ${successCount}/${totalCount} 個文件`);
  // logger.info(`❌ 失敗處理: ${totalCount - successCount} 個文件`);

  if (successCount === totalCount) {
    // logger.info('\n🎉 所有服務文件已成功集成錯誤處理系統！');
  } else {
    // logger.info('\n⚠️  部分文件處理失敗，請檢查錯誤信息。');
  }
}

// 運行主函數
if (require.main === module) {
  main();
}

module.exports = {
  processServiceFile,
  addErrorHandlerImport,
  addErrorHandlingToMethod,
};
