import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface CloudflareFile {
  key: string;
  size: number;
  uploaded: Date;
  etag: string;
  contentType?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface CloudflareUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  expiresIn?: number;
}

export interface CloudflareDownloadOptions {
  expiresIn?: number;
  responseContentType?: string;
  responseContentDisposition?: string;
}

export interface CloudflareListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: Date;
}

export class CloudflareStorageService {
  private isInitialized: boolean = false;
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly zoneId: string;
  private readonly baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';
    this.baseUrl = 'https://api.cloudflare.com/client/v4';

    if (!this.accountId || !this.apiToken || !this.zoneId) {
      logger.warn('Cloudflare credentials not found in environment variables');
    } else {
      this.isInitialized = true;
      logger.info('Cloudflare storage service initialized successfully');
    }
  }

  isAvailable(): boolean {
    return (
      this.isInitialized && !!this.accountId && !!this.apiToken && !!this.zoneId
    );
  }

  async uploadFile(
    key: string,
    file: Buffer | string,
    options: CloudflareUploadOptions = {}
  ): Promise<ApiResponse<CloudflareFile>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const {
        contentType = 'application/octet-stream',
        metadata = {},
        public: isPublic = false,
      } = options;

      const _response = await api.post(`/api/storage/cloudflare/upload`, {
        key,
        file: file instanceof Buffer ? file.toString('base64') : file,
        contentType,
        metadata,
        public: isPublic,
        accountId: this.accountId,
        zoneId: this.zoneId,
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as CloudflareFile,
          message: 'File uploaded successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Upload failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare upload error:', error);
      return {
        success: false,
        message: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async downloadFile(
    key: string,
    options: CloudflareDownloadOptions = {}
  ): Promise<ApiResponse<Buffer>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const { expiresIn = 3600 } = options;

      const _response = await api.get(`/api/storage/cloudflare/download`, {
        params: {
          key,
          accountId: this.accountId,
          zoneId: this.zoneId,
          expiresIn,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: Buffer.from(response.data as string, 'base64'),
          message: 'File downloaded successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Download failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare download error:', error);
      return {
        success: false,
        message: `Download error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async deleteFile(key: string): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.delete(`/api/storage/cloudflare/delete`, {
        params: {
          key,
          accountId: this.accountId,
          zoneId: this.zoneId,
        },
      });

      if (response.success) {
        return {
          success: true,
          message: 'File deleted successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Delete failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare delete error:', error);
      return {
        success: false,
        message: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async listFiles(
    options: CloudflareListOptions = {}
  ): Promise<ApiResponse<CloudflareFile[]>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const { prefix = '', limit = 1000, cursor } = options;

      const _response = await api.get(`/api/storage/cloudflare/list`, {
        params: {
          accountId: this.accountId,
          zoneId: this.zoneId,
          prefix,
          limit,
          cursor,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as CloudflareFile[],
          message: 'Files listed successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'List failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare list error:', error);
      return {
        success: false,
        message: `List error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getFileUrl(
    key: string,
    expiresIn = 3600
  ): Promise<ApiResponse<string>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.get(`/api/storage/cloudflare/url`, {
        params: {
          key,
          accountId: this.accountId,
          zoneId: this.zoneId,
          expiresIn,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as string,
          message: 'File URL generated successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'URL generation failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare URL generation error:', error);
      return {
        success: false,
        message: `URL generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async copyFile(
    sourceKey: string,
    destinationKey: string
  ): Promise<ApiResponse<CloudflareFile>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.post(`/api/storage/cloudflare/copy`, {
        sourceKey,
        destinationKey,
        accountId: this.accountId,
        zoneId: this.zoneId,
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as CloudflareFile,
          message: 'File copied successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Copy failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare copy error:', error);
      return {
        success: false,
        message: `Copy error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getFileMetadata(key: string): Promise<ApiResponse<CloudflareFile>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const _response = await api.get(`/api/storage/cloudflare/metadata`, {
        params: {
          key,
          accountId: this.accountId,
          zoneId: this.zoneId,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as CloudflareFile,
          message: 'File metadata retrieved successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Metadata retrieval failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare metadata error:', error);
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
      options?: CloudflareUploadOptions;
    }[]
  ): Promise<ApiResponse<CloudflareFile[]>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      if (files.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No files to upload',
          timestamp: new Date(),
        };
      }

      const _uploadPromises = files.map(({ key, file, options }) =>
        this.uploadFile(key, file, options)
      );

      const _results = await Promise.all(uploadPromises);
      const _successfulUploads = results.filter(result => result.success);
      const _failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        logger.warn(`${failedUploads.length} files failed to upload`);
      }

      return {
        success: successfulUploads.length > 0,
        data: successfulUploads
          .map(result => result.data)
          .filter(Boolean) as CloudflareFile[],
        message: `Uploaded ${successfulUploads.length}/${files.length} files successfully`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare batch upload error:', error);
      return {
        success: false,
        message: `Batch upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getServiceStats(): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Cloudflare storage service not available',
          timestamp: new Date(),
        };
      }

      const _listResponse = await this.listFiles({ limit: 1 });

      return {
        success: true,
        data: {
          service: 'Cloudflare Storage',
          accountId: this.accountId,
          zoneId: this.zoneId,
          available: this.isAvailable(),
          filesCount: listResponse.success ? 'Available' : 'Unknown',
        },
        message: 'Cloudflare storage service statistics retrieved',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Cloudflare stats error:', error);
      return {
        success: false,
        message: `Stats error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }
}

export const _cloudflareService = new CloudflareStorageService();
export { CloudflareStorageService as CloudflareService };
