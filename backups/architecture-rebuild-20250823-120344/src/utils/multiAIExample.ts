import {
  multiAIService,
  AIProvider,
  AIModelType,
  AITaskType,
  AIRequestConfig,
} from '../services/multiAIService';
import { aiModelManager, AIModelCapability } from '../services/aiModelManager';
import { logger } from '../utils/logger';

export class MultiAIExample {
  // 基本AI請求示例
  static async basicAIRequest() {
    try {
      logger.info('🚀 開始基本AI請求示例...');

      const prompt = '請分析這張寶可夢卡片的市場價值和投資潛力';

      const config: AIRequestConfig = {
        task: 'analysis',
        temperature: 0.3,
        maxTokens: 1000,
      };

      const response = await multiAIService.executeRequest(prompt, config);

      logger.info('✅ 基本AI請求完成:', {
        provider: response.metadata.provider,
        model: response.metadata.model,
        processingTime: response.metadata.processingTime,
        cost: response.metadata.cost,
        success: response.success,
      });

      return response;
    } catch (error) {
      logger.error('❌ 基本AI請求失敗:', error);
      throw error;
    }
  }

  // 指定AI提供商示例
  static async specificProviderRequest() {
    try {
      logger.info('🚀 開始指定提供商AI請求示例...');

      const prompt = '請詳細分析這張遊戲王卡片的稀有度和收藏價值';

      const config: AIRequestConfig = {
        provider: 'openai',
        model: 'gpt-4',
        task: 'analysis',
        temperature: 0.2,
        maxTokens: 1500,
      };

      const response = await multiAIService.executeRequest(prompt, config);

      logger.info('✅ 指定提供商AI請求完成:', {
        provider: response.metadata.provider,
        model: response.metadata.model,
        processingTime: response.metadata.processingTime,
        cost: response.metadata.cost,
      });

      return response;
    } catch (error) {
      logger.error('❌ 指定提供商AI請求失敗:', error);
      throw error;
    }
  }

  // 卡片識別任務示例
  static async cardRecognitionTask() {
    try {
      logger.info('🚀 開始卡片識別任務示例...');

      // 模擬base64圖像數據
      const imageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...';

      const prompt = '請識別這張卡片的名稱、系列、稀有度等基本信息';

      const response = await aiModelManager.executeCardTask(
        'card_recognition',
        prompt,
        {
          imageData,
          preferences: {
            prioritizeAccuracy: true,
            requireVision: true as any,
          },
        }
      );

      logger.info('✅ 卡片識別任務完成:', {
        model: response.metadata.model,
        provider: response.metadata.provider,
        processingTime: response.metadata.processingTime,
        confidence: response.metadata.confidence,
      });

      return response;
    } catch (error) {
      logger.error('❌ 卡片識別任務失敗:', error);
      throw error;
    }
  }

  // 條件分析任務示例
  static async conditionAnalysisTask() {
    try {
      logger.info('🚀 開始條件分析任務示例...');

      const imageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...';

      const prompt =
        '請詳細分析這張卡片的狀況，包括磨損程度、邊緣狀況、表面質量等，並給出評級建議';

      const response = await aiModelManager.executeCardTask(
        'condition_analysis',
        prompt,
        {
          imageData,
          preferences: {
            prioritizeAccuracy: true,
            requireVision: true as any,
          },
        }
      );

      logger.info('✅ 條件分析任務完成:', {
        model: response.metadata.model,
        provider: response.metadata.provider,
        processingTime: response.metadata.processingTime,
      });

      return response;
    } catch (error) {
      logger.error('❌ 條件分析任務失敗:', error);
      throw error;
    }
  }

  // 價格預測任務示例
  static async pricePredictionTask() {
    try {
      logger.info('🚀 開始價格預測任務示例...');

      const prompt = `基於以下市場數據，預測這張"青眼白龍"卡片的未來價格趨勢：
      - 當前市場價格: $500
      - 歷史最高價: $800
      - 最近30天交易量: 150張
      - 市場需求趨勢: 上升
      - 供應量: 稀缺`;

      const response = await aiModelManager.executeCardTask(
        'price_prediction',
        prompt,
        {
          preferences: {
            prioritizeAccuracy: true,
            maxCost: 'medium',
          },
        }
      );

      logger.info('✅ 價格預測任務完成:', {
        model: response.metadata.model,
        provider: response.metadata.provider,
        processingTime: response.metadata.processingTime,
      });

      return response;
    } catch (error) {
      logger.error('❌ 價格預測任務失敗:', error);
      throw error;
    }
  }

  // 批量AI請求示例
  static async batchAIRequests() {
    try {
      logger.info('🚀 開始批量AI請求示例...');

      const requests = [
        {
          prompt: '分析這張卡片的投資價值',
          config: { task: 'analysis' as AITaskType, temperature: 0.3 },
        },
        {
          prompt: '預測這張卡片未來3個月的價格趨勢',
          config: { task: 'prediction' as AITaskType, temperature: 0.2 },
        },
        {
          prompt: '生成這張卡片的收藏建議',
          config: { task: 'generation' as AITaskType, temperature: 0.7 },
        },
      ];

      const response = await multiAIService.executeBatchRequests(requests);

      logger.info('✅ 批量AI請求完成:', {
        totalRequests: response.summary.totalRequests,
        successfulRequests: response.summary.successfulRequests,
        failedRequests: response.summary.failedRequests,
        totalProcessingTime: response.summary.totalProcessingTime,
        totalCost: response.summary.totalCost,
        averageConfidence: response.summary.averageConfidence,
      });

      return response;
    } catch (error) {
      logger.error('❌ 批量AI請求失敗:', error);
      throw error;
    }
  }

  // 模型比較示例
  static async modelComparison() {
    try {
      logger.info('🚀 開始模型比較示例...');

      const models: AIModelType[] = [
        'gpt-4',
        'claude-3',
        'gemini-pro',
        'gpt-3.5-turbo',
      ];

      const comparison = aiModelManager.compareModels(models);

      logger.info('✅ 模型比較完成:');
      comparison.forEach((item, index) => {
        logger.info(`${index + 1}. ${item.model} (評分: ${item.score})`, {
          provider: item.capability.provider,
          capabilities: item.capability.capabilities,
          performance: item.capability.performance,
          specializations: item.capability.specializations,
        });
      });

      return comparison;
    } catch (error) {
      logger.error('❌ 模型比較失敗:', error);
      throw error;
    }
  }

  // 獲取推薦模型示例
  static async getRecommendedModels() {
    try {
      logger.info('🚀 開始獲取推薦模型示例...');

      const useCases = [
        'card-scanning',
        'price-analysis',
        'market-research',
        'investment-advice',
        'cost-effective',
        'high-accuracy',
        'fast-processing',
      ];

      const recommendations: Record<string, AIModelType[]> = {};

      useCases.forEach(useCase => {
        recommendations[useCase] = aiModelManager.getRecommendedModels(useCase);
      });

      logger.info('✅ 推薦模型獲取完成:', recommendations);

      return recommendations;
    } catch (error) {
      logger.error('❌ 獲取推薦模型失敗:', error);
      throw error;
    }
  }

  // 提供商狀態檢查示例
  static async checkProviderStatus() {
    try {
      logger.info('🚀 開始提供商狀態檢查示例...');

      const status = multiAIService.getProviderStatus();

      logger.info('✅ 提供商狀態檢查完成:');
      status.forEach(provider => {
        logger.info(`${provider.provider}:`, {
          isActive: provider.isActive,
          capabilities: provider.capabilities,
          rateLimit: provider.rateLimit,
          priority: provider.priority,
        });
      });

      return status;
    } catch (error) {
      logger.error('❌ 提供商狀態檢查失敗:', error);
      throw error;
    }
  }

  // 測試提供商連接示例
  static async testProviderConnections() {
    try {
      logger.info('🚀 開始測試提供商連接示例...');

      const providers: AIProvider[] = ['openai', 'claude', 'gemini', 'azure'];
      const results: Record<AIProvider, boolean> = {} as any;

      for (const provider of providers) {
        try {
          const isConnected =
            await multiAIService.testProviderConnection(provider);
          results[provider] = isConnected;
          logger.info(
            `${provider} 連接測試: ${isConnected ? '✅ 成功' : '❌ 失敗'}`
          );
        } catch (error) {
          results[provider] = false;
          logger.error(`${provider} 連接測試失敗:`, error);
        }
      }

      logger.info('✅ 提供商連接測試完成:', results);

      return results;
    } catch (error) {
      logger.error('❌ 提供商連接測試失敗:', error);
      throw error;
    }
  }

  // 獲取使用統計示例
  static async getUsageStats() {
    try {
      logger.info('🚀 開始獲取使用統計示例...');

      const stats = await multiAIService.getUsageStats();

      logger.info('✅ 使用統計獲取完成:', {
        totalRequests: stats.totalRequests,
        totalCost: stats.totalCost,
        averageProcessingTime: stats.averageProcessingTime,
        providerBreakdown: stats.providerBreakdown,
      });

      return stats;
    } catch (error) {
      logger.error('❌ 獲取使用統計失敗:', error);
      throw error;
    }
  }

  // 添加自定義AI提供商示例
  static async addCustomProvider() {
    try {
      logger.info('🚀 開始添加自定義AI提供商示例...');

      const customProvider = {
        provider: 'custom' as AIProvider,
        apiKey: 'your-custom-api-key',
        models: ['custom-model'] as any,
        capabilities: ['analysis', 'generation'] as AITaskType[],
        rateLimit: {
          requestsPerMinute: 20,
          requestsPerHour: 1000,
          tokensPerMinute: 30000,
        },
        cost: {
          inputTokensPerDollar: 50000,
          outputTokensPerDollar: 100000,
        },
        priority: 6,
        isActive: true,
      };

      multiAIService.addProvider(customProvider);

      logger.info('✅ 自定義AI提供商添加完成:', customProvider);

      return customProvider;
    } catch (error) {
      logger.error('❌ 添加自定義AI提供商失敗:', error);
      throw error;
    }
  }

  // 添加自定義模型示例
  static async addCustomModel() {
    try {
      logger.info('🚀 開始添加自定義模型示例...');

      const customModel: AIModelCapability = {
        model: 'custom-advanced' as AIModelType,
        provider: 'custom' as any,
        capabilities: {
          vision: true,
          code: true,
          math: true,
          reasoning: true,
          creativity: true,
          analysis: true,
          multilingual: true,
          contextLength: 16384,
          maxTokens: 8192,
        },
        performance: {
          speed: 'fast',
          accuracy: 'high',
          cost: 'low',
        },
        specializations: [
          'custom-analysis',
          'specialized-tasks',
          'domain-specific',
        ],
      };

      aiModelManager.addCustomModel(customModel);

      logger.info('✅ 自定義模型添加完成:', { customModel });

      return customModel;
    } catch (error) {
      logger.error('❌ 添加自定義模型失敗:', error);
      throw error;
    }
  }

  // 運行所有示例
  static async runAllExamples() {
    try {
      logger.info('🚀 開始運行所有多AI模型示例...');

      const results = {
        basicRequest: await this.basicAIRequest(),
        specificProvider: await this.specificProviderRequest(),
        cardRecognition: await this.cardRecognitionTask(),
        conditionAnalysis: await this.conditionAnalysisTask(),
        pricePrediction: await this.pricePredictionTask(),
        batchRequests: await this.batchAIRequests(),
        modelComparison: await this.modelComparison(),
        recommendedModels: await this.getRecommendedModels(),
        providerStatus: await this.checkProviderStatus(),
        providerConnections: await this.testProviderConnections(),
        usageStats: await this.getUsageStats(),
        customProvider: await this.addCustomProvider(),
        customModel: await this.addCustomModel(),
      };

      logger.info('✅ 所有多AI模型示例運行完成!');

      return results;
    } catch (error) {
      logger.error('❌ 運行多AI模型示例失敗:', error);
      throw error;
    }
  }
}

export default MultiAIExample;
