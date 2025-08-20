const logger = require('../utils/logger');

class PortfolioOptimizationService {
  constructor() {
    this.isInitialized = false;
    this.riskFreeRate = 0.02; // 2% 無風險利率
    this.optimizationMethods = {
      MARKOWITZ: 'markowitz',
      CAPM: 'capm',
      BLACK_LITTERMAN: 'black_litterman'
    };
  }

  /**
   * 初始化投資組合優化服務
   */
  async initialize() {
    try {
      logger.info('初始化投資組合優化服務...');
      this.isInitialized = true;
      logger.info('投資組合優化服務初始化完成');
      return true;
    } catch (error) {
      logger.error('投資組合優化服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 計算收益率
   */
  calculateReturns(prices) {
    try {
      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        const returnRate = (prices[i] - prices[i - 1]) / prices[i - 1];
        returns.push(returnRate);
      }
      return returns;
    } catch (error) {
      logger.error('收益率計算失敗:', error);
      throw error;
    }
  }

  /**
   * 計算協方差矩陣
   */
  calculateCovarianceMatrix(returnsMatrix) {
    try {
      const n = returnsMatrix.length;
      const covarianceMatrix = [];
      
      for (let i = 0; i < n; i++) {
        covarianceMatrix[i] = [];
        for (let j = 0; j < n; j++) {
          covarianceMatrix[i][j] = this.calculateCovariance(returnsMatrix[i], returnsMatrix[j]);
        }
      }
      
      return covarianceMatrix;
    } catch (error) {
      logger.error('協方差矩陣計算失敗:', error);
      throw error;
    }
  }

  /**
   * 計算預期收益率
   */
  calculateExpectedReturns(returnsMatrix) {
    try {
      return returnsMatrix.map(returns => 
        returns.reduce((sum, ret) => sum + ret, 0) / returns.length
      );
    } catch (error) {
      logger.error('預期收益率計算失敗:', error);
      throw error;
    }
  }

  /**
   * 馬科維茨投資組合理論
   */
  markowitzOptimization(returnsMatrix, targetReturn = null, riskTolerance = 0.5) {
    try {
      const expectedReturns = this.calculateExpectedReturns(returnsMatrix);
      const covarianceMatrix = this.calculateCovarianceMatrix(returnsMatrix);
      const n = expectedReturns.length;

      // 簡化的馬科維茨優化
      const weights = this.solveMarkowitzOptimization(
        expectedReturns,
        covarianceMatrix,
        targetReturn,
        riskTolerance
      );

      const portfolioReturn = this.calculatePortfolioReturn(expectedReturns, weights);
      const portfolioRisk = this.calculatePortfolioRisk(covarianceMatrix, weights);
      const sharpeRatio = (portfolioReturn - this.riskFreeRate) / portfolioRisk;

      return {
        weights,
        expectedReturn: portfolioReturn,
        risk: portfolioRisk,
        sharpeRatio,
        method: this.optimizationMethods.MARKOWITZ
      };
    } catch (error) {
      logger.error('馬科維茨優化失敗:', error);
      throw error;
    }
  }

  /**
   * 解決馬科維茨優化問題
   */
  solveMarkowitzOptimization(expectedReturns, covarianceMatrix, targetReturn, riskTolerance) {
    try {
      const n = expectedReturns.length;
      
      // 簡化的權重分配（基於風險容忍度）
      const weights = new Array(n).fill(1 / n);
      
      if (targetReturn) {
        // 如果有目標收益率，調整權重
        const currentReturn = this.calculatePortfolioReturn(expectedReturns, weights);
        const adjustment = (targetReturn - currentReturn) / currentReturn;
        
        for (let i = 0; i < n; i++) {
          weights[i] *= (1 + adjustment * riskTolerance);
        }
      }
      
      // 正規化權重
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      return weights.map(weight => weight / totalWeight);
    } catch (error) {
      logger.error('馬科維茨優化求解失敗:', error);
      throw error;
    }
  }

  /**
   * 計算投資組合收益率
   */
  calculatePortfolioReturn(expectedReturns, weights) {
    try {
      let portfolioReturn = 0;
      for (let i = 0; i < expectedReturns.length; i++) {
        portfolioReturn += expectedReturns[i] * weights[i];
      }
      return portfolioReturn;
    } catch (error) {
      logger.error('投資組合收益率計算失敗:', error);
      throw error;
    }
  }

  /**
   * 計算投資組合風險
   */
  calculatePortfolioRisk(covarianceMatrix, weights) {
    try {
      let risk = 0;
      const n = weights.length;
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          risk += weights[i] * weights[j] * covarianceMatrix[i][j];
        }
      }
      
      return Math.sqrt(risk);
    } catch (error) {
      logger.error('投資組合風險計算失敗:', error);
      throw error;
    }
  }

  /**
   * 資本資產定價模型 (CAPM)
   */
  capmOptimization(returnsMatrix, marketReturns) {
    try {
      const expectedReturns = this.calculateExpectedReturns(returnsMatrix);
      const betas = this.calculateBetas(returnsMatrix, marketReturns);
      
      // CAPM 公式: E(Ri) = Rf + βi(E(Rm) - Rf)
      const marketReturn = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length;
      const capmReturns = betas.map(beta => this.riskFreeRate + beta * (marketReturn - this.riskFreeRate));
      
      // 基於 CAPM 的權重分配
      const weights = this.allocateWeightsByCAPM(capmReturns, betas);
      
      const covarianceMatrix = this.calculateCovarianceMatrix(returnsMatrix);
      const portfolioReturn = this.calculatePortfolioReturn(expectedReturns, weights);
      const portfolioRisk = this.calculatePortfolioRisk(covarianceMatrix, weights);
      const sharpeRatio = (portfolioReturn - this.riskFreeRate) / portfolioRisk;

      return {
        weights,
        expectedReturn: portfolioReturn,
        risk: portfolioRisk,
        sharpeRatio,
        betas,
        capmReturns,
        method: this.optimizationMethods.CAPM
      };
    } catch (error) {
      logger.error('CAPM 優化失敗:', error);
      throw error;
    }
  }

  /**
   * 計算 Beta 係數
   */
  calculateBetas(returnsMatrix, marketReturns) {
    try {
      const betas = [];
      
      for (let i = 0; i < returnsMatrix.length; i++) {
        const assetReturns = returnsMatrix[i];
        const covariance = this.calculateCovariance(assetReturns, marketReturns);
        const marketVariance = this.calculateVariance(marketReturns);
        const beta = covariance / marketVariance;
        betas.push(beta);
      }
      
      return betas;
    } catch (error) {
      logger.error('Beta 係數計算失敗:', error);
      throw error;
    }
  }

  /**
   * 計算協方差
   */
  calculateCovariance(x, y) {
    try {
      const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
      const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
      
      let covariance = 0;
      for (let i = 0; i < x.length; i++) {
        covariance += (x[i] - meanX) * (y[i] - meanY);
      }
      
      return covariance / (x.length - 1);
    } catch (error) {
      logger.error('協方差計算失敗:', error);
      throw error;
    }
  }

  /**
   * 計算方差
   */
  calculateVariance(data) {
    try {
      const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
      return variance;
    } catch (error) {
      logger.error('方差計算失敗:', error);
      throw error;
    }
  }

  /**
   * 基於 CAPM 的權重分配
   */
  allocateWeightsByCAPM(capmReturns, betas) {
    try {
      const n = capmReturns.length;
      const weights = new Array(n).fill(0);
      
      // 基於 CAPM 收益率的權重分配
      const totalReturn = capmReturns.reduce((sum, ret) => sum + ret, 0);
      
      for (let i = 0; i < n; i++) {
        weights[i] = capmReturns[i] / totalReturn;
      }
      
      // 正規化權重
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      return weights.map(weight => weight / totalWeight);
    } catch (error) {
      logger.error('CAPM 權重分配失敗:', error);
      throw error;
    }
  }

  /**
   * 風險價值 (VaR) 計算
   */
  calculateVaR(returnsMatrix, weights, confidenceLevel = 0.95) {
    try {
      const portfolioReturns = this.calculatePortfolioReturns(returnsMatrix, weights);
      const sortedReturns = portfolioReturns.sort((a, b) => a - b);
      const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
      
      return {
        var: sortedReturns[varIndex],
        confidenceLevel,
        portfolioReturns
      };
    } catch (error) {
      logger.error('VaR 計算失敗:', error);
      throw error;
    }
  }

  /**
   * 計算投資組合歷史收益率
   */
  calculatePortfolioReturns(returnsMatrix, weights) {
    try {
      const portfolioReturns = [];
      const n = returnsMatrix[0].length;
      
      for (let t = 0; t < n; t++) {
        let portfolioReturn = 0;
        for (let i = 0; i < returnsMatrix.length; i++) {
          portfolioReturn += returnsMatrix[i][t] * weights[i];
        }
        portfolioReturns.push(portfolioReturn);
      }
      
      return portfolioReturns;
    } catch (error) {
      logger.error('投資組合歷史收益率計算失敗:', error);
      throw error;
    }
  }

  /**
   * 條件風險價值 (CVaR) 計算
   */
  calculateCVaR(returnsMatrix, weights, confidenceLevel = 0.95) {
    try {
      const portfolioReturns = this.calculatePortfolioReturns(returnsMatrix, weights);
      const sortedReturns = portfolioReturns.sort((a, b) => a - b);
      const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
      
      // 計算 VaR 以下的平均損失
      let cvar = 0;
      for (let i = 0; i <= varIndex; i++) {
        cvar += sortedReturns[i];
      }
      cvar /= (varIndex + 1);
      
      return {
        cvar,
        var: sortedReturns[varIndex],
        confidenceLevel
      };
    } catch (error) {
      logger.error('CVaR 計算失敗:', error);
      throw error;
    }
  }

  /**
   * 壓力測試
   */
  stressTest(returnsMatrix, weights, scenarios) {
    try {
      const results = [];
      
      for (const scenario of scenarios) {
        const stressedReturns = this.applyStressScenario(returnsMatrix, scenario);
        const portfolioReturn = this.calculatePortfolioReturn(
          this.calculateExpectedReturns(stressedReturns),
          weights
        );
        const portfolioRisk = this.calculatePortfolioRisk(
          this.calculateCovarianceMatrix(stressedReturns),
          weights
        );
        
        results.push({
          scenario: scenario.name,
          expectedReturn: portfolioReturn,
          risk: portfolioRisk,
          sharpeRatio: (portfolioReturn - this.riskFreeRate) / portfolioRisk
        });
      }
      
      return results;
    } catch (error) {
      logger.error('壓力測試失敗:', error);
      throw error;
    }
  }

  /**
   * 應用壓力情景
   */
  applyStressScenario(returnsMatrix, scenario) {
    try {
      const stressedReturns = returnsMatrix.map((assetReturns, assetIndex) => {
        const stressFactor = scenario.factors[assetIndex] || 1;
        return assetReturns.map(return_ => return_ * stressFactor);
      });
      
      return stressedReturns;
    } catch (error) {
      logger.error('壓力情景應用失敗:', error);
      throw error;
    }
  }

  /**
   * 有效前沿計算
   */
  calculateEfficientFrontier(returnsMatrix, numPortfolios = 100) {
    try {
      const efficientFrontier = [];
      const expectedReturns = this.calculateExpectedReturns(returnsMatrix);
      const covarianceMatrix = this.calculateCovarianceMatrix(returnsMatrix);
      
      const minReturn = Math.min(...expectedReturns);
      const maxReturn = Math.max(...expectedReturns);
      
      for (let i = 0; i < numPortfolios; i++) {
        const targetReturn = minReturn + (maxReturn - minReturn) * i / (numPortfolios - 1);
        
        try {
          const optimization = this.markowitzOptimization(returnsMatrix, targetReturn);
          efficientFrontier.push({
            return: optimization.expectedReturn,
            risk: optimization.risk,
            sharpeRatio: optimization.sharpeRatio,
            weights: optimization.weights
          });
        } catch (error) {
          // 跳過無法優化的點
          continue;
        }
      }
      
      return efficientFrontier;
    } catch (error) {
      logger.error('有效前沿計算失敗:', error);
      throw error;
    }
  }

  /**
   * 清理資源
   */
  dispose() {
    try {
      logger.info('投資組合優化服務資源已清理');
    } catch (error) {
      logger.error('資源清理失敗:', error);
    }
  }
}

module.exports = new PortfolioOptimizationService();
