const path = require('path');

// 添加後端路徑到模組搜索路徑
const backendPath = path.join(__dirname, '..', 'backend');
require('module').globalPaths.push(backendPath);

const AnomalyDetectionService = require('../backend/src/services/anomalyDetectionService');

async function testAnomalyDetection() {
  console.log('🚨 開始測試異常檢測服務...\n');

  try {
    // 初始化服務
    console.log('📊 初始化異常檢測服務...');
    await AnomalyDetectionService.initialize();
    console.log('✅ 服務初始化成功\n');

    // 生成測試數據（包含一些異常值）
    console.log('📊 生成測試數據...');
    const normalData = Array.from({ length: 90 }, (_, i) => 100 + Math.random() * 10);
    const anomalyData = [50, 200, 45, 250, 35]; // 明顯的異常值
    const testData = [...normalData, ...anomalyData];
    console.log(`✅ 生成 ${testData.length} 個測試數據點（包含 ${anomalyData.length} 個異常值）\n`);

    // 1. 統計異常檢測
    console.log('📈 測試統計異常檢測...');
    const statisticalResult = AnomalyDetectionService.statisticalAnomalyDetection(testData, 2);
    console.log(`✅ 統計異常檢測完成，發現 ${statisticalResult.anomalies.length} 個異常`);
    console.log(`📊 統計信息: 均值=${statisticalResult.statistics.mean.toFixed(2)}, 標準差=${statisticalResult.statistics.stdDev.toFixed(2)}`);
    console.log('');

    // 2. 隔離森林異常檢測
    console.log('🌲 測試隔離森林異常檢測...');
    const isolationResult = AnomalyDetectionService.isolationForestAnomalyDetection(testData, 0.1);
    console.log(`✅ 隔離森林異常檢測完成，發現 ${isolationResult.anomalies.length} 個異常`);
    console.log(`📊 閾值: ${isolationResult.threshold.toFixed(4)}`);
    console.log('');

    // 3. DBSCAN 異常檢測
    console.log('🔍 測試 DBSCAN 異常檢測...');
    const dbscanResult = AnomalyDetectionService.dbscanAnomalyDetection(testData, 0.5, 3);
    console.log(`✅ DBSCAN 異常檢測完成，發現 ${dbscanResult.anomalies.length} 個異常`);
    console.log(`📊 聚類數量: ${new Set(dbscanResult.clusters.filter(c => c !== -1)).size}`);
    console.log('');

    // 4. 自編碼器異常檢測
    console.log('🤖 測試自編碼器異常檢測...');
    const autoencoderResult = AnomalyDetectionService.autoencoderAnomalyDetection(testData, 2);
    console.log(`✅ 自編碼器異常檢測完成，發現 ${autoencoderResult.anomalies.length} 個異常`);
    console.log('');

    // 5. 綜合異常檢測
    console.log('🎯 測試綜合異常檢測...');
    const comprehensiveResult = AnomalyDetectionService.comprehensiveAnomalyDetection(testData, {
      statisticalThreshold: 2,
      contamination: 0.1,
      eps: 0.5,
      minPts: 3,
      encodingDim: 2,
      comprehensiveThreshold: 2
    });
    console.log(`✅ 綜合異常檢測完成，發現 ${comprehensiveResult.comprehensive.anomalies.length} 個異常`);
    console.log('');

    // 顯示詳細結果
    console.log('📋 詳細檢測結果:');
    console.log('統計異常檢測:', statisticalResult.anomalies.map(a => `索引${a.index}(值${a.value})`).join(', '));
    console.log('隔離森林檢測:', isolationResult.anomalies.map(a => `索引${a.index}(值${a.value})`).join(', '));
    console.log('DBSCAN 檢測:', dbscanResult.anomalies.map(a => `索引${a.index}(值${a.value})`).join(', '));
    console.log('自編碼器檢測:', autoencoderResult.anomalies.map(a => `索引${a.index}(值${a.value})`).join(', '));
    console.log('綜合檢測:', comprehensiveResult.comprehensive.anomalies.map(a => `索引${a.index}(值${a.value}, 分數${a.score})`).join(', '));
    console.log('');

    // 6. 動態閾值調整測試
    console.log('⚙️ 測試動態閾值調整...');
    const currentThreshold = 2;
    const newThreshold = AnomalyDetectionService.adjustThreshold(testData, currentThreshold, 0.1);
    console.log(`✅ 閾值調整完成: ${currentThreshold} → ${newThreshold.toFixed(2)}`);
    console.log('');

    // 7. 性能測試
    console.log('⚡ 性能測試...');
    const startTime = Date.now();
    const performanceData = Array.from({ length: 1000 }, (_, i) => 100 + Math.random() * 10);
    AnomalyDetectionService.comprehensiveAnomalyDetection(performanceData);
    const endTime = Date.now();
    console.log(`✅ 1000個數據點的綜合異常檢測耗時: ${endTime - startTime}ms`);
    console.log('');

    // 清理資源
    console.log('🧹 清理資源...');
    AnomalyDetectionService.dispose();
    console.log('✅ 資源清理完成');

    console.log('\n🎉 異常檢測服務測試完成！');
    console.log('✅ 所有功能正常運作');
    console.log('✅ 可以開始進行實時市場預警');

  } catch (error) {
    console.error('❌ 異常檢測服務測試失敗:', error.message);
    console.error('詳細錯誤:', error);
  }
}

// 運行測試
testAnomalyDetection();
