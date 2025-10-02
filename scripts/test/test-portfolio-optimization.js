const path = require('path');

// Add後端Path到模組SearchPath
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const backendPath = path.join(__dirname, '..', 'backend');
require('module').globalPaths.push(backendPath);

const PortfolioOptimizationService = require('../backend/src/services/portfolioOptimizationService');

async function testPortfolioOptimization() {
  try {
    // InitializeService
    await PortfolioOptimizationService.initialize();
    // 生成TestData
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const numAssets = 5;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const numPeriods = 100;

    // 生成模擬價格Data
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const pricesMatrix = [];
    for (let i = 0; i < numAssets; i++) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const prices = [100 + Math.random() * 50]; // 初始價格
      for (let j = 1; j < numPeriods; j++) {
        const change = (Math.random() - 0.5) * 0.1; // -5% 到 +5% 的變化
        prices.push(prices[j - 1] * (1 + change));
      }
      pricesMatrix.push(prices);
    }

    // 計算收益率矩陣
    const returnsMatrix = pricesMatrix.map((prices) =>
      PortfolioOptimizationService.calculateReturns(prices)
    );

    // 1. 馬科維茨優化
    const markowitzResult =
      PortfolioOptimizationService.markowitzOptimization(returnsMatrix);
// eslint-disable-next-line no-console
    console.log(
      `📊 馬科維茨優化結果: 預期收益率 ${markowitzResult.expectedReturn.toFixed(2)}%`
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 馬科維茨優化結果: 風險 ${markowitzResult.risk.toFixed(2)}%`
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 馬科維茨優化結果: 夏普比率 ${markowitzResult.sharpeRatio.toFixed(2)}`
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 馬科維茨優化結果: 權重分配 [${markowitzResult.weights.map((w) => (w * 100).toFixed(1) + '%').join(', ')}]`
    );
    // 2. CAPM 優化
// eslint-disable-next-line no-console
    console.log('📊 CAPM 優化測試');
    const marketReturns = Array.from(
      { length: returnsMatrix[0].length },
      () => (Math.random() - 0.5) * 0.05
    );
    const capmResult = PortfolioOptimizationService.capmOptimization(
      returnsMatrix,
      marketReturns
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 CAPM 優化結果: 預期收益率 ${capmResult.expectedReturn.toFixed(2)}%`
    );
// eslint-disable-next-line no-console
    console.log(`📊 CAPM 優化結果: 風險 ${capmResult.risk.toFixed(2)}%`);
// eslint-disable-next-line no-console
    console.log(
      `📊 CAPM 優化結果: 夏普比率 ${capmResult.sharpeRatio.toFixed(2)}`
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 CAPM 優化結果: 權重分配 [${capmResult.weights.map((w) => (w * 100).toFixed(1) + '%').join(', ')}]`
    );
    // 3. VaR 計算
// eslint-disable-next-line no-console
    console.log('📊 VaR 計算...');
    const varResult = PortfolioOptimizationService.calculateVaR(
      returnsMatrix,
      markowitzResult.weights,
      0.95
    );
// eslint-disable-next-line no-console
    console.log(`📊 VaR 結果: ${(varResult.var * 100).toFixed(2)}%`);
// eslint-disable-next-line no-console
    console.log(
      `📊 VaR 置信區間: ${(varResult.confidenceInterval * 100).toFixed(0)}%`
    );

    // 4. CVaR 計算
// eslint-disable-next-line no-console
    console.log('📊 CVaR 計算...');
    const cvarResult = PortfolioOptimizationService.calculateCVaR(
      returnsMatrix,
      markowitzResult.weights,
      0.95
    );
// eslint-disable-next-line no-console
    console.log(`📊 CVaR 結果: ${(cvarResult.cvar * 100).toFixed(2)}%`);
// eslint-disable-next-line no-console
    console.log(
      `📊 CVaR 置信區間: ${(cvarResult.confidenceInterval * 100).toFixed(2)}%`
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 CVaR 風險度量: ${(cvarResult.riskMeasure * 100).toFixed(0)}%`
    );
    // 5. 壓力Test
    const scenarios = [
      {
        name: '市場崩盤',
        factors: [0.5, 0.3, 0.7, 0.4, 0.6], // 各Asset的壓力因子
      },
      {
        name: '經濟衰退',
        factors: [0.8, 0.6, 0.9, 0.7, 0.8],
      },
      {
        name: '通貨膨脹',
        factors: [1.2, 1.1, 1.3, 1.0, 1.2],
      },
    ];

    const stressTestResult = PortfolioOptimizationService.stressTest(
      returnsMatrix,
      markowitzResult.weights,
      scenarios
    );
    stressTestResult.forEach((result) => {
// eslint-disable-next-line no-console
      console.log(
        `📊 壓力測試 ${result.scenario}: 收益率=${(result.return * 100).toFixed(2)}%, 風險=${(result.risk * 100).toFixed(2)}%, 夏普比率=${result.sharpeRatio.toFixed(4)}`
      );
    });

    // 6. 有效前沿計算
    const efficientFrontier =
      PortfolioOptimizationService.calculateEfficientFrontier(
        returnsMatrix,
        20
      );
    // 找出最佳夏普比率的投資組合
    const bestSharpe = efficientFrontier.reduce((best, current) =>
      current.sharpeRatio > best.sharpeRatio ? current : best
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 最佳夏普比率投資組合: 夏普比率=${bestSharpe.sharpeRatio.toFixed(4)} (收益率: ${(bestSharpe.return * 100).toFixed(2)}%, 風險: ${(bestSharpe.risk * 100).toFixed(2)}%)`
    );

    // 7. 性能Test
    const startTime = Date.now();
    PortfolioOptimizationService.calculateEfficientFrontier(returnsMatrix, 100);
    const endTime = Date.now();
// eslint-disable-next-line no-console
    console.log(
      `⚡ 性能測試: 計算 100 個投資組合耗時 ${endTime - startTime}ms`
    );

    // 8. 比較不同Method
// eslint-disable-next-line no-console
    console.log(
      `📊 馬科維茨方法: 收益率=${(markowitzResult.expectedReturn * 100).toFixed(2)}%, 風險=${(markowitzResult.risk * 100).toFixed(2)}%, 夏普比率=${markowitzResult.sharpeRatio.toFixed(4)}`
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 CAPM 方法: 收益率=${(capmResult.expectedReturn * 100).toFixed(2)}%, 風險=${(capmResult.risk * 100).toFixed(2)}%, 夏普比率=${capmResult.sharpeRatio.toFixed(4)}`
    );
// eslint-disable-next-line no-console
    console.log(
      `📊 有效前沿最佳: 收益率=${(bestSharpe.return * 100).toFixed(2)}%, 風險=${(bestSharpe.risk * 100).toFixed(2)}%, 夏普比率=${bestSharpe.sharpeRatio.toFixed(4)}`
    );
    // 清理Resource
    PortfolioOptimizationService.dispose();
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('❌ 投資組合優化Service測試Failed:', error.message);
// eslint-disable-next-line no-console
    console.error('詳細Error:', error);
  }
}

// 運RowTest
testPortfolioOptimization();
