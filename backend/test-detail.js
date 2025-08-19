// 詳細測試
console.log('🔍 開始詳細測試...');

// 測試 1: 檢查 getCardModel 函數
try {
  const getCardModel = require('./src/models/Card');
  console.log('✅ getCardModel 函數正常');

  // 測試函數調用
  const Card = getCardModel();
  console.log('✅ getCardModel() 調用正常');
} catch (error) {
  console.log('❌ getCardModel 錯誤:', error.message);
}

// 測試 2: 檢查反饋服務
try {
  console.log('📋 測試反饋服務...');
  const feedbackService = require('./src/services/feedbackService');
  console.log('✅ 反饋服務正常');
} catch (error) {
  console.log('❌ 反饋服務錯誤:', error.message);
  console.log('錯誤堆疊:', error.stack);
}

// 測試 3: 檢查監控服務
try {
  console.log('📋 測試監控服務...');
  const monitoringService = require('./src/services/monitoringService');
  console.log('✅ 監控服務正常');
} catch (error) {
  console.log('❌ 監控服務錯誤:', error.message);
  console.log('錯誤堆疊:', error.stack);
}

// 測試 4: 檢查模擬評級路由
try {
  console.log('📋 測試模擬評級路由...');
  const simulatedGradingRoutes = require('./src/routes/simulatedGrading');
  console.log('✅ 模擬評級路由正常');
} catch (error) {
  console.log('❌ 模擬評級路由錯誤:', error.message);
  console.log('錯誤堆疊:', error.stack);
}

// 測試 5: 檢查警報路由
try {
  console.log('📋 測試警報路由...');
  const alertRoutes = require('./src/routes/alerts');
  console.log('✅ 警報路由正常');
} catch (error) {
  console.log('❌ 警報路由錯誤:', error.message);
  console.log('錯誤堆疊:', error.stack);
}

console.log('🎉 詳細測試完成！');
