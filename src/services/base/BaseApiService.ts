import { z, ZodSchema } from 'zod';
import { apiService } from '@/services/apiService';
import { validateInput, validateApiResponse } from '@/utils/validationService';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

export abstract class BaseApiService {
  /**
   * 執行 API 調用的統一方法
   * @param operation 操作名稱（用於日誌）
   * @param apiCall API 調用函數
   * @param inputSchema 輸入驗證模式
   * @param responseSchema 響應驗證模式
   * @param inputData 輸入數據
   * @returns API 響應
   */
  protected async executeApiCall<T, P = any>(
    operation: string,
    apiCall: () => Promise<ApiResponse<T>>,
    inputSchema?: ZodSchema<P>,
    responseSchema?: ZodSchema<T>,
    inputData?: P
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();

    try {
      // 輸入驗證
      if (inputSchema && inputData) {
        const validationResult = validateInput(inputSchema, inputData);
        if (!validationResult.isValid) {
          throw new Error(validationResult.errorMessage || `${operation} 參數驗證失敗`);
        }
      }

      // API 調用
      const response = await apiCall();

      // 響應驗證
      if (responseSchema && response.data) {
        const responseValidation = validateApiResponse(responseSchema, response.data);
        if (!responseValidation.isValid) {
          throw new Error(responseValidation.errorMessage || `${operation} 響應數據驗證失敗`);
        }

        const result = {
          ...response,
          data: responseValidation.data!
        };

        // 記錄成功日誌
        const duration = Date.now() - startTime;
        logger.info(`✅ ${operation} 成功`, {
          duration: `${duration}ms`,
          status: response.status
        });

        return result;
      }

      // 記錄成功日誌
      const duration = Date.now() - startTime;
      logger.info(`✅ ${operation} 成功`, {
        duration: `${duration}ms`,
        status: response.status
      });

      return response;
    } catch (error: any) {
      // 記錄錯誤日誌
      const duration = Date.now() - startTime;
      logger.error(`❌ ${operation} 失敗`, {
        error: error.message,
        duration: `${duration}ms`,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * 創建標準化的 API 調用函數
   * @param endpoint API 端點
   * @param method HTTP 方法
   * @param inputSchema 輸入驗證模式
   * @param responseSchema 響應驗證模式
   * @returns API 調用函數
   */
  protected createApiCall<T, P = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    inputSchema?: ZodSchema<P>,
    responseSchema?: ZodSchema<T>
  ) {
    return async (data?: P): Promise<ApiResponse<T>> => {
      const operation = `${method} ${endpoint}`;

      const apiCall = () => {
        switch (method) {
          case 'GET':
            return apiService.get<T>(endpoint, { params: data });
          case 'POST':
            return apiService.post<T>(endpoint, data);
          case 'PUT':
            return apiService.put<T>(endpoint, data);
          case 'DELETE':
            return apiService.delete<T>(endpoint);
          default:
            throw new Error(`不支持的 HTTP 方法: ${method}`);
        }
      };

      return this.executeApiCall(operation, apiCall, inputSchema, responseSchema, data);
    };
  }

  /**
   * 創建帶查詢參數的 GET 請求
   * @param endpoint API 端點
   * @param responseSchema 響應驗證模式
   * @returns API 調用函數
   */
  protected createGetCall<T, P = any>(
    endpoint: string,
    responseSchema?: ZodSchema<T>
  ) {
    return this.createApiCall<T, P>(endpoint, 'GET', undefined, responseSchema);
  }

  /**
   * 創建 POST 請求
   * @param endpoint API 端點
   * @param inputSchema 輸入驗證模式
   * @param responseSchema 響應驗證模式
   * @returns API 調用函數
   */
  protected createPostCall<T, P = any>(
    endpoint: string,
    inputSchema?: ZodSchema<P>,
    responseSchema?: ZodSchema<T>
  ) {
    return this.createApiCall<T, P>(endpoint, 'POST', inputSchema, responseSchema);
  }

  /**
   * 創建 PUT 請求
   * @param endpoint API 端點
   * @param inputSchema 輸入驗證模式
   * @param responseSchema 響應驗證模式
   * @returns API 調用函數
   */
  protected createPutCall<T, P = any>(
    endpoint: string,
    inputSchema?: ZodSchema<P>,
    responseSchema?: ZodSchema<T>
  ) {
    return this.createApiCall<T, P>(endpoint, 'PUT', inputSchema, responseSchema);
  }

  /**
   * 創建 DELETE 請求
   * @param endpoint API 端點
   * @param responseSchema 響應驗證模式
   * @returns API 調用函數
   */
  protected createDeleteCall<T>(
    endpoint: string,
    responseSchema?: ZodSchema<T>
  ) {
    return this.createApiCall<T>(endpoint, 'DELETE', undefined, responseSchema);
  }

  /**
   * 批量執行 API 調用
   * @param calls API 調用數組
   * @returns 批量執行結果
   */
  protected async executeBatch<T>(
    calls: (() => Promise<ApiResponse<T>>)[]
  ): Promise<ApiResponse<T>[]> {
    const startTime = Date.now();
    const operation = `批量執行 ${calls.length} 個操作`;

    try {
      const results = await Promise.all(calls.map(call => call()));

      const duration = Date.now() - startTime;
      logger.info(`✅ ${operation} 成功`, {
        count: calls.length,
        duration: `${duration}ms`
      });

      return results;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`❌ ${operation} 失敗`, {
        error: error.message,
        count: calls.length,
        duration: `${duration}ms`
      });
      throw error;
    }
  }

  /**
   * 帶重試的 API 調用
   * @param operation 操作名稱
   * @param apiCall API 調用函數
   * @param maxRetries 最大重試次數
   * @param retryDelay 重試延遲（毫秒）
   * @returns API 響應
   */
  protected async executeWithRetry<T>(
    operation: string,
    apiCall: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeApiCall(operation, apiCall);
      } catch (error: any) {
        lastError = error;

        if (attempt === maxRetries) {
          logger.error(`❌ ${operation} 重試失敗 (${attempt}/${maxRetries})`, {
            error: error.message
          });
          throw error;
        }

        logger.warn(`⚠️ ${operation} 失敗，${retryDelay}ms 後重試 (${attempt}/${maxRetries})`, {
          error: error.message
        });

        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    throw lastError!;
  }

  /**
   * 創建分頁查詢
   * @param endpoint API 端點
   * @param responseSchema 響應驗證模式
   * @returns 分頁查詢函數
   */
  protected createPaginatedCall<T>(
    endpoint: string,
    responseSchema?: ZodSchema<T>
  ) {
    return async (params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: Record<string, any>;
    } = {}): Promise<ApiResponse<T>> => {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder || 'desc',
        ...params.filters
      };

      return this.createGetCall<T>(endpoint, responseSchema)(queryParams);
    };
  }
}
