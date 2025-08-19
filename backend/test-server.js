// 服務器啟動測試
require('dotenv').config();

console.log('🚀 開始服務器啟動測試...');

// 設置測試環境
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.TZ = 'UTC';

// 測試 1: 檢查環境變量
console.log('📋 環境變量:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- TZ:', process.env.TZ);

// 測試 2: 檢查核心模塊
try {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const compression = require('compression');

  console.log('✅ 核心依賴加載成功');
} catch (error) {
  console.log('❌ 核心依賴加載失敗:', error.message);
}

// 測試 3: 檢查配置文件
try {
  const logger = require('./src/utils/logger');
  console.log('✅ 日誌模塊加載成功');
} catch (error) {
  console.log('❌ 日誌模塊加載失敗:', error.message);
}

// 測試 4: 檢查路由文件
const routes = [
  './src/routes/auth.js',
  './src/routes/cards.js',
  './src/routes/market.js',
  './src/routes/simulatedGrading.js',
  './src/routes/ai.js',
  './src/routes/deepLearning.js',
  './src/routes/performance.js',
  './src/routes/batch.js',
  './src/routes/dataExport.js',
  './src/routes/alerts.js',
  './src/routes/feedback.js'
];

console.log('📋 路由文件檢查:');
routes.forEach(route => {
  try {
    require(route);
    console.log(`✅ ${route} 加載成功`);
  } catch (error) {
    console.log(`❌ ${route} 加載失敗:`, error.message);
  }
});

// 測試 5: 檢查服務文件
const services = [
  './src/services/aiService.js',
  './src/services/alertService.js',
  './src/services/backupService.js',
  './src/services/batchOperationService.js',
  './src/services/dataExportService.js',
  './src/services/databaseOptimizer.js',
  './src/services/deepLearningService.js',
  './src/services/modelPersistenceService.js',
  './src/services/monitoringService.js',
  './src/services/notificationService.js',
  './src/services/shareVerificationService.js',
  './src/services/simulatedGradingService.js',
  './src/services/websocketService.js'
];

console.log('📋 服務文件檢查:');
services.forEach(service => {
  try {
    require(service);
    console.log(`✅ ${service} 加載成功`);
  } catch (error) {
    console.log(`❌ ${service} 加載失敗:`, error.message);
  }
});

// 測試 6: 檢查中間件
const middlewares = [
  './src/middleware/auth.js',
  './src/middleware/performance.js',
  './src/middleware/security.js'
];

console.log('📋 中間件檢查:');
middlewares.forEach(middleware => {
  try {
    require(middleware);
    console.log(`✅ ${middleware} 加載成功`);
  } catch (error) {
    console.log(`❌ ${middleware} 加載失敗:`, error.message);
  }
});

console.log('🎉 服務器啟動測試完成！');
