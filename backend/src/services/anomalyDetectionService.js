const Matrix = require('ml-matrix');
const logger = require('../utils/logger');

class AnomalyDetectionService {
  constructor() {
    this.isInitialized = false;
    this.models = new Map();
    this.thresholds = new Map();
  }

  /**
   * 初始化異常檢測服務
   */
  async initialize() {
    try {
      logger.info('初始化異常檢測服務...');
      this.isInitialized = true;
      logger.info('異常檢測服務初始化完成');
      return true;
    } catch (error) {
      logger.error('異常檢測服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 統計異常檢測
   */
  statisticalAnomalyDetection(data, threshold = 2) {
    try {
      const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance);

      const anomalies = data.map((value, index) => {
        const zScore = Math.abs((value - mean) / stdDev);
        return {
          index,
          value,
          zScore,
          isAnomaly: zScore > threshold
        };
      });

      return {
        anomalies: anomalies.filter(a => a.isAnomaly),
        statistics: { mean, stdDev, threshold },
        allData: anomalies
      };
    } catch (error) {
      logger.error('統計異常檢測失敗:', error);
      throw error;
    }
  }

  /**
   * 隔離森林異常檢測
   */
  isolationForestAnomalyDetection(data, contamination = 0.1, nEstimators = 100) {
    try {
      const anomalies = [];
      const scores = [];

      // 簡化的隔離森林實現
      for (let i = 0; i < data.length; i++) {
        const score = this.calculateIsolationScore(data, i, nEstimators);
        scores.push(score);
        
        if (score > this.getIsolationThreshold(contamination, scores)) {
          anomalies.push({
            index: i,
            value: data[i],
            score,
            isAnomaly: true
          });
        }
      }

      return {
        anomalies,
        scores,
        threshold: this.getIsolationThreshold(contamination, scores)
      };
    } catch (error) {
      logger.error('隔離森林異常檢測失敗:', error);
      throw error;
    }
  }

  /**
   * 計算隔離分數
   */
  calculateIsolationScore(data, index, nEstimators) {
    let totalScore = 0;
    
    for (let i = 0; i < nEstimators; i++) {
      const pathLength = this.getPathLength(data, index);
      totalScore += pathLength;
    }
    
    return totalScore / nEstimators;
  }

  /**
   * 獲取路徑長度
   */
  getPathLength(data, index) {
    // 簡化的路徑長度計算
    const value = data[index];
    let pathLength = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (i !== index) {
        const distance = Math.abs(value - data[i]);
        pathLength += Math.log(distance + 1);
      }
    }
    
    return pathLength / (data.length - 1);
  }

  /**
   * 獲取隔離閾值
   */
  getIsolationThreshold(contamination, scores) {
    const sortedScores = [...scores].sort((a, b) => b - a);
    const thresholdIndex = Math.floor(contamination * scores.length);
    return sortedScores[thresholdIndex] || Math.max(...scores);
  }

  /**
   * DBSCAN 聚類異常檢測
   */
  dbscanAnomalyDetection(data, eps = 0.5, minPts = 3) {
    try {
      const clusters = this.dbscan(data, eps, minPts);
      const anomalies = [];

      // 找出噪聲點（異常點）
      for (let i = 0; i < clusters.length; i++) {
        if (clusters[i] === -1) {
          anomalies.push({
            index: i,
            value: data[i],
            cluster: -1,
            isAnomaly: true
          });
        }
      }

      return {
        anomalies,
        clusters,
        parameters: { eps, minPts }
      };
    } catch (error) {
      logger.error('DBSCAN 異常檢測失敗:', error);
      throw error;
    }
  }

  /**
   * DBSCAN 聚類算法
   */
  dbscan(data, eps, minPts) {
    const clusters = new Array(data.length).fill(-1);
    let clusterId = 0;

    for (let i = 0; i < data.length; i++) {
      if (clusters[i] !== -1) continue;

      const neighbors = this.getNeighbors(data, i, eps);
      
      if (neighbors.length < minPts) {
        clusters[i] = -1; // 噪聲點
      } else {
        this.expandCluster(data, clusters, i, neighbors, clusterId, eps, minPts);
        clusterId++;
      }
    }

    return clusters;
  }

  /**
   * 獲取鄰居點
   */
  getNeighbors(data, pointIndex, eps) {
    const neighbors = [];
    const point = data[pointIndex];

    for (let i = 0; i < data.length; i++) {
      if (i !== pointIndex) {
        const distance = Math.abs(point - data[i]);
        if (distance <= eps) {
          neighbors.push(i);
        }
      }
    }

    return neighbors;
  }

  /**
   * 擴展聚類
   */
  expandCluster(data, clusters, pointIndex, neighbors, clusterId, eps, minPts) {
    clusters[pointIndex] = clusterId;

    for (let i = 0; i < neighbors.length; i++) {
      const neighborIndex = neighbors[i];
      
      if (clusters[neighborIndex] === -1) {
        clusters[neighborIndex] = clusterId;
        
        const newNeighbors = this.getNeighbors(data, neighborIndex, eps);
        if (newNeighbors.length >= minPts) {
          neighbors.push(...newNeighbors);
        }
      }
    }
  }

  /**
   * 自編碼器異常檢測
   */
  autoencoderAnomalyDetection(data, encodingDim = 2) {
    try {
      // 簡化的自編碼器實現
      const encoded = this.encode(data, encodingDim);
      const decoded = this.decode(encoded, data.length);
      
      const reconstructionErrors = data.map((original, index) => {
        const reconstructed = decoded[index];
        const error = Math.abs(original - reconstructed);
        return {
          index,
          original,
          reconstructed,
          error,
          isAnomaly: error > this.getAutoencoderThreshold(data, decoded)
        };
      });

      const anomalies = reconstructionErrors.filter(item => item.isAnomaly);

      return {
        anomalies,
        reconstructionErrors,
        encoded,
        decoded
      };
    } catch (error) {
      logger.error('自編碼器異常檢測失敗:', error);
      throw error;
    }
  }

  /**
   * 編碼函數
   */
  encode(data, encodingDim) {
    // 簡化的編碼實現
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.map(value => (value - mean) / encodingDim);
  }

  /**
   * 解碼函數
   */
  decode(encoded, originalLength) {
    // 簡化的解碼實現
    const mean = encoded.reduce((sum, val) => sum + val, 0) / encoded.length;
    return encoded.map(value => value + mean);
  }

  /**
   * 獲取自編碼器閾值
   */
  getAutoencoderThreshold(original, reconstructed) {
    const errors = original.map((orig, index) => Math.abs(orig - reconstructed[index]));
    const meanError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const stdError = Math.sqrt(errors.reduce((sum, error) => sum + Math.pow(error - meanError, 2), 0) / errors.length);
    
    return meanError + 2 * stdError; // 2個標準差
  }

  /**
   * 綜合異常檢測
   */
  comprehensiveAnomalyDetection(data, options = {}) {
    try {
      const results = {
        statistical: this.statisticalAnomalyDetection(data, options.statisticalThreshold || 2),
        isolationForest: this.isolationForestAnomalyDetection(data, options.contamination || 0.1),
        dbscan: this.dbscanAnomalyDetection(data, options.eps || 0.5, options.minPts || 3),
        autoencoder: this.autoencoderAnomalyDetection(data, options.encodingDim || 2)
      };

      // 綜合評分
      const anomalyScores = new Array(data.length).fill(0);
      
      // 統計異常檢測評分
      results.statistical.allData.forEach(item => {
        if (item.isAnomaly) anomalyScores[item.index] += 1;
      });

      // 隔離森林評分
      results.isolationForest.anomalies.forEach(item => {
        anomalyScores[item.index] += 1;
      });

      // DBSCAN 評分
      results.dbscan.anomalies.forEach(item => {
        anomalyScores[item.index] += 1;
      });

      // 自編碼器評分
      results.autoencoder.anomalies.forEach(item => {
        anomalyScores[item.index] += 1;
      });

      // 綜合異常點
      const comprehensiveAnomalies = anomalyScores.map((score, index) => ({
        index,
        value: data[index],
        score,
        isAnomaly: score >= (options.comprehensiveThreshold || 2)
      })).filter(item => item.isAnomaly);

      return {
        ...results,
        comprehensive: {
          anomalies: comprehensiveAnomalies,
          scores: anomalyScores
        }
      };
    } catch (error) {
      logger.error('綜合異常檢測失敗:', error);
      throw error;
    }
  }

  /**
   * 動態閾值調整
   */
  adjustThreshold(data, currentThreshold, sensitivity = 0.1) {
    try {
      const anomalies = this.statisticalAnomalyDetection(data, currentThreshold);
      const anomalyRate = anomalies.anomalies.length / data.length;
      
      let newThreshold = currentThreshold;
      
      if (anomalyRate > 0.05) { // 異常率過高
        newThreshold += sensitivity;
      } else if (anomalyRate < 0.01) { // 異常率過低
        newThreshold -= sensitivity;
      }
      
      return Math.max(1, Math.min(5, newThreshold)); // 限制在 1-5 之間
    } catch (error) {
      logger.error('閾值調整失敗:', error);
      return currentThreshold;
    }
  }

  /**
   * 清理資源
   */
  dispose() {
    try {
      this.models.clear();
      this.thresholds.clear();
      logger.info('異常檢測服務資源已清理');
    } catch (error) {
      logger.error('資源清理失敗:', error);
    }
  }
}

module.exports = new AnomalyDetectionService();
