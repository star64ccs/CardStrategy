import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import {
  ApiOptimizer,
  SmartCache,
  performanceOptimizer,
} from '@/utils/performanceOptimizer';
import { logger } from '@/utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// API 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  timestamp?: string;
  cached?: boolean;
}

// API 請求配置
export interface ApiRequestConfig extends AxiosRequestConfig {
  cache?: boolean;
  ttl?: number;
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  showLoading?: boolean;
  showError?: boolean;
}

// API 錯誤類型
export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  details?: any;
}

// 請求攔截器配置
interface RequestInterceptor {
  onRequest?: (
    config: AxiosRequestConfig
  ) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onResponse?: (
    response: AxiosResponse
  ) => AxiosResponse | Promise<AxiosResponse>;
  onError?: (error: any) => any;
}

// 性能監控配置
interface PerformanceConfig {
  enableMetrics?: boolean;
  logSlowRequests?: boolean;
  slowRequestThreshold?: number;
}

export class OptimizedApiService {
  private static instance: OptimizedApiService;
  private axiosInstance: AxiosInstance;
  private requestInterceptors: RequestInterceptor[] = [];
  private performanceConfig: PerformanceConfig = {
    enableMetrics: true,
    logSlowRequests: true,
    slowRequestThreshold: 1000, // 1秒
  };

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_ENDPOINTS.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): OptimizedApiService {
    if (!OptimizedApiService.instance) {
      OptimizedApiService.instance = new OptimizedApiService();
    }
    return OptimizedApiService.instance;
  }

  // 設置攔截器
  private setupInterceptors(): void {
    // 請求攔截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const startTime = Date.now();
        (config as any).startTime = startTime;

        // 添加認證標頭
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 執行自定義請求攔截器
        this.requestInterceptors.forEach((interceptor) => {
          if (interceptor.onRequest) {
            config = interceptor.onRequest(config);
          }
        });

        logger.debug('API 請求開始', {
          method: config.method?.toUpperCase(),
          url: config.url,
          timestamp: new Date().toISOString(),
        });

        return config;
      },
      (error) => {
        logger.error('API 請求攔截器錯誤', error);
        return Promise.reject(error);
      }
    );

    // 響應攔截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const endTime = Date.now();
        const { startTime } = response.config as any;
        const duration = endTime - startTime;

        // 記錄性能指標
        if (this.performanceConfig.enableMetrics) {
          performanceOptimizer.PerformanceMonitor.recordMetric(
            `api_${response.config.method}_${response.config.url}`,
            duration
          );
        }

        // 記錄慢請求
        if (
          this.performanceConfig.logSlowRequests &&
          duration > this.performanceConfig.slowRequestThreshold
        ) {
          logger.warn('慢 API 請求', {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        }

        logger.debug('API 響應成功', {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        });

        return response;
      },
      (error) => {
        const endTime = Date.now();
        const startTime = (error.config as any)?.startTime;
        const duration = startTime ? endTime - startTime : 0;

        logger.error('API 響應錯誤', {
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        });

        return Promise.reject(this.formatError(error));
      }
    );
  }

  // 格式化錯誤
  private formatError(error: any): ApiError {
    return {
      message: error.response?.data?.message || error.message || '未知錯誤',
      code: error.response?.data?.code || error.code || 'UNKNOWN_ERROR',
      status: error.response?.status || 0,
      timestamp: new Date().toISOString(),
      details: error.response?.data,
    };
  }

  // 獲取認證令牌
  private getAuthToken(): string | null {
    try {
      return (
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token')
      );
    } catch {
      return null;
    }
  }

  // 設置認證令牌
  setAuthToken(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
    } catch {
      sessionStorage.setItem('auth_token', token);
    }
  }

  // 清除認證令牌
  clearAuthToken(): void {
    try {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    } catch {
      // 忽略錯誤
    }
  }

  // 添加請求攔截器
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // 設置性能配置
  setPerformanceConfig(config: PerformanceConfig): void {
    this.performanceConfig = { ...this.performanceConfig, ...config };
  }

  // 通用請求方法
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const {
      cache = true,
      ttl = 5 * 60 * 1000, // 5分鐘
      retry = true,
      retryAttempts = 3,
      retryDelay = 1000,
      ...axiosConfig
    } = config;

    const cacheKey = this.generateCacheKey(config);

    // 使用優化的 API 請求
    return ApiOptimizer.request(
      cacheKey,
      async () => {
        const response = await this.axiosInstance.request({
          ...axiosConfig,
          timeout: axiosConfig.timeout || 10000,
        });

        return {
          success: true,
          data: response.data,
          message: response.data?.message,
          timestamp: new Date().toISOString(),
        };
      },
      {
        cache,
        ttl,
        retry,
      }
    );
  }

  // GET 請求
  async get<T = any>(
    url: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      ...config,
    });
  }

  // POST 請求
  async post<T = any>(
    url: string,
    data?: any,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  // PUT 請求
  async put<T = any>(
    url: string,
    data?: any,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  // DELETE 請求
  async delete<T = any>(
    url: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  // PATCH 請求
  async patch<T = any>(
    url: string,
    data?: any,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  // 批量請求
  async batchRequests<T = any>(
    requests: {
      method: string;
      url: string;
      data?: any;
      config?: ApiRequestConfig;
    }[]
  ): Promise<ApiResponse<T>[]> {
    const requestConfigs = requests.map((req, index) => ({
      key: `batch_${index}_${req.method}_${req.url}`,
      requestFn: () => this.request<T>(req),
    }));

    return ApiOptimizer.batchRequests(requestConfigs);
  }

  // 生成緩存鍵
  private generateCacheKey(config: ApiRequestConfig): string {
    const { method, url, params, data } = config;
    const key = `${method?.toUpperCase()}_${url}_${JSON.stringify(params)}_${JSON.stringify(data)}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
  }

  // 清理緩存
  clearCache(pattern?: string): void {
    if (pattern) {
      // 清理特定模式的緩存
      const keys = Array.from(SmartCache.getInstance()['cache'].keys());
      keys.forEach((key) => {
        if (key.includes(pattern)) {
          SmartCache.getInstance().delete(key);
        }
      });
    } else {
      // 清理所有緩存
      SmartCache.getInstance().clear();
    }
  }

  // 獲取性能指標
  getPerformanceMetrics(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    return performanceOptimizer.PerformanceMonitor.getMetrics();
  }

  // 健康檢查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', {
        cache: false,
        retry: false,
      });
      return response.success;
    } catch {
      return false;
    }
  }

  // 上傳文件
  async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
      ...config,
    });
  }

  // 下載文件
  async downloadFile(
    url: string,
    filename?: string,
    config: ApiRequestConfig = {}
  ): Promise<void> {
    const response = await this.axiosInstance.request({
      method: 'GET',
      url,
      responseType: 'blob',
      ...config,
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// 導出服務類和實例
export { OptimizedApiService };
export const apiService = OptimizedApiService.getInstance();

// 導出便捷方法
export const api = {
  get: apiService.get.bind(apiService),
  post: apiService.post.bind(apiService),
  put: apiService.put.bind(apiService),
  delete: apiService.delete.bind(apiService),
  patch: apiService.patch.bind(apiService),
  batch: apiService.batchRequests.bind(apiService),
  upload: apiService.uploadFile.bind(apiService),
  download: apiService.downloadFile.bind(apiService),
  clearCache: apiService.clearCache.bind(apiService),
  healthCheck: apiService.healthCheck.bind(apiService),
  getMetrics: apiService.getPerformanceMetrics.bind(apiService),
  setAuthToken: apiService.setAuthToken.bind(apiService),
  clearAuthToken: apiService.clearAuthToken.bind(apiService),
};
