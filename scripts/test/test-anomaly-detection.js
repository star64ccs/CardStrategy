const path = require('path');

// Add後端Path到模組SearchPath
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const backendPath = path.join(__dirname, '..', 'backend');
require('module').globalPaths.push(backendPath);

const AnomalyDetectionService = require('../backend/src/services/anomalyDetectionService');

async function testAnomalyDetection() {
  try {
    // InitializeService
    await AnomalyDetectionService.initialize();
    // 生成TestData（Package含一些異常Value）
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const normalData = Array.from(
      { length: 90 },
      (_, i) => 100 + Math.random() * 10
    );
    const anomalyData = [50, 200, 45, 250, 35]; // 明顯的異常Value
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const testData = [...normalData, ...anomalyData];
    // 1. Statistics異常檢測
    const statisticalResult =
      AnomalyDetectionService.statisticalAnomalyDetection(testData, 2);
// eslint-disable-next-line no-console
    console.log(
      `📊 統計異常檢測結果: 檢測到 ${statisticalResult.anomalies.length} 個異常值, 標準差=${statisticalResult.statistics.stdDev.toFixed(2)}`
    );

    // 2. 隔離森林異常檢測
    const isolationResult =
      AnomalyDetectionService.isolationForestAnomalyDetection(testData, 0.1);
// eslint-disable-next-line no-console
    console.log(
      `🌲 隔離森林異常檢測結果: 檢測到 ${isolationResult.anomalies.length} 個異常值`
    );

    // 3. DBSCAN 異常檢測
    const dbscanResult = AnomalyDetectionService.dbscanAnomalyDetection(
      testData,
      0.5,
      3
    );
// eslint-disable-next-line no-console
    console.log(
      `🔍 DBSCAN 異常檢測結果: 檢測到 ${dbscanResult.anomalies.length} 個異常值, 聚類數=${dbscanResult.clusters.size}`
    );

    // 4. 自Encode器異常檢測
    const autoencoderResult =
      AnomalyDetectionService.autoencoderAnomalyDetection(testData, 2);
// eslint-disable-next-line no-console
    console.log(
      `🤖 自編碼器異常檢測結果: 檢測到 ${autoencoderResult.anomalies.length} 個異常值`
    );

    // 5. 綜合異常檢測
    const comprehensiveResult =
      AnomalyDetectionService.comprehensiveAnomalyDetection(testData, {
        statisticalThreshold: 2,
        contamination: 0.1,
        eps: 0.5,
        minPts: 3,
        encodingDim: 2,
        comprehensiveThreshold: 2,
      });

    // Show詳細結果
// eslint-disable-next-line no-console
    console.log(
      `📈 綜合異常檢測結果: 檢測到 ${comprehensiveResult.anomalies.length} 個異常值`
    );
// eslint-disable-next-line no-console
    console.log(
      `異常值索引: [${comprehensiveResult.anomalies.map((a) => a.index).join(', ')}]`
    );
// eslint-disable-next-line no-console
    console.log(
      `異常值: [${comprehensiveResult.anomalies.map((a) => a.value).join(', ')}]`
    );
// eslint-disable-next-line no-console
    console.log(
      `異常分數: [${comprehensiveResult.anomalies.map((a) => a.score).join(', ')}]`
    );
// eslint-disable-next-line no-console
    console.log(
      `檢測方法: [${comprehensiveResult.anomalies.map((a) => a.method).join(', ')}]`
    );

    // 6. Dynamic閾Value調整Test
    const currentThreshold = 2;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const newThreshold = AnomalyDetectionService.adjustThreshold(
      testData,
      currentThreshold,
      0.1
    );
// eslint-disable-next-line no-console
    console.log(`⚙️ 動態閾值調整: ${currentThreshold} -> ${newThreshold}`);

    // 7. 性能Test
    const startTime = Date.now();
    const performanceData = Array.from(
      { length: 1000 },
      (_, i) => 100 + Math.random() * 10
    );
    AnomalyDetectionService.comprehensiveAnomalyDetection(performanceData);
    const endTime = Date.now();
// eslint-disable-next-line no-console
    console.log(`⚡ 性能測試: 處理 1000 個數據點耗時 ${endTime - startTime}ms`);

    // 清理Resource
    AnomalyDetectionService.dispose();
// eslint-disable-next-line no-console
    console.log('✅ 異常檢測Service測試完成');
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('❌ 異常檢測Service測試Failed:', error.message);
// eslint-disable-next-line no-console
    console.error('詳細Error:', error);
  }
}

// 運RowTest
testAnomalyDetection();
