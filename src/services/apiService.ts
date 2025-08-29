/**
 * API 服務
 * 提供統一的 API 調用接口和錯誤處理
 */

import { api } from '../config/api';
import { logger } from '../utils/logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

class ApiService {
  private static instance: ApiService;
  private isInitialized = false;
  private defaultConfig: ApiRequestConfig = {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
  };

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * 初始化 API 服務
   */
  public async initialize(
    config?: Partial<ApiRequestConfig>
  ): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('ApiService 已經初始化');
      return true;
    }

    try {
      if (config) {
        this.defaultConfig = { ...this.defaultConfig, ...config };
      }

      // 驗證 API 配置
      await this.validateApiConfig();

      this.isInitialized = true;
      logger.info('ApiService 初始化成功');
      return true;
    } catch (error) {
      logger.error('ApiService 初始化失敗:', error);
      return false;
    }
  }

  /**
   * GET 請求
   */
  public async get<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  /**
   * POST 請求
   */
  public async post<T = any>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  /**
   * PUT 請求
   */
  public async put<T = any>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  /**
   * DELETE 請求
   */
  public async delete<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  /**
   * PATCH 請求
   */
  public async patch<T = any>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  /**
   * 統一請求方法
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'ApiService 未初始化',
        status: 500,
      };
    }

    const _requestConfig = { ...this.defaultConfig, ...config };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= requestConfig.retries; attempt++) {
      try {
        const _response = await this.makeRequest<T>(
          method,
          endpoint,
          data,
          requestConfig
        );
        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt < requestConfig.retries) {
          logger.warn(
            `API 請求失敗，重試 ${attempt + 1}/${requestConfig.retries}:`,
            {
              method,
              endpoint,
              error: lastError.message,
            }
          );

          await this.delay(requestConfig.retryDelay);
        }
      }
    }

    logger.error('API 請求最終失敗:', {
      method,
      endpoint,
      error: lastError?.message,
    });

    // 重新拋出最後的錯誤，而不是返回錯誤對象
    throw lastError || new Error('請求失敗');
  }

  /**
   * 執行實際請求
   */
  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const _apiConfig = api.getConfig();
    let url = endpoint;

    // 處理查詢參數
    if (config?.params && method === 'GET') {
      const _params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const _queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const _headers = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };

    const requestOptions: unknown = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      requestOptions.data = data;
    }

    try {
      let response;
      switch (method) {
        case 'GET':
          response = await api.get(url, requestOptions);
          break;
        case 'POST':
          response = await api.post(url, data, requestOptions);
          break;
        case 'PUT':
          response = await api.put(url, data, requestOptions);
          break;
        case 'DELETE':
          response = await api.delete(url, requestOptions);
          break;
        case 'PATCH':
          response = await api.patch(url, data, requestOptions);
          break;
        default:
          throw new Error(`不支援的 HTTP 方法: ${method}`);
      }

      // 首先檢查響應數據中的 success 字段
      if (
        response?.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        // 如果是錯誤響應（success: false），拋出異常
        if (response.data.success === false) {
          throw new Error(
            response.data.message || response.data.error || '請求失敗'
          );
        }

        return {
          success: response.data.success,
          data: response.data.data || response.data,
          status: response.status,
        };
      }

      // 檢查響應狀態
      if (response && response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          status: response.status,
        };
      } else {
        // 對於非 2xx 狀態碼，檢查響應數據中的錯誤信息
        if (
          response?.data &&
          typeof response.data === 'object' &&
          'success' in response.data
        ) {
          throw new Error(
            response.data.message ||
              response.data.error ||
              `HTTP ${response?.status || 'Unknown'}`
          );
        }
        throw new Error(
          response?.data?.error || `HTTP ${response?.status || 'Unknown'}`
        );
      }
    } catch (error: unknown) {
      // 處理 axios 錯誤
      if (error.response) {
        // 服務器返回了錯誤狀態碼
        throw new Error(
          error.response.data?.error || `HTTP ${error.response.status}`
        );
      } else if (error.request) {
        // 請求已發出但沒有收到響應
        throw new Error('網絡錯誤：無法連接到服務器');
      } else {
        // 其他錯誤
        throw new Error(error.message || '未知錯誤');
      }
    }
  }

  /**
   * 驗證 API 配置
   */
  private async validateApiConfig(): Promise<void> {
    const _apiConfig = api.getConfig();
    if (!apiConfig.baseURL) {
      throw new Error('API baseURL 未配置');
    }

    // 測試連接
    try {
      await this.get('/health');
    } catch (error) {
      logger.warn('API 健康檢查失敗，但繼續初始化:', error);
    }
  }

  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 檢查服務狀態
   */
  public isServiceAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * 獲取服務統計
   */
  public getStats(): unknown {
    return {
      isInitialized: this.isInitialized,
      defaultConfig: this.defaultConfig,
    };
  }
}

// 導出單例實例
export const _apiService = ApiService.getInstance();
