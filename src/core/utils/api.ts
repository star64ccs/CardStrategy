import {
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRY_ATTEMPTS,
  API_RETRY_DELAY,
} from '../constants';
import type { ApiResponse } from '../types';
import { ApiError } from '../types';

import { retry, safeExecute } from './helpers';
import { AuthStorage } from './storage';

// 導入類型定義
import type { HttpMethod, RequestConfig } from './types';

// API 客戶端類
export class ApiClient {
  private readonly baseURL: string;
  private readonly defaultTimeout: number;
  private readonly defaultRetryAttempts: number;
  private readonly defaultRetryDelay: number;

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
    const _fullURL = this.buildURL(url, params);

    // 準備請求頭
    const _requestHeaders = await this.prepareHeaders(headers, withAuth);

    // 準備請求體
    const _requestBody = this.prepareRequestBody(data);

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
    const _fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    if (!params) {
      return fullURL;
    }

    const _urlObj = new URL(fullURL);
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
    const _defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'CardStrategy/1.0.0',
    };

    const _finalHeaders = { ...defaultHeaders, ...headers };

    if (withAuth) {
      const _token = await AuthStorage.getToken();
      if (token) {
        (finalHeaders as any)['Authorization'] = `Bearer ${token}`;
      }
    }

    return finalHeaders;
  }

  // 準備請求體
  private prepareRequestBody(data?: unknown): string | undefined {
    if (!data) {
      return undefined;
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
    body?: string,
    timeout?: number
  ): Promise<ApiResponse<T>> {
    const _controller = new AbortController();
    const _timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const _response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const _responseData = await this.parseResponse<T>(response);

      if (!response.ok) {
        const _errorMessage =
          responseData &&
          typeof responseData === 'object' &&
          'message' in responseData
            ? (responseData as any).message
            : `HTTP ${response.status}`;
        throw new Error(errorMessage);
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
    const _contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      const _text = await response.text();
      return text as T;
    }

    return response.blob() as T;
  }

  // 處理請求錯誤
  private handleRequestError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new Error('請求超時');
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new Error('網絡連接失敗');
    }

    return new Error('未知錯誤');
  }

  // 便捷方法
  async get<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  async delete<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, ...config });
  }
}

// 創建默認 API 客戶端實例
export const _apiClient = new ApiClient();

// 導出便捷函數
export const _api = {
  get: <T>(url: string, config?: Partial<RequestConfig>) =>
    apiClient.get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: Partial<RequestConfig>) =>
    apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: Partial<RequestConfig>) =>
    apiClient.put<T>(url, data, config),
  delete: <T>(url: string, config?: Partial<RequestConfig>) =>
    apiClient.delete<T>(url, config),
  patch: <T>(url: string, data?: unknown, config?: Partial<RequestConfig>) =>
    apiClient.patch<T>(url, data, config),
};

// 導出類型
export type { RequestConfig, HttpMethod } from './types';
