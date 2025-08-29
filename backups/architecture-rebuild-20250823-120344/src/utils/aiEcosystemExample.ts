import { aiEcosystem } from '../services/aiEcosystem';
import { aiEcosystemMonitor } from '../services/aiEcosystemMonitor';
import {
  multiAIService,
  AIProvider,
  AIModelType,
  AITaskType,
} from '../services/multiAIService';
import { aiModelManager } from '../services/aiModelManager';
import { dataQualityService } from '../services/dataQualityService';
import { logger } from '../utils/logger';

export class AIEcosystemExample {
  // ==================== 基礎初始化示例 ====================

  static async initializeEcosystem() {
    try {
      logger.info('🚀 開始初始化AI生態系統...');

      // 初始化AI生態系統
      await aiEcosystem.initialize();

      // 啟動監控
      await aiEcosystemMonitor.startMonitoring();

      // 設置警報處理器
      aiEcosystemMonitor.addAlertHandler(alert => {
        logger.warn(`🚨 警報: ${alert.title} - ${alert.message}`);
      });

      logger.info('✅ AI生態系統初始化完成');
      return true;
    } catch (error) {
      logger.error('❌ 初始化失敗:', error);
      return false;
    }
  }

  // ==================== 卡片識別示例 ====================

  static async cardRecognitionExample() {
    try {
      logger.info('📸 開始卡片識別示例...');

      // 模擬圖片數據
      const imageData =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';

      // 使用AI生態系統進行卡片識別
      const result = await aiEcosystem.recognizeCard(imageData, {
        enableConditionAnalysis: true,
        enablePriceEstimation: true,
        model: 'gpt-4',
        provider: 'openai',
      });

      logger.info('✅ 卡片識別結果:', result);
      return result;
    } catch (error) {
      logger.error('❌ 卡片識別失敗:', error);
      throw error;
    }
  }

  // ==================== 條件分析示例 ====================

  static async conditionAnalysisExample() {
    try {
      logger.info('🔍 開始條件分析示例...');

      // 模擬圖片數據
      const imageData =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';

      // 使用AI生態系統進行條件分析
      const result = await aiEcosystem.analyzeCardCondition(imageData, {
        detailedAnalysis: true,
        model: 'claude-3',
        provider: 'anthropic',
      });

      logger.info('✅ 條件分析結果:', result);
      return result;
    } catch (error) {
      logger.error('❌ 條件分析失敗:', error);
      throw error;
    }
  }

  // ==================== 價格預測示例 ====================

  static async pricePredictionExample() {
    try {
      logger.info('💰 開始價格預測示例...');

      // 模擬卡片數據
      const cardData = {
        name: '青眼白龍',
        series: '遊戲王',
        rarity: 'UR',
        condition: 'NM',
        year: 2002,
      };

      // 模擬市場數據
      const marketData = {
        currentTrend: 'rising',
        averagePrice: 150,
        volume: 1000,
      };

      // 使用AI生態系統進行價格預測
      const result = await aiEcosystem.predictCardPrice(cardData, {
        marketData,
        model: 'gemini-pro',
        provider: 'gemini',
      });

      logger.info('✅ 價格預測結果:', result);
      return result;
    } catch (error) {
      logger.error('❌ 價格預測失敗:', error);
      throw error;
    }
  }

  // ==================== 市場分析示例 ====================

  static async marketAnalysisExample() {
    try {
      logger.info('📊 開始市場分析示例...');

      // 模擬市場數據
      const marketData = {
        totalVolume: 50000,
        averagePrice: 120,
        trendingCards: ['青眼白龍', '黑魔導', '真紅眼黑龍'],
        marketSentiment: 'positive',
      };

      // 使用AI生態系統進行市場分析
      const result = await aiEcosystem.analyzeMarket(marketData, {
        analysisType: 'trend',
        model: 'claude-3',
        provider: 'anthropic',
      });

      logger.info('✅ 市場分析結果:', result);
      return result;
    } catch (error) {
      logger.error('❌ 市場分析失敗:', error);
      throw error;
    }
  }

  // ==================== 批量任務示例 ====================

  static async batchTasksExample() {
    try {
      logger.info('🔄 開始批量任務示例...');

      const tasks = [
        {
          taskType: 'recognition' as AITaskType,
          prompt: '識別這張卡片：青眼白龍',
          config: { model: 'gpt-4', maxTokens: 500 },
        },
        {
          taskType: 'analysis' as AITaskType,
          prompt: '分析這張卡片的市場價值',
          config: { model: 'claude-3', maxTokens: 800 },
        },
        {
          taskType: 'prediction' as AITaskType,
          prompt: '預測這張卡片的未來價格趨勢',
          config: { model: 'gemini-pro', maxTokens: 600 },
        },
      ];

      // 使用AI生態系統執行批量任務
      const result = await aiEcosystem.executeBatchTasks(tasks);

      logger.info('✅ 批量任務結果:', result);
      return result;
    } catch (error) {
      logger.error('❌ 批量任務失敗:', error);
      throw error;
    }
  }

  // ==================== 監控和儀表板示例 ====================

  static async monitoringExample() {
    try {
      logger.info('📈 開始監控示例...');

      // 獲取實時指標
      const metrics = aiEcosystemMonitor.getMetrics();
      logger.info('📊 實時指標:', metrics);

      // 獲取儀表板數據
      const dashboard = aiEcosystemMonitor.getDashboard();
      logger.info('📋 儀表板數據:', dashboard);

      // 獲取警報
      const alerts = aiEcosystemMonitor.getAlerts();
      logger.info('🚨 警報列表:', alerts);

      // 生成日報
      const dailyReport = await aiEcosystemMonitor.generateReport('daily');
      logger.info('📄 日報:', dailyReport);

      return {
        metrics,
        dashboard,
        alerts,
        dailyReport,
      };
    } catch (error) {
      logger.error('❌ 監控示例失敗:', error);
      throw error;
    }
  }

  // ==================== 模型管理示例 ====================

  static async modelManagementExample() {
    try {
      logger.info('🤖 開始模型管理示例...');

      // 獲取推薦模型
      const recommendedModels =
        aiEcosystem.getRecommendedModels('card_recognition');
      logger.info('🎯 推薦模型:', recommendedModels);

      // 比較模型
      const modelComparison = aiEcosystem.compareModels([
        'gpt-4',
        'claude-3',
        'gemini-pro',
      ]);
      logger.info('⚖️ 模型比較:', modelComparison);

      // 獲取模型能力
      const modelCapabilities = aiModelManager.getAllModelCapabilities();
      logger.info('💪 模型能力:', modelCapabilities);

      // 選擇最佳模型
      const bestModel = aiModelManager.selectBestModelForTask(
        'card_recognition',
        {
          prioritizeAccuracy: true,
          requireVision: true,
        }
      );
      logger.info('🏆 最佳模型:', bestModel);

      return {
        recommendedModels,
        modelComparison,
        modelCapabilities,
        bestModel,
      };
    } catch (error) {
      logger.error('❌ 模型管理示例失敗:', error);
      throw error;
    }
  }

  // ==================== 圖片處理示例 ====================

  static async imageProcessingExample() {
    try {
      logger.info('🖼️ 開始圖片處理示例...');

      // 模擬圖片文件
      const mockImageFile = new Blob(['mock image data'], {
        type: 'image/jpeg',
      });

      // 轉換圖片為base64
      const base64Result = await dataQualityService.convertImageToBase64(
        mockImageFile,
        {
          quality: 0.8,
          maxWidth: 1024,
          maxHeight: 1024,
        }
      );

      logger.info('✅ 圖片轉base64結果:', base64Result);

      // 壓縮圖片
      const compressedResult = await dataQualityService.compressBase64Image(
        base64Result.base64,
        {
          quality: 0.6,
          maxWidth: 512,
          maxHeight: 512,
        }
      );

      logger.info('✅ 圖片壓縮結果:', compressedResult);

      return {
        base64Result,
        compressedResult,
      };
    } catch (error) {
      logger.error('❌ 圖片處理示例失敗:', error);
      throw error;
    }
  }

  // ==================== 連接測試示例 ====================

  static async connectionTestExample() {
    try {
      logger.info('🔗 開始連接測試示例...');

      // 測試所有提供商連接
      const connectionResults = await aiEcosystem.testConnection();
      logger.info('🔗 連接測試結果:', connectionResults);

      // 獲取提供商狀態
      const providerStatus = multiAIService.getProviderStatus();
      logger.info('📊 提供商狀態:', providerStatus);

      // 獲取使用統計
      const usageStats = await multiAIService.getUsageStats();
      logger.info('📈 使用統計:', usageStats);

      return {
        connectionResults,
        providerStatus,
        usageStats,
      };
    } catch (error) {
      logger.error('❌ 連接測試示例失敗:', error);
      throw error;
    }
  }

  // ==================== 配置管理示例 ====================

  static async configurationExample() {
    try {
      logger.info('⚙️ 開始配置管理示例...');

      // 獲取當前配置
      const currentConfig = aiEcosystem.getConfig();
      logger.info('📋 當前配置:', currentConfig);

      // 更新配置
      aiEcosystem.updateConfig({
        maxConcurrentRequests: 15,
        monthlyBudget: 1500,
        enableCostOptimization: true,
      });

      logger.info('✅ 配置已更新');

      // 獲取更新後的配置
      const updatedConfig = aiEcosystem.getConfig();
      logger.info('📋 更新後配置:', updatedConfig);

      return {
        currentConfig,
        updatedConfig,
      };
    } catch (error) {
      logger.error('❌ 配置管理示例失敗:', error);
      throw error;
    }
  }

  // ==================== 完整工作流程示例 ====================

  static async completeWorkflowExample() {
    try {
      logger.info('🔄 開始完整工作流程示例...');

      // 1. 初始化系統
      await this.initializeEcosystem();

      // 2. 處理圖片
      const imageResult = await this.imageProcessingExample();

      // 3. 卡片識別
      const recognitionResult = await this.cardRecognitionExample();

      // 4. 條件分析
      const conditionResult = await this.conditionAnalysisExample();

      // 5. 價格預測
      const priceResult = await this.pricePredictionExample();

      // 6. 市場分析
      const marketResult = await this.marketAnalysisExample();

      // 7. 監控狀態
      const monitoringResult = await this.monitoringExample();

      // 8. 生成報告
      const report = await aiEcosystemMonitor.generateReport('daily');

      logger.info('✅ 完整工作流程執行完成');

      return {
        imageResult,
        recognitionResult,
        conditionResult,
        priceResult,
        marketResult,
        monitoringResult,
        report,
      };
    } catch (error) {
      logger.error('❌ 完整工作流程失敗:', error);
      throw error;
    }
  }

  // ==================== 性能測試示例 ====================

  static async performanceTestExample() {
    try {
      logger.info('⚡ 開始性能測試示例...');

      const startTime = Date.now();
      const results = [];

      // 執行多個並發任務
      const promises = Array.from({ length: 10 }, (_, i) =>
        aiEcosystem.executeTask('analysis', `測試任務 ${i + 1}`, {
          model: 'gpt-3.5-turbo',
          maxTokens: 100,
        })
      );

      const batchResults = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / batchResults.length;

      logger.info(
        `⚡ 性能測試結果: 總時間 ${totalTime}ms, 平均時間 ${averageTime}ms`
      );

      return {
        totalTime,
        averageTime,
        results: batchResults,
      };
    } catch (error) {
      logger.error('❌ 性能測試失敗:', error);
      throw error;
    }
  }

  // ==================== 錯誤處理示例 ====================

  static async errorHandlingExample() {
    try {
      logger.info('🛡️ 開始錯誤處理示例...');

      // 測試無效的提供商
      try {
        await multiAIService.executeRequest('測試請求', {
          provider: 'invalid_provider' as AIProvider,
          model: 'gpt-4',
        });
      } catch (error) {
        logger.info('✅ 正確捕獲無效提供商錯誤:', error.message);
      }

      // 測試無效的模型
      try {
        await aiEcosystem.executeTask('recognition', '測試', {
          model: 'invalid_model' as AIModelType,
        });
      } catch (error) {
        logger.info('✅ 正確捕獲無效模型錯誤:', error.message);
      }

      // 測試空提示
      try {
        await aiEcosystem.executeTask('analysis', '', {});
      } catch (error) {
        logger.info('✅ 正確捕獲空提示錯誤:', error.message);
      }

      logger.info('✅ 錯誤處理示例完成');
      return true;
    } catch (error) {
      logger.error('❌ 錯誤處理示例失敗:', error);
      throw error;
    }
  }

  // ==================== 運行所有示例 ====================

  static async runAllExamples() {
    try {
      logger.info('🎯 開始運行所有AI生態系統示例...');

      const results = {
        initialization: await this.initializeEcosystem(),
        cardRecognition: await this.cardRecognitionExample(),
        conditionAnalysis: await this.conditionAnalysisExample(),
        pricePrediction: await this.pricePredictionExample(),
        marketAnalysis: await this.marketAnalysisExample(),
        batchTasks: await this.batchTasksExample(),
        monitoring: await this.monitoringExample(),
        modelManagement: await this.modelManagementExample(),
        imageProcessing: await this.imageProcessingExample(),
        connectionTest: await this.connectionTestExample(),
        configuration: await this.configurationExample(),
        performanceTest: await this.performanceTestExample(),
        errorHandling: await this.errorHandlingExample(),
        completeWorkflow: await this.completeWorkflowExample(),
      };

      logger.info('🎉 所有示例運行完成！');
      return results;
    } catch (error) {
      logger.error('❌ 運行示例失敗:', error);
      throw error;
    }
  }

  // ==================== 清理資源 ====================

  static cleanup() {
    try {
      logger.info('🧹 開始清理資源...');

      // 停止監控
      aiEcosystemMonitor.stopMonitoring();

      // 清除歷史數據
      aiEcosystemMonitor.clearHistory();
      aiEcosystemMonitor.clearAlerts();

      logger.info('✅ 資源清理完成');
    } catch (error) {
      logger.error('❌ 資源清理失敗:', error);
    }
  }
}

export default AIEcosystemExample;
