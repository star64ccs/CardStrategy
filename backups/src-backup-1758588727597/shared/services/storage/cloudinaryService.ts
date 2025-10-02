import { serviceConfig } from '../../../core/config/services';
import { errorHandler } from '../../../core/utils/errorHandler';
import { logger } from '../../../core/utils/logger';

/**
 * Cloudinary 服務配置接口
 */
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  baseURL: string;
}

/**
 * 上傳選項接口
 */
interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: string;
  format?: string;
  quality?: string | number;
  width?: number;
  height?: number;
  crop?: string;
  tags?: string[];
  context?: Record<string, string>;
}

/**
 * 上傳結果接口
 */
interface UploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

/**
 * 轉換選項接口
 */
interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'fill' | 'crop' | 'thumb' | 'pad';
  quality?: string | number;
  format?: string;
  effect?: string;
  overlay?: string;
  gravity?: string;
  radius?: number | string;
  border?: string;
  background?: string;
}

/**
 * Cloudinary 服務類
 * 提供圖片和視頻存儲、處理功能
 */
export class CloudinaryService {
  private static instance: CloudinaryService;
  private config: CloudinaryConfig;
  private isInitialized = false;

  private constructor() {
    this.config = {
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      baseURL: 'https://api.cloudinary.com/v1_1',
    };
  }

  static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  /**
   * 初始化 Cloudinary 服務
   */
  async initialize(): Promise<void> {
    try {
      await serviceConfig.initialize();

      const cloudName = serviceConfig.get('CLOUDINARY_CLOUD_NAME');
      const apiKey = serviceConfig.get('CLOUDINARY_API_KEY');
      const apiSecret = serviceConfig.get('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary 配置不完整');
      }

      this.config = {
        cloudName,
        apiKey,
        apiSecret,
        baseURL: 'https://api.cloudinary.com/v1_1',
      };

      // 測試 API 連接
      await this.testConnection();

      this.isInitialized = true;
      logger.info('Cloudinary 服務初始化成功');
    } catch (error) {
      logger.error('Cloudinary 服務初始化失敗:', { error });
      throw error;
    }
  }

  /**
   * 測試 API 連接
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await this.makeRequest(
        '/resources/image',
        'GET',
        null,
        {
          max_results: 1,
        }
      );

      if (!response.resources) {
        throw new Error('API 響應格式無效');
      }

      logger.info('Cloudinary API 連接測試成功');
    } catch (error) {
      logger.error('Cloudinary API 連接測試失敗:', { error });
      throw new Error('無法連接到 Cloudinary API');
    }
  }

  /**
   * 上傳圖片
   */
  async uploadImage(
    file: File | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const formData = new FormData();

      // 添加文件
      if (typeof file === 'string') {
        formData.append('file', file); // URL 或 base64
      } else {
        formData.append('file', file);
      }

      // 添加上傳參數
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }
      if (options.tags) {
        formData.append('tags', options.tags.join(','));
      }
      if (options.context) {
        formData.append('context', this.formatContext(options.context));
      }

      // 添加轉換參數
      if (options.transformation) {
        formData.append('transformation', options.transformation);
      }

      // 生成簽名
      const timestamp = Math.round(new Date().getTime() / 1000);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.config.apiKey);

      const signature = await this.generateSignature(formData, timestamp);
      formData.append('signature', signature);

      logger.info('開始上傳圖片到 Cloudinary:', {
        folder: options.folder,
        publicId: options.publicId,
        fileType: typeof file,
      });

      const response = await this.makeUploadRequest('/image/upload', formData);

      logger.info('Cloudinary 圖片上傳成功:', {
        publicId: response.public_id,
        url: response.secure_url,
        bytes: response.bytes,
      });

      return response;
    } catch (error) {
      const appError = errorHandler.handleError(
        error as Error,
        'Cloudinary圖片上傳'
      );
      throw appError;
    }
  }

  /**
   * 上傳卡牌圖片
   */
  async uploadCardImage(
    file: File,
    cardId: string,
    cardName: string,
    side: 'front' | 'back' = 'front'
  ): Promise<UploadResult> {
    const options: UploadOptions = {
      folder: 'cards',
      publicId: `${cardId}_${side}`,
      tags: ['card', side, cardId],
      context: {
        card_id: cardId,
        card_name: cardName,
        side,
      },
      transformation: 'c_fill,w_800,h_1200,q_auto:good',
    };

    return this.uploadImage(file, options);
  }

  /**
   * 生成圖片 URL
   */
  generateImageUrl(
    publicId: string,
    transformations?: TransformationOptions
  ): string {
    let transformationString = '';

    if (transformations) {
      const parts: string[] = [];

      if (transformations.width) parts.push(`w_${transformations.width}`);
      if (transformations.height) parts.push(`h_${transformations.height}`);
      if (transformations.crop) parts.push(`c_${transformations.crop}`);
      if (transformations.quality) parts.push(`q_${transformations.quality}`);
      if (transformations.format) parts.push(`f_${transformations.format}`);
      if (transformations.effect) parts.push(`e_${transformations.effect}`);
      if (transformations.overlay) parts.push(`l_${transformations.overlay}`);
      if (transformations.gravity) parts.push(`g_${transformations.gravity}`);
      if (transformations.radius) parts.push(`r_${transformations.radius}`);
      if (transformations.border) parts.push(`bo_${transformations.border}`);
      if (transformations.background)
        parts.push(`b_${transformations.background}`);

      if (parts.length > 0) {
        transformationString = `${parts.join(',')}/`;
      }
    }

    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${transformationString}${publicId}`;
  }

  /**
   * 生成卡牌縮略圖 URL
   */
  generateCardThumbnail(
    publicId: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    const sizes = {
      small: { width: 200, height: 300 },
      medium: { width: 400, height: 600 },
      large: { width: 800, height: 1200 },
    };

    const { width, height } = sizes[size];

    return this.generateImageUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto:good',
      format: 'webp',
    });
  }

  /**
   * 生成響應式圖片 URL
   */
  generateResponsiveUrls(publicId: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.generateImageUrl(publicId, {
        width: 150,
        height: 225,
        crop: 'fill',
        quality: 'auto:low',
        format: 'webp',
      }),
      small: this.generateImageUrl(publicId, {
        width: 300,
        height: 450,
        crop: 'fill',
        quality: 'auto:good',
        format: 'webp',
      }),
      medium: this.generateImageUrl(publicId, {
        width: 600,
        height: 900,
        crop: 'fill',
        quality: 'auto:good',
        format: 'webp',
      }),
      large: this.generateImageUrl(publicId, {
        width: 1200,
        height: 1800,
        crop: 'fill',
        quality: 'auto:best',
        format: 'webp',
      }),
      original: this.generateImageUrl(publicId),
    };
  }

  /**
   * 刪除圖片
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const formData = new FormData();

      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.config.apiKey);

      const signature = await this.generateSignature(formData, timestamp);
      formData.append('signature', signature);

      const response = await this.makeUploadRequest(
        '/image/destroy',
        formData
      );

      logger.info('Cloudinary 圖片刪除成功:', {
        publicId,
        result: response.result,
      });

      return response.result === 'ok';
    } catch (error) {
      logger.error('Cloudinary 圖片刪除失敗:', { error, publicId });
      return false;
    }
  }

  /**
   * 獲取圖片信息
   */
  async getImageInfo(publicId: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.makeRequest(
        `/resources/image/upload/${publicId}`,
        'GET'
      );

      logger.info('獲取 Cloudinary 圖片信息成功:', { publicId });

      return response;
    } catch (error) {
      logger.error('獲取 Cloudinary 圖片信息失敗:', { error, publicId });
      throw error;
    }
  }

  /**
   * 搜索圖片
   */
  async searchImages(
    query: string,
    options: {
      maxResults?: number;
      nextCursor?: string;
      sortBy?: string;
    } = {}
  ): Promise<{
    resources: unknown[];
    nextCursor?: string;
    totalCount: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const params: Record<string, any> = {
        expression: query,
        max_results: options.maxResults || 20,
      };

      if (options.nextCursor) {
        params.next_cursor = options.nextCursor;
      }

      if (options.sortBy) {
        params.sort_by = options.sortBy;
      }

      const response = await this.makeRequest(
        '/resources/search',
        'GET',
        null,
        params
      );

      logger.info('Cloudinary 圖片搜索成功:', {
        query,
        resultCount: response.resources.length,
        totalCount: response.total_count,
      });

      return {
        resources: response.resources,
        nextCursor: response.next_cursor,
        totalCount: response.total_count,
      };
    } catch (error) {
      logger.error('Cloudinary 圖片搜索失敗:', { error, query });
      throw error;
    }
  }

  /**
   * 生成簽名
   */
  private async generateSignature(
    formData: FormData,
    timestamp: number
  ): Promise<string> {
    // 收集需要簽名的參數
    const params: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      if (key !== 'file' && key !== 'api_key' && key !== 'signature') {
        params[key] = value.toString();
      }
    }

    // 按字母順序排序參數
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 添加 API Secret
    const stringToSign = `${sortedParams}${this.config.apiSecret}`;

    // 生成 SHA1 哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  }

  /**
   * 格式化上下文參數
   */
  private formatContext(context: Record<string, string>): string {
    return Object.entries(context)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');
  }

  /**
   * 發送上傳請求
   */
  private async makeUploadRequest(
    endpoint: string,
    formData: FormData
  ): Promise<any> {
    const url = `${this.config.baseURL}/${this.config.cloudName}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Cloudinary API 錯誤 ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Cloudinary API 請求失敗');
    }
  }

  /**
   * 發送 HTTP 請求
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
    params?: Record<string, any>
  ): Promise<any> {
    let url = `${this.config.baseURL}/${this.config.cloudName}${endpoint}`;

    // 添加查詢參數
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
      });
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      Authorization: `Basic ${btoa(`${this.config.apiKey}:${this.config.apiSecret}`)}`,
    };

    if (body && method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method === 'POST') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Cloudinary API 錯誤 ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Cloudinary API 請求失敗');
    }
  }

  /**
   * 檢查服務狀態
   */
  async getServiceStatus(): Promise<{
    isAvailable: boolean;
    cloudName: string;
    lastChecked: Date;
  }> {
    try {
      await this.testConnection();
      return {
        isAvailable: true,
        cloudName: this.config.cloudName,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        isAvailable: false,
        cloudName: this.config.cloudName,
        lastChecked: new Date(),
      };
    }
  }
}

// 導出單例實例
export const cloudinaryService = CloudinaryService.getInstance();

// 導出類型
export type { TransformationOptions, UploadOptions, UploadResult };
