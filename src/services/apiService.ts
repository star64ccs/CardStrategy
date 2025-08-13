import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, ApiError } from '@/types';
import { environment } from '@/config/environment';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = environment.apiBaseUrl;

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: environment.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add auth token to requests
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors and token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${this.baseURL}/auth/refresh`, {
                refreshToken
              });

              const { token } = response.data;
              await AsyncStorage.setItem('authToken', token);

              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch {
            // Refresh token failed, redirect to login
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
            // You might want to dispatch a logout action here
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        message: data?.message || `HTTP ${status} 錯誤`,
        code: data?.code || 'UNKNOWN_ERROR',
        details: data?.details || {}
      };
    } else if (error.request) {
      // Network error
      return {
        message: '網路連線錯誤，請檢查您的網路連線',
        code: 'NETWORK_ERROR',
        details: {}
      };
    }
    // Other error
    return {
      message: error.message || '未知錯誤',
      code: 'UNKNOWN_ERROR',
      details: {}
    };

  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, config);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || '請求成功',
        timestamp: new Date()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data, config);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || '請求成功',
        timestamp: new Date()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data, config);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || '請求成功',
        timestamp: new Date()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data, config);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || '請求成功',
        timestamp: new Date()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url, config);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || '請求成功',
        timestamp: new Date()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // File upload
  async uploadFile<T = any>(
    url: string,
    file: any,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });

      return {
        success: true,
        data: response.data,
        message: response.data?.message || '上傳成功',
        timestamp: new Date()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Download file
  async downloadFile(url: string, _filename?: string): Promise<Blob> {
    try {
      const response = await this.api.get(url, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
