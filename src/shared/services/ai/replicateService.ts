import type { ApiResponse } from '../../../core/types';
import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface ReplicateModel {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive';
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export interface ReplicatePrediction {
  id: string;
  version: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: Record<string, any>;
  output: unknown;
  error?: string;
  logs?: string;
  metrics?: Record<string, any>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ReplicatePredictionRequest {
  version: string;
  input: Record<string, any>;
  webhook?: string;
  webhookEventsFilter?: string[];
}

export class ReplicateService {
  private readonly apiToken: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN || '';
    this.baseUrl = 'https://api.replicate.com/v1';

    if (!this.apiToken) {
      logger.warn('Replicate API token not found in environment variables');
    }
  }

  /**
   * CheckServiceYesNo可用
   */
  isAvailable(): boolean {
    return !!this.apiToken;
  }

  /**
   * Get可用的模型List
   */
  async getModels(): Promise<ApiResponse<ReplicateModel[]>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: [],
          message: 'Replicate API token not configured',
          timestamp: new Date(),
        };
      }

      const _response = await api.get(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: (response.data as any).results || [],
          message: 'Models retrieved successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || 'Failed to retrieve models',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting Replicate models:', { error });
      return {
        success: false,
        data: [],
        message: 'Failed to retrieve models',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Create預測Task
   */
  async createPrediction(
    request: ReplicatePredictionRequest
  ): Promise<ApiResponse<ReplicatePrediction>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Replicate API token not configured',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(`${this.baseUrl}/predictions`, request, {
        headers: {
          Authorization: `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as ReplicatePrediction,
          message: 'Prediction created successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: undefined,
        message: response.message || 'Failed to create prediction',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error creating Replicate prediction:', { error, request });
      return {
        success: false,
        data: undefined,
        message: 'Failed to create prediction',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get預測結果
   */
  async getPrediction(
    predictionId: string
  ): Promise<ApiResponse<ReplicatePrediction>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Replicate API token not configured',
          timestamp: new Date(),
        };
      }

      const _response = await api.get(
        `${this.baseUrl}/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as ReplicatePrediction,
          message: 'Prediction retrieved successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: undefined,
        message: response.message || 'Failed to retrieve prediction',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting Replicate prediction:', {
        error,
        predictionId,
      });
      return {
        success: false,
        data: undefined,
        message: 'Failed to retrieve prediction',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Cancel預測Task
   */
  async cancelPrediction(predictionId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: false,
          message: 'Replicate API token not configured',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(
        `${this.baseUrl}/predictions/${predictionId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Token ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: response.success,
        data: response.success,
        message: response.success
          ? 'Prediction cancelled successfully'
          : 'Failed to cancel prediction',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error cancelling Replicate prediction:', {
        error,
        predictionId,
      });
      return {
        success: false,
        data: false,
        message: 'Failed to cancel prediction',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchHandle預測Task
   */
  async batchPredict(
    requests: ReplicatePredictionRequest[]
  ): Promise<ApiResponse<ReplicatePrediction[]>> {
    try {
      if (requests.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No requests to process',
          timestamp: new Date(),
        };
      }

      if (!this.isAvailable()) {
        return {
          success: false,
          data: [],
          message: 'Replicate API token not configured',
          timestamp: new Date(),
        };
      }

      const predictions: ReplicatePrediction[] = [];
      const errors: string[] = [];

      // ParallelHandle所有Request
      const _promises = requests.map(async (request, index) => {
        try {
          const _result = await this.createPrediction(request);
          if (result.success && result.data) {
            predictions.push(result.data);
          } else {
            errors.push(`Request ${index + 1}: ${result.message}`);
          }
        } catch (error) {
          errors.push(`Request ${index + 1}: ${error}`);
        }
      });

      await Promise.all(promises);

      return {
        success: predictions.length > 0,
        data: predictions,
        message:
          errors.length > 0
            ? `Processed ${predictions.length} predictions with ${errors.length} errors`
            : 'All predictions processed successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error in batch prediction:', { error });
      return {
        success: false,
        data: [],
        message: 'Failed to process batch predictions',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Await預測Complete
   */
  async waitForPrediction(
    predictionId: string,
    timeoutMs = 300000
  ): Promise<ApiResponse<ReplicatePrediction>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Replicate API token not configured',
          timestamp: new Date(),
        };
      }

      const _startTime = Date.now();

      while (Date.now() - startTime < timeoutMs) {
        const _result = await this.getPrediction(predictionId);

        if (!result.success || !result.data) {
          return result;
        }

        const _prediction = result.data;

        if (prediction.status === 'succeeded') {
          return {
            success: true,
            data: prediction,
            message: 'Prediction completed successfully',
            timestamp: new Date(),
          };
        }

        if (
          prediction.status === 'failed' ||
          prediction.status === 'canceled'
        ) {
          return {
            success: false,
            data: prediction,
            message: `Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`,
            timestamp: new Date(),
          };
        }

        // Await 2 Second後再次Check
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return {
        success: false,
        data: undefined,
        message: 'Prediction timeout',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error waiting for prediction:', { error, predictionId });
      return {
        success: false,
        data: undefined,
        message: 'Failed to wait for prediction',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetServiceStatisticsInformation
   */
  async getServiceStats(): Promise<
    ApiResponse<{
      available: boolean;
      modelsCount: number;
      activePredictions: number;
      lastUsed: string;
    }>
  > {
    try {
      const _available = this.isAvailable();

      if (!available) {
        return {
          success: true,
          data: {
            available: false,
            modelsCount: 0,
            activePredictions: 0,
            lastUsed: new Date().toISOString(),
          },
          message: 'Service not available',
          timestamp: new Date(),
        };
      }

      const _modelsResult = await this.getModels();
      const _modelsCount =
        modelsResult.success && modelsResult.data
          ? modelsResult.data.length
          : 0;

      return {
        success: true,
        data: {
          available: true,
          modelsCount,
          activePredictions: 0, // 需要額外 API 調用來Get
          lastUsed: new Date().toISOString(),
        },
        message: 'Service stats retrieved successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting Replicate service stats:', { error });
      return {
        success: false,
        data: undefined,
        message: 'Failed to get service stats',
        timestamp: new Date(),
      };
    }
  }
}

// Create單例Instance
export const _replicateService = new ReplicateService();
