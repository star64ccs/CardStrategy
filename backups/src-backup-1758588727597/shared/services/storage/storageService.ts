import { logger } from '../../../core/utils/logger';

import type {
  CloudflareFile,
  CloudflareUploadOptions,
  CloudflareDownloadOptions,
  CloudflareListOptions,
} from './cloudflareService';
import { cloudflareService } from './cloudflareService';
import type {
  S3File,
  S3UploadOptions,
  S3DownloadOptions,
  S3ListOptions,
} from './s3Service';
import { s3Service } from './s3Service';

export interface StorageFile {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType?: string;
  url?: string;
  metadata?: Record<string, any>;
  provider: 's3' | 'cloudflare';
}

export interface StorageUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  expiresIn?: number;
  provider?: 's3' | 'cloudflare' | 'auto';
}

export interface StorageDownloadOptions {
  expiresIn?: number;
  responseContentType?: string;
  responseContentDisposition?: string;
  provider?: 's3' | 'cloudflare' | 'auto';
}

export interface StorageListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
  provider?: 's3' | 'cloudflare' | 'auto';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: Date;
}

export class StorageService {
  private static instance: StorageService;
  private readonly defaultProvider: 's3' | 'cloudflare' = 's3';

  private convertS3FileToStorageFile(s3File: S3File): StorageFile {
    return {
      key: s3File.key,
      size: s3File.size,
      lastModified: s3File.lastModified,
      etag: s3File.etag,
      contentType: s3File.contentType,
      url: s3File.url,
      metadata: s3File.metadata,
      provider: 's3',
    };
  }

  private convertCloudflareFileToStorageFile(
    cloudflareFile: CloudflareFile
  ): StorageFile {
    return {
      key: cloudflareFile.key,
      size: cloudflareFile.size,
      lastModified: cloudflareFile.uploaded,
      etag: cloudflareFile.etag,
      contentType: cloudflareFile.contentType,
      url: cloudflareFile.url,
      metadata: cloudflareFile.metadata,
      provider: 'cloudflare',
    };
  }

  private constructor() {
    logger.info('Storage service initialized');
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  getAvailableProviders(): Record<string, boolean> {
    return {
      s3: s3Service.isAvailable(),
      cloudflare: cloudflareService.isAvailable(),
    };
  }

  private selectProvider(
    preferredProvider?: 's3' | 'cloudflare' | 'auto'
  ): 's3' | 'cloudflare' | null {
    const availableProviders = this.getAvailableProviders();

    if (preferredProvider === 'auto') {
      // 優先選擇 S3，如果不可用則選擇 Cloudflare
      if (availableProviders.s3) return 's3';
      if (availableProviders.cloudflare) return 'cloudflare';
      return null;
    }

    if (preferredProvider && availableProviders[preferredProvider]) {
      return preferredProvider;
    }

    // 如果指定提供商不可用，嘗試其他可用提供商
    if (availableProviders.s3) return 's3';
    if (availableProviders.cloudflare) return 'cloudflare';

    return null;
  }

  async uploadFile(
    key: string,
    file: Buffer | string,
    options: StorageUploadOptions = {}
  ): Promise<ApiResponse<StorageFile>> {
    try {
      const { provider = 'auto' } = options;
      const selectedProvider = this.selectProvider(provider);

      if (!selectedProvider) {
        return {
          success: false,
          message: 'No storage provider available',
          timestamp: new Date(),
        };
      }

      if (selectedProvider === 's3') {
        const result = await s3Service.uploadFile(
          key,
          file,
          options as S3UploadOptions
        );
        if (result.success && result.data) {
          return {
            success: true,
            data: {
              ...result.data,
              provider: 's3',
            },
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: result.success,
          data: result.data ? { ...result.data, provider: 's3' } : undefined,
          message: result.message,
          timestamp: result.timestamp,
        };
      } else {
        const result = await cloudflareService.uploadFile(
          key,
          file,
          options as CloudflareUploadOptions
        );
        if (result.success && result.data) {
          return {
            success: true,
            data: {
              ...result.data,
              provider: 'cloudflare',
              lastModified: result.data.uploaded,
            },
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: result.success,
          data: result.data
            ? {
                ...result.data,
                provider: 'cloudflare',
                lastModified: result.data.uploaded,
              }
            : undefined,
          message: result.message,
          timestamp: result.timestamp,
        };
      }
    } catch (error) {
      logger.error('Storage upload error:', error);
      return {
        success: false,
        message: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async downloadFile(
    key: string,
    options: StorageDownloadOptions = {}
  ): Promise<ApiResponse<Buffer>> {
    try {
      const { provider = 'auto' } = options;
      const selectedProvider = this.selectProvider(provider);

      if (!selectedProvider) {
        return {
          success: false,
          message: 'No storage provider available',
          timestamp: new Date(),
        };
      }

      if (selectedProvider === 's3') {
        return await s3Service.downloadFile(key, options as S3DownloadOptions);
      } else {
        return await cloudflareService.downloadFile(
          key,
          options as CloudflareDownloadOptions
        );
      }
    } catch (error) {
      logger.error('Storage download error:', error);
      return {
        success: false,
        message: `Download error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async deleteFile(
    key: string,
    provider?: 's3' | 'cloudflare' | 'auto'
  ): Promise<ApiResponse> {
    try {
      const selectedProvider = this.selectProvider(provider);

      if (!selectedProvider) {
        return {
          success: false,
          message: 'No storage provider available',
          timestamp: new Date(),
        };
      }

      if (selectedProvider === 's3') {
        return await s3Service.deleteFile(key);
      } else {
        return await cloudflareService.deleteFile(key);
      }
    } catch (error) {
      logger.error('Storage delete error:', error);
      return {
        success: false,
        message: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async listFiles(
    options: StorageListOptions = {}
  ): Promise<ApiResponse<StorageFile[]>> {
    try {
      const { provider = 'auto' } = options;
      const selectedProvider = this.selectProvider(provider);

      if (!selectedProvider) {
        return {
          success: false,
          message: 'No storage provider available',
          timestamp: new Date(),
        };
      }

      if (selectedProvider === 's3') {
        const result = await s3Service.listFiles(options as S3ListOptions);
        if (result.success && result.data) {
          return {
            success: true,
            data: result.data.map(file =>
              this.convertS3FileToStorageFile(file)
            ),
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: false,
          message: result.message,
          timestamp: new Date(),
        };
      } else {
        const result = await cloudflareService.listFiles(
          options as CloudflareListOptions
        );
        if (result.success && result.data) {
          return {
            success: true,
            data: result.data.map(file =>
              this.convertCloudflareFileToStorageFile(file)
            ),
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: false,
          message: result.message,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Storage list error:', error);
      return {
        success: false,
        message: `List error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getFileUrl(
    key: string,
    expiresIn = 3600,
    provider?: 's3' | 'cloudflare' | 'auto'
  ): Promise<ApiResponse<string>> {
    try {
      const selectedProvider = this.selectProvider(provider);

      if (!selectedProvider) {
        return {
          success: false,
          message: 'No storage provider available',
          timestamp: new Date(),
        };
      }

      if (selectedProvider === 's3') {
        return await s3Service.getFileUrl(key, expiresIn);
      } else {
        return await cloudflareService.getFileUrl(key, expiresIn);
      }
    } catch (error) {
      logger.error('Storage URL generation error:', error);
      return {
        success: false,
        message: `URL generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async copyFile(
    sourceKey: string,
    destinationKey: string,
    provider?: 's3' | 'cloudflare' | 'auto'
  ): Promise<ApiResponse<StorageFile>> {
    try {
      const selectedProvider = this.selectProvider(provider);

      if (!selectedProvider) {
        return {
          success: false,
          message: 'No storage provider available',
          timestamp: new Date(),
        };
      }

      if (selectedProvider === 's3') {
        const result = await s3Service.copyFile(sourceKey, destinationKey);
        if (result.success && result.data) {
          return {
            success: true,
            data: this.convertS3FileToStorageFile(result.data),
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: false,
          message: result.message,
          timestamp: new Date(),
        };
      } else {
        const result = await cloudflareService.copyFile(
          sourceKey,
          destinationKey
        );
        if (result.success && result.data) {
          return {
            success: true,
            data: this.convertCloudflareFileToStorageFile(result.data),
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: false,
          message: result.message,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Storage copy error:', error);
      return {
        success: false,
        message: `Copy error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getFileMetadata(
    key: string,
    provider?: 's3' | 'cloudflare' | 'auto'
  ): Promise<ApiResponse<StorageFile>> {
    try {
      const selectedProvider = this.selectProvider(provider);

      if (!selectedProvider) {
        return {
          success: false,
          message: 'No storage provider available',
          timestamp: new Date(),
        };
      }

      if (selectedProvider === 's3') {
        const result = await s3Service.getFileMetadata(key);
        if (result.success && result.data) {
          return {
            success: true,
            data: this.convertS3FileToStorageFile(result.data),
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: false,
          message: result.message,
          timestamp: new Date(),
        };
      } else {
        const result = await cloudflareService.getFileMetadata(key);
        if (result.success && result.data) {
          return {
            success: true,
            data: this.convertCloudflareFileToStorageFile(result.data),
            message: result.message,
            timestamp: new Date(),
          };
        }
        return {
          success: false,
          message: result.message,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Storage metadata error:', error);
      return {
        success: false,
        message: `Metadata error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async batchUploadFiles(
    files: {
      key: string;
      file: Buffer | string;
      options?: StorageUploadOptions;
    }[]
  ): Promise<ApiResponse<StorageFile[]>> {
    try {
      if (files.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No files to upload',
          timestamp: new Date(),
        };
      }

      const uploadPromises = files.map(({ key, file, options }) =>
        this.uploadFile(key, file, options)
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        logger.warn(`${failedUploads.length} files failed to upload`);
      }

      return {
        success: successfulUploads.length > 0,
        data: successfulUploads
          .map(result => result.data)
          .filter(Boolean) as StorageFile[],
        message: `Uploaded ${successfulUploads.length}/${files.length} files successfully`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Storage batch upload error:', error);
      return {
        success: false,
        message: `Batch upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getServiceStats(): Promise<ApiResponse> {
    try {
      const s3Stats = await s3Service.getServiceStats();
      const cloudflareStats = await cloudflareService.getServiceStats();

      return {
        success: true,
        data: {
          s3: s3Stats.data,
          cloudflare: cloudflareStats.data,
          availableProviders: this.getAvailableProviders(),
        },
        message: 'Storage service statistics retrieved',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Storage stats error:', error);
      return {
        success: false,
        message: `Stats error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }
}

export const storageService = StorageService.getInstance();
