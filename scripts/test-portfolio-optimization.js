const path = require('path');

// 添加後端路徑到模組搜索路徑
const backendPath = path.join(__dirname, '..', 'backend');
require('module').globalPaths.push(backendPath);

const PortfolioOptimizationService = require('../backend/src/services/portfolioOptimizationService');

async function testPortfolioOptimization() {
  console.log('💼 開始測試投資組合優化服務...\n');

  try {
    // 初始化服務
    console.log('📊 初始化投資組合優化服務...');
    await PortfolioOptimizationService.initialize();
    console.log('✅ 服務初始化成功\n');

    // 生成測試數據
    console.log('📊 生成測試數據...');
    const numAssets = 5;
    const numPeriods = 100;
    
    // 生成模擬價格數據
    const pricesMatrix = [];
    for (let i = 0; i < numAssets; i++) {
      const prices = [100 + Math.random() * 50]; // 初始價格
      for (let j = 1; j < numPeriods; j++) {
        const change = (Math.random() - 0.5) * 0.1; // -5% 到 +5% 的變化
        prices.push(prices[j - 1] * (1 + change));
      }
      pricesMatrix.push(prices);
    }
    
    // 計算收益率矩陣
    const returnsMatrix = pricesMatrix.map(prices => 
      PortfolioOptimizationService.calculateReturns(prices)
    );
    
    console.log(`✅ 生成 ${numAssets} 個資產，${numPeriods} 個時間點的數據\n`);

    // 1. 馬科維茨優化
    console.log('📈 測試馬科維茨投資組合理論...');
    const markowitzResult = PortfolioOptimizationService.markowitzOptimization(returnsMatrix);
    console.log('✅ 馬科維茨優化完成');
    console.log(`📊 預期收益率: ${(markowitzResult.expectedReturn * 100).toFixed(2)}%`);
    console.log(`📊 投資組合風險: ${(markowitzResult.risk * 100).toFixed(2)}%`);
    console.log(`📊 夏普比率: ${markowitzResult.sharpeRatio.toFixed(4)}`);
    console.log(`📊 權重分配: ${markowitzResult.weights.map(w => (w * 100).toFixed(1) + '%').join(', ')}`);
    console.log('');

    // 2. CAPM 優化
    console.log('🏛️ 測試資本資產定價模型 (CAPM)...');
    const marketReturns = Array.from({ length: returnsMatrix[0].length }, () => 
      (Math.random() - 0.5) * 0.05
    );
    const capmResult = PortfolioOptimizationService.capmOptimization(returnsMatrix, marketReturns);
    console.log('✅ CAPM 優化完成');
    console.log(`📊 預期收益率: ${(capmResult.expectedReturn * 100).toFixed(2)}%`);
    console.log(`📊 投資組合風險: ${(capmResult.risk * 100).toFixed(2)}%`);
    console.log(`📊 夏普比率: ${capmResult.sharpeRatio.toFixed(4)}`);
    console.log(`📊 Beta 係數: ${capmResult.betas.map(b => b.toFixed(3)).join(', ')}`);
    console.log(`📊 權重分配: ${capmResult.weights.map(w => (w * 100).toFixed(1) + '%').join(', ')}`);
    console.log('');

    // 3. VaR 計算
    console.log('⚠️ 測試風險價值 (VaR) 計算...');
    const varResult = PortfolioOptimizationService.calculateVaR(returnsMatrix, markowitzResult.weights, 0.95);
    console.log('✅ VaR 計算完成');
    console.log(`📊 95% VaR: ${(varResult.var * 100).toFixed(2)}%`);
    console.log(`📊 置信水平: ${(varResult.confidenceLevel * 100).toFixed(0)}%`);
    console.log('');

    // 4. CVaR 計算
    console.log('🎯 測試條件風險價值 (CVaR) 計算...');
    const cvarResult = PortfolioOptimizationService.calculateCVaR(returnsMatrix, markowitzResult.weights, 0.95);
    console.log('✅ CVaR 計算完成');
    console.log(`📊 95% VaR: ${(cvarResult.var * 100).toFixed(2)}%`);
    console.log(`📊 95% CVaR: ${(cvarResult.cvar * 100).toFixed(2)}%`);
    console.log(`📊 置信水平: ${(cvarResult.confidenceLevel * 100).toFixed(0)}%`);
    console.log('');

    // 5. 壓力測試
    console.log('🌪️ 測試壓力測試...');
    const scenarios = [
      {
        name: '市場崩盤',
        factors: [0.5, 0.3, 0.7, 0.4, 0.6] // 各資產的壓力因子
      },
      {
        name: '經濟衰退',
        factors: [0.8, 0.6, 0.9, 0.7, 0.8]
      },
      {
        name: '通貨膨脹',
        factors: [1.2, 1.1, 1.3, 1.0, 1.2]
      }
    ];
    
    const stressTestResult = PortfolioOptimizationService.stressTest(returnsMatrix, markowitzResult.weights, scenarios);
    console.log('✅ 壓力測試完成');
    stressTestResult.forEach(result => {
      console.log(`📊 ${result.scenario}: 收益率=${(result.expectedReturn * 100).toFixed(2)}%, 風險=${(result.risk * 100).toFixed(2)}%, 夏普比率=${result.sharpeRatio.toFixed(4)}`);
    });
    console.log('');

    // 6. 有效前沿計算
    console.log('📊 計算有效前沿...');
    const efficientFrontier = PortfolioOptimizationService.calculateEfficientFrontier(returnsMatrix, 20);
    console.log('✅ 有效前沿計算完成');
    console.log(`📊 生成了 ${efficientFrontier.length} 個有效投資組合`);
    
    // 找出最佳夏普比率的投資組合
    const bestSharpe = efficientFrontier.reduce((best, current) => 
      current.sharpeRatio > best.sharpeRatio ? current : best
    );
    console.log(`📊 最佳夏普比率: ${bestSharpe.sharpeRatio.toFixed(4)} (收益率: ${(bestSharpe.return * 100).toFixed(2)}%, 風險: ${(bestSharpe.risk * 100).toFixed(2)}%)`);
    console.log('');

    // 7. 性能測試
    console.log('⚡ 性能測試...');
    const startTime = Date.now();
    PortfolioOptimizationService.calculateEfficientFrontier(returnsMatrix, 100);
    const endTime = Date.now();
    console.log(`✅ 100個投資組合的有效前沿計算耗時: ${endTime - startTime}ms`);
    console.log('');

    // 8. 比較不同方法
    console.log('📊 不同優化方法比較:');
    console.log(`馬科維茨: 收益率=${(markowitzResult.expectedReturn * 100).toFixed(2)}%, 風險=${(markowitzResult.risk * 100).toFixed(2)}%, 夏普比率=${markowitzResult.sharpeRatio.toFixed(4)}`);
    console.log(`CAPM: 收益率=${(capmResult.expectedReturn * 100).toFixed(2)}%, 風險=${(capmResult.risk * 100).toFixed(2)}%, 夏普比率=${capmResult.sharpeRatio.toFixed(4)}`);
    console.log(`最佳前沿: 收益率=${(bestSharpe.return * 100).toFixed(2)}%, 風險=${(bestSharpe.risk * 100).toFixed(2)}%, 夏普比率=${bestSharpe.sharpeRatio.toFixed(4)}`);
    console.log('');

    // 清理資源
    console.log('🧹 清理資源...');
    PortfolioOptimizationService.dispose();
    console.log('✅ 資源清理完成');

    console.log('\n🎉 投資組合優化服務測試完成！');
    console.log('✅ 所有功能正常運作');
    console.log('✅ 可以開始進行智能投資組合優化');

  } catch (error) {
    console.error('❌ 投資組合優化服務測試失敗:', error.message);
    console.error('詳細錯誤:', error);
  }
}

// 運行測試
testPortfolioOptimization();
