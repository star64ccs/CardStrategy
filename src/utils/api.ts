import { ApiResponse, ApiError } from '../types';
import {
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRY_ATTEMPTS,
  API_RETRY_DELAY,
} from './constants';
import { AuthStorage } from './storage';
import { retry, safeExecute } from './helpers';

// HTTP 方法類型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 請求配置
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  withAuth?: boolean;
}

// API 客戶端類
export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetryAttempts: number;
  private defaultRetryDelay: number;

  constructor(
    baseURL: string = API_BASE_URL,
    timeout: number = API_TIMEOUT,
    retryAttempts: number = API_RETRY_ATTEMPTS,
    retryDelay: number = API_RETRY_DELAY
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
    this.defaultRetryAttempts = retryAttempts;
    this.defaultRetryDelay = retryDelay;
  }

  // 發送請求
  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const {
      method,
      url,
      data,
      params,
      headers = {},
      timeout = this.defaultTimeout,
      retryAttempts = this.defaultRetryAttempts,
      retryDelay = this.defaultRetryDelay,
      withAuth = true,
    } = config;

    // 構建完整 URL
    const fullURL = this.buildURL(url, params);

    // 準備請求頭
    const requestHeaders = await this.prepareHeaders(headers, withAuth);

    // 準備請求體
    const requestBody = this.prepareRequestBody(data);

    // 發送請求（帶重試機制）
    return retry(
      () =>
        this.sendRequest<T>(
          fullURL,
          method,
          requestHeaders,
          requestBody,
          timeout
        ),
      retryAttempts,
      retryDelay
    );
  }

  // 構建完整 URL
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    if (!params) {
      return fullURL;
    }

    const urlObj = new URL(fullURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });

    return urlObj.toString();
  }

  // 準備請求頭
  private async prepareHeaders(
    headers: Record<string, string>,
    withAuth: boolean
  ): Promise<Record<string, string>> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (withAuth) {
      const token = await AuthStorage.getAuthToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    return defaultHeaders;
  }

  // 準備請求體
  private prepareRequestBody(data?: any): string | null {
    if (!data) {
      return null;
    }

    if (typeof data === 'string') {
      return data;
    }

    return JSON.stringify(data);
  }

  // 發送實際請求
  private async sendRequest<T>(
    url: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: string | null,
    timeout: number
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await this.parseResponse<T>(response);

      if (!response.ok) {
        throw this.createApiError(response, responseData);
      }

      return {
        success: true,
        data: responseData,
        timestamp: new Date(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleRequestError(error);
    }
  }

  // 解析響應
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    if (contentType && contentType.includes('text/')) {
      const text = await response.text();
      return text as T;
    }

    return response.blob() as T;
  }

  // 創建 API 錯誤
  private createApiError(response: Response, data: any): ApiError {
    return {
      code: response.status.toString(),
      message: data?.message || response.statusText || 'Unknown error',
      details: data?.details || data,
    };
  }

  // 處理請求錯誤
  private handleRequestError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        code: 'TIMEOUT',
        message: '請求超時',
      };
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: '網路連接錯誤',
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || '未知錯誤',
    };
  }

  // GET 請求
  async get<T>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params: params || {},
      ...config,
    });
  }

  // POST 請求
  async post<T>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  // PUT 請求
  async put<T>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  // DELETE 請求
  async delete<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  // PATCH 請求
  async patch<T>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }
}

// 創建預設 API 客戶端實例
export const apiClient = new ApiClient();

// 便捷的 API 函數
export const api = {
  get: <T>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>
  ) => apiClient.get<T>(url, params, config),

  post: <T>(url: string, data?: any, config?: Partial<RequestConfig>) =>
    apiClient.post<T>(url, data, config),

  put: <T>(url: string, data?: any, config?: Partial<RequestConfig>) =>
    apiClient.put<T>(url, data, config),

  delete: <T>(url: string, config?: Partial<RequestConfig>) =>
    apiClient.delete<T>(url, config),

  patch: <T>(url: string, data?: any, config?: Partial<RequestConfig>) =>
    apiClient.patch<T>(url, data, config),
};

// 錯誤處理工具
export const handleApiError = (error: ApiError): string => {
  switch (error.code) {
    case '401':
      return '認證失敗，請重新登入';
    case '403':
      return '權限不足';
    case '404':
      return '請求的資源不存在';
    case '422':
      return '請求數據驗證失敗';
    case '429':
      return '請求過於頻繁，請稍後再試';
    case '500':
      return '伺服器內部錯誤';
    case 'TIMEOUT':
      return '請求超時，請檢查網路連接';
    case 'NETWORK_ERROR':
      return '網路連接錯誤，請檢查網路設置';
    default:
      return error.message || '發生未知錯誤';
  }
};

// 安全 API 調用
export const safeApiCall = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  fallback?: T
): Promise<T | null> => {
  const result = await safeExecute(async () => {
    const response = await apiCall();
    return response.data || null;
  }, fallback || null);
  return result || null;
};

// 批量 API 調用
export const batchApiCalls = async <T>(
  apiCalls: (() => Promise<ApiResponse<T>>)[]
): Promise<(T | null)[]> => {
  const results = await Promise.allSettled(
    apiCalls.map((call) => safeApiCall(call))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return null;
  });
};

// 分頁 API 調用
export const paginatedApiCall = async <T>(
  apiCall: (
    page: number,
    limit: number
  ) => Promise<ApiResponse<{ data: T[]; pagination: any }>>,
  pageSize: number = 20
): Promise<T[]> => {
  const allData: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await apiCall(page, pageSize);

    if (response.success && response.data) {
      allData.push(...response.data.data);
      hasMore = response.data.pagination.hasNext;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allData;
};

// 導出預設 API 客戶端
export default apiClient;
