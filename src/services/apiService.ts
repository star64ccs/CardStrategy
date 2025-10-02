/**
 * API Service
 * 提供統一的 API 調用Interface和ErrorHandle
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
   * Initialize API Service
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

      // Verify API Configure
      await this.validateApiConfig();

      this.isInitialized = true;
      logger.info('ApiService InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('ApiService InitializeFailed:', error);
      return false;
    }
  }

  /**
   * GET Request
   */
  public async get<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  /**
   * POST Request
   */
  public async post<T = any>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  /**
   * PUT Request
   */
  public async put<T = any>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  /**
   * DELETE Request
   */
  public async delete<T = any>(
    endpoint: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  /**
   * PATCH Request
   */
  public async patch<T = any>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  /**
   * 統一RequestMethod
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
            `API 請求Failed，重試 ${attempt + 1}/${requestConfig.retries}:`,
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

    logger.error('API 請求最終Failed:', {
      method,
      endpoint,
      error: lastError?.message,
    });

    // ReThrow最後的Error，而不YesReturnErrorObject
    throw lastError || new Error('請求Failed');
  }

  /**
   * 執Row實際Request
   */
  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const _apiConfig = api.getConfig();
    let url = endpoint;

    // HandleQueryParameter
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

      // 首先CheckResponseData中的 success Field
      if (
        response?.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        // 如果YesErrorResponse（success: false），Throw異常
        if (response.data.success === false) {
          throw new Error(
            response.data.message || response.data.error || '請求Failed'
          );
        }

        return {
          success: response.data.success,
          data: response.data.data || response.data,
          status: response.status,
        };
      }

      // CheckResponseStatus
      if (response && response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          status: response.status,
        };
      } else {
        // 對於非 2xx Status碼，CheckResponseData中的ErrorInformation
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
      // Handle axios Error
      if (error.response) {
        // ServerReturn了ErrorStatus碼
        throw new Error(
          error.response.data?.error || `HTTP ${error.response.status}`
        );
      } else if (error.request) {
        // Request已發出但沒有收到Response
        throw new Error('網絡Error：無法Connect到Server');
      } else {
        // 其他Error
        throw new Error(error.message || '未知Error');
      }
    }
  }

  /**
   * Verify API Configure
   */
  private async validateApiConfig(): Promise<void> {
    const _apiConfig = api.getConfig();
    if (!apiConfig.baseURL) {
      throw new Error('API baseURL 未配置');
    }

    // TestConnect
    try {
      await this.get('/health');
    } catch (error) {
      logger.warn('API 健康CheckFailed，但繼續Initialize:', error);
    }
  }

  /**
   * 延遲Function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * CheckServiceStatus
   */
  public isServiceAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * GetServiceStatistics
   */
  public getStats(): unknown {
    return {
      isInitialized: this.isInitialized,
      defaultConfig: this.defaultConfig,
    };
  }
}

// Export單例Instance
export const _apiService = ApiService.getInstance();
