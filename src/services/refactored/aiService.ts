import { z } from 'zod';
import { BaseApiService } from '@/services/base/BaseApiService';
import {
  ApiMethod,
  ValidateInput,
  ValidateResponse,
  Retry,
  PerformanceMonitor,
  Cache,
} from '@/decorators/serviceDecorators';
import { ValidationUtils } from '@/utils/validationUtils';
import { LoggingUtils } from '@/utils/loggingUtils';
import { API_ENDPOINTS } from '@/config/api';
import { ApiResponse } from '@/types';

// 驗證模式
const AIAnalysisSchema = z.object({
  cardId: z.string().uuid(),
  analysis: z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1),
    factors: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  timestamp: z.string().datetime(),
});

const AIPredictionSchema = z.object({
  cardId: z.string().uuid(),
  timeframe: z.enum(['1d', '7d', '30d', '90d']),
  predictedPrice: z.number().positive(),
  confidence: z.number().min(0).max(1),
  factors: z.array(z.string()),
  riskAssessment: z.string(),
  trend: z.enum(['up', 'down', 'stable']),
});

const AIRecommendationSchema = z.object({
  cardId: z.string().uuid(),
  recommendation: z.enum(['buy', 'sell', 'hold']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  expectedReturn: z.number(),
  timeHorizon: z.string(),
});

const AIChatMessageSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  response: z.string(),
  timestamp: z.string().datetime(),
  sessionId: z.string().uuid().optional(),
});

/**
 * 重構後的 AI 服務類
 * 使用基類和裝飾器消除重複代碼
 */
export class AIService extends BaseApiService {
  /**
   * 獲取卡片 AI 分析
   * 使用裝飾器自動處理驗證、錯誤處理和日誌記錄
   */
  @ApiMethod(
    API_ENDPOINTS.AI.ANALYSIS,
    'POST',
    z.object({ cardId: z.string().uuid('無效的卡牌 ID') }),
    AIAnalysisSchema
  )
  @Retry(3, 1000)
  @PerformanceMonitor('AI 分析')
  @Cache(300000) // 5分鐘緩存
  async getCardAnalysis(cardId: string): Promise<ApiResponse<any>> {
    // 使用基類方法，無需重複的驗證和錯誤處理邏輯
    return this.createPostCall<any, { cardId: string }>(
      API_ENDPOINTS.AI.ANALYSIS,
      z.object({ cardId: z.string().uuid('無效的卡牌 ID') }),
      AIAnalysisSchema
    )({ cardId });
  }

  /**
   * 獲取價格預測
   */
  @ApiMethod(
    API_ENDPOINTS.AI.PREDICTION,
    'POST',
    z.object({
      cardId: z.string().uuid('無效的卡牌 ID'),
      timeframe: z.enum(['1d', '7d', '30d', '90d']),
    }),
    AIPredictionSchema
  )
  @Retry(3, 1000)
  @PerformanceMonitor('AI 預測')
  async getPricePrediction(
    cardId: string,
    timeframe: '1d' | '7d' | '30d' | '90d'
  ): Promise<ApiResponse<any>> {
    // 使用驗證工具類
    ValidationUtils.validateCardId(cardId);
    ValidationUtils.validateTimeframe(timeframe);

    return this.createPostCall<any, { cardId: string; timeframe: string }>(
      API_ENDPOINTS.AI.PREDICTION,
      z.object({
        cardId: z.string().uuid('無效的卡牌 ID'),
        timeframe: z.enum(['1d', '7d', '30d', '90d']),
      }),
      AIPredictionSchema
    )({ cardId, timeframe });
  }

  /**
   * 獲取投資建議
   */
  @ValidateInput(z.object({ cardId: z.string().uuid('無效的卡牌 ID') }))
  @ValidateResponse(RecommendationSchema)
  @Retry(2, 2000)
  @PerformanceMonitor('AI 建議')
  async getInvestmentRecommendation(cardId: string): Promise<ApiResponse<any>> {
    // 使用驗證工具類
    ValidationUtils.validateCardId(cardId);

    return this.createPostCall<any, { cardId: string }>(
      API_ENDPOINTS.AI.RECOMMENDATION,
      z.object({ cardId: z.string().uuid('無效的卡牌 ID') }),
      AIRecommendationSchema
    )({ cardId });
  }

  /**
   * 發送聊天消息
   */
  @ValidateInput(
    z.object({
      message: z
        .string()
        .min(1, '消息不能為空')
        .max(1000, '消息不能超過 1000 個字元'),
      sessionId: z.string().uuid().optional(),
    })
  )
  @ValidateResponse(AIChatMessageSchema)
  @PerformanceMonitor('AI 聊天')
  async sendChatMessage(
    message: string,
    sessionId?: string
  ): Promise<ApiResponse<any>> {
    // 使用驗證工具類
    if (message.length === 0) {
      throw new Error('消息不能為空');
    }

    return this.createPostCall<any, { message: string; sessionId?: string }>(
      API_ENDPOINTS.AI.CHAT,
      z.object({
        message: z
          .string()
          .min(1, '消息不能為空')
          .max(1000, '消息不能超過 1000 個字元'),
        sessionId: z.string().uuid().optional(),
      }),
      AIChatMessageSchema
    )({ message, sessionId });
  }

  /**
   * 批量獲取卡片分析
   * 使用基類的批量處理功能
   */
  @PerformanceMonitor('批量 AI 分析')
  async getBatchCardAnalysis(cardIds: string[]): Promise<ApiResponse<any[]>> {
    // 使用驗證工具類批量驗證
    ValidationUtils.validateUUIDs(cardIds, '卡牌 ID');

    // 使用基類的批量執行功能
    const calls = cardIds.map((cardId) => () => this.getCardAnalysis(cardId));

    const results = await this.executeBatch(calls);
    return {
      success: true,
      data: results.map((r) => r.data),
      status: 200,
    };
  }

  /**
   * 獲取 AI 模型性能統計
   */
  @Cache(600000) // 10分鐘緩存
  @PerformanceMonitor('AI 統計')
  async getAIModelStats(): Promise<ApiResponse<any>> {
    return this.createGetCall<any>(
      API_ENDPOINTS.AI.STATS,
      z.object({
        totalRequests: z.number(),
        averageResponseTime: z.number(),
        accuracy: z.number().min(0).max(1),
        models: z.array(
          z.object({
            name: z.string(),
            accuracy: z.number(),
            usage: z.number(),
          })
        ),
      })
    )();
  }

  /**
   * 訓練 AI 模型
   */
  @ValidateInput(
    z.object({
      modelType: z.enum(['sentiment', 'prediction', 'recommendation']),
      trainingData: z.array(z.any()).min(1, '訓練數據不能為空'),
      parameters: z.record(z.any()).optional(),
    })
  )
  @PerformanceMonitor('AI 模型訓練')
  async trainAIModel(
    modelType: string,
    trainingData: any[],
    parameters?: Record<string, any>
  ): Promise<ApiResponse<any>> {
    // 記錄業務邏輯
    LoggingUtils.logBusinessLogic(
      'AI 模型訓練',
      `開始訓練 ${modelType} 模型，數據量: ${trainingData.length}`,
      { modelType, dataSize: trainingData.length }
    );

    return this.createPostCall<
      any,
      {
        modelType: string;
        trainingData: any[];
        parameters?: Record<string, any>;
      }
    >(
      API_ENDPOINTS.AI.TRAIN,
      z.object({
        modelType: z.enum(['sentiment', 'prediction', 'recommendation']),
        trainingData: z.array(z.any()).min(1, '訓練數據不能為空'),
        parameters: z.record(z.any()).optional(),
      }),
      z.object({
        modelId: z.string().uuid(),
        status: z.enum(['training', 'completed', 'failed']),
        accuracy: z.number().optional(),
        trainingTime: z.number(),
      })
    )({ modelType, trainingData, parameters });
  }

  /**
   * 獲取 AI 模型列表
   */
  @Cache(300000) // 5分鐘緩存
  async getAIModels(): Promise<ApiResponse<any[]>> {
    return this.createGetCall<any[]>(
      API_ENDPOINTS.AI.MODELS,
      z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          type: z.enum(['sentiment', 'prediction', 'recommendation']),
          version: z.string(),
          accuracy: z.number(),
          lastUpdated: z.string().datetime(),
          status: z.enum(['active', 'inactive', 'training']),
        })
      )
    )();
  }

  /**
   * 刪除 AI 模型
   */
  @ValidateInput(z.object({ modelId: z.string().uuid('無效的模型 ID') }))
  @PerformanceMonitor('AI 模型刪除')
  async deleteAIModel(modelId: string): Promise<ApiResponse<void>> {
    // 使用驗證工具類
    ValidationUtils.validateUUID(modelId, '模型 ID');

    return this.createDeleteCall<void>(
      `${API_ENDPOINTS.AI.MODELS}/${modelId}`
    )();
  }

  /**
   * 獲取 AI 服務健康狀態
   */
  @Cache(60000) // 1分鐘緩存
  async getAIHealth(): Promise<ApiResponse<any>> {
    return this.createGetCall<any>(
      API_ENDPOINTS.AI.HEALTH,
      z.object({
        status: z.enum(['healthy', 'degraded', 'unhealthy']),
        services: z.record(
          z.object({
            status: z.enum(['up', 'down']),
            responseTime: z.number(),
            lastCheck: z.string().datetime(),
          })
        ),
        models: z.record(
          z.object({
            status: z.enum(['active', 'inactive', 'error']),
            accuracy: z.number(),
            lastTraining: z.string().datetime(),
          })
        ),
      })
    )();
  }
}

// 導出單例實例
export const aiService = new AIService();
