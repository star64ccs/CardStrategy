// 簡化測試
console.log('🧪 開始簡化測試...');

// 測試 1: 基本依賴
try {
  const express = require('express');
  console.log('✅ Express 正常');
} catch (error) {
  console.log('❌ Express 錯誤:', error.message);
}

// 測試 2: 路由文件
const routes = [
  './src/routes/auth.js',
  './src/routes/cards.js',
  './src/routes/market.js',
  './src/routes/simulatedGrading.js',
  './src/routes/ai.js',
  './src/routes/performance.js',
  './src/routes/batch.js',
  './src/routes/dataExport.js',
  './src/routes/alerts.js',
  './src/routes/feedback.js'
];

console.log('📋 路由文件測試:');
routes.forEach(route => {
  try {
    const routeModule = require(route);
    console.log(`✅ ${route} 正常`);
  } catch (error) {
    console.log(`❌ ${route} 錯誤: ${error.message}`);
  }
});

// 測試 3: 服務文件
const services = [
  './src/services/aiService.js',
  './src/services/alertService.js',
  './src/services/backupService.js',
  './src/services/batchOperationService.js',
  './src/services/dataExportService.js',
  './src/services/databaseOptimizer.js',
  './src/services/modelPersistenceService.js',
  './src/services/monitoringService.js',
  './src/services/notificationService.js',
  './src/services/shareVerificationService.js',
  './src/services/simulatedGradingService.js',
  './src/services/websocketService.js'
];

console.log('📋 服務文件測試:');
services.forEach(service => {
  try {
    const serviceModule = require(service);
    console.log(`✅ ${service} 正常`);
  } catch (error) {
    console.log(`❌ ${service} 錯誤: ${error.message}`);
  }
});

// 測試 4: 中間件
const middlewares = [
  './src/middleware/auth.js',
  './src/middleware/performance.js',
  './src/middleware/security.js'
];

console.log('📋 中間件測試:');
middlewares.forEach(middleware => {
  try {
    const middlewareModule = require(middleware);
    console.log(`✅ ${middleware} 正常`);
  } catch (error) {
    console.log(`❌ ${middleware} 錯誤: ${error.message}`);
  }
});

console.log('🎉 簡化測試完成！');
