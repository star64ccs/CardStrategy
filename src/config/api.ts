import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import { logger } from '@/utils/logger';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

class ApiClient {
  private readonly instance: AxiosInstance;
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseURL:
        process.env.NODE_ENV === 'test'
          ? '/api' // Test環境使用相對Path
          : process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    };

    this.instance = axios.create(this.config);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request攔截器
    this.instance.interceptors.request.use(
      config => {
        logger.debug('API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });

        // AddAuthenticate令牌
        this.addAuthToken(config);

        return config;
      },
      error => {
        logger.error('API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response攔截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });

        return response;
      },
      async error => {
        logger.error('API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });

        // Handle 401 未AuthorizeError
        if (error.response?.status === 401) {
          await this.handleUnauthorized();
        }

        return Promise.reject(error);
      }
    );
  }

  private async addAuthToken(config: AxiosRequestConfig): Promise<void> {
    try {
      // 在Test環境中SkipAuthenticate令牌
      if (process.env.NODE_ENV === 'test') {
        return;
      }

      // 在運Row時使用 import
      const _module = await import('@react-native-async-storage/async-storage');
      const _AsyncStorage = module.default;
      const _token = await AsyncStorage.getItem('accessToken');

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logger.error('Failed to add auth token', error);
    }
  }

  private async handleUnauthorized(): Promise<void> {
    try {
      // 在Test環境中SkipHandle
      if (process.env.NODE_ENV === 'test') {
        return;
      }

      // 嘗試Refresh令牌
      const { authService } = await import('@/services/authService');
      const _refreshResult = await authService.refreshToken();

      if (!refreshResult.success) {
        // RefreshFailed，ClearAuthenticateData並重定向到Login頁面
        await authService.logout();
        // 這裡可以觸發重定向到Login頁面的Event
        logger.warn('Authentication expired, redirecting to login');
      }
    } catch (error) {
      logger.error('Failed to handle unauthorized error', error);
    }
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (process.env.NODE_ENV === 'test') {
      // 在Test環境中使用 fetch
      const _fullUrl = url.startsWith('http')
        ? url
        : `http://localhost${this.config.baseURL}${url}`;

      // Create超時Control器
      const _controller = new AbortController();
      const _timeoutId = setTimeout(
        () => controller.abort(),
        config?.timeout || this.config.timeout
      );

      try {
        const _response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(config?.headers as Record<string, string>),
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const _data = await response.json();
        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as any,
          config: { url },
        } as AxiosResponse<T>;
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('請求超時');
        }
        throw error;
      }
    }
    return this.instance.get(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (process.env.NODE_ENV === 'test') {
      // 在Test環境中使用 fetch
      const _fullUrl = url.startsWith('http')
        ? url
        : `http://localhost${this.config.baseURL}${url}`;
      const _response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers as Record<string, string>),
        },
        body: JSON.stringify(data),
      });

      const _responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as any,
        config: { url },
      } as AxiosResponse<T>;
    }
    return this.instance.post(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (process.env.NODE_ENV === 'test') {
      // 在Test環境中使用 fetch
      const _fullUrl = url.startsWith('http')
        ? url
        : `http://localhost${this.config.baseURL}${url}`;
      const _response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers as Record<string, string>),
        },
        body: JSON.stringify(data),
      });

      const _responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as any,
        config: { url },
      } as AxiosResponse<T>;
    }
    return this.instance.put(url, data, config);
  }

  public async patch<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (process.env.NODE_ENV === 'test') {
      // 在Test環境中使用 fetch
      const _fullUrl = url.startsWith('http')
        ? url
        : `http://localhost${this.config.baseURL}${url}`;
      const _response = await fetch(fullUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers as Record<string, string>),
        },
        body: JSON.stringify(data),
      });

      const _responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as any,
        config: { url },
      } as AxiosResponse<T>;
    }
    return this.instance.patch(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (process.env.NODE_ENV === 'test') {
      // 在Test環境中使用 fetch
      const _fullUrl = url.startsWith('http')
        ? url
        : `http://localhost${this.config.baseURL}${url}`;
      const _response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers as Record<string, string>),
        },
      });

      const _responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as any,
        config: { url },
      } as AxiosResponse<T>;
    }
    return this.instance.delete(url, config);
  }

  public updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update axios InstanceConfigure
    this.instance.defaults.baseURL = this.config.baseURL;
    this.instance.defaults.timeout = this.config.timeout;
    if (this.config.headers) {
      this.instance.defaults.headers.common = this.config.headers;
    }
    this.instance.defaults.withCredentials = this.config.withCredentials;

    logger.info('API configuration updated', this.config);
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }
}

// Create單例Instance
export const _api = new ApiClient();

// Export便捷Method
export const _apiGet = <T = any>(url: string, config?: AxiosRequestConfig) =>
  api.get<T>(url, config);
export const _apiPost = <T = any>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) => api.post<T>(url, data, config);
export const _apiPut = <T = any>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) => api.put<T>(url, data, config);
export const _apiPatch = <T = any>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) => api.patch<T>(url, data, config);
export const _apiDelete = <T = any>(url: string, config?: AxiosRequestConfig) =>
  api.delete<T>(url, config);

export default api;
