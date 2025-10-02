import { serviceConfig } from '../../../core/config/services';
import { errorHandler } from '../../../core/utils/errorHandler';
import { logger } from '../../../core/utils/logger';

/**
 * Cloudinary ServiceConfigureInterface
 */
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  baseURL: string;
}

/**
 * UploadOptionsInterface
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
 * Upload結果Interface
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
 * ConvertOptionsInterface
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
 * Cloudinary ServiceClass
 * 提供Graph片和視頻Storage、Handle功能
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
   * Initialize Cloudinary Service
   */
  async initialize(): Promise<void> {
    try {
      await serviceConfig.initialize();

      const _cloudName = serviceConfig.get('CLOUDINARY_CLOUD_NAME');
      const _apiKey = serviceConfig.get('CLOUDINARY_API_KEY');
      const _apiSecret = serviceConfig.get('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary 配置不完整');
      }

      this.config = {
        cloudName,
        apiKey,
        apiSecret,
        baseURL: 'https://api.cloudinary.com/v1_1',
      };

      // Test API Connect
      await this.testConnection();

      this.isInitialized = true;
      logger.info('Cloudinary ServiceInitializeSuccess');
    } catch (error) {
      logger.error('Cloudinary ServiceInitializeFailed:', { error });
      throw error;
    }
  }

  /**
   * Test API Connect
   */
  private async testConnection(): Promise<void> {
    try {
      const _response = await this.makeRequest(
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

      logger.info('Cloudinary API Connect測試Success');
    } catch (error) {
      logger.error('Cloudinary API Connect測試Failed:', { error });
      throw new Error('無法Connect到 Cloudinary API');
    }
  }

  /**
   * UploadGraph片
   */
  async uploadImage(
    file: File | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const _formData = new FormData();

      // AddFile
      if (typeof file === 'string') {
        formData.append('file', file); // URL 或 base64
      } else {
        formData.append('file', file);
      }

      // AddUploadParameter
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

      // AddConvertParameter
      if (options.transformation) {
        formData.append('transformation', options.transformation);
      }

      // 生成Sign
      const _timestamp = Math.round(new Date().getTime() / 1000);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.config.apiKey);

      const _signature = await this.generateSignature(formData, timestamp);
      formData.append('signature', signature);

      logger.info('開始上傳圖片到 Cloudinary:', {
        folder: options.folder,
        publicId: options.publicId,
        fileType: typeof file,
      });

      const _response = await this.makeUploadRequest('/image/upload', formData);

      logger.info('Cloudinary 圖片上傳Success:', {
        publicId: response.public_id,
        url: response.secure_url,
        bytes: response.bytes,
      });

      return response;
    } catch (error) {
      const _appError = errorHandler.handleError(
        error as Error,
        'Cloudinary圖片上傳'
      );
      throw appError;
    }
  }

  /**
   * Upload卡牌Graph片
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
   * 生成Graph片 URL
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
   * 生成卡牌縮略Graph URL
   */
  generateCardThumbnail(
    publicId: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    const _sizes = {
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
   * 生成Response式Graph片 URL
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
   * DeleteGraph片
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const _timestamp = Math.round(new Date().getTime() / 1000);
      const _formData = new FormData();

      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.config.apiKey);

      const _signature = await this.generateSignature(formData, timestamp);
      formData.append('signature', signature);

      const _response = await this.makeUploadRequest(
        '/image/destroy',
        formData
      );

      logger.info('Cloudinary 圖片DeleteSuccess:', {
        publicId,
        result: response.result,
      });

      return response.result === 'ok';
    } catch (error) {
      logger.error('Cloudinary 圖片DeleteFailed:', { error, publicId });
      return false;
    }
  }

  /**
   * GetGraph片Information
   */
  async getImageInfo(publicId: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const _response = await this.makeRequest(
        `/resources/image/upload/${publicId}`,
        'GET'
      );

      logger.info('Get Cloudinary 圖片信息Success:', { publicId });

      return response;
    } catch (error) {
      logger.error('Get Cloudinary 圖片信息Failed:', { error, publicId });
      throw error;
    }
  }

  /**
   * SearchGraph片
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

      const _response = await this.makeRequest(
        '/resources/search',
        'GET',
        null,
        params
      );

      logger.info('Cloudinary 圖片搜索Success:', {
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
      logger.error('Cloudinary 圖片搜索Failed:', { error, query });
      throw error;
    }
  }

  /**
   * 生成Sign
   */
  private async generateSignature(
    formData: FormData,
    timestamp: number
  ): Promise<string> {
    // 收集需要Sign的Parameter
    const params: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      if (key !== 'file' && key !== 'api_key' && key !== 'signature') {
        params[key] = value.toString();
      }
    }

    // 按字母順序SortParameter
    const _sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Add API Secret
    const _stringToSign = `${sortedParams}${this.config.apiSecret}`;

    // 生成 SHA1 哈希
    const _encoder = new TextEncoder();
    const _data = encoder.encode(stringToSign);
    const _hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const _hashArray = Array.from(new Uint8Array(hashBuffer));
    const _hashHex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  }

  /**
   * Format上下文Parameter
   */
  private formatContext(context: Record<string, string>): string {
    return Object.entries(context)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');
  }

  /**
   * SendUploadRequest
   */
  private async makeUploadRequest(
    endpoint: string,
    formData: FormData
  ): Promise<any> {
    const _url = `${this.config.baseURL}/${this.config.cloudName}${endpoint}`;

    try {
      const _response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const _errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Cloudinary API Error ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Cloudinary API 請求Failed');
    }
  }

  /**
   * Send HTTP Request
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
    params?: Record<string, any>
  ): Promise<any> {
    let url = `${this.config.baseURL}/${this.config.cloudName}${endpoint}`;

    // AddQueryParameter
    if (params) {
      const _searchParams = new URLSearchParams();
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
      const _response = await fetch(url, requestOptions);

      if (!response.ok) {
        const _errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Cloudinary API Error ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Cloudinary API 請求Failed');
    }
  }

  /**
   * CheckServiceStatus
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

// Export單例Instance
export const _cloudinaryService = CloudinaryService.getInstance();

// ExportClass型
export type { TransformationOptions, UploadOptions, UploadResult };
