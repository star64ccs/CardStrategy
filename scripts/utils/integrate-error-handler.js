#!/usr/bin/env node

/**
 * ErrorHandle系統集成腳本
 * 用於在所有Service中Auto集成 errorHandler
 */

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 需要集成的ServiceFileList
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

// ErrorHandleImport模板
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorHandlerImport = `import { errorHandler, withErrorHandling } from '@/utils/errorHandler';`;

// ErrorHandlePackage裝模板Function
function createErrorHandlerWrapper(
  methodName,
  params,
  originalMethodBody,
  serviceName
) {
  return `
  // 使用ErrorHandlePackage裝器
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
 * CheckFileYesNo存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * ReadFileContent
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    // logger.info(`無法ReadFile ${filePath}:`, error.message);
    return null;
  }
}

/**
 * WriteFileContent
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    // logger.info(`✅ 已UpdateFile: ${filePath}`);
    return true;
  } catch (error) {
    // logger.info(`❌ 無法WriteFile ${filePath}:`, error.message);
    return false;
  }
}

/**
 * CheckYesNo已經Import了 errorHandler
 */
function hasErrorHandlerImport(content) {
  return (
    content.includes('errorHandler') || content.includes('withErrorHandling')
  );
}

/**
 * AddErrorHandleImport
 */
function addErrorHandlerImport(content) {
  // 找到最後一個 import 語句
  const importRegex = /^import.*$/gm;
  const imports = content.match(importRegex) || [];

  if (imports.length === 0) {
    // 如果沒有 import 語句，在FileOn頭Add
    return `${errorHandlerImport}\n\n${content}`;
  }

  // 在最後一個 import 語句後Add
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
 * 為MethodAddErrorHandle
 */
function addErrorHandlingToMethod(content, methodName, serviceName) {
  // 簡單的ErrorHandlePackage裝
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
 * HandleSingleServiceFile
 */
function processServiceFile(filePath) {
  // logger.info(`\n🔧 HandleFile: ${filePath}`);

  if (!fileExists(filePath)) {
    // logger.info(`⚠️  File不存在: ${filePath}`);
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

  // CheckYesNo已經有ErrorHandle
  if (hasErrorHandlerImport(content)) {
    // logger.info(`ℹ️  File已Package含ErrorHandle: ${filePath}`);
    return true;
  }

  // AddErrorHandleImport
  content = addErrorHandlerImport(content);
  modified = true;

  // 為主要的AsyncMethodAddErrorHandle
  const asyncMethodRegex =
    /async\s+(\w+)\s*\([^)]*\)\s*:\s*Promise<[^>]*>\s*{/g;
  let match;

  while ((match = asyncMethodRegex.exec(content)) !== null) {
    const methodName = match[1];
    // logger.info(`  📝 為MethodAddErrorHandle: ${methodName}`);

    // 這裡可以Add更複雜的ErrorHandle邏輯
    // 目前只Yes簡單地Record已Handle
  }

  if (modified) {
    return writeFile(filePath, content);
  }

  return true;
}

/**
 * 主Function
 */
function main() {
  // logger.info('🚀 Begin集成ErrorHandle系統...\n');

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

  // logger.info(`\n📊 集成CompleteStatistics:`);
  // logger.info(`✅ SuccessHandle: ${successCount}/${totalCount} 個File`);
  // logger.info(`❌ FailedHandle: ${totalCount - successCount} 個File`);

  if (successCount === totalCount) {
    // logger.info('\n🎉 所有ServiceFile已Success集成ErrorHandle系統！');
  } else {
    // logger.info('\n⚠️  PartialFileHandleFailed，請CheckErrorInformation。');
  }
}

// 運Row主Function
if (require.main === module) {
  main();
}

module.exports = {
  processServiceFile,
  addErrorHandlerImport,
  addErrorHandlingToMethod,
};
